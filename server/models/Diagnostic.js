import mongoose from 'mongoose';

const diagnosticSchema = new mongoose.Schema({
  carMake: {
    type: String,
    required: true
  },
  carModel: {
    type: String,
    required: true
  },
  year: {
    type: String,
    required: true
  },
  issue: {
    type: String,
    required: true
  },
  affectedParts: [{
    name: String,
    position: {
      x: Number,
      y: Number,
      z: Number
    }
  }],
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  userEmail: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model('Diagnostic', diagnosticSchema);
