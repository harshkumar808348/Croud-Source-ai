import { useState, useEffect } from "react";

function FileUpload({ onImageUploaded }) {
    const [selectedImage, setSelectedImage] = useState(null);
    const [selectedFile, setSelectedFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    
    // User information state
    const [userName, setUserName] = useState('');
    const [userArea, setUserArea] = useState('');
    const [userPincode, setUserPincode] = useState('');
    
    // Location state
    const [location, setLocation] = useState(null);
    const [locationLoading, setLocationLoading] = useState(false);
    const [locationError, setLocationError] = useState('');
    const [locationPermission, setLocationPermission] = useState('prompt');

    // Check location permission on component mount
    useEffect(() => {
        if ('geolocation' in navigator) {
            navigator.permissions.query({ name: 'geolocation' }).then((result) => {
                setLocationPermission(result.state);
            });
        }
    }, []);

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            setSelectedFile(file);
            setSelectedImage(URL.createObjectURL(file));
        }
    };

    // Function to get current location
    const getCurrentLocation = () => {
        setLocationLoading(true);
        setLocationError('');

        if (!navigator.geolocation) {
            setLocationError('Geolocation is not supported by this browser.');
            setLocationLoading(false);
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                setLocation({ latitude, longitude });
                setLocationPermission('granted');
                setLocationLoading(false);
                
                // Get address from coordinates (reverse geocoding)
                getAddressFromCoordinates(latitude, longitude);
            },
            (error) => {
                console.error('Location error:', error);
                setLocationError(`Location error: ${error.message}`);
                setLocationLoading(false);
                setLocationPermission('denied');
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 60000
            }
        );
    };

    // Function to get address from coordinates using reverse geocoding
    const getAddressFromCoordinates = async (lat, lng) => {
        try {
            const response = await fetch(
                `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY || 'demo'}`
            );
            
            if (response.ok) {
                const data = await response.json();
                if (data.results && data.results[0]) {
                    setLocation(prev => ({
                        ...prev,
                        address: data.results[0].formatted_address
                    }));
                }
            }
        } catch (error) {
            console.log('Could not get address from coordinates:', error);
            // This is not critical, so we don't show an error
        }
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        
        if (!selectedFile) {
            alert('Please select a file');
            return;
        }

        if (!userName.trim() || !userArea.trim() || !userPincode.trim()) {
            alert('Please fill in all required fields: Name, Area, and Pincode');
            return;
        }

        if (!location) {
            alert('Please capture your current location before uploading');
            return;
        }

        setUploading(true);
        const formData = new FormData();
        formData.append('image', selectedFile);
        formData.append('userName', userName.trim());
        formData.append('userArea', userArea.trim());
        formData.append('userPincode', userPincode.trim());
        formData.append('latitude', location.latitude);
        formData.append('longitude', location.longitude);
        formData.append('address', location.address || '');

        try {
            const response = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
            });

            if (response.ok) {
                const result = await response.json();
                alert('Issue reported successfully! Thank you for helping improve your community.');
                
                // Reset form
                setSelectedFile(null);
                setSelectedImage(null);
                setUserName('');
                setUserArea('');
                setUserPincode('');
                setLocation(null);
                
                // Notify parent component to refresh images
                if (onImageUploaded) {
                    onImageUploaded();
                }
            } else {
                const errorData = await response.json();
                alert('Report failed: ' + (errorData.message || 'Unknown error'));
            }
        } catch (error) {
            alert('Error reporting issue: ' + error.message);
        } finally {
            setUploading(false);
        }
    };

    const resetLocation = () => {
        setLocation(null);
        setLocationError('');
    };

    return (
        <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-8 text-white text-center">
                    <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                    </div>
                    <h2 className="text-3xl font-bold mb-2">Report a Local Issue</h2>
                    <p className="text-blue-100 text-lg">Help improve your community by reporting infrastructure problems</p>
                </div>
                
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* File Upload Section */}
                    <div className="space-y-4">
                        <label className="block text-sm font-semibold text-gray-700">
                            📸 Upload Image of the Problem *
                        </label>
                        <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-blue-400 transition-colors">
                            <input 
                                type="file" 
                                name="image" 
                                accept="image/*"
                                onChange={handleFileChange}
                                className="hidden"
                                id="image-upload"
                            /> 
                            <label htmlFor="image-upload" className="cursor-pointer">
                                <div className="space-y-4">
                                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                                        <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                        </svg>
                                    </div>
                                    <div>
                                        <p className="text-lg font-medium text-gray-900">Click to upload image</p>
                                        <p className="text-sm text-gray-500">PNG, JPG, GIF up to 10MB</p>
                                    </div>
                                </div>
                            </label>
                        </div>
                        
                        {selectedImage && (
                            <div className="flex justify-center">
                                <div className="relative">
                                    <img 
                                        src={selectedImage} 
                                        alt="Selected issue" 
                                        className="w-48 h-48 object-cover rounded-xl border-4 border-white shadow-lg"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setSelectedFile(null);
                                            setSelectedImage(null);
                                        }}
                                        className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                                    >
                                        ×
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* User Information Section */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                👤 Your Name *
                            </label>
                            <input
                                type="text"
                                value={userName}
                                onChange={(e) => setUserName(e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                placeholder="Enter your full name"
                                required
                            />
                        </div>
                        
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                🏘️ Area/Locality *
                            </label>
                            <input
                                type="text"
                                value={userArea}
                                onChange={(e) => setUserArea(e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                placeholder="Enter your area"
                                required
                            />
                        </div>
                        
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                📍 Pincode *
                            </label>
                            <input
                                type="text"
                                value={userPincode}
                                onChange={(e) => setUserPincode(e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                placeholder="Enter pincode"
                                pattern="[0-9]{6}"
                                title="Please enter a valid 6-digit pincode"
                                required
                            />
                        </div>
                    </div>

                    {/* Location Capture Section */}
                    <div className="space-y-4">
                        <label className="block text-sm font-semibold text-gray-700">
                            📍 Problem Location *
                        </label>
                        
                        {!location ? (
                            <div className="space-y-3">
                                <button
                                    type="button"
                                    onClick={getCurrentLocation}
                                    disabled={locationLoading}
                                    className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white py-4 px-6 rounded-xl hover:from-green-600 hover:to-emerald-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed font-semibold text-lg transition-all transform hover:scale-105 disabled:transform-none"
                                >
                                    {locationLoading ? (
                                        <span className="flex items-center justify-center">
                                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                                            Getting Location...
                                        </span>
                                    ) : (
                                        '📍 Use Current Location'
                                    )}
                                </button>
                                
                                {locationError && (
                                    <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                                        <p className="text-red-600 text-sm">{locationError}</p>
                                    </div>
                                )}
                                
                                {locationPermission === 'denied' && (
                                    <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
                                        <p className="text-orange-600 text-sm">
                                            Location access denied. Please enable location permissions in your browser settings.
                                        </p>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                            </svg>
                                        </div>
                                        <div>
                                            <p className="text-green-800 font-semibold">Location Captured!</p>
                                            <p className="text-green-600 text-sm">
                                                Lat: {location.latitude.toFixed(6)}, Long: {location.longitude.toFixed(6)}
                                            </p>
                                            {location.address && (
                                                <p className="text-green-600 text-sm mt-1">{location.address}</p>
                                            )}
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={resetLocation}
                                        className="text-green-600 hover:text-green-800 text-sm font-medium bg-white px-3 py-1 rounded-lg hover:bg-green-50 transition-colors"
                                    >
                                        Change
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Upload Button */}
                    <button 
                        type="submit"
                        disabled={!selectedFile || !userName.trim() || !userArea.trim() || !userPincode.trim() || !location || uploading}
                        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 px-6 rounded-xl hover:from-blue-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed font-bold text-lg transition-all transform hover:scale-105 disabled:transform-none shadow-lg"
                    >
                        {uploading ? (
                            <span className="flex items-center justify-center">
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                                Reporting Issue...
                            </span>
                        ) : (
                            '🚨 Report This Issue'
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default FileUpload;