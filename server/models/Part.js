import mongoose from 'mongoose';

const partSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  carMake: {
    type: String,
    required: true
  },
  carModel: {
    type: String,
    required: true
  },
  year: {
    type: String
  },
  price: {
    type: Number,
    required: true
  },
  condition: {
    type: String,
    enum: ['new', 'used', 'refurbished'],
    default: 'new'
  },
  quantity: {
    type: Number,
    default: 1
  },
  location: {
    type: String,
    required: true
  },
  country: {
    type: String,
    required: true
  },
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  imageUrl: {
    type: String
  },
  partNumber: {
    type: String
  },
  category: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model('Part', partSchema);
