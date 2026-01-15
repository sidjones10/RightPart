import express from 'express';
import Part from '../models/Part.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

router.get('/search', async (req, res) => {
  try {
    const { query, make, model, country, minPrice, maxPrice } = req.query;

    let filter = {};

    if (query) {
      filter.$or = [
        { name: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } },
        { partNumber: { $regex: query, $options: 'i' } }
      ];
    }

    if (make) filter.carMake = { $regex: make, $options: 'i' };
    if (model) filter.carModel = { $regex: model, $options: 'i' };
    if (country) filter.country = { $regex: country, $options: 'i' };

    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    const parts = await Part.find(filter)
      .populate('seller', 'name email location')
      .sort({ createdAt: -1 })
      .limit(100);

    res.json(parts);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const part = await Part.findById(req.params.id)
      .populate('seller', 'name email location');

    if (!part) {
      return res.status(404).json({ message: 'Part not found' });
    }

    res.json(part);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.post('/', authMiddleware, async (req, res) => {
  try {
    const part = new Part({
      ...req.body,
      seller: req.user.userId
    });

    await part.save();
    res.status(201).json(part);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const part = await Part.findById(req.params.id);

    if (!part) {
      return res.status(404).json({ message: 'Part not found' });
    }

    if (part.seller.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const updatedPart = await Part.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    res.json(updatedPart);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const part = await Part.findById(req.params.id);

    if (!part) {
      return res.status(404).json({ message: 'Part not found' });
    }

    if (part.seller.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await Part.findByIdAndDelete(req.params.id);
    res.json({ message: 'Part deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;
