// utils/verificationEmailTemplates.js
// Email templates for manual verification responses

const approvedTemplate = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Verification Approved - {{SUPPLIER_NAME}}</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; margin: 0; padding: 20px; background: #f0fdf4; }
        .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #10b981, #047857); color: white; padding: 30px 20px; text-align: center; }
        .header h1 { margin: 0; font-size: 28px; }
        .header p { margin: 10px 0 0; opacity: 0.9; }
        .content { padding: 40px 30px; }
        .success-badge { background: #dcfce7; border: 2px solid #22c55e; border-radius: 50px; padding: 15px 25px; text-align: center; margin: 20px 0; }
        .success-badge h2 { color: #16a34a; margin: 0; font-size: 20px; }
        .benefits { background: #f8fafc; border-radius: 8px; padding: 20px; margin: 20px 0; }
        .benefit-item { display: flex; align-items: center; margin: 10px 0; }
        .benefit-icon { width: 24px; height: 24px; background: #10b981; border-radius: 50%; color: white; display: flex; align-items: center; justify-content: center; margin-right: 12px; font-weight: bold; }
        .cta-button { display: inline-block; background: #10b981; color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: bold; margin: 20px 0; }
        .footer { background: #f8fafc; padding: 20px; text-align: center; color: #64748b; font-size: 14px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🎉 Verification Approved!</h1>
            <p>Welcome to our verified provider network</p>
        </div>
        
        <div class="content">
            <div class="success-badge">
                <h2>✅ {{DOCUMENT_TYPE}} Verified Successfully</h2>
            </div>

            <p>Hi <strong>{{SUPPLIER_NAME}}</strong>,</p>
            
            <p>Great news! Your {{DOCUMENT_TYPE}} has been reviewed and <strong>approved</strong>. You're now one step closer to becoming a fully verified provider on our platform.</p>

            {{#if DBS_SPECIFIC}}
            <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0;">
                <strong>DBS Certificate Approved:</strong> Your Enhanced DBS certificate meets all our child safety requirements. This is crucial for providing services to families with children.
            </div>
            {{/if}}

            <div class="benefits">
                <h3 style="color: #1f2937; margin-bottom: 15px;">🌟 What This Means For You:</h3>
                
                <div class="benefit-item">
                    <div class="benefit-icon">✓</div>
                    <div>
                        <strong>Verified Badge:</strong> Stand out with a trust badge on your profile
                    </div>
                </div>
                
                <div class="benefit-item">
                    <div class="benefit-icon">📈</div>
                    <div>
                        <strong>More Bookings:</strong> Verified providers get 3x more inquiries
                    </div>
                </div>
                
                <div class="benefit-item">
                    <div class="benefit-icon">🔒</div>
                    <div>
                        <strong>Premium Access:</strong> Unlock higher-value bookings
                    </div>
                </div>
            </div>

            {{#unless FULLY_VERIFIED}}
            <div style="background: #dbeafe; border-radius: 8px; padding: 20px; margin: 20px 0;">
                <h4 style="color: #1d4ed8; margin-top: 0;">📋 Complete Your Verification</h4>
                <p style="color: #1e3a8a; margin-bottom: 0;">To become fully verified, please upload your remaining documents through your verification dashboard.</p>
            </div>
            {{/unless}}

            <div style="text-align: center; margin: 30px 0;">
                <a href="{{DASHBOARD_LINK}}" class="cta-button">
                    🚀 Access Your Dashboard
                </a>
            </div>

            <p>Thank you for being part of our trusted provider network. We're excited to help you grow your business!</p>
            
            <p style="color: #64748b; margin-top: 30px;">
                Best regards,<br>
                <strong>The Verification Team</strong>
            </p>
        </div>

        <div class="footer">
            <p>This verification is valid for 3 years from your DBS issue date.</p>
            <p>Need help? Contact us at <strong>hello@yourplatform.com</strong> or <strong>0800 123 4567</strong></p>
        </div>
    </div>
</body>
</html>`;

const rejectedTemplate = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Verification Document Needs Attention - {{SUPPLIER_NAME}}</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; margin: 0; padding: 20px; background: #fef2f2; }
        .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #ef4444, #dc2626); color: white; padding: 30px 20px; text-align: center; }
        .header h1 { margin: 0; font-size: 28px; }
        .header p { margin: 10px 0 0; opacity: 0.9; }
        .content { padding: 40px 30px; }
        .attention-badge { background: #fef3c7; border: 2px solid #f59e0b; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0; }
        .feedback-box { background: #fef2f2; border-left: 4px solid #ef4444; padding: 20px; margin: 20px 0; border-radius: 6px; }
        .requirements { background: #f0f9ff; border-radius: 8px; padding: 20px; margin: 20px 0; }
        .requirement-item { margin: 10px 0; padding-left: 20px; }
        .cta-button { display: inline-block; background: #ef4444; color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: bold; margin: 20px 0; }
        .help-section { background: #f8fafc; border-radius: 8px; padding: 20px; margin: 20px 0; }
        .footer { background: #f8fafc; padding: 20px; text-align: center; color: #64748b; font-size: 14px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>📋 Document Needs Attention</h1>
            <p>Let's get this sorted quickly</p>
        </div>
        
        <div class="content">
            <div class="attention-badge">
                <h2 style="color: #d97706; margin: 0;">⚠️ {{DOCUMENT_TYPE}} Requires Resubmission</h2>
            </div>

            <p>Hi <strong>{{SUPPLIER_NAME}}</strong>,</p>
            
            <p>Thank you for uploading your {{DOCUMENT_TYPE}}. After review, we need you to resubmit this document to meet our verification standards.</p>

            <div class="feedback-box">
                <h3 style="color: #dc2626; margin-top: 0;">📝 Review Feedback:</h3>
                <p style="margin-bottom: 0;"><em>{{REJECTION_REASON}}</em></p>
            </div>

            <div class="requirements">
                <h3 style="color: #0369a1; margin-top: 0;">📋 {{DOCUMENT_TYPE}} Requirements:</h3>
                
                {{#if DBS_REQUIREMENTS}}
                <div class="requirement-item">• Must be Enhanced DBS level</div>
                <div class="requirement-item">• Must be dated within the last 3 years</div>
                <div class="requirement-item">• Must clearly show "Child Workforce" checking</div>
                <div class="requirement-item">• Certificate number must be clearly visible</div>
                {{/if}}
                
                {{#if ID_REQUIREMENTS}}
                <div class="requirement-item">• Government-issued photo ID only</div>
                <div class="requirement-item">• All information must be clearly readable</div>
                <div class="requirement-item">• Document must not be expired</div>
                <div class="requirement-item">• Photo must be clearly visible</div>
                {{/if}}
                
                {{#if ADDRESS_REQUIREMENTS}}
                <div class="requirement-item">• Document must be dated within last 3 months</div>
                <div class="requirement-item">• Address must match your profile</div>
                <div class="requirement-item">• Official letterhead or stamp required</div>
                <div class="requirement-item">• Full address must be clearly visible</div>
                {{/if}}
                
                <div class="requirement-item">• File must be clear and readable (PDF, JPG, PNG)</div>
                <div class="requirement-item">• Maximum file size: 10MB</div>
            </div>

            <div style="text-align: center; margin: 30px 0;">
                <a href="{{UPLOAD_LINK}}" class="cta-button">
                    📤 Upload New Document
                </a>
            </div>

            <div class="help-section">
                <h4 style="color: #374151; margin-top: 0;">💡 Tips for Successful Upload:</h4>
                <ul style="color: #4b5563; margin: 10px 0;">
                    <li>Use good lighting when taking photos</li>
                    <li>Ensure all text is clearly readable</li>
                    <li>Include the full document in the image</li>
                    <li>Save as PDF when possible for best quality</li>
                </ul>
            </div>

            <p>We're here to help you complete your verification successfully. Once approved, you'll gain access to premium features and significantly more booking opportunities.</p>
            
            <div style="background: #ecfccb; border-radius: 6px; padding: 15px; margin: 20px 0;">
                <strong style="color: #365314;">Need Help?</strong>
                <p style="color: #4d7c0f; margin: 5px 0 0;">
                    Contact our support team at <strong>hello@yourplatform.com</strong> or <strong>0800 123 4567</strong><br>
                    We're available Monday-Friday, 9am-6pm
                </p>
            </div>
            
            <p style="color: #64748b; margin-top: 30px;">
                Best regards,<br>
                <strong>The Verification Team</strong>
            </p>
        </div>

        <div class="footer">
            <p>Your verification is important to us and the families we serve.</p>
            <p>All documents are stored securely and reviewed confidentially.</p>
        </div>
    </div>
</body>
</html>`;

// Simple utility function to generate copy-paste email content
export function generateVerificationEmail(type, data) {
    const {
        supplierName,
        supplierEmail,
        documentType,
        rejectionReason,
        dashboardLink = 'https://yourplatform.com/verification',
        uploadLink = 'https://yourplatform.com/verification'
    } = data;

    const documentTypeNames = {
        dbs: 'DBS Certificate',
        id: 'Photo ID Document',
        address: 'Address Proof Document'
    };

    const documentName = documentTypeNames[documentType] || documentType;

    if (type === 'approved') {
        const subject = `✅ ${documentName} Approved - Welcome to Our Verified Network!`;
        
        // Simple text version for copy-paste
        const textBody = `Hi ${supplierName},

Great news! Your ${documentName} has been reviewed and APPROVED. 

${documentType === 'dbs' ? '🔒 Your Enhanced DBS certificate meets all our child safety requirements.' : ''}
${documentType === 'id' ? '🆔 Your photo ID has been verified successfully.' : ''}
${documentType === 'address' ? '🏠 Your address proof has been accepted.' : ''}

What this means for you:
✅ Verified badge on your profile
📈 3x more booking inquiries  
🔒 Access to premium bookings
💰 Higher earning potential

${documentType === 'dbs' ? '' : 'Next steps: Complete your remaining verification documents to become fully verified.'}

Access your dashboard: ${dashboardLink}

Welcome to our trusted provider network!

Best regards,
The Verification Team
hello@yourplatform.com | 0800 123 4567`;

        return {
            subject,
            textBody,
            htmlBody: approvedTemplate
                .replace(/{{SUPPLIER_NAME}}/g, supplierName)
                .replace(/{{DOCUMENT_TYPE}}/g, documentName)
                .replace(/{{DASHBOARD_LINK}}/g, dashboardLink)
        };
    }

    if (type === 'rejected') {
        const subject = `📋 ${documentName} Needs Attention - Quick Resubmission Required`;
        
        const textBody = `Hi ${supplierName},

Your ${documentName} needs to be resubmitted to meet our verification standards.

REASON FOR RESUBMISSION:
${rejectionReason}

REQUIREMENTS FOR ${documentName.toUpperCase()}:
${documentType === 'dbs' ? `• Enhanced DBS level required
• Must be within last 3 years
• Must show "Child Workforce" checking
• Certificate number clearly visible` : ''}
${documentType === 'id' ? `• Government-issued photo ID only
• All information clearly readable
• Must not be expired
• Photo clearly visible` : ''}
${documentType === 'address' ? `• Must be dated within last 3 months
• Address must match your profile
• Official letterhead/stamp required
• Full address clearly visible` : ''}
• File must be clear (PDF, JPG, PNG)
• Maximum 10MB file size

UPLOAD NEW DOCUMENT: ${uploadLink}

TIPS FOR SUCCESS:
- Use good lighting
- Ensure text is readable
- Include full document
- Save as PDF when possible

Need help? Contact us at hello@yourplatform.com or 0800 123 4567

We're here to help you succeed!

Best regards,
The Verification Team`;

        return {
            subject,
            textBody,
            htmlBody: rejectedTemplate
                .replace(/{{SUPPLIER_NAME}}/g, supplierName)
                .replace(/{{DOCUMENT_TYPE}}/g, documentName)
                .replace(/{{REJECTION_REASON}}/g, rejectionReason)
                .replace(/{{UPLOAD_LINK}}/g, uploadLink)
        };
    }

    throw new Error('Invalid email type. Use "approved" or "rejected".');
}