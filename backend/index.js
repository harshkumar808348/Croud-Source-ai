import express from 'express';
import cors from 'cors';
const app = express();
import dotenv from 'dotenv';
import UploadImage from './UploadImage/UploadImage.js';
import dbConnection from './Database/dbConnection.js';
import geminiRouter from './UploadImage/Analysis.js';
import adminAuthRouter from './routes/adminAuth.js';
import chatbotRouter from './routes/chatbot.js';
dotenv.config({path: './.env'});
const PORT = process.env.PORT || 3000;

// Connect to database (optional for development)
if (process.env.MONGODB_URI) {
    dbConnection();
} else {
    console.warn('⚠️ MONGODB_URI not set, running without database connection');
}

// Middleware
app.use(express.json());
app.use(cors({
  origin: ['http://localhost:5173', 'https://croud-source-ai-svy1.vercel.app'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
 
  credentials: true
}));

// Routes
app.use('/api', UploadImage);
app.use('/api/gemini', geminiRouter);
app.use('/api/admin', adminAuthRouter);
app.use('/api/chatbot', chatbotRouter);
app.get('/', (req, res) => {
      res.send({
         activeStatus : true,
         error : false,
      })
});

console.log('✅ All routes mounted successfully');

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development'
    });
});

app.get('/api/gemini/test', (req, res) => {
    res.json({ message: 'Gemini router is working!' });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({ 
        error: 'Internal server error',
        message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
    });
});

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({ error: 'Route not found' });
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Server is running on http://localhost:${PORT}`);
    console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
});

