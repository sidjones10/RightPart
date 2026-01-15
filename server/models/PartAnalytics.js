import mongoose from 'mongoose';

const partAnalyticsSchema = new mongoose.Schema({
  partName: {
    type: String,
    required: true,
    index: true
  },
  carMake: {
    type: String,
    required: true,
    index: true
  },
  carModel: {
    type: String,
    required: true,
    index: true
  },
  // Aggregated data from user reports
  totalReports: {
    type: Number,
    default: 0
  },
  averageFailureMileage: {
    type: Number
  },
  averageFailureMonths: {
    type: Number
  },
  qualityRating: {
    type: Number,
    min: 1,
    max: 5,
    default: 3
  },
  commonIssues: [{
    issue: String,
    count: Number
  }],
  // Individual failure reports
  failureReports: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    mileage: Number,
    monthsSinceInstallation: Number,
    issue: String,
    reportedAt: Date
  }],
  lastUpdated: {
    type: Date,
    default: Date.now
  }
});

// Compound index for efficient lookups
partAnalyticsSchema.index({ partName: 1, carMake: 1, carModel: 1 }, { unique: true });

export default mongoose.model('PartAnalytics', partAnalyticsSchema);
