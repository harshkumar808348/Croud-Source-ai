import express from "express";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from 'url';
import Image from "../Database/uploadImage.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const router = express.Router();

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configure multer for memory storage
const upload = multer({ storage: multer.memoryStorage() });

// POST route for uploading images
router.post('/upload', upload.single('image'), async (req, res) => {
    try {
        // Check if all required fields are present
        const { userName, userArea, userPincode, latitude, longitude, address } = req.body;
        
        if (!userName || !userArea || !userPincode || !latitude || !longitude) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields: userName, userArea, userPincode, latitude, longitude'
            });
        }

        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'No image file provided'
            });
        }

        // Upload to Cloudinary
        const result = await new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                {
                    folder: 'infrastructure-reports',
                    resource_type: 'auto'
                },
                (error, result) => {
                    if (error) reject(error);
                    else resolve(result);
                }
            );

            uploadStream.end(req.file.buffer);
        });

        // Create new image document
        const newImage = new Image({
            imageUrl: result.secure_url,
            userName: userName.trim(),
            userArea: userArea.trim(),
            userPincode: userPincode.trim(),
            location: {
                latitude: parseFloat(latitude),
                longitude: parseFloat(longitude),
                address: address || ''
            }
        });

        // Save to database
        await newImage.save();

        console.log('✅ Image uploaded successfully');

        res.status(201).json({
            success: true,
            message: 'Image uploaded successfully',
            imageId: newImage._id,
            imageUrl: result.secure_url,
            userData: {
                userName: newImage.userName,
                userArea: newImage.userArea,
                userPincode: newImage.userPincode,
                location: newImage.location
            }
        });

    } catch (error) {
        console.error('❌ Upload error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to upload image',
            error: error.message
        });
    }
});

// GET route for retrieving all images
router.get('/images', async (req, res) => {
    try {
        const images = await Image.find().sort({ uploadedAt: -1 });
        
        // Data migration: Add default values for old images
        const migratedImages = images.map(image => {
            if (!image.userName || !image.userArea || !image.userPincode || !image.location) {
                return {
                    ...image.toObject(),
                    userName: image.userName || 'Anonymous User',
                    userArea: image.userArea || 'Unknown Area',
                    userPincode: image.userPincode || 'No Pincode',
                    location: image.location || {
                        latitude: 0,
                        longitude: 0,
                        address: 'Location not available'
                    },
                    uploadedAt: image.uploadedAt || image._id.getTimestamp()
                };
            }
            return image.toObject();
        });

        res.json({
            success: true,
            images: migratedImages
        });

    } catch (error) {
        console.error('❌ Error fetching images:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch images',
            error: error.message
        });
    }
});

// PUT route for updating image with safety analysis results
router.put('/images/:id/analysis', async (req, res) => {
    try {
        const { id } = req.params;
        const { analysis, safetyScore, safetyPercentage } = req.body;

        if (!analysis || !safetyScore) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields: analysis, safetyScore'
            });
        }

        const updatedImage = await Image.findByIdAndUpdate(
            id,
            {
                analysis,
                safetyScore,
                safetyPercentage: safetyPercentage || 50,
                analyzedAt: new Date()
            },
            { new: true }
        );

        if (!updatedImage) {
            return res.status(404).json({
                success: false,
                message: 'Image not found'
            });
        }

        console.log('✅ Analysis results updated for image:', id);

        res.json({
            success: true,
            message: 'Analysis results updated successfully',
            image: updatedImage
        });

    } catch (error) {
        console.error('❌ Error updating analysis:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update analysis results',
            error: error.message
        });
    }
});

// POST route for liking/unliking a post
router.post('/images/:id/like', async (req, res) => {
    try {
        const { id } = req.params;
        const { userIdentifier } = req.body; // This could be IP, session ID, or user ID

        if (!userIdentifier) {
            return res.status(400).json({
                success: false,
                message: 'User identifier is required'
            });
        }

        const image = await Image.findById(id);
        if (!image) {
            return res.status(404).json({
                success: false,
                message: 'Image not found'
            });
        }

        const isLiked = image.likedBy.includes(userIdentifier);
        
        if (isLiked) {
            // Unlike
            image.likes = Math.max(0, image.likes - 1);
            image.likedBy = image.likedBy.filter(id => id !== userIdentifier);
        } else {
            // Like
            image.likes += 1;
            image.likedBy.push(userIdentifier);
        }

        await image.save();

        res.json({
            success: true,
            message: isLiked ? 'Post unliked' : 'Post liked',
            likes: image.likes,
            isLiked: !isLiked
        });

    } catch (error) {
        console.error('❌ Error liking/unliking post:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to like/unlike post',
            error: error.message
        });
    }
});

// POST route for adding a comment
router.post('/images/:id/comment', async (req, res) => {
    try {
        const { id } = req.params;
        const { userName, userArea, comment, userIdentifier } = req.body;

        if (!userName || !comment) {
            return res.status(400).json({
                success: false,
                message: 'User name and comment are required'
            });
        }

        const image = await Image.findById(id);
        if (!image) {
            return res.status(404).json({
                success: false,
                message: 'Image not found'
            });
        }

        const newComment = {
            id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
            userName,
            userArea: userArea || 'Unknown Area',
            comment,
            createdAt: new Date(),
            likes: 0,
            likedBy: []
        };

        image.comments.push(newComment);
        await image.save();

        res.json({
            success: true,
            message: 'Comment added successfully',
            comment: newComment
        });

    } catch (error) {
        console.error('❌ Error adding comment:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to add comment',
            error: error.message
        });
    }
});

// POST route for liking/unliking a comment
router.post('/images/:imageId/comments/:commentId/like', async (req, res) => {
    try {
        const { imageId, commentId } = req.params;
        const { userIdentifier } = req.body;

        if (!userIdentifier) {
            return res.status(400).json({
                success: false,
                message: 'User identifier is required'
            });
        }

        const image = await Image.findById(imageId);
        if (!image) {
            return res.status(404).json({
                success: false,
                message: 'Image not found'
            });
        }

        const comment = image.comments.find(c => c.id === commentId);
        if (!comment) {
            return res.status(404).json({
                success: false,
                message: 'Comment not found'
            });
        }

        const isLiked = comment.likedBy.includes(userIdentifier);
        
        if (isLiked) {
            // Unlike
            comment.likes = Math.max(0, comment.likes - 1);
            comment.likedBy = comment.likedBy.filter(id => id !== userIdentifier);
        } else {
            // Like
            comment.likes += 1;
            comment.likedBy.push(userIdentifier);
        }

        await image.save();

        res.json({
            success: true,
            message: isLiked ? 'Comment unliked' : 'Comment liked',
            likes: comment.likes,
            isLiked: !isLiked
        });

    } catch (error) {
        console.error('❌ Error liking/unliking comment:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to like/unlike comment',
            error: error.message
        });
    }
});

// GET route for getting comments with pagination
router.get('/images/:id/comments', async (req, res) => {
    try {
        const { id } = req.params;
        const { page = 1, limit = 5 } = req.query;

        const image = await Image.findById(id);
        if (!image) {
            return res.status(404).json({
                success: false,
                message: 'Image not found'
            });
        }

        const startIndex = (page - 1) * limit;
        const endIndex = page * limit;
        const comments = image.comments.slice(startIndex, endIndex);
        const hasMore = endIndex < image.comments.length;

        res.json({
            success: true,
            comments,
            hasMore,
            totalComments: image.comments.length,
            currentPage: parseInt(page),
            totalPages: Math.ceil(image.comments.length / limit)
        });

    } catch (error) {
        console.error('❌ Error fetching comments:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch comments',
            error: error.message
        });
    }
});

export default router;