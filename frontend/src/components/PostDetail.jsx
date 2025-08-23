import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const PostDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [comments, setComments] = useState([]);
    const [commentPage, setCommentPage] = useState(1);
    const [hasMoreComments, setHasMoreComments] = useState(false);
    const [newComment, setNewComment] = useState('');
    const [commentUserName, setCommentUserName] = useState('');
    const [commentUserArea, setCommentUserArea] = useState('');
    const [submittingComment, setSubmittingComment] = useState(false);
    const [userIdentifier] = useState(() => {
        const existing = localStorage.getItem('userIdentifier');
        if (existing) return existing;
        const newId = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        localStorage.setItem('userIdentifier', newId);
        return newId;
    });

    const fetchPost = async () => {
        try {
            setLoading(true);
            const response = await fetch(`/api/images`);
            if (!response.ok) throw new Error('Failed to fetch posts');
            
            const data = await response.json();
            if (data.success) {
                const foundPost = data.images.find(img => img._id === id);
                if (foundPost) {
                    setPost(foundPost);
                    await fetchComments(1);
                } else {
                    setError('Post not found');
                }
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const fetchComments = async (page = 1) => {
        try {
            const response = await fetch(`/api/images/${id}/comments?page=${page}&limit=5`);
            if (!response.ok) throw new Error('Failed to fetch comments');
            
            const data = await response.json();
            if (data.success) {
                if (page === 1) {
                    setComments(data.comments);
                } else {
                    setComments(prev => [...prev, ...data.comments]);
                }
                setHasMoreComments(data.hasMore);
                setCommentPage(page);
            }
        } catch (err) {
            console.error('Error fetching comments:', err);
        }
    };

    const handleLike = async () => {
        try {
            console.log('Liking post:', id, 'User:', userIdentifier);
            const response = await fetch(`/api/images/${id}/like`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userIdentifier })
            });

            console.log('Response status:', response.status);
            if (response.ok) {
                const data = await response.json();
                console.log('Response data:', data);
                if (data.success) {
                    setPost(prev => ({
                        ...prev,
                        likes: data.likes,
                        likedBy: data.isLiked 
                            ? [...(prev.likedBy || []), userIdentifier]
                            : (prev.likedBy || []).filter(id => id !== userIdentifier)
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

    const handleCommentLike = async (commentId) => {
        try {
            const response = await fetch(`/api/images/${id}/comments/${commentId}/like`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userIdentifier })
            });

            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    setComments(prev => prev.map(comment => {
                        if (comment.id === commentId) {
                            return {
                                ...comment,
                                likes: data.likes,
                                likedBy: data.isLiked 
                                    ? [...(comment.likedBy || []), userIdentifier]
                                    : (comment.likedBy || []).filter(id => id !== userIdentifier)
                            };
                        }
                        return comment;
                    }));
                }
            }
        } catch (err) {
            console.error('Error liking comment:', err);
        }
    };

    const handleSubmitComment = async (e) => {
        e.preventDefault();
        if (!newComment.trim() || !commentUserName.trim()) return;

        setSubmittingComment(true);
        try {
            console.log('Submitting comment for post:', id);
            const response = await fetch(`/api/images/${id}/comment`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userName: commentUserName,
                    userArea: commentUserArea,
                    comment: newComment.trim(),
                    userIdentifier
                })
            });

            console.log('Comment response status:', response.status);
            if (response.ok) {
                const data = await response.json();
                console.log('Comment response data:', data);
                if (data.success) {
                    setComments(prev => [data.comment, ...prev]);
                    setNewComment('');
                    setCommentUserName('');
                    setCommentUserArea('');
                }
            } else {
                const errorText = await response.text();
                console.error('Comment API Error:', errorText);
            }
        } catch (err) {
            console.error('Error submitting comment:', err);
        } finally {
            setSubmittingComment(false);
        }
    };

    const handleShare = () => {
        const shareUrl = `${window.location.origin}/post/${id}`;
        if (navigator.share) {
            navigator.share({
                title: 'Community Issue Report',
                text: `Check out this infrastructure issue reported in ${post?.userArea || 'our community'}`,
                url: shareUrl
            });
        } else {
            navigator.clipboard.writeText(shareUrl);
            alert('Link copied to clipboard!');
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const isLiked = post?.likedBy?.includes(userIdentifier);
    const isCommentLiked = (comment) => comment.likedBy?.includes(userIdentifier);

    useEffect(() => {
        fetchPost();
    }, [id]);

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="relative">
                        <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 mx-auto mb-6"></div>
                        <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-blue-600 animate-ping"></div>
                    </div>
                    <p className="text-gray-600 text-lg font-medium">Loading post details...</p>
                    <p className="text-gray-400 text-sm mt-2">Please wait while we fetch the report</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center p-4">
                <div className="text-center max-w-md">
                    <div className="bg-white rounded-3xl shadow-2xl p-8 border border-red-100">
                        <div className="w-20 h-20 bg-gradient-to-br from-red-100 to-red-200 rounded-full flex items-center justify-center mx-auto mb-6">
                            <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-3">Oops! Something went wrong</h3>
                        <p className="text-red-600 mb-6">{error}</p>
                        <div className="space-y-3">
                            <button 
                                onClick={() => window.location.reload()}
                                className="w-full bg-gradient-to-r from-red-600 to-red-700 text-white px-6 py-3 rounded-xl hover:from-red-700 hover:to-red-800 transition-all font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                            >
                                Try Again
                            </button>
                            <button 
                                onClick={() => navigate('/')}
                                className="w-full bg-gray-100 text-gray-700 px-6 py-3 rounded-xl hover:bg-gray-200 transition-all font-medium"
                            >
                                Back to Home
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (!post) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center p-4">
                <div className="text-center max-w-md">
                    <div className="bg-white rounded-3xl shadow-2xl p-8 border border-gray-100">
                        <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
                            <svg className="w-10 h-10 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-3">Post Not Found</h3>
                        <p className="text-gray-600 mb-6">The report you're looking for doesn't exist or has been removed.</p>
                        <button 
                            onClick={() => navigate('/')}
                            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                        >
                            Back to Home
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
            {/* Enhanced Header */}
            <div className="bg-white/90 backdrop-blur-xl shadow-lg border-b border-gray-200/50 sticky top-0 z-50">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center py-4">
                        <div className="flex items-center space-x-4">
                            <button
                                onClick={() => navigate('/')}
                                className="p-3 hover:bg-gray-100 rounded-xl transition-all duration-200 group"
                            >
                                <svg className="w-6 h-6 text-gray-600 group-hover:text-gray-800 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                </svg>
                            </button>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">Report Details</h1>
                                <p className="text-sm text-gray-600">Community infrastructure analysis</p>
                            </div>
                        </div>
                        <button
                            onClick={handleShare}
                            className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center space-x-2"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                            </svg>
                            <span>Share Report</span>
                        </button>
                    </div>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content - Left Side */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Enhanced Post Card */}
                        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100">
                            {/* Enhanced Image Section */}
                            <div className="relative group">
                                <img 
                                    src={post.imageUrl} 
                                    alt="Reported infrastructure issue" 
                                    className="w-full h-96 object-cover group-hover:scale-105 transition-transform duration-500"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                <div className="absolute top-6 right-6 flex space-x-3">
                                    <div className={`px-4 py-2 rounded-full text-sm font-semibold shadow-lg ${
                                        post.location && post.location.latitude && post.location.longitude ? 
                                        'bg-green-500 text-white' : 'bg-gray-500 text-white'
                                    }`}>
                                        {post.location && post.location.latitude && post.location.longitude ? 
                                         '📍 Located' : '📍 No Location'}
                                    </div>
                                </div>
                            </div>

                            {/* Enhanced Post Info */}
                            <div className="p-8">
                                {/* Enhanced User Info */}
                                <div className="flex items-start space-x-6 mb-8">
                                    <div className="w-20 h-20 bg-gradient-to-br from-blue-500 via-purple-600 to-indigo-600 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg">
                                        <span className="text-white font-bold text-2xl">
                                            {post.userName?.charAt(0).toUpperCase() || 'U'}
                                        </span>
                                    </div>
                                    <div className="flex-1">
                                        <h2 className="font-bold text-gray-900 text-2xl mb-2">
                                            {post.userName || 'Anonymous User'}
                                        </h2>
                                        <p className="text-gray-600 text-lg mb-1">
                                            {post.userArea || 'Unknown Area'} • {post.userPincode || 'No Pincode'}
                                        </p>
                                        <p className="text-sm text-gray-500">
                                            📅 {formatDate(post.uploadedAt)}
                                        </p>
                                    </div>
                                </div>

                                {/* Enhanced Location Info */}
                                {post.location && post.location.latitude && post.location.longitude && (
                                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 mb-8 border border-blue-100">
                                        <div className="flex items-start space-x-4">
                                            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
                                                <span className="text-white text-lg">📍</span>
                                            </div>
                                            <div className="flex-1">
                                                <h3 className="text-lg font-bold text-blue-900 mb-4">Issue Location</h3>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div className="bg-white rounded-xl p-4 shadow-sm">
                                                        <span className="text-sm font-semibold text-blue-700 block mb-1">Latitude</span>
                                                        <p className="text-blue-900 font-mono text-lg">{Number(post.location.latitude).toFixed(6)}</p>
                                                    </div>
                                                    <div className="bg-white rounded-xl p-4 shadow-sm">
                                                        <span className="text-sm font-semibold text-blue-700 block mb-1">Longitude</span>
                                                        <p className="text-blue-900 font-mono text-lg">{Number(post.location.longitude).toFixed(6)}</p>
                                                    </div>
                                                </div>
                                                {post.location.address && (
                                                    <div className="mt-4 bg-white rounded-xl p-4 shadow-sm">
                                                        <span className="text-sm font-semibold text-blue-700 block mb-2">Address</span>
                                                        <p className="text-blue-900">📍 {post.location.address}</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Enhanced Safety Score */}
                                {post.safetyScore && (
                                    <div className={`rounded-2xl p-6 mb-8 border-2 ${
                                        post.safetyScore === 'Safe' ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200' :
                                        post.safetyScore === 'Moderate' ? 'bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200' :
                                        'bg-gradient-to-r from-red-50 to-pink-50 border-red-200'
                                    }`}>
                                        <div className="flex items-center space-x-4">
                                            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg ${
                                                post.safetyScore === 'Safe' ? 'bg-gradient-to-br from-green-500 to-emerald-600' :
                                                post.safetyScore === 'Moderate' ? 'bg-gradient-to-br from-yellow-500 to-orange-600' :
                                                'bg-gradient-to-br from-red-500 to-pink-600'
                                            }`}>
                                                <span className="text-white text-2xl font-bold">
                                                    {post.safetyScore === 'Safe' ? '✓' :
                                                     post.safetyScore === 'Moderate' ? '⚠' : '⚠'}
                                                </span>
                                            </div>
                                            <div>
                                                <h3 className="text-xl font-bold text-gray-900 mb-1">Safety Assessment</h3>
                                                <p className={`text-lg font-semibold ${
                                                    post.safetyScore === 'Safe' ? 'text-green-700' :
                                                    post.safetyScore === 'Moderate' ? 'text-yellow-700' :
                                                    'text-red-700'
                                                }`}>
                                                    {post.safetyScore} {post.safetyPercentage && `(${post.safetyPercentage}% confidence)`}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Enhanced AI Analysis */}
                                {post.analysis && (
                                    <div className="bg-gradient-to-r from-gray-50 to-slate-50 rounded-2xl p-6 mb-8 border border-gray-200">
                                        <div className="flex items-center space-x-3 mb-4">
                                            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center">
                                                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                                                </svg>
                                            </div>
                                            <h3 className="text-xl font-bold text-gray-900">AI Analysis Report</h3>
                                        </div>
                                        <div className="bg-white rounded-xl p-4 shadow-sm">
                                            <p className="text-gray-700 text-base leading-relaxed whitespace-pre-wrap">
                                                {post.analysis}
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {/* Enhanced Like Button */}
                                <div className="flex items-center justify-between pt-6 border-t border-gray-100">
                                    <button
                                        onClick={handleLike}
                                        className={`flex items-center space-x-3 px-6 py-3 rounded-xl transition-all duration-200 font-semibold ${
                                            isLiked 
                                                ? 'bg-gradient-to-r from-red-100 to-pink-100 text-red-600 hover:from-red-200 hover:to-pink-200 shadow-lg' 
                                                : 'bg-gradient-to-r from-gray-100 to-slate-100 text-gray-600 hover:from-gray-200 hover:to-slate-200'
                                        }`}
                                    >
                                        <svg className={`w-5 h-5 ${isLiked ? 'fill-current' : 'fill-none'}`} stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                        </svg>
                                        <span>{post.likes || 0} likes</span>
                                    </button>
                                    <div className="text-gray-500 font-medium">
                                        {comments.length} comment{comments.length !== 1 ? 's' : ''}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Comments Section - Right Side */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-3xl shadow-2xl p-6 border border-gray-100 sticky top-24">
                            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center space-x-2">
                                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                </svg>
                                <span>Comments</span>
                            </h3>

                            {/* Enhanced Comment Form */}
                            <form onSubmit={handleSubmitComment} className="mb-6">
                                <div className="space-y-4">
                                    <div className="grid grid-cols-1 gap-3">
                                        <input
                                            type="text"
                                            placeholder="Your name *"
                                            value={commentUserName}
                                            onChange={(e) => setCommentUserName(e.target.value)}
                                            className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                            required
                                        />
                                        <input
                                            type="text"
                                            placeholder="Your area (optional)"
                                            value={commentUserArea}
                                            onChange={(e) => setCommentUserArea(e.target.value)}
                                            className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                        />
                                    </div>
                                    <textarea
                                        placeholder="Add your comment... *"
                                        value={newComment}
                                        onChange={(e) => setNewComment(e.target.value)}
                                        rows="3"
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-all"
                                        required
                                    />
                                    <button
                                        type="submit"
                                        disabled={submittingComment || !newComment.trim() || !commentUserName.trim()}
                                        className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-indigo-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed font-semibold transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                                    >
                                        {submittingComment ? 'Posting...' : 'Post Comment'}
                                    </button>
                                </div>
                            </form>

                            {/* Enhanced Comments List */}
                            <div className="space-y-4 max-h-96 overflow-y-auto">
                                {comments.map((comment) => (
                                    <div key={comment.id} className="bg-gradient-to-r from-gray-50 to-slate-50 rounded-2xl p-4 border border-gray-100">
                                        <div className="flex items-start space-x-3">
                                            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-blue-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm">
                                                <span className="text-white font-semibold text-sm">
                                                    {comment.userName.charAt(0).toUpperCase()}
                                                </span>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center space-x-2 mb-2">
                                                    <h4 className="font-semibold text-gray-900 text-sm">{comment.userName}</h4>
                                                    {comment.userArea && (
                                                        <span className="text-xs text-gray-500">• {comment.userArea}</span>
                                                    )}
                                                </div>
                                                <p className="text-gray-700 text-sm mb-3 leading-relaxed">{comment.comment}</p>
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center space-x-4">
                                                        <button
                                                            onClick={() => handleCommentLike(comment.id)}
                                                            className={`flex items-center space-x-1 text-xs transition-colors ${
                                                                isCommentLiked(comment) 
                                                                    ? 'text-red-600' 
                                                                    : 'text-gray-500 hover:text-red-600'
                                                            }`}
                                                        >
                                                            <svg className={`w-3 h-3 ${isCommentLiked(comment) ? 'fill-current' : 'fill-none'}`} stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                                            </svg>
                                                            <span>{comment.likes || 0}</span>
                                                        </button>
                                                        <span className="text-xs text-gray-500">
                                                            {formatDate(comment.createdAt)}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Load More Comments */}
                            {hasMoreComments && (
                                <div className="text-center mt-6">
                                    <button
                                        onClick={() => fetchComments(commentPage + 1)}
                                        className="bg-gradient-to-r from-gray-100 to-slate-100 text-gray-700 px-6 py-3 rounded-xl hover:from-gray-200 hover:to-slate-200 transition-all font-medium shadow-sm hover:shadow-md"
                                    >
                                        Load More Comments
                                    </button>
                                </div>
                            )}

                            {comments.length === 0 && (
                                <div className="text-center py-8 text-gray-500">
                                    <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                        </svg>
                                    </div>
                                    <h3 className="text-lg font-semibold text-gray-700 mb-2">No Comments Yet</h3>
                                    <p className="text-sm">Be the first to comment on this report!</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PostDetail;
