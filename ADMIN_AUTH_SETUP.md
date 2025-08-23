# 🔐 Admin Authentication Setup Guide

This guide will help you set up the secure two-step authentication system for the Admin Dashboard.

## 📋 Prerequisites

1. **Node.js and npm** installed
2. **MongoDB** running locally or a cloud database
3. **Email account** (Gmail recommended for development)

## 🚀 Setup Instructions

### 1. Backend Configuration

#### Email Service Setup

Create a `.env` file in the `backend` directory with the following configuration:

```env
# Database Configuration
MONGODB_URI=mongodb://localhost:27017/crowdsource_ai

# Server Configuration
PORT=3000

# Email Configuration
# Option 1: Using Gmail (recommended for development)
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# Option 2: Using custom mailer configuration (for production)
# MAILER={"service":"gmail","auth":{"user":"your-email@gmail.com","pass":"your-app-password"}}

# Gemini AI Configuration
GEMINI_API_KEY=your-gemini-api-key
```

#### Gmail Setup (Recommended for Development)

1. **Enable 2-Factor Authentication**:
   - Go to your Google Account settings
   - Navigate to Security
   - Enable 2-Step Verification

2. **Generate App Password**:
   - Go to Security settings
   - Find "App passwords" under 2-Step Verification
   - Generate a new app password for "Mail"
   - Use this password in your `.env` file

3. **Alternative Email Services**:
   - **Outlook**: Use `service: "outlook"`
   - **Yahoo**: Use `service: "yahoo"`
   - **Custom SMTP**: Configure with your SMTP settings

### 2. Install Dependencies

```bash
# Backend dependencies
cd backend
npm install

# Frontend dependencies
cd ../frontend
npm install
```

### 3. Start the Servers

```bash
# Start backend server (from backend directory)
cd backend
npm start

# Start frontend server (from frontend directory)
cd frontend
npm run dev
```

## 🔑 How to Use

### 1. Admin Registration

1. Navigate to `/admin-register`
2. Enter your email address
3. Click "Register Admin Account"
4. Check your email for confirmation

### 2. Admin Login

1. Navigate to `/admin-login`
2. Enter your registered email
3. Click "Send Verification Code"
4. Check your email for the 6-digit code
5. Enter the code and click "Verify & Login"

### 3. Access Admin Dashboard

- After successful login, you'll be redirected to `/admin`
- The dashboard is now protected and requires authentication
- Your session will persist until you logout

## 🔒 Security Features

### Two-Step Authentication
- **Step 1**: Email verification
- **Step 2**: 6-digit verification code
- Codes expire after 10 minutes
- Resend functionality with 60-second cooldown

### Session Management
- Secure session tokens
- Automatic logout on invalid sessions
- Session persistence across browser sessions

### Email Security
- Professional email templates
- Secure code delivery
- Rate limiting on code requests

## 📧 Email Templates

The system includes professionally designed email templates:

### Registration Confirmation
- Welcome message
- Next steps instructions
- Professional branding

### Verification Code
- Clear 6-digit code display
- Security instructions
- Expiration warnings

## 🛠️ API Endpoints

### Admin Authentication
- `POST /api/admin/register` - Register new admin
- `POST /api/admin/request-code` - Request verification code
- `POST /api/admin/verify-code` - Verify code and login
- `POST /api/admin/resend-code` - Resend verification code
- `GET /api/admin/profile` - Get admin profile

## 🔧 Troubleshooting

### Email Not Sending
1. Check your email credentials in `.env`
2. Verify 2FA is enabled for Gmail
3. Use App Password instead of regular password
4. Check spam folder

### Verification Code Issues
1. Codes expire after 10 minutes
2. Wait 60 seconds before resending
3. Check email spam folder
4. Verify email address is correct

### Database Issues
1. Ensure MongoDB is running
2. Check connection string in `.env`
3. Verify database permissions

## 🚀 Production Deployment

### Environment Variables
- Use strong, unique passwords
- Store sensitive data in environment variables
- Use production email services (SendGrid, AWS SES)

### Security Considerations
- Enable HTTPS in production
- Implement rate limiting
- Add IP whitelisting if needed
- Regular security audits

## 📞 Support

If you encounter any issues:

1. Check the browser console for errors
2. Verify all environment variables are set
3. Ensure all dependencies are installed
4. Check MongoDB connection

---

**Note**: This authentication system provides enterprise-level security for your admin dashboard. Make sure to keep your email credentials secure and never commit them to version control.


