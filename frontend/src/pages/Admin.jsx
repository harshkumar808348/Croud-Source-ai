import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Admin = () => {
    const navigate = useNavigate();
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [adminInfo, setAdminInfo] = useState(null);
    const [images, setImages] = useState([]);
    const [selectedImage, setSelectedImage] = useState('');
    const [analysis, setAnalysis] = useState('');
    const [loading, setLoading] = useState(false);
    const [safetyScore, setSafetyScore] = useState(null);
    const [analyzingAll, setAnalyzingAll] = useState(false);
    const [currentFilter, setCurrentFilter] = useState('All'); // Add filter state
    const [stats, setStats] = useState({
        totalImages: 0,
        analyzedImages: 0,
        unanalyzedImages: 0,
        safeImages: 0,
        moderateImages: 0,
        dangerImages: 0
    });

    // Fetch images from the database
    const fetchImages = async () => {
        try {
            const response = await fetch('/api/images');
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const data = await response.json();
            if (data.success) {
                setImages(data.images);
                calculateStats(data.images);
            }
        } catch (err) {
            console.error('Error fetching images:', err);
        }
    };

    // Check authentication on component mount
    useEffect(() => {
        const checkAuth = () => {
            const adminSession = localStorage.getItem('adminSession');
            if (adminSession) {
                try {
                    const session = JSON.parse(adminSession);
                    setIsAuthenticated(true);
                    setAdminInfo(session);
                } catch (error) {
                    console.error('Invalid admin session:', error);
                    localStorage.removeItem('adminSession');
                    navigate('/admin-login');
                }
            } else {
                navigate('/admin-login');
            }
        };

        checkAuth();
    }, [navigate]);

    useEffect(() => {
        if (isAuthenticated) {
            fetchImages();
        }
    }, [isAuthenticated]);

    // Calculate statistics for the dashboard
    const calculateStats = (imageList) => {
        const total = imageList.length;
        const analyzed = imageList.filter(img => img.analysis || img.safetyScore).length;
        const unanalyzed = imageList.filter(img => !img.safetyScore).length;
        const safe = imageList.filter(img => img.safetyScore === 'Safe').length;
        const moderate = imageList.filter(img => img.safetyScore === 'Moderate').length;
        const danger = imageList.filter(img => img.safetyScore === 'Danger').length;

        setStats({
            totalImages: total,
            analyzedImages: analyzed,
            unanalyzedImages: unanalyzed,
            safeImages: safe,
            moderateImages: moderate,
            dangerImages: danger
        });
    };

    // Analyze all images automatically
    const analyzeAllImages = async () => {
        setAnalyzingAll(true);
        const unanalyzedImages = images.filter(img => !img.safetyScore);
        
        if (unanalyzedImages.length === 0) {
            setAnalyzingAll(false);
            return;
        }

        console.log(`Starting automatic analysis of ${unanalyzedImages.length} images...`);

        for (let i = 0; i < unanalyzedImages.length; i++) {
            const image = unanalyzedImages[i];
            try {
                console.log(`Analyzing image ${i + 1}/${unanalyzedImages.length}: ${image._id}`);
                
                const response = await fetch('/api/gemini/analyze', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ imageUrl: image.imageUrl }),
                });

                if (response.ok) {
                    const data = await response.json();
                    if (data.success) {
                        // Extract safety information from analysis
                        const safetyInfo = extractSafetyInfoFromText(data.analysis);
                        
                        // Save analysis results to database
                        try {
                            const updateResponse = await fetch(`/api/images/${image._id}/analysis`, {
                                method: 'PUT',
                                headers: {
                                    'Content-Type': 'application/json',
                                },
                                body: JSON.stringify({
                                    analysis: data.analysis,
                                    safetyScore: safetyInfo.level,
                                    safetyPercentage: safetyInfo.percentage
                                }),
                            });

                            if (updateResponse.ok) {
                                console.log(`✅ Analysis saved to database for image: ${image._id}`);
                            } else {
                                console.error(`❌ Failed to save analysis to database for image: ${image._id}`);
                            }
                        } catch (updateError) {
                            console.error(`❌ Error saving analysis to database for image ${image._id}:`, updateError);
                        }
                        
                        // Update the image with analysis results
                        const updatedImages = images.map(img => 
                            img._id === image._id 
                                ? { ...img, analysis: data.analysis, safetyScore: safetyInfo.level }
                                : img
                        );
                        
                        setImages(updatedImages);
                        calculateStats(updatedImages);
                        
                        // Add a small delay to avoid overwhelming the API
                        await new Promise(resolve => setTimeout(resolve, 1000));
                    }
                }
            } catch (error) {
                console.error(`Error analyzing image ${image._id}:`, error);
            }
        }
        
        setAnalyzingAll(false);
        console.log('Automatic analysis completed');
        
        // Refresh data from database to ensure consistency
        await fetchImages();
    };

    // Extract safety information from analysis text
    const extractSafetyInfoFromText = (analysisText) => {
        const lowerText = analysisText.toLowerCase();
        
        // Check for danger indicators
        const dangerKeywords = ['danger', 'unsafe', 'hazard', 'flood', 'pothole', 'damage', 'crack', 'critical', 'emergency', 'severe'];
        const safeKeywords = ['safe', 'good', 'normal', 'stable', 'intact', 'excellent', 'fine'];
        
        let dangerCount = 0;
        let safeCount = 0;
        
        dangerKeywords.forEach(keyword => {
            const regex = new RegExp(keyword, 'gi');
            const matches = analysisText.match(regex);
            if (matches) dangerCount += matches.length;
        });
        
        safeKeywords.forEach(keyword => {
            const regex = new RegExp(keyword, 'gi');
            const matches = analysisText.match(regex);
            if (matches) safeCount += matches.length;
        });
        
        // Calculate safety percentage
        const total = dangerCount + safeCount;
        if (total > 0) {
            const safetyPercentage = Math.round((safeCount / total) * 100);
            return {
                percentage: safetyPercentage,
                level: safetyPercentage >= 70 ? 'Safe' : safetyPercentage >= 40 ? 'Moderate' : 'Danger'
            };
        }
        
        // Default to moderate if no clear indicators
        return { percentage: 50, level: 'Moderate' };
    };

    // Analyze the selected image
    const analyzeImage = async (imageUrl) => {
        try {
            setLoading(true);
            setAnalysis('');
            setSelectedImage(imageUrl);
            setSafetyScore(null);

            const response = await fetch('/api/gemini/analyze', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ imageUrl }),
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Failed to analyze: ${errorText}`);
            }

            const data = await response.json();

            if (data.success) {
                setAnalysis(data.analysis);
                // Extract safety information from analysis
                const safetyInfo = extractSafetyInfoFromText(data.analysis);
                setSafetyScore(safetyInfo);
                
                // Save analysis results to database
                try {
                    // Find the image ID from the imageUrl
                    const image = images.find(img => img.imageUrl === imageUrl);
                    if (image) {
                        const updateResponse = await fetch(`/api/images/${image._id}/analysis`, {
                            method: 'PUT',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({
                                analysis: data.analysis,
                                safetyScore: safetyInfo.level,
                                safetyPercentage: safetyInfo.percentage
                            }),
                        });

                        if (updateResponse.ok) {
                            console.log(`✅ Analysis saved to database for image: ${image._id}`);
                            
                            // Update the local state to reflect the database change
                            const updatedImages = images.map(img => 
                                img._id === image._id 
                                    ? { ...img, analysis: data.analysis, safetyScore: safetyInfo.level }
                                    : img
                            );
                            setImages(updatedImages);
                            calculateStats(updatedImages);
                        } else {
                            console.error(`❌ Failed to save analysis to database for image: ${image._id}`);
                        }
                    }
                } catch (updateError) {
                    console.error(`❌ Error saving analysis to database:`, updateError);
                }
            } else {
                setAnalysis('Analysis failed: ' + data.message);
            }
        } catch (error) {
            console.error('Analysis Error:', error);
            setAnalysis('Error: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    // Extract safety information from analysis (for selected image)
    const extractSafetyInfo = (analysisText) => {
        const safetyInfo = extractSafetyInfoFromText(analysisText);
        setSafetyScore(safetyInfo);
    };

    const getSafetyColor = (level) => {
        switch (level) {
            case 'Safe': return 'text-green-600';
            case 'Moderate': return 'text-yellow-600';
            case 'Danger': return 'text-red-600';
            default: return 'text-gray-600';
        }
    };

    const getSafetyBgColor = (level) => {
        switch (level) {
            case 'Safe': return 'bg-green-100';
            case 'Moderate': return 'bg-yellow-100';
            case 'Danger': return 'bg-red-100';
            default: return 'bg-gray-100';
        }
    };

    const getSeverityIndicator = (level) => {
        switch (level) {
            case 'Safe':
                return (
                    <div className="flex items-center space-x-2 px-3 py-1 bg-green-100 rounded-full">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-green-700 text-xs font-semibold">Safe</span>
                    </div>
                );
            case 'Moderate':
                return (
                    <div className="flex items-center space-x-2 px-3 py-1 bg-yellow-100 rounded-full">
                        <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                        <span className="text-yellow-700 text-xs font-semibold">Moderate</span>
                    </div>
                );
            case 'Danger':
                return (
                    <div className="flex items-center space-x-2 px-3 py-1 bg-red-100 rounded-full">
                        <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                        <span className="text-red-700 text-xs font-semibold">Danger</span>
                    </div>
                );
            default:
                return (
                    <div className="flex items-center space-x-2 px-3 py-1 bg-gray-100 rounded-full">
                        <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
                        <span className="text-gray-700 text-xs font-semibold">Unanalyzed</span>
                    </div>
                );
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'Unknown';
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('en-IN', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch (error) {
            return 'Invalid Date';
        }
    };

    // Filter images based on current filter
    const getFilteredImages = () => {
        if (currentFilter === 'All') {
            return images;
        } else if (currentFilter === 'Unanalyzed') {
            return images.filter(img => !img.safetyScore);
        }
        return images.filter(img => img.safetyScore === currentFilter);
    };

    const handleLogout = () => {
        localStorage.removeItem('adminSession');
        setIsAuthenticated(false);
        setAdminInfo(null);
        navigate('/admin-login');
    };

    // Show loading while checking authentication
    if (!isAuthenticated) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 mx-auto mb-6"></div>
                    <p className="text-gray-600 text-lg font-medium">Checking authentication...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50">
            {/* Header */}
            <div className="bg-white/80 backdrop-blur-md shadow-sm border-b border-gray-200 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center py-4">
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                                <span className="text-white font-bold text-xl">C</span>
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">crowdsource.ai</h1>
                                <p className="text-sm text-gray-600">Admin Dashboard</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-4">
                            {/* Admin Info */}
                            {adminInfo && (
                                <div className="flex items-center space-x-3 bg-blue-50 px-4 py-2 rounded-xl border border-blue-100">
                                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                                        <span className="text-white text-sm font-bold">
                                            {adminInfo.email.charAt(0).toUpperCase()}
                                        </span>
                                    </div>
                                    <div className="text-sm">
                                        <p className="font-semibold text-gray-900">{adminInfo.email}</p>
                                        <p className="text-gray-500">Admin</p>
                                    </div>
                                </div>
                            )}
                            
                            <Link
                                to="/"
                                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all transform hover:scale-105 font-semibold shadow-lg"
                            >
                                ← Home
                            </Link>

                            {/* Logout Button */}
                            <button
                                onClick={handleLogout}
                                className="bg-gradient-to-r from-red-600 to-pink-600 text-white px-4 py-2 rounded-xl hover:from-red-700 hover:to-pink-700 font-semibold transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                            >
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Page Title */}
                <div className="text-center mb-12">
                    <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                        Community Issues 
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600"> Analytics Dashboard</span>
                    </h2>
                    <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                        Monitor and analyze infrastructure problems reported by your community. 
                        Use AI-powered insights to prioritize safety improvements.
                    </p>
                </div>

                {/* Auto Analysis Button */}
                <div className="text-center mb-8">
                    <button
                        onClick={analyzeAllImages}
                        disabled={analyzingAll}
                        className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-4 rounded-xl hover:from-purple-700 hover:to-pink-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed font-bold text-lg transition-all transform hover:scale-105 disabled:transform-none shadow-lg"
                    >
                        {analyzingAll ? (
                            <span className="flex items-center justify-center">
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                                Analyzing All Reports...
                            </span>
                        ) : (
                            '🤖 Auto-Analyze All Reports'
                        )}
                    </button>
                    <p className="text-sm text-gray-600 mt-2">
                        Automatically analyze all unanalyzed reports with AI to determine severity levels
                    </p>
                </div>

                {/* Statistics Dashboard */}
                <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-12">
                    <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all transform hover:-translate-y-1">
                        <div className="flex items-center">
                            <div className="p-3 bg-blue-100 rounded-xl">
                                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Total Reports</p>
                                <p className="text-3xl font-bold text-gray-900">{stats.totalImages}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all transform hover:-translate-y-1">
                        <div className="flex items-center">
                            <div className="p-3 bg-green-100 rounded-xl">
                                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Analyzed</p>
                                <p className="text-3xl font-bold text-gray-900">{stats.analyzedImages}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all transform hover:-translate-y-1">
                        <div className="flex items-center">
                            <div className="p-3 bg-green-100 rounded-xl">
                                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Safe</p>
                                <p className="text-3xl font-bold text-green-600">{stats.safeImages}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all transform hover:-translate-y-1">
                        <div className="flex items-center">
                            <div className="p-3 bg-yellow-100 rounded-xl">
                                <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                </svg>
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Moderate</p>
                                <p className="text-3xl font-bold text-yellow-600">{stats.moderateImages}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all transform hover:-translate-y-1">
                        <div className="flex items-center">
                            <div className="p-3 bg-red-100 rounded-xl">
                                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                </svg>
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Danger</p>
                                <p className="text-3xl font-bold text-red-600">{stats.dangerImages}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filter Buttons */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-8">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
                        <div>
                            <h3 className="text-lg font-bold text-gray-900">Filter Reports</h3>
                            <p className="text-sm text-gray-600">Click on a status to filter reports</p>
                        </div>
                        <div className="text-sm text-gray-500 mt-2 sm:mt-0">
                            Showing {getFilteredImages().length} of {images.length} reports
                        </div>
                    </div>
                    <div className="flex flex-wrap gap-3">
                        <button
                            onClick={() => setCurrentFilter('All')}
                            className={`px-6 py-3 rounded-xl font-semibold transition-all transform hover:scale-105 ${
                                currentFilter === 'All'
                                    ? 'bg-gradient-to-r from-gray-600 to-gray-700 text-white shadow-lg'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                        >
                            📊 All Reports ({images.length})
                        </button>
                        <button
                            onClick={() => setCurrentFilter('Danger')}
                            className={`px-6 py-3 rounded-xl font-semibold transition-all transform hover:scale-105 ${
                                currentFilter === 'Danger'
                                    ? 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg'
                                    : 'bg-red-100 text-red-700 hover:bg-red-200'
                            }`}
                        >
                            ⚠️ Danger ({stats.dangerImages})
                        </button>
                        <button
                            onClick={() => setCurrentFilter('Moderate')}
                            className={`px-6 py-3 rounded-xl font-semibold transition-all transform hover:scale-105 ${
                                currentFilter === 'Moderate'
                                    ? 'bg-gradient-to-r from-yellow-600 to-yellow-700 text-white shadow-lg'
                                    : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                            }`}
                        >
                            ⚡ Moderate ({stats.moderateImages})
                        </button>
                        <button
                            onClick={() => setCurrentFilter('Safe')}
                            className={`px-6 py-3 rounded-xl font-semibold transition-all transform hover:scale-105 ${
                                currentFilter === 'Safe'
                                    ? 'bg-gradient-to-r from-green-600 to-green-700 text-white shadow-lg'
                                    : 'bg-green-100 text-green-700 hover:bg-green-200'
                            }`}
                        >
                            ✅ Safe ({stats.safeImages})
                        </button>
                        <button
                            onClick={() => setCurrentFilter('Unanalyzed')}
                            className={`px-6 py-3 rounded-xl font-semibold transition-all transform hover:scale-105 ${
                                currentFilter === 'Unanalyzed'
                                    ? 'bg-gradient-to-r from-gray-600 to-gray-700 text-white shadow-lg'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                        >
                            🔍 Unanalyzed ({stats.unanalyzedImages})
                        </button>
                    </div>
                </div>

                {/* Main Content */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Image Grid */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-2xl shadow-lg border border-gray-100">
                            <div className="px-8 py-6 border-b border-gray-100">
                                <h2 className="text-2xl font-bold text-gray-900">Reports for Analysis</h2>
                                <p className="text-gray-600">Click on any report to analyze it with AI for safety assessment</p>
                            </div>
                            <div className="p-8">
                                {getFilteredImages().length === 0 ? (
                                    <div className="text-center py-12">
                                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.47-.881-6.08-2.33" />
                                            </svg>
                                        </div>
                                        <h3 className="text-lg font-semibold text-gray-700 mb-2">No {currentFilter} Reports Found</h3>
                                        <p className="text-sm text-gray-500 mb-4">
                                            {currentFilter === 'All' 
                                                ? 'No reports available at the moment.' 
                                                : currentFilter === 'Unanalyzed'
                                                ? 'All reports have been analyzed. Great job!'
                                                : `No reports classified as "${currentFilter}" found. Try selecting a different filter or analyze more reports.`
                                            }
                                        </p>
                                        {currentFilter !== 'All' && (
                                            <button
                                                onClick={() => setCurrentFilter('All')}
                                                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all font-semibold"
                                            >
                                                View All Reports
                                            </button>
                                        )}
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {getFilteredImages().map(image => (
                                        <div key={image._id} className={`border rounded-2xl overflow-hidden hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 ${
                                            image.safetyScore === 'Danger' ? 'border-red-300 bg-red-50' :
                                            image.safetyScore === 'Moderate' ? 'border-yellow-300 bg-yellow-50' :
                                            image.safetyScore === 'Safe' ? 'border-green-300 bg-green-50' :
                                            'border-gray-200'
                                        }`}>
                                            <img
                                                src={image.imageUrl}
                                                alt="Community infrastructure report"
                                                className="w-full h-48 object-cover cursor-pointer hover:opacity-90 transition-opacity"
                                                onClick={() => analyzeImage(image.imageUrl)}
                                            />
                                            <div className="p-6">
                                                {/* Severity Indicator */}
                                                <div className="flex justify-between items-start mb-4">
                                                    <div className="flex items-center space-x-2">
                                                        <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                                                            <span className="text-white font-semibold text-sm">
                                                                {image.userName ? image.userName.charAt(0).toUpperCase() : 'U'}
                                                            </span>
                                                        </div>
                                                        <span className="font-semibold text-gray-800 text-sm">
                                                            {image.userName || 'Anonymous'}
                                                        </span>
                                                    </div>
                                                    {getSeverityIndicator(image.safetyScore)}
                                                </div>
                                                
                                                <p className="text-sm text-gray-600 mb-3">
                                                    {image.userArea || 'Unknown Area'} • {image.userPincode || 'No Pincode'}
                                                </p>
                                                
                                                {image.location && image.location.latitude && image.location.longitude && (
                                                    <p className="text-sm text-green-600 mb-3 flex items-center">
                                                        <span className="mr-1">📍</span>
                                                        {Number(image.location.latitude).toFixed(4)}, {Number(image.location.longitude).toFixed(4)}
                                                    </p>
                                                )}
                                                
                                                <p className="text-xs text-gray-500 mb-4">
                                                    {formatDate(image.uploadedAt)}
                                                </p>
                                                
                                                <button
                                                    onClick={() => analyzeImage(image.imageUrl)}
                                                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-4 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all font-semibold transform hover:scale-105"
                                                >
                                                    🔍 Analyze Report
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Analysis Panel */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 sticky top-24">
                            <div className="px-6 py-6 border-b border-gray-100">
                                <h2 className="text-xl font-bold text-gray-900">AI Safety Analysis</h2>
                                <p className="text-gray-600">Real-time infrastructure safety assessment</p>
                            </div>
                            <div className="p-6">
                                {selectedImage ? (
                                    <div className="space-y-6">
                                        {/* Selected Image */}
                                        <div>
                                            <h3 className="text-sm font-semibold text-gray-700 mb-3">Selected Report:</h3>
                                            <img
                                                src={selectedImage}
                                                alt="Selected infrastructure issue"
                                                className="w-full h-40 object-cover rounded-xl border-2 border-gray-200"
                                            />
                                        </div>

                                        {/* Safety Score Display */}
                                        {safetyScore && (
                                            <div className={`p-4 rounded-xl ${getSafetyBgColor(safetyScore.level)} border border-gray-200`}>
                                                <div className="flex items-center justify-between mb-3">
                                                    <span className="font-semibold text-gray-800">Safety Assessment:</span>
                                                    <span className={`font-bold text-xl ${getSafetyColor(safetyScore.level)}`}>
                                                        {safetyScore.level}
                                                    </span>
                                                </div>
                                                <div className="space-y-3">
                                                    <div className="flex justify-between text-sm text-gray-600">
                                                        <span>Safety Score</span>
                                                        <span className="font-semibold">{safetyScore.percentage}%</span>
                                                    </div>
                                                    <div className="w-full bg-gray-200 rounded-full h-3">
                                                        <div 
                                                            className={`h-3 rounded-full transition-all duration-500 ${
                                                                safetyScore.level === 'Safe' ? 'bg-green-500' :
                                                                safetyScore.level === 'Moderate' ? 'bg-yellow-500' : 'bg-red-500'
                                                            }`}
                                                            style={{ width: `${safetyScore.percentage}%` }}
                                                        ></div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* Analysis Text */}
                                        {loading ? (
                                            <div className="flex items-center space-x-3 text-blue-600 bg-blue-50 p-4 rounded-xl">
                                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                                                <span className="font-medium">Analyzing infrastructure safety...</span>
                                            </div>
                                        ) : (
                                            <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                                                <h3 className="text-sm font-semibold text-gray-700 mb-3">AI Analysis:</h3>
                                                <pre className="whitespace-pre-wrap font-sans text-gray-700 leading-relaxed text-sm">
                                                    {analysis || 'Click on a report to start AI analysis'}
                                                </pre>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="text-center py-12 text-gray-500">
                                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                        </div>
                                        <h3 className="text-lg font-semibold text-gray-700 mb-2">Select a Report</h3>
                                        <p className="text-sm">Choose any community report to analyze with AI</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Admin;
