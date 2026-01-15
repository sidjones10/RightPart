import express from 'express';
import Vehicle from '../models/Vehicle.js';
import { authMiddleware } from '../middleware/auth.js';
import { generatePredictiveReminders, checkTagRenewalReminders } from '../services/maintenancePredictor.js';

const router = express.Router();

// Get all vehicles for the logged-in user
router.get('/', authMiddleware, async (req, res) => {
  try {
    const vehicles = await Vehicle.find({ owner: req.user.userId });
    res.json(vehicles);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get a specific vehicle
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const vehicle = await Vehicle.findOne({
      _id: req.params.id,
      owner: req.user.userId
    });

    if (!vehicle) {
      return res.status(404).json({ message: 'Vehicle not found' });
    }

    res.json(vehicle);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Add a new vehicle
router.post('/', authMiddleware, async (req, res) => {
  try {
    const vehicleData = {
      ...req.body,
      owner: req.user.userId
    };

    const vehicle = new Vehicle(vehicleData);
    await vehicle.save();

    // Generate initial maintenance reminders
    await generatePredictiveReminders(vehicle, req.user);
    await checkTagRenewalReminders(vehicle, req.user);

    res.status(201).json(vehicle);
  } catch (error) {
    res.status(400).json({ message: 'Error creating vehicle', error: error.message });
  }
});

// Update vehicle information
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const vehicle = await Vehicle.findOneAndUpdate(
      { _id: req.params.id, owner: req.user.userId },
      { $set: req.body },
      { new: true, runValidators: true }
    );

    if (!vehicle) {
      return res.status(404).json({ message: 'Vehicle not found' });
    }

    // Regenerate reminders based on updated info
    await generatePredictiveReminders(vehicle, req.user);
    await checkTagRenewalReminders(vehicle, req.user);

    res.json(vehicle);
  } catch (error) {
    res.status(400).json({ message: 'Error updating vehicle', error: error.message });
  }
});

// Update mileage
router.patch('/:id/mileage', authMiddleware, async (req, res) => {
  try {
    const { currentMileage } = req.body;

    const vehicle = await Vehicle.findOneAndUpdate(
      { _id: req.params.id, owner: req.user.userId },
      { $set: { currentMileage } },
      { new: true }
    );

    if (!vehicle) {
      return res.status(404).json({ message: 'Vehicle not found' });
    }

    // Check if any maintenance reminders should be triggered
    await generatePredictiveReminders(vehicle, req.user);

    res.json(vehicle);
  } catch (error) {
    res.status(400).json({ message: 'Error updating mileage', error: error.message });
  }
});

// Record oil change
router.post('/:id/oil-change', authMiddleware, async (req, res) => {
  try {
    const { mileage, date } = req.body;

    const vehicle = await Vehicle.findOneAndUpdate(
      { _id: req.params.id, owner: req.user.userId },
      {
        $set: {
          lastOilChange: {
            mileage: mileage || vehicle.currentMileage,
            date: date || new Date()
          }
        }
      },
      { new: true }
    );

    if (!vehicle) {
      return res.status(404).json({ message: 'Vehicle not found' });
    }

    res.json(vehicle);
  } catch (error) {
    res.status(400).json({ message: 'Error recording oil change', error: error.message });
  }
});

// Delete vehicle
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const vehicle = await Vehicle.findOneAndDelete({
      _id: req.params.id,
      owner: req.user.userId
    });

    if (!vehicle) {
      return res.status(404).json({ message: 'Vehicle not found' });
    }

    res.json({ message: 'Vehicle deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;
