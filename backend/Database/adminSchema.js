import mongoose from 'mongoose';

const adminSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    verificationCode: {
        code: String,
        expiresAt: Date
    },
    lastLogin: {
        type: Date,
        default: null
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Update the updatedAt field before saving
adminSchema.pre('save', function(next) {
    this.updatedAt = new Date();
    next();
});

// Method to generate verification code
adminSchema.methods.generateVerificationCode = function() {
    const code = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit code
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes expiry
    
    this.verificationCode = {
        code: code,
        expiresAt: expiresAt
    };
    
    return code;
};

// Method to verify code
adminSchema.methods.verifyCode = function(inputCode) {
    if (!this.verificationCode || !this.verificationCode.code) {
        return false;
    }
    
    if (new Date() > this.verificationCode.expiresAt) {
        return false;
    }
    
    return this.verificationCode.code === inputCode;
};

// Method to clear verification code after successful login
adminSchema.methods.clearVerificationCode = function() {
    this.verificationCode = undefined;
    this.isVerified = true;
    this.lastLogin = new Date();
};

const Admin = mongoose.model('Admin', adminSchema);

export default Admin;

