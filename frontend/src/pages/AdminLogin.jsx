import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const AdminLogin = () => {
    const [email, setEmail] = useState('');
    const [verificationCode, setVerificationCode] = useState('');
    const [step, setStep] = useState(1); // 1: email, 2: verification code
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState('');
    const [resendTimer, setResendTimer] = useState(0);
    const navigate = useNavigate();

    const handleRequestCode = async (e) => {
        e.preventDefault();
        
        if (!email.trim()) {
            setMessage('Please enter a valid email address');
            setMessageType('error');
            return;
        }

        setLoading(true);
        setMessage('');

        try {
            const response = await fetch('/api/admin/request-code', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email: email.trim() })
            });

            const data = await response.json();

            if (data.success) {
                setMessage(data.message);
                setMessageType('success');
                setStep(2);
                startResendTimer();
            } else {
                setMessage(data.message);
                setMessageType('error');
            }
        } catch (error) {
            console.error('Request code error:', error);
            setMessage('Network error. Please try again.');
            setMessageType('error');
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyCode = async (e) => {
        e.preventDefault();
        
        if (!verificationCode.trim()) {
            setMessage('Please enter the verification code');
            setMessageType('error');
            return;
        }

        setLoading(true);
        setMessage('');

        try {
            const response = await fetch('/api/admin/verify-code', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 
                    email: email.trim(),
                    code: verificationCode.trim()
                })
            });

            const data = await response.json();

            if (data.success) {
                setMessage('Login successful! Redirecting to dashboard...');
                setMessageType('success');
                
                // Store admin session
                localStorage.setItem('adminSession', JSON.stringify({
                    email: data.admin.email,
                    sessionToken: data.sessionToken,
                    lastLogin: data.admin.lastLogin
                }));
                
                // Redirect to admin dashboard
                setTimeout(() => {
                    navigate('/admin');
                }, 2000);
            } else {
                setMessage(data.message);
                setMessageType('error');
            }
        } catch (error) {
            console.error('Verify code error:', error);
            setMessage('Network error. Please try again.');
            setMessageType('error');
        } finally {
            setLoading(false);
        }
    };

    const handleResendCode = async () => {
        if (resendTimer > 0) return;

        setLoading(true);
        setMessage('');

        try {
            const response = await fetch('/api/admin/resend-code', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email: email.trim() })
            });

            const data = await response.json();

            if (data.success) {
                setMessage(data.message);
                setMessageType('success');
                startResendTimer();
            } else {
                setMessage(data.message);
                setMessageType('error');
            }
        } catch (error) {
            console.error('Resend code error:', error);
            setMessage('Network error. Please try again.');
            setMessageType('error');
        } finally {
            setLoading(false);
        }
    };

    const startResendTimer = () => {
        setResendTimer(60);
        const interval = setInterval(() => {
            setResendTimer((prev) => {
                if (prev <= 1) {
                    clearInterval(interval);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    };

    const goBackToEmail = () => {
        setStep(1);
        setVerificationCode('');
        setMessage('');
        setMessageType('');
        setResendTimer(0);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                <div className="bg-white rounded-3xl shadow-2xl p-8 border border-gray-100">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                            </svg>
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900 mb-2">Admin Login</h1>
                        <p className="text-gray-600">
                            {step === 1 ? 'Enter your email to continue' : 'Enter verification code'}
                        </p>
                    </div>

                    {/* Message Display */}
                    {message && (
                        <div className={`mb-6 p-4 rounded-xl ${
                            messageType === 'success' 
                                ? 'bg-green-50 border border-green-200 text-green-700' 
                                : 'bg-red-50 border border-red-200 text-red-700'
                        }`}>
                            <div className="flex items-center space-x-2">
                                {messageType === 'success' ? (
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                ) : (
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                    </svg>
                                )}
                                <span className="font-medium">{message}</span>
                            </div>
                        </div>
                    )}

                    {/* Step 1: Email Input */}
                    {step === 1 && (
                        <form onSubmit={handleRequestCode} className="space-y-6">
                            <div>
                                <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                                    Email Address
                                </label>
                                <input
                                    type="email"
                                    id="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="Enter your admin email"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                    required
                                    disabled={loading}
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading || !email.trim()}
                                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-xl hover:from-blue-700 hover:to-indigo-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed font-semibold transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                            >
                                {loading ? (
                                    <div className="flex items-center justify-center space-x-2">
                                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                                        <span>Sending Code...</span>
                                    </div>
                                ) : (
                                    'Send Verification Code'
                                )}
                            </button>
                        </form>
                    )}

                    {/* Step 2: Verification Code */}
                    {step === 2 && (
                        <form onSubmit={handleVerifyCode} className="space-y-6">
                            <div>
                                <label htmlFor="code" className="block text-sm font-semibold text-gray-700 mb-2">
                                    Verification Code
                                </label>
                                <input
                                    type="text"
                                    id="code"
                                    value={verificationCode}
                                    onChange={(e) => setVerificationCode(e.target.value)}
                                    placeholder="Enter 6-digit code"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-center text-2xl font-mono tracking-widest"
                                    maxLength="6"
                                    required
                                    disabled={loading}
                                />
                                <p className="text-sm text-gray-500 mt-2 text-center">
                                    Enter the 6-digit code sent to {email}
                                </p>
                            </div>

                            <button
                                type="submit"
                                disabled={loading || !verificationCode.trim()}
                                className="w-full bg-gradient-to-r from-green-600 to-blue-600 text-white py-3 rounded-xl hover:from-green-700 hover:to-blue-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed font-semibold transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                            >
                                {loading ? (
                                    <div className="flex items-center justify-center space-x-2">
                                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                                        <span>Verifying...</span>
                                    </div>
                                ) : (
                                    'Verify & Login'
                                )}
                            </button>

                            {/* Resend Code Button */}
                            <div className="text-center">
                                <button
                                    type="button"
                                    onClick={handleResendCode}
                                    disabled={resendTimer > 0 || loading}
                                    className="text-blue-600 hover:text-blue-700 disabled:text-gray-400 font-medium transition-colors"
                                >
                                    {resendTimer > 0 
                                        ? `Resend code in ${resendTimer}s` 
                                        : 'Resend verification code'
                                    }
                                </button>
                            </div>

                            {/* Back to Email */}
                            <div className="text-center">
                                <button
                                    type="button"
                                    onClick={goBackToEmail}
                                    className="text-gray-500 hover:text-gray-700 text-sm transition-colors flex items-center justify-center space-x-1 mx-auto"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                    </svg>
                                    <span>Back to email</span>
                                </button>
                            </div>
                        </form>
                    )}

                    {/* Info Section */}
                    <div className="mt-8 p-4 bg-blue-50 rounded-xl border border-blue-100">
                        <h3 className="text-sm font-semibold text-blue-900 mb-2">Two-Step Security</h3>
                        <ul className="text-sm text-blue-700 space-y-1">
                            <li>• Enter your registered email address</li>
                            <li>• Check your email for a verification code</li>
                            <li>• Enter the code to access the dashboard</li>
                            <li>• Codes expire after 10 minutes</li>
                        </ul>
                    </div>

                    {/* Navigation */}
                    <div className="mt-6 text-center">
                        <p className="text-gray-600 text-sm">
                            Don't have an account?{' '}
                            <Link 
                                to="/admin-register" 
                                className="text-blue-600 hover:text-blue-700 font-semibold transition-colors"
                            >
                                Register here
                            </Link>
                        </p>
                    </div>

                    {/* Back to Home */}
                    <div className="mt-4 text-center">
                        <Link 
                            to="/" 
                            className="text-gray-500 hover:text-gray-700 text-sm transition-colors flex items-center justify-center space-x-1"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                            <span>Back to Home</span>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminLogin;


