// utils/secureStorage.js
import crypto from 'crypto';

class SecureDocumentStorage {
  constructor() {
    this.encryptionKey = process.env.DOCUMENT_ENCRYPTION_KEY;
    this.storageProvider = 'aws-s3'; // or your preferred provider
  }

  // Encrypt sensitive data before storage
  encryptSensitiveData(data) {
    const cipher = crypto.createCipher('aes-256-cbc', this.encryptionKey);
    let encrypted = cipher.update(data, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return encrypted;
  }

  // Decrypt when needed (only for authorized access)
  decryptSensitiveData(encryptedData) {
    const decipher = crypto.createDecipher('aes-256-cbc', this.encryptionKey);
    let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  }

  // Upload document with encryption
  async uploadDocument(file, supplierId, documentType) {
    try {
      // Generate unique filename
      const fileName = `verification/${supplierId}/${documentType}/${Date.now()}-${file.originalname}`;
      
      // Upload to secure storage with encryption at rest
      const uploadResult = await this.uploadToSecureStorage(file, fileName);
      
      // Log access
      await this.logDocumentAccess({
        action: 'upload',
        supplierId,
        documentType,
        fileName,
        timestamp: new Date().toISOString()
      });

      return {
        success: true,
        documentUrl: uploadResult.secureUrl,
        fileName: uploadResult.fileName
      };
      
    } catch (error) {
      console.error('Document upload failed:', error);
      throw new Error('Secure upload failed');
    }
  }
}