import express from 'express';
import Bid from '../models/Bid.js';
import Part from '../models/Part.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

router.post('/', authMiddleware, async (req, res) => {
  try {
    const { partId, amount, message } = req.body;

    const part = await Part.findById(partId);
    if (!part) {
      return res.status(404).json({ message: 'Part not found' });
    }

    const bid = new Bid({
      part: partId,
      mechanic: req.user.userId,
      amount,
      message
    });

    await bid.save();

    const populatedBid = await Bid.findById(bid._id)
      .populate('mechanic', 'name email')
      .populate('part', 'name carMake carModel');

    res.status(201).json(populatedBid);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.get('/mechanic', authMiddleware, async (req, res) => {
  try {
    const bids = await Bid.find({ mechanic: req.user.userId })
      .populate('part')
      .sort({ createdAt: -1 });

    res.json(bids);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.get('/seller', authMiddleware, async (req, res) => {
  try {
    const parts = await Part.find({ seller: req.user.userId });
    const partIds = parts.map(part => part._id);

    const bids = await Bid.find({ part: { $in: partIds } })
      .populate('mechanic', 'name email')
      .populate('part')
      .sort({ createdAt: -1 });

    res.json(bids);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.put('/:id/accept', authMiddleware, async (req, res) => {
  try {
    const bid = await Bid.findById(req.params.id).populate('part');

    if (!bid) {
      return res.status(404).json({ message: 'Bid not found' });
    }

    if (bid.part.seller.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    bid.status = 'accepted';
    await bid.save();

    res.json(bid);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.put('/:id/reject', authMiddleware, async (req, res) => {
  try {
    const bid = await Bid.findById(req.params.id).populate('part');

    if (!bid) {
      return res.status(404).json({ message: 'Bid not found' });
    }

    if (bid.part.seller.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    bid.status = 'rejected';
    await bid.save();

    res.json(bid);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;
