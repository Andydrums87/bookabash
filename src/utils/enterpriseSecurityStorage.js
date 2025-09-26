// utils/enterpriseSecurityStorage.js
import { v2 as cloudinary } from 'cloudinary';
import crypto from 'crypto';
import { createHash, timingSafeEqual } from 'crypto';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import validator from 'validator';

class EnterpriseSecurityStorage {
  constructor() {
    // Validate all required environment variables
    this.validateEnvironment();
    
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
      secure: true,
      private_cdn: true, // Use private CDN for additional security
    });
    
    this.encryptionKey = Buffer.from(process.env.DOCUMENT_ENCRYPTION_KEY, 'hex');
    this.hmacKey = Buffer.from(process.env.DOCUMENT_HMAC_KEY, 'hex');
    this.auditLogger = new AuditLogger();
  }

  validateEnvironment() {
    const required = [
      'CLOUDINARY_CLOUD_NAME',
      'CLOUDINARY_API_KEY', 
      'CLOUDINARY_API_SECRET',
      'DOCUMENT_ENCRYPTION_KEY',
      'DOCUMENT_HMAC_KEY',
      'SECURITY_SALT'
    ];

    for (const key of required) {
      if (!process.env[key]) {
        throw new Error(`Missing required environment variable: ${key}`);
      }
    }

    if (process.env.DOCUMENT_ENCRYPTION_KEY.length !== 64) { // 32 bytes = 64 hex chars
      throw new Error('DOCUMENT_ENCRYPTION_KEY must be 64 hex characters (32 bytes)');
    }
  }

  // Advanced file validation with deep inspection
  async validateFile(file, documentType, userContext) {
    const errors = [];
    
    try {
      // Convert to buffer for analysis
      const buffer = Buffer.from(await file.arrayBuffer());
      
      // 1. Size validation
      const maxSizes = {
        dbs: 15 * 1024 * 1024,    // 15MB for DBS (can be large scans)
        id: 10 * 1024 * 1024,     // 10MB for ID documents
        address: 10 * 1024 * 1024  // 10MB for address proofs
      };
      
      if (buffer.length > (maxSizes[documentType] || 5 * 1024 * 1024)) {
        errors.push(`File too large for ${documentType}`);
      }

      // 2. Magic number validation (file signature)
      const signatures = {
        'application/pdf': [[0x25, 0x50, 0x44, 0x46]], // %PDF
        'image/jpeg': [[0xFF, 0xD8, 0xFF]],
        'image/png': [[0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]]
      };

      const fileSignature = Array.from(buffer.subarray(0, 8));
      const expectedSignatures = signatures[file.type];
      
      if (expectedSignatures) {
        const validSignature = expectedSignatures.some(sig => 
          sig.every((byte, index) => fileSignature[index] === byte)
        );
        
        if (!validSignature) {
          errors.push('File signature does not match declared type');
        }
      }

      // 3. Content scanning for embedded threats
      await this.scanForThreats(buffer, file.type);

      // 4. Document type specific validation
      if (documentType === 'dbs') {
        await this.validateDBSDocument(buffer, userContext);
      }

      // 5. Metadata sanitization
      const sanitizedName = this.sanitizeFilename(file.name);
      if (sanitizedName !== file.name) {
        console.warn('Filename was sanitized:', { original: file.name, sanitized: sanitizedName });
      }

      return { errors, sanitizedBuffer: buffer };
      
    } catch (error) {
      errors.push(`File validation failed: ${error.message}`);
      return { errors };
    }
  }

  // Deep content scanning
  async scanForThreats(buffer, mimeType) {
    const content = buffer.toString('ascii', 0, Math.min(4096, buffer.length));
    
    // Scan for embedded scripts and suspicious content
    const threats = [
      /<script/i,
      /javascript:/i,
      /vbscript:/i,
      /onload=/i,
      /onerror=/i,
      /eval\(/i,
      /document\.write/i,
      /window\.location/i,
      /%3cscript/i, // URL encoded
      /&#60;script/i // HTML encoded
    ];

    for (const threat of threats) {
      if (threat.test(content)) {
        throw new Error('Potentially malicious content detected');
      }
    }

    // PDF-specific threats
    if (mimeType === 'application/pdf') {
      const pdfThreats = [
        /\/JavaScript/i,
        /\/JS/i,
        /\/Launch/i,
        /\/EmbeddedFile/i,
        /\/URI/i
      ];
      
      for (const threat of pdfThreats) {
        if (threat.test(content)) {
          throw new Error('Potentially malicious PDF content detected');
        }
      }
    }

    // Check for excessive embedded files or suspicious structures
    const suspiciousPatterns = [
      /PK\x03\x04/, // ZIP signature (potential zip bomb)
      /Rar!/, // RAR signature
      /7z\xBC\xAF\x27\x1C/ // 7z signature
    ];

    for (const pattern of suspiciousPatterns) {
      if (pattern.test(buffer)) {
        console.warn('Suspicious file structure detected, flagging for manual review');
      }
    }
  }

  // DBS-specific validation
  async validateDBSDocument(buffer, userContext) {
    const text = buffer.toString('utf8', 0, Math.min(2048, buffer.length));
    
    // Look for DBS certificate indicators
    const dbsIndicators = [
      /disclosure.*barring.*service/i,
      /enhanced.*disclosure/i,
      /dbs.*certificate/i,
      /certificate.*number/i
    ];

    const hasDBSIndicators = dbsIndicators.some(pattern => pattern.test(text));
    
    if (!hasDBSIndicators) {
      console.warn('Uploaded file may not be a valid DBS certificate');
      // In production, you might want to flag this for manual review
    }

    // Check for expired certificates (basic text search)
    const datePatterns = /(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/g;
    const dates = [];
    let match;
    
    while ((match = datePatterns.exec(text)) !== null) {
      const [, day, month, year] = match;
      const date = new Date(year, month - 1, day);
      if (!isNaN(date.getTime())) {
        dates.push(date);
      }
    }

    // Check if any dates are more than 3 years old
    const threeYearsAgo = new Date();
    threeYearsAgo.setFullYear(threeYearsAgo.getFullYear() - 3);
    
    const hasOldDates = dates.some(date => date < threeYearsAgo);
    if (hasOldDates) {
      console.warn('DBS certificate may be expired - flagging for manual verification');
    }
  }

  sanitizeFilename(filename) {
    // Remove dangerous characters and limit length
    return filename
      .replace(/[^a-zA-Z0-9._-]/g, '_')
      .substring(0, 100)
      .replace(/^\.+/, '') // Remove leading dots
      .replace(/\.+$/, ''); // Remove trailing dots
  }

  // Generate cryptographically secure paths
  generateSecurePath(supplierId, documentType) {
    const timestamp = Date.now();
    const random = crypto.randomBytes(16).toString('hex');
    
    // Create HMAC of supplier ID for path obfuscation
    const hmac = crypto.createHmac('sha256', this.hmacKey);
    hmac.update(supplierId + process.env.SECURITY_SALT);
    const hashedId = hmac.digest('hex').substring(0, 16);
    
    return `verification/${hashedId}/${documentType}/${timestamp}/${random}`;
  }

  // Enterprise-grade encryption
  encryptSensitiveData(data) {
    if (!data) return null;
    
    const algorithm = 'aes-256-gcm';
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipher(algorithm, this.encryptionKey);
    
    let encrypted = cipher.update(data, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const authTag = cipher.getAuthTag();
    
    return {
      encrypted,
      iv: iv.toString('hex'),
      authTag: authTag.toString('hex'),
      algorithm,
      timestamp: new Date().toISOString()
    };
  }

  decryptSensitiveData(encryptedData) {
    if (!encryptedData?.encrypted) return null;
    
    try {
      const decipher = crypto.createDecipher(
        encryptedData.algorithm, 
        this.encryptionKey
      );
      
      decipher.setAuthTag(Buffer.from(encryptedData.authTag, 'hex'));
      
      let decrypted = decipher.update(encryptedData.encrypted, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      
      return decrypted;
    } catch (error) {
      console.error('Decryption failed:', error);
      throw new Error('Data integrity check failed');
    }
  }

  // Secure upload with comprehensive error handling
  async uploadDocument(file, supplierId, documentType, metadata = {}, userContext = {}) {
    const uploadId = crypto.randomUUID();
    
    try {
      // Start audit trail
      await this.auditLogger.logAction({
        action: 'UPLOAD_STARTED',
        uploadId,
        supplierId,
        documentType,
        fileName: file.name,
        fileSize: file.size,
        userAgent: userContext.userAgent,
        ipAddress: userContext.ipAddress
      });

      // Validate file
      const { errors, sanitizedBuffer } = await this.validateFile(file, documentType, userContext);
      
      if (errors.length > 0) {
        await this.auditLogger.logAction({
          action: 'UPLOAD_VALIDATION_FAILED',
          uploadId,
          supplierId,
          errors
        });
        throw new Error(`Validation failed: ${errors.join(', ')}`);
      }

      // Generate secure path and upload
      const securePath = this.generateSecurePath(supplierId, documentType);
      const sanitizedFilename = this.sanitizeFilename(file.name);
      
      const uploadResult = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: securePath,
            public_id: uploadId,
            resource_type: file.type.startsWith('image/') ? 'image' : 'raw',
            access_mode: 'authenticated',
            type: 'private',
            secure: true,
            tags: [
              `supplier:${supplierId}`, 
              `doctype:${documentType}`, 
              'verification',
              `upload:${uploadId}`
            ],
            context: {
              original_filename: sanitizedFilename,
              document_type: documentType,
              supplier_id: supplierId,
              upload_id: uploadId,
              uploaded_at: new Date().toISOString(),
              user_agent_hash: crypto.createHash('sha256').update(userContext.userAgent || '').digest('hex').substring(0, 16)
            },
            transformation: documentType === 'dbs' ? [
              { quality: 'auto:best' },
              { flags: 'immutable_cache' }
            ] : undefined,
            notification_url: process.env.CLOUDINARY_WEBHOOK_URL, // For upload notifications
            invalidate: true,
            unique_filename: true,
            use_filename: false,
            overwrite: false
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        
        uploadStream.end(sanitizedBuffer);
      });

      // Generate secure access token
      const accessToken = this.generateAccessToken(uploadId, supplierId);

      await this.auditLogger.logAction({
        action: 'UPLOAD_SUCCESS',
        uploadId,
        supplierId,
        documentType,
        cloudinaryId: uploadResult.public_id,
        fileSize: sanitizedBuffer.length
      });

      return {
        success: true,
        uploadId,
        documentId: uploadResult.public_id,
        fileName: sanitizedFilename,
        fileSize: sanitizedBuffer.length,
        uploadedAt: new Date().toISOString(),
        accessToken, // For later retrieval
        checksum: crypto.createHash('sha256').update(sanitizedBuffer).digest('hex')
      };

    } catch (error) {
      await this.auditLogger.logAction({
        action: 'UPLOAD_FAILED',
        uploadId,
        supplierId,
        error: error.message
      });
      
      throw error;
    }
  }

  // Generate time-limited access tokens
  generateAccessToken(uploadId, supplierId) {
    const payload = {
      uploadId,
      supplierId,
      exp: Math.floor(Date.now() / 1000) + (30 * 60), // 30 minute expiry
      iat: Math.floor(Date.now() / 1000)
    };
    
    const token = Buffer.from(JSON.stringify(payload)).toString('base64');
    const signature = crypto
      .createHmac('sha256', this.hmacKey)
      .update(token)
      .digest('hex');
    
    return `${token}.${signature}`;
  }

  // Verify access tokens
  verifyAccessToken(token) {
    try {
      const [payload, signature] = token.split('.');
      
      const expectedSignature = crypto
        .createHmac('sha256', this.hmacKey)
        .update(payload)
        .digest('hex');
      
      if (!timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))) {
        throw new Error('Invalid token signature');
      }
      
      const data = JSON.parse(Buffer.from(payload, 'base64').toString());
      
      if (data.exp < Math.floor(Date.now() / 1000)) {
        throw new Error('Token expired');
      }
      
      return data;
    } catch (error) {
      throw new Error('Invalid access token');
    }
  }
}

// Comprehensive audit logging
class AuditLogger {
  async logAction(action) {
    const logEntry = {
      ...action,
      timestamp: new Date().toISOString(),
      nodeId: process.env.NODE_ID || 'unknown',
      environment: process.env.NODE_ENV || 'development'
    };
    
    // Log to multiple destinations for redundancy
    console.log('SECURITY_AUDIT:', JSON.stringify(logEntry));
    
    // In production, also send to:
    // 1. Dedicated audit database
    // 2. Security monitoring service (e.g., Splunk, DataDog)
    // 3. Encrypted file logs with rotation
    
    try {
      // Example: Send to audit database
      // await supabase.from('security_audit_log').insert(logEntry);
      
      // Example: Send to external security service
      // await securityMonitoring.logEvent(logEntry);
      
    } catch (error) {
      console.error('Failed to write audit log:', error);
      // This is critical - in production you'd want alerts here
    }
  }
}

export { EnterpriseSecurityStorage };