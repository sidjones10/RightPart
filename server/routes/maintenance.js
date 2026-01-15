import express from 'express';
import MaintenanceReminder from '../models/MaintenanceReminder.js';
import Vehicle from '../models/Vehicle.js';
import PartAnalytics from '../models/PartAnalytics.js';
import { authMiddleware } from '../middleware/auth.js';
import { generatePredictiveReminders, checkTagRenewalReminders } from '../services/maintenancePredictor.js';

const router = express.Router();

// Get all reminders for user
router.get('/reminders', authMiddleware, async (req, res) => {
  try {
    const { status, priority, type } = req.query;
    const filter = { user: req.user.userId };

    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (type) filter.type = type;

    const reminders = await MaintenanceReminder.find(filter)
      .populate('vehicle')
      .sort({ priority: -1, dueDate: 1, dueMileage: 1 });

    res.json(reminders);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get reminders for a specific vehicle
router.get('/reminders/vehicle/:vehicleId', authMiddleware, async (req, res) => {
  try {
    const reminders = await MaintenanceReminder.find({
      vehicle: req.params.vehicleId,
      user: req.user.userId
    }).sort({ priority: -1, dueDate: 1 });

    res.json(reminders);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get reminder statistics
router.get('/stats', authMiddleware, async (req, res) => {
  try {
    const pending = await MaintenanceReminder.countDocuments({
      user: req.user.userId,
      status: 'pending'
    });

    const critical = await MaintenanceReminder.countDocuments({
      user: req.user.userId,
      status: 'pending',
      priority: 'critical'
    });

    const high = await MaintenanceReminder.countDocuments({
      user: req.user.userId,
      status: 'pending',
      priority: 'high'
    });

    const overdue = await MaintenanceReminder.countDocuments({
      user: req.user.userId,
      status: 'pending',
      $or: [
        { dueDate: { $lt: new Date() } },
        { dueMileage: { $exists: true } }
      ]
    });

    res.json({ pending, critical, high, overdue });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create manual reminder
router.post('/reminders', authMiddleware, async (req, res) => {
  try {
    const reminderData = {
      ...req.body,
      user: req.user.userId,
      predictionSource: 'manual'
    };

    const reminder = new MaintenanceReminder(reminderData);
    await reminder.save();

    res.status(201).json(reminder);
  } catch (error) {
    res.status(400).json({ message: 'Error creating reminder', error: error.message });
  }
});

// Update reminder
router.put('/reminders/:id', authMiddleware, async (req, res) => {
  try {
    const reminder = await MaintenanceReminder.findOneAndUpdate(
      { _id: req.params.id, user: req.user.userId },
      { $set: req.body },
      { new: true }
    );

    if (!reminder) {
      return res.status(404).json({ message: 'Reminder not found' });
    }

    res.json(reminder);
  } catch (error) {
    res.status(400).json({ message: 'Error updating reminder', error: error.message });
  }
});

// Mark reminder as completed
router.patch('/reminders/:id/complete', authMiddleware, async (req, res) => {
  try {
    const reminder = await MaintenanceReminder.findOneAndUpdate(
      { _id: req.params.id, user: req.user.userId },
      {
        $set: {
          status: 'completed',
          completedAt: new Date()
        }
      },
      { new: true }
    );

    if (!reminder) {
      return res.status(404).json({ message: 'Reminder not found' });
    }

    res.json(reminder);
  } catch (error) {
    res.status(400).json({ message: 'Error completing reminder', error: error.message });
  }
});

// Dismiss reminder
router.patch('/reminders/:id/dismiss', authMiddleware, async (req, res) => {
  try {
    const reminder = await MaintenanceReminder.findOneAndUpdate(
      { _id: req.params.id, user: req.user.userId },
      { $set: { status: 'dismissed' } },
      { new: true }
    );

    if (!reminder) {
      return res.status(404).json({ message: 'Reminder not found' });
    }

    res.json(reminder);
  } catch (error) {
    res.status(400).json({ message: 'Error dismissing reminder', error: error.message });
  }
});

// Delete reminder
router.delete('/reminders/:id', authMiddleware, async (req, res) => {
  try {
    const reminder = await MaintenanceReminder.findOneAndDelete({
      _id: req.params.id,
      user: req.user.userId
    });

    if (!reminder) {
      return res.status(404).json({ message: 'Reminder not found' });
    }

    res.json({ message: 'Reminder deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Refresh all reminders for user's vehicles
router.post('/refresh', authMiddleware, async (req, res) => {
  try {
    const vehicles = await Vehicle.find({ owner: req.user.userId });

    for (const vehicle of vehicles) {
      await generatePredictiveReminders(vehicle, req.user);
      await checkTagRenewalReminders(vehicle, req.user);
    }

    const reminders = await MaintenanceReminder.find({
      user: req.user.userId,
      status: 'pending'
    }).populate('vehicle');

    res.json({
      message: 'Reminders refreshed successfully',
      count: reminders.length,
      reminders
    });
  } catch (error) {
    res.status(500).json({ message: 'Error refreshing reminders', error: error.message });
  }
});

// Get part analytics
router.get('/analytics/:partName', authMiddleware, async (req, res) => {
  try {
    const { partName } = req.params;
    const { make, model } = req.query;

    const filter = { partName };
    if (make) filter.carMake = make;
    if (model) filter.carModel = model;

    const analytics = await PartAnalytics.find(filter);

    res.json(analytics);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;
