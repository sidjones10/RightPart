import mongoose from 'mongoose';

const maintenanceReminderSchema = new mongoose.Schema({
  vehicle: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vehicle',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['oil_change', 'part_maintenance', 'registration_renewal', 'inspection_renewal', 'general'],
    required: true
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String
  },
  partName: {
    type: String
  },
  dueDate: {
    type: Date
  },
  dueMileage: {
    type: Number
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'dismissed'],
    default: 'pending'
  },
  predictionSource: {
    type: String,
    enum: ['user_data', 'manual', 'manufacturer'],
    default: 'manual'
  },
  // Predictive data based on other users
  averageFailureMileage: {
    type: Number
  },
  userReportsCount: {
    type: Number,
    default: 0
  },
  completedAt: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model('MaintenanceReminder', maintenanceReminderSchema);
