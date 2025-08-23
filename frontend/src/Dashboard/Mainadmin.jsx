import React, { useState, useEffect } from 'react';

const ImageAnalysis = () => {
    const [images, setImages] = useState([]);
    const [selectedImage, setSelectedImage] = useState('');
    const [analysis, setAnalysis] = useState('');
    const [loading, setLoading] = useState(false);
    const [safetyScore, setSafetyScore] = useState(null);

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
            }
        } catch (err) {
            console.error('Error fetching images:', err);
        }
    };

    useEffect(() => {
        fetchImages();
    }, []);

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
                extractSafetyInfo(data.analysis);
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

    // Extract safety information from analysis
    const extractSafetyInfo = (analysisText) => {
        const lowerText = analysisText.toLowerCase();
        
        // Check for danger indicators
        const dangerKeywords = ['danger', 'unsafe', 'hazard', 'flood', 'pothole', 'damage', 'crack'];
        const safeKeywords = ['safe', 'good', 'normal', 'stable', 'intact'];
        
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
            setSafetyScore({
                percentage: safetyPercentage,
                level: safetyPercentage >= 70 ? 'Safe' : safetyPercentage >= 40 ? 'Moderate' : 'Danger',
                color: safetyPercentage >= 70 ? 'green' : safetyPercentage >= 40 ? 'yellow' : 'red'
            });
        }
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

    return (
        <div className="max-w-6xl mx-auto p-6">
            <h2 className="text-3xl font-bold text-center mb-8 text-gray-800">
                Image Analysis with Gemini AI 🔍
            </h2>

            {/* Image Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {images.map(image => (
                    <div key={image._id} className="border border-gray-200 rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow">
                        <img
                            src={image.imageUrl}
                            alt="Database content"
                            className="w-full h-48 object-cover cursor-pointer hover:opacity-90 transition-opacity"
                            onClick={() => analyzeImage(image.imageUrl)}
                        />
                        <div className="p-4 bg-white">
                            {/* User Information */}
                            <div className="mb-3 pb-3 border-b border-gray-100">
                                <div className="flex items-center space-x-2 mb-2">
                                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                                        <span className="text-blue-600 font-semibold text-xs">
                                            {image.userName ? image.userName.charAt(0).toUpperCase() : 'U'}
                                        </span>
                                    </div>
                                    <span className="font-medium text-gray-800 text-sm">
                                        {image.userName || 'Anonymous'}
                                    </span>
                                </div>
                                <p className="text-xs text-gray-600">
                                    {image.userArea || 'Unknown Area'}, {image.userPincode || 'No Pincode'}
                                </p>
                                {image.location && image.location.latitude && image.location.longitude && (
                                    <p className="text-xs text-green-600 mt-1">
                                        📍 Located: {Number(image.location.latitude).toFixed(4)}, {Number(image.location.longitude).toFixed(4)}
                                    </p>
                                )}
                            </div>
                            
                            <button
                                onClick={() => analyzeImage(image.imageUrl)}
                                className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition-colors font-medium"
                            >
                                Analyze Image
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Selected Image & Analysis */}
            {selectedImage && (
                <div className="border border-gray-300 rounded-lg p-6 bg-white shadow-lg">
                    <h3 className="text-xl font-semibold mb-4 text-gray-800">Selected Image:</h3>
                    <div className="flex flex-col md:flex-row gap-6">
                        <div className="flex-shrink-0">
                            <img
                                src={selectedImage}
                                alt="Selected"
                                className="max-w-sm h-auto rounded-lg border border-gray-200"
                            />
                        </div>
                        
                        <div className="flex-1">
                            <h3 className="text-xl font-semibold mb-4 text-gray-800">AI Analysis Results:</h3>
                            
                            {/* Safety Score Display */}
                            {safetyScore && (
                                <div className={`mb-4 p-4 rounded-lg ${getSafetyBgColor(safetyScore.level)}`}>
                                    <div className="flex items-center justify-between">
                                        <span className="font-semibold text-gray-800">Safety Assessment:</span>
                                        <span className={`font-bold text-lg ${getSafetyColor(safetyScore.level)}`}>
                                            {safetyScore.level}
                                        </span>
                                    </div>
                                    <div className="mt-2">
                                        <div className="flex justify-between text-sm text-gray-600 mb-1">
                                            <span>Safety Score</span>
                                            <span>{safetyScore.percentage}%</span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-2">
                                            <div 
                                                className={`h-2 rounded-full transition-all duration-500 ${
                                                    safetyScore.level === 'Safe' ? 'bg-green-500' :
                                                    safetyScore.level === 'Moderate' ? 'bg-yellow-500' : 'bg-red-500'
                                                }`}
                                                style={{ width: `${safetyScore.percentage}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {loading ? (
                                <div className="flex items-center space-x-2 text-blue-600">
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                                    <span>Analyzing image...</span>
                                </div>
                            ) : (
                                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                    <pre className="whitespace-pre-wrap font-sans text-gray-700 leading-relaxed">
                                        {analysis || 'Click on an image to analyze it'}
                                    </pre>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ImageAnalysis;