import React from 'react'
import { Link } from 'react-router-dom'

const ImageShow = () => {
    const [images, setImages] = React.useState([])
    const [loading, setLoading] = React.useState(true)
    const [error, setError] = React.useState(null)
    const [userIdentifier] = React.useState(() => {
        // Generate a unique identifier for this user session
        const existing = localStorage.getItem('userIdentifier');
        if (existing) return existing;
        const newId = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        localStorage.setItem('userIdentifier', newId);
        return newId;
    });

    const fetchImages = async () => {
        try {
            setLoading(true)
            setError(null)
            const response = await fetch('/api/images')
            if (!response.ok) {
                throw new Error('Failed to fetch images')
            }
            const data = await response.json()
            if (data.success) {
                setImages(data.images)
            } else {
                setError(data.message || 'Failed to fetch images')
            }
        } catch (err) {
            console.error('Error:', err)
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    React.useEffect(() => {
        fetchImages()
    }, [])

    const formatDate = (dateString) => {
        const date = new Date(dateString)
        return date.toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    const safeRender = (value, fallback = 'N/A') => {
        if (value === null || value === undefined || value === '') {
            return fallback;
        }
        return value;
    };

    const safeNumberFormat = (value, decimals = 6) => {
        if (value === null || value === undefined || isNaN(value)) {
            return 'N/A';
        }
        try {
            return Number(value).toFixed(decimals);
        } catch (error) {
            return 'N/A';
        }
    };

    const handleLike = async (imageId, currentLikes, currentLikedBy) => {
        try {
            console.log('Liking post:', imageId, 'User:', userIdentifier);
            const response = await fetch(`/api/images/${imageId}/like`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userIdentifier })
            });

            console.log('Response status:', response.status);
            if (response.ok) {
                const data = await response.json();
                console.log('Response data:', data);
                if (data.success) {
                    // Update the local state
                    setImages(prev => prev.map(img => {
                        if (img._id === imageId) {
                            return {
                                ...img,
                                likes: data.likes,
                                likedBy: data.isLiked 
                                    ? [...(img.likedBy || []), userIdentifier]
                                    : (img.likedBy || []).filter(id => id !== userIdentifier)
                            };
                        }
                        return img;
                    }));
                }
            } else {
                const errorText = await response.text();
                console.error('API Error:', errorText);
            }
        } catch (err) {
            console.error('Error liking post:', err);
        }
    };

    const handleShare = (imageId) => {
        const shareUrl = `${window.location.origin}/post/${imageId}`;
        if (navigator.share) {
            navigator.share({
                title: 'Community Issue Report',
                text: 'Check out this infrastructure issue reported in our community',
                url: shareUrl
            });
        } else {
            navigator.clipboard.writeText(shareUrl);
            alert('Link copied to clipboard!');
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-16">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600 text-lg">Loading community reports...</p>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="text-center py-16">
                <div className="bg-red-50 border border-red-200 rounded-2xl p-8 max-w-md mx-auto">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                    </div>
                    <p className="text-red-600 text-lg font-semibold mb-4">Error: {error}</p>
                    <button 
                        onClick={fetchImages}
                        className="bg-red-600 text-white px-6 py-3 rounded-xl hover:bg-red-700 transition-colors font-medium"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        )
    }

    if (images.length === 0) {
        return (
            <div className="text-center py-16">
                <div className="bg-gray-50 border border-gray-200 rounded-2xl p-8 max-w-md mx-auto">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">No Reports Yet</h3>
                    <p className="text-gray-600 mb-4">Be the first to report an infrastructure issue in your community!</p>
                    <button 
                        onClick={() => document.getElementById('image-upload')?.click()}
                        className="bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition-colors font-medium"
                    >
                        📸 Report First Issue
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {images.map((image, index) => {
                    try {
                        const isLiked = image.likedBy?.includes(userIdentifier);
                        
                        return (
                            <div key={image._id || index} className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100">
                                {/* Image */}
                                <div className="relative">
                                    <Link to={`/post/${image._id}`}>
                                        <img 
                                            src={image.imageUrl} 
                                            alt="Reported infrastructure issue" 
                                            className="w-full h-56 object-cover cursor-pointer hover:opacity-90 transition-opacity"
                                        />
                                    </Link>
                                    <div className="absolute top-4 right-4 flex space-x-2">
                                        <button
                                            onClick={() => handleShare(image._id)}
                                            className="p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-lg hover:bg-white transition-colors"
                                        >
                                            <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                                            </svg>
                                        </button>
                                        <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                            image.location && image.location.latitude && image.location.longitude && 
                                            !isNaN(image.location.latitude) && !isNaN(image.location.longitude) ? 
                                            'bg-green-500 text-white' : 'bg-gray-500 text-white'
                                        }`}>
                                            {image.location && image.location.latitude && image.location.longitude && 
                                             !isNaN(image.location.latitude) && !isNaN(image.location.longitude) ? 
                                             '📍 Located' : '📍 No Location'}
                                        </div>
                                    </div>
                                </div>
                                
                                {/* Content */}
                                <div className="p-6 space-y-4">
                                    {/* User Information */}
                                    <div className="flex items-start space-x-3">
                                        <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                                            <span className="text-white font-bold text-lg">
                                                {safeRender(image.userName, 'U').charAt(0).toUpperCase()}
                                            </span>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-semibold text-gray-900 text-lg truncate">
                                                {safeRender(image.userName, 'Anonymous User')}
                                            </h3>
                                            <p className="text-gray-600 text-sm">
                                                {safeRender(image.userArea, 'Unknown Area')} • {safeRender(image.userPincode, 'No Pincode')}
                                            </p>
                                        </div>
                                    </div>
                                    
                                    {/* Location Information */}
                                    {image.location && image.location.latitude && image.location.longitude && (
                                        <div className="bg-blue-50 rounded-xl p-4">
                                            <div className="flex items-start space-x-3">
                                                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                                                    <span className="text-white text-sm">📍</span>
                                                </div>
                                                <div className="flex-1">
                                                    <p className="text-sm font-semibold text-blue-900 mb-1">Issue Location</p>
                                                    <div className="space-y-1">
                                                        <p className="text-xs text-blue-700">
                                                            <span className="font-medium">Lat:</span> {safeNumberFormat(image.location.latitude)}
                                                        </p>
                                                        <p className="text-xs text-blue-700">
                                                            <span className="font-medium">Long:</span> {safeNumberFormat(image.location.longitude)}
                                                        </p>
                                                        {image.location.address && (
                                                            <p className="text-xs text-blue-700 mt-2 p-2 bg-blue-100 rounded-lg">
                                                                📍 {image.location.address}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                    
                                    {/* Social Actions & Info */}
                                    <div className="pt-4 border-t border-gray-100">
                                        {/* Like Button */}
                                        <div className="flex items-center justify-between mb-3">
                                            <button
                                                onClick={() => handleLike(image._id, image.likes, image.likedBy)}
                                                className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-all ${
                                                    isLiked 
                                                        ? 'bg-red-100 text-red-600 hover:bg-red-200' 
                                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                                }`}
                                            >
                                                <svg className={`w-4 h-4 ${isLiked ? 'fill-current' : 'fill-none'}`} stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                                </svg>
                                                <span className="text-sm font-medium">{image.likes || 0}</span>
                                            </button>
                                            <Link
                                                to={`/post/${image._id}`}
                                                className="flex items-center space-x-2 text-gray-500 hover:text-blue-600 transition-colors"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                                </svg>
                                                <span className="text-sm">{image.comments?.length || 0} comments</span>
                                            </Link>
                                        </div>
                                        
                                        {/* Upload Time & ID */}
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center space-x-2 text-gray-500">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                                <span className="text-sm">{formatDate(image.uploadedAt)}</span>
                                            </div>
                                            <span className="text-xs text-blue-600 font-mono bg-blue-50 px-2 py-1 rounded-lg">
                                                ID: {(image._id || '').slice(-6)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    } catch (error) {
                        console.error('Error rendering image:', error, image);
                        return (
                            <div key={index} className="bg-red-50 border border-red-200 rounded-2xl p-6">
                                <div className="text-center">
                                    <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                        <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                        </svg>
                                    </div>
                                    <p className="text-red-600 text-sm font-medium">Error displaying report</p>
                                    <p className="text-red-500 text-xs mt-1">ID: {image._id || 'Unknown'}</p>
                                </div>
                            </div>
                        );
                    }
                })}
            </div>
        </div>
    )
}

export default ImageShow