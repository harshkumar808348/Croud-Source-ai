import express from 'express';
const router = express.Router();
import Admin from '../Database/adminSchema.js';
import { sendVerificationCode, sendRegistrationConfirmation } from '../services/emailService.js';

// Admin Registration
router.post('/register', async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                success: false,
                message: 'Email is required'
            });
        }

        // Check if admin already exists
        const existingAdmin = await Admin.findOne({ email: email.toLowerCase() });
        if (existingAdmin) {
            return res.status(400).json({
                success: false,
                message: 'Admin with this email already exists'
            });
        }

        // Create new admin
        const admin = new Admin({
            email: email.toLowerCase()
        });

        await admin.save();

        // Send registration confirmation email
        const emailResult = await sendRegistrationConfirmation(email);
        
        if (!emailResult.success) {
            console.warn('⚠️ Registration confirmation email failed to send:', emailResult.error);
        }

        res.status(201).json({
            success: true,
            message: 'Admin registered successfully. Please check your email for confirmation.',
            admin: {
                email: admin.email,
                createdAt: admin.createdAt
            }
        });

    } catch (error) {
        console.error('❌ Admin registration error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error during registration'
        });
    }
});

// Request verification code (Step 1 of login)
router.post('/request-code', async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                success: false,
                message: 'Email is required'
            });
        }

        // Find admin by email
        const admin = await Admin.findOne({ email: email.toLowerCase() });
        if (!admin) {
            return res.status(404).json({
                success: false,
                message: 'Admin not found. Please register first.'
            });
        }

        // Generate new verification code
        const verificationCode = admin.generateVerificationCode();
        await admin.save();

        // Send verification code email
        const emailResult = await sendVerificationCode(email, verificationCode);
        
        if (!emailResult.success) {
            return res.status(500).json({
                success: false,
                message: 'Failed to send verification code. Please try again.'
            });
        }

        res.json({
            success: true,
            message: 'Verification code sent to your email',
            email: admin.email
        });

    } catch (error) {
        console.error('❌ Request verification code error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

// Verify code and login (Step 2 of login)
router.post('/verify-code', async (req, res) => {
    try {
        const { email, code } = req.body;

        if (!email || !code) {
            return res.status(400).json({
                success: false,
                message: 'Email and verification code are required'
            });
        }

        // Find admin by email
        const admin = await Admin.findOne({ email: email.toLowerCase() });
        if (!admin) {
            return res.status(404).json({
                success: false,
                message: 'Admin not found'
            });
        }

        // Verify the code
        if (!admin.verifyCode(code)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid or expired verification code'
            });
        }

        // Clear verification code and mark as verified
        admin.clearVerificationCode();
        await admin.save();

        // Create session token (you can use JWT here for more security)
        const sessionToken = `admin_${admin._id}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        res.json({
            success: true,
            message: 'Login successful',
            admin: {
                email: admin.email,
                lastLogin: admin.lastLogin,
                isVerified: admin.isVerified
            },
            sessionToken: sessionToken
        });

    } catch (error) {
        console.error('❌ Verify code error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

// Get admin profile
router.get('/profile', async (req, res) => {
    try {
        const { email } = req.query;

        if (!email) {
            return res.status(400).json({
                success: false,
                message: 'Email is required'
            });
        }

        const admin = await Admin.findOne({ email: email.toLowerCase() });
        if (!admin) {
            return res.status(404).json({
                success: false,
                message: 'Admin not found'
            });
        }

        res.json({
            success: true,
            admin: {
                email: admin.email,
                isVerified: admin.isVerified,
                lastLogin: admin.lastLogin,
                createdAt: admin.createdAt
            }
        });

    } catch (error) {
        console.error('❌ Get admin profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

// Resend verification code
router.post('/resend-code', async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                success: false,
                message: 'Email is required'
            });
        }

        const admin = await Admin.findOne({ email: email.toLowerCase() });
        if (!admin) {
            return res.status(404).json({
                success: false,
                message: 'Admin not found'
            });
        }

        // Generate new verification code
        const verificationCode = admin.generateVerificationCode();
        await admin.save();

        // Send verification code email
        const emailResult = await sendVerificationCode(email, verificationCode);
        
        if (!emailResult.success) {
            return res.status(500).json({
                success: false,
                message: 'Failed to send verification code. Please try again.'
            });
        }

        res.json({
            success: true,
            message: 'New verification code sent to your email'
        });

    } catch (error) {
        console.error('❌ Resend verification code error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

export default router;

