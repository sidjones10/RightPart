import mongoose from 'mongoose';

const vehicleSchema = new mongoose.Schema({
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  make: {
    type: String,
    required: true
  },
  model: {
    type: String,
    required: true
  },
  year: {
    type: String,
    required: true
  },
  vin: {
    type: String,
    unique: true,
    sparse: true
  },
  currentMileage: {
    type: Number,
    default: 0
  },
  lastOilChange: {
    mileage: Number,
    date: Date
  },
  registrationExpiry: {
    type: Date
  },
  inspectionExpiry: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model('Vehicle', vehicleSchema);
