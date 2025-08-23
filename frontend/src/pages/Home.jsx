import React, { useState, useCallback, useEffect } from 'react';
import { Link } from 'react-router-dom';
import FileUpload from '../Dashboard/Upload';
import ImageShow from '../Dashboard/ImageShow';
import Chatbot from '../components/Chatbot';

const Home = () => {
    const [refreshKey, setRefreshKey] = useState(0);
    const [scrollY, setScrollY] = useState(0);

    const handleImageUploaded = useCallback(() => {
        setRefreshKey(prev => prev + 1);
    }, []);

    useEffect(() => {
        const handleScroll = () => setScrollY(window.scrollY);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <div className="min-h-screen relative overflow-hidden">
            {/* Animated Background */}
            <div className="fixed inset-0 -z-10">
                {/* Primary gradient background */}
                <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-100/50"></div>
                
                {/* Animated geometric shapes */}
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden">
                    <div 
                        className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-full blur-3xl animate-pulse"
                        style={{ animationDuration: '8s' }}
                    ></div>
                    <div 
                        className="absolute top-40 right-20 w-96 h-96 bg-gradient-to-r from-emerald-400/15 to-teal-400/15 rounded-full blur-3xl animate-pulse"
                        style={{ animationDuration: '12s', animationDelay: '2s' }}
                    ></div>
                    <div 
                        className="absolute bottom-20 left-1/4 w-80 h-80 bg-gradient-to-r from-purple-400/10 to-pink-400/10 rounded-full blur-3xl animate-pulse"
                        style={{ animationDuration: '10s', animationDelay: '4s' }}
                    ></div>
                </div>

                {/* Grid pattern overlay */}
                <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%239C92AC%22%20fill-opacity%3D%220.03%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%221%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-50"></div>
            </div>

            {/* Header with Glassmorphism */}
            <header 
                className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
                    scrollY > 50 ? 'bg-white/80 backdrop-blur-xl shadow-lg' : 'bg-transparent'
                }`}
            >
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center py-4">
                        <div className="flex items-center space-x-4">
                            <div className="relative">
                                <div className="w-12 h-12 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                                    <span className="text-white font-bold text-xl">C</span>
                                </div>
                                <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 rounded-2xl blur opacity-30 animate-pulse"></div>
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                                    crowdsource.ai
                                </h1>
                                <p className="text-sm text-gray-600 font-medium">Community-driven infrastructure reporting</p>
                            </div>
                        </div>
                        <Link
                            to="/admin"
                            className="group relative px-6 py-3 rounded-2xl font-semibold text-white overflow-hidden transition-all duration-300 hover:scale-105"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 via-green-500 to-emerald-600"></div>
                            <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 via-green-600 to-emerald-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                            <span className="relative flex items-center space-x-2">
                                <span>🚀</span>
                                <span>Admin Dashboard</span>
                            </span>
                        </Link>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="relative pt-24">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    {/* Hero Section */}
                    <section className="text-center mb-20">
                        <div className="max-w-4xl mx-auto">
                            <div className="mb-8">
                                <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-blue-100 text-blue-800 border border-blue-200">
                                    🎯 AI-Powered Community Reporting
                                </span>
                            </div>
                            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
                                <span className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent">
                                    Report Local Issues,
                                </span>
                                <br />
                                <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                                    Improve Your Community
                                </span>
                            </h1>
                            <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed mb-8">
                                Help make your neighborhood safer by reporting potholes, waterlogging, poor road conditions, and other infrastructure problems. 
                                Together, we can build better communities.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                                <button 
                                    onClick={() => document.getElementById('image-upload')?.click()}
                                    className="group relative px-8 py-4 rounded-2xl font-semibold text-white overflow-hidden transition-all duration-300 hover:scale-105 shadow-xl"
                                >
                                    <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600"></div>
                                    <div className="absolute inset-0 bg-gradient-to-r from-blue-700 via-purple-700 to-indigo-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                    <span className="relative flex items-center space-x-2">
                                        <span>📸</span>
                                        <span>Report an Issue Now</span>
                                    </span>
                                </button>
                                <Link
                                    to="/admin"
                                    className="group px-8 py-4 rounded-2xl font-semibold border-2 border-gray-300 text-gray-700 hover:border-gray-400 hover:text-gray-900 transition-all duration-300 hover:scale-105 bg-white/50 backdrop-blur-sm"
                                >
                                    <span className="flex items-center space-x-2">
                                        <span>📊</span>
                                        <span>View Reports</span>
                                    </span>
                                </Link>
                            </div>
                        </div>
                    </section>

                    {/* Upload Section with Glassmorphism */}
                    <section className="mb-20">
                        <div className="bg-white/60 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/20">
                            <FileUpload onImageUploaded={handleImageUploaded} />
                        </div>
                    </section>
                    
                    {/* Image Gallery Section */}
                    <section className="mb-20">
                        <div className="text-center mb-12">
                            <h2 className="text-4xl md:text-5xl font-bold mb-4">
                                <span className="bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                                    Recent Community Reports
                                </span>
                            </h2>
                            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                                See what issues your neighbors have reported and their current status
                            </p>
                        </div>
                        <div className="bg-white/60 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/20">
                            <ImageShow key={`show-${refreshKey}`} />
                        </div>
                    </section>
                    
                    {/* Features Section */}
                    <section className="mb-20">
                        <div className="text-center mb-12">
                            <h2 className="text-4xl md:text-5xl font-bold mb-4">
                                <span className="bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                                    Platform Features
                                </span>
                            </h2>
                            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                                Everything you need to make your community safer and better
                            </p>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {/* Analytics Dashboard */}
                            <div className="group bg-white/60 backdrop-blur-xl rounded-3xl p-8 shadow-xl border border-white/20 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
                                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                    </svg>
                                </div>
                                <h3 className="text-2xl font-bold text-gray-900 mb-4">Analytics Dashboard</h3>
                                <p className="text-gray-600 mb-6 leading-relaxed">
                                    Track reported issues, view safety assessments, and monitor community improvements with real-time analytics.
                                </p>
                                <Link
                                    to="/admin"
                                    className="inline-flex items-center text-blue-600 hover:text-blue-700 font-semibold group/link"
                                >
                                    <span>View Dashboard</span>
                                    <svg className="w-5 h-5 ml-2 group-hover/link:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </Link>
                            </div>
                            
                            {/* Report Issues */}
                            <div className="group bg-white/60 backdrop-blur-xl rounded-3xl p-8 shadow-xl border border-white/20 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
                                <div className="w-16 h-16 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                    </svg>
                                </div>
                                <h3 className="text-2xl font-bold text-gray-900 mb-4">Report Issues</h3>
                                <p className="text-gray-600 mb-6 leading-relaxed">
                                    Upload photos with location data to report infrastructure problems in your area with AI-powered analysis.
                                </p>
                                <span className="inline-flex items-center text-emerald-600 font-semibold">
                                    <span>Upload Above</span>
                                    <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                                    </svg>
                                </span>
                            </div>

                            {/* Community Driven */}
                            <div className="group bg-white/60 backdrop-blur-xl rounded-3xl p-8 shadow-xl border border-white/20 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
                                <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                    </svg>
                                </div>
                                <h3 className="text-2xl font-bold text-gray-900 mb-4">Community Driven</h3>
                                <p className="text-gray-600 mb-6 leading-relaxed">
                                    Join thousands of citizens working together to improve local infrastructure and build safer communities.
                                </p>
                                <span className="inline-flex items-center text-purple-600 font-semibold">
                                    Be Part of the Solution
                                </span>
                            </div>
                        </div>
                    </section>

                    {/* Call to Action Section */}
                    <section className="mb-20">
                        <div className="relative bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 rounded-3xl p-12 text-center text-white overflow-hidden">
                            {/* Background decoration */}
                            <div className="absolute top-0 left-0 w-full h-full">
                                <div className="absolute top-10 left-10 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
                                <div className="absolute bottom-10 right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
                                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-60 h-60 bg-white/5 rounded-full blur-3xl"></div>
                            </div>
                            
                            <div className="relative z-10">
                                <h2 className="text-4xl md:text-5xl font-bold mb-6">Ready to Make a Difference?</h2>
                                <p className="text-xl md:text-2xl text-blue-100 mb-8 max-w-3xl mx-auto leading-relaxed">
                                    Your reports help local authorities identify and fix infrastructure problems faster. 
                                    Every photo counts towards building a safer community!
                                </p>
                                <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
                                    <button 
                                        onClick={() => document.getElementById('image-upload')?.click()}
                                        className="group px-8 py-4 rounded-2xl font-semibold bg-white text-blue-600 hover:bg-gray-100 transition-all duration-300 hover:scale-105 shadow-xl"
                                    >
                                        <span className="flex items-center space-x-2">
                                            <span>📸</span>
                                            <span>Report an Issue Now</span>
                                        </span>
                                    </button>
                                    <Link
                                        to="/admin"
                                        className="group px-8 py-4 rounded-2xl font-semibold border-2 border-white text-white hover:bg-white hover:text-blue-600 transition-all duration-300 hover:scale-105"
                                    >
                                        <span className="flex items-center space-x-2">
                                            <span>📊</span>
                                            <span>View Reports</span>
                                        </span>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </section>
                </div>
            </main>
            
            {/* Chatbot */}
            <Chatbot />
        </div>
    );
};

export default Home;
