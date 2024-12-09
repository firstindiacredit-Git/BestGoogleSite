import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import path from 'path';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Routes will be imported here
// app.use('/api/auth', authRoutes);
// app.use('/api/bookmarks', bookmarkRoutes);
// etc.

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});