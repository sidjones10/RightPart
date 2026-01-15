import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import authRoutes from './routes/auth.js';
import partsRoutes from './routes/parts.js';
import bidsRoutes from './routes/bids.js';
import diagnosticsRoutes from './routes/diagnostics.js';
import vehiclesRoutes from './routes/vehicles.js';
import maintenanceRoutes from './routes/maintenance.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
const connectDB = async () => {
  try {
    if (process.env.MONGODB_URI) {
      await mongoose.connect(process.env.MONGODB_URI);
      console.log('MongoDB connected successfully');
    } else {
      console.log('MongoDB URI not provided, running without database');
    }
  } catch (error) {
    console.error('MongoDB connection error:', error);
    console.log('Continuing without database...');
  }
};

connectDB();

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/parts', partsRoutes);
app.use('/api/bids', bidsRoutes);
app.use('/api/diagnostics', diagnosticsRoutes);
app.use('/api/vehicles', vehiclesRoutes);
app.use('/api/maintenance', maintenanceRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'RightPart API is running' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
