import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Email configuration
const createTransporter = () => {
    // Check if MAILER environment variable exists
    if (process.env.MAILER) {
        try {
            const mailerConfig = JSON.parse(process.env.MAILER);
            return nodemailer.createTransport(mailerConfig);
        } catch (error) {
            console.error('❌ Error parsing MAILER config:', error);
        }
    }

    // Default Gmail configuration
    const config = {
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        },
        tls: {
            rejectUnauthorized: false
        },
        debug: false, // Disable debug logs
        logger: false // Disable logger
    };

    // Validate required credentials
    if (!config.auth.user || !config.auth.pass) {
        console.error('❌ Missing EMAIL_USER or EMAIL_PASS in environment variables');
        throw new Error('Email credentials not configured');
    }
    
    return nodemailer.createTransport(config);
};

// Test email connection
export const testEmailConnection = async () => {
    try {
        const transporter = createTransporter();
        await transporter.verify();
        console.log('✅ Email service is ready');
        return { success: true };
    } catch (error) {
        console.error('❌ Email service error:', error.message);
        return { success: false, error: error.message };
    }
};

// Send verification code email
const sendVerificationCode = async (email, code) => {
    try {
        console.log('📧 Sending verification code to:', email);

        const transporter = createTransporter();
        await transporter.verify();

        // Email options
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Your Admin Login Verification Code',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                    <h2 style="color: #333; text-align: center;">Admin Login Verification</h2>
                    
                    <div style="background: #f8f9fa; padding: 30px; border-radius: 10px; text-align: center; margin: 20px 0;">
                        <p style="font-size: 16px; color: #666; margin-bottom: 20px;">Your verification code is:</p>
                        <div style="background: #007bff; color: white; padding: 15px 25px; border-radius: 5px; display: inline-block;">
                            <h1 style="margin: 0; font-size: 28px; letter-spacing: 3px;">${code}</h1>
                        </div>
                    </div>
                    
                    <div style="background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 5px; padding: 15px; margin: 20px 0;">
                        <p style="margin: 0; color: #856404;">
                            ⏰ This code will expire in <strong>10 minutes</strong>
                        </p>
                    </div>
                    
                    <p style="color: #666; font-size: 14px; text-align: center;">
                        If you didn't request this code, please ignore this email or contact support.
                    </p>
                    
                    <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
                    <p style="color: #999; font-size: 12px; text-align: center;">
                        This is an automated message from Admin Portal. Please do not reply to this email.
                    </p>
                </div>
            `,
            text: `Admin Login Verification Code: ${code}\n\nThis code will expire in 10 minutes.`
        };

        // Send email with timeout
        const result = await Promise.race([
            transporter.sendMail(mailOptions),
            new Promise((_, reject) => 
                setTimeout(() => reject(new Error('Email send timeout after 30 seconds')), 30000)
            )
        ]);
        
        console.log('✅ Verification code sent successfully!');
        
        return { 
            success: true, 
            messageId: result.messageId,
            response: result.response,
            accepted: result.accepted,
            rejected: result.rejected,
            email: email
        };

    } catch (error) {
        console.error('❌ Error sending verification email:', error.message);
        
        // Log specific error types for debugging
        if (error.code === 'EAUTH') {
            console.error('🔐 Authentication failed - Check your email credentials');
        } else if (error.code === 'ECONNECTION') {
            console.error('🌐 Connection failed - Check your internet connection');
        } else if (error.responseCode === 535) {
            console.error('🔑 Invalid credentials - Use App Password for Gmail');
        }
        
        return { 
            success: false, 
            error: error.message,
            code: error.code,
            responseCode: error.responseCode,
            response: error.response
        };
    }
};

// Send admin registration confirmation
const sendRegistrationConfirmation = async (email) => {
    try {
        console.log('📧 Sending registration confirmation to:', email);

        const transporter = createTransporter();

        const mailOptions = {
            from: {
                name: 'Admin Portal',
                address: process.env.EMAIL_USER
            },
            to: email,
            subject: '🎉 Welcome to Admin Portal - Registration Successful',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                    <div style="text-align: center; margin-bottom: 30px;">
                        <h1 style="color: #28a745; margin: 0;">Welcome to Admin Portal!</h1>
                        <p style="color: #666; font-size: 18px;">Your admin account has been successfully created</p>
                    </div>
                    
                    <div style="background: #f8f9fa; padding: 25px; border-radius: 10px; margin: 20px 0;">
                        <h3 style="color: #333; margin-top: 0;">Account Details:</h3>
                        <p style="margin: 10px 0;"><strong>Email:</strong> ${email}</p>
                        <p style="margin: 10px 0;"><strong>Registration Date:</strong> ${new Date().toLocaleString()}</p>
                        <p style="margin: 10px 0;"><strong>Status:</strong> Active</p>
                    </div>
                    
                    <div style="background: #d4edda; border: 1px solid #c3e6cb; border-radius: 5px; padding: 15px; margin: 20px 0;">
                        <h4 style="color: #155724; margin-top: 0;">Next Steps:</h4>
                        <ol style="color: #155724; margin: 0;">
                            <li>You can now log in to your admin account</li>
                            <li>Use the "Request Code" feature to get verification codes</li>
                            <li>Check your email for verification codes when logging in</li>
                        </ol>
                    </div>
                    
                    <div style="text-align: center; margin: 30px 0;">
                        <p style="color: #666;">Thank you for joining Admin Portal!</p>
                    </div>
                    
                    <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
                    <p style="color: #999; font-size: 12px; text-align: center;">
                        This is an automated welcome message. Please do not reply to this email.
                    </p>
                </div>
            `,
            text: `
                Welcome to Admin Portal!
                
                Your admin account has been successfully created.
                
                Account Details:
                - Email: ${email}
                - Registration Date: ${new Date().toLocaleString()}
                - Status: Active
                
                Next Steps:
                1. You can now log in to your admin account
                2. Use the "Request Code" feature to get verification codes
                3. Check your email for verification codes when logging in
                
                Thank you for joining Admin Portal!
            `
        };

        const result = await transporter.sendMail(mailOptions);
        
        console.log('✅ Registration confirmation sent successfully!');
        
        return { 
            success: true, 
            messageId: result.messageId,
            email: email
        };

    } catch (error) {
        console.error('❌ Error sending registration confirmation:', error.message);
        return { 
            success: false, 
            error: error.message,
            code: error.code
        };
    }
};

// Send a simple test email
export const sendTestEmail = async (email) => {
    try {
        console.log('🧪 Sending test email to:', email);
        
        const transporter = createTransporter();
        await transporter.verify();
        
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Test Email from Admin Portal',
            html: '<h1>Test Email</h1><p>If you receive this, your email service is working!</p>',
            text: 'Test Email - If you receive this, your email service is working!'
        };

        const result = await transporter.sendMail(mailOptions);
        console.log('✅ Test email sent successfully');
        
        return { success: true, messageId: result.messageId };
    } catch (error) {
        console.error('❌ Test email failed:', error.message);
        return { success: false, error: error.message };
    }
};

// Initialize and test email service
export const initializeEmailService = async () => {
    try {
        // Check environment variables
        if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
            console.error('❌ Missing EMAIL_USER or EMAIL_PASS environment variables');
            return false;
        }
        
        // Test connection
        const testResult = await testEmailConnection();
        
        if (testResult.success) {
            console.log('✅ Email service initialized successfully');
            return true;
        } else {
            console.error('❌ Email service initialization failed');
            return false;
        }
        
    } catch (error) {
        console.error('❌ Email service initialization error:', error.message);
        return false;
    }
};

export {
    sendVerificationCode,
    sendRegistrationConfirmation
};