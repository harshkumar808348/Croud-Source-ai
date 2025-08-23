import mongoose from "mongoose";

const imageSchema = new mongoose.Schema({
    imageUrl: {
        type: String,
        required: true
    },
    userName: {
        type: String,
        required: true
    },
    userArea: {
        type: String,
        required: true
    },
    userPincode: {
        type: String,
        required: true
    },
    location: {
        latitude: {
            type: Number,
            required: true
        },
        longitude: {
            type: Number,
            required: true
        },
        address: {
            type: String,
            required: false
        }
    },
    uploadedAt: {
        type: Date,
        default: Date.now
    },
    // AI Analysis fields
    analysis: {
        type: String,
        required: false
    },
    safetyScore: {
        type: String,
        enum: ['Safe', 'Moderate', 'Danger'],
        required: false
    },
    safetyPercentage: {
        type: Number,
        min: 0,
        max: 100,
        required: false
    },
    analyzedAt: {
        type: Date,
        required: false
    },
    // Social features
    likes: {
        type: Number,
        default: 0
    },
    likedBy: [{
        type: String, // Store user identifiers (IP or session ID for now)
        required: false
    }],
    comments: [{
        id: {
            type: String,
            required: true
        },
        userName: {
            type: String,
            required: true
        },
        userArea: {
            type: String,
            required: false
        },
        comment: {
            type: String,
            required: true
        },
        createdAt: {
            type: Date,
            default: Date.now
        },
        likes: {
            type: Number,
            default: 0
        },
        likedBy: [{
            type: String,
            required: false
        }]
    }]
});

const Image = mongoose.model("Image", imageSchema);

export default Image;