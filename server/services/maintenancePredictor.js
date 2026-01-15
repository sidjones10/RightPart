import PartAnalytics from '../models/PartAnalytics.js';
import MaintenanceReminder from '../models/MaintenanceReminder.js';

// Standard maintenance intervals (in miles)
const MAINTENANCE_INTERVALS = {
  oil_change: 5000,
  air_filter: 15000,
  cabin_filter: 15000,
  spark_plugs: 30000,
  brake_pads: 50000,
  timing_belt: 60000,
  transmission_fluid: 60000,
  coolant_flush: 50000,
  tire_rotation: 7500,
  battery: 36 // months
};

/**
 * Updates part analytics when a user reports an issue
 */
export async function updatePartAnalytics(diagnostic) {
  try {
    const { carMake, carModel, affectedParts, user } = diagnostic;

    for (const part of affectedParts) {
      await PartAnalytics.findOneAndUpdate(
        {
          partName: part.name,
          carMake,
          carModel
        },
        {
          $inc: { totalReports: 1 },
          $push: {
            failureReports: {
              userId: user,
              issue: diagnostic.issue,
              reportedAt: new Date()
            }
          },
          $set: { lastUpdated: new Date() }
        },
        { upsert: true, new: true }
      );

      // Recalculate analytics
      await recalculatePartAnalytics(part.name, carMake, carModel);
    }
  } catch (error) {
    console.error('Error updating part analytics:', error);
  }
}

/**
 * Recalculates average failure rates for a part
 */
async function recalculatePartAnalytics(partName, carMake, carModel) {
  const analytics = await PartAnalytics.findOne({ partName, carMake, carModel });

  if (!analytics || analytics.failureReports.length === 0) return;

  const reports = analytics.failureReports.filter(r => r.mileage);

  if (reports.length > 0) {
    const avgMileage = reports.reduce((sum, r) => sum + r.mileage, 0) / reports.length;
    const avgMonths = reports.filter(r => r.monthsSinceInstallation)
      .reduce((sum, r) => sum + r.monthsSinceInstallation, 0) / reports.length || null;

    await PartAnalytics.findOneAndUpdate(
      { partName, carMake, carModel },
      {
        $set: {
          averageFailureMileage: Math.round(avgMileage),
          averageFailureMonths: avgMonths ? Math.round(avgMonths) : null,
          lastUpdated: new Date()
        }
      }
    );
  }
}

/**
 * Generates predictive maintenance reminders for a vehicle
 */
export async function generatePredictiveReminders(vehicle, user) {
  try {
    const { make, model, currentMileage, lastOilChange } = vehicle;

    // Oil change reminder
    if (lastOilChange && lastOilChange.mileage) {
      const mileageSinceOil = currentMileage - lastOilChange.mileage;
      if (mileageSinceOil >= MAINTENANCE_INTERVALS.oil_change * 0.8) {
        await createReminder({
          vehicle: vehicle._id,
          user: user._id,
          type: 'oil_change',
          title: 'Oil Change Due Soon',
          description: `Your vehicle has ${mileageSinceOil.toLocaleString()} miles since last oil change`,
          dueMileage: lastOilChange.mileage + MAINTENANCE_INTERVALS.oil_change,
          priority: mileageSinceOil >= MAINTENANCE_INTERVALS.oil_change ? 'high' : 'medium',
          predictionSource: 'manufacturer'
        });
      }
    }

    // Check for predictive part maintenance based on community data
    const commonParts = ['brake_pads', 'battery', 'alternator', 'starter', 'water_pump', 'fuel_pump'];

    for (const partName of commonParts) {
      const analytics = await PartAnalytics.findOne({
        partName,
        carMake: make,
        carModel: model
      });

      if (analytics && analytics.averageFailureMileage && analytics.totalReports >= 5) {
        const predictedFailure = analytics.averageFailureMileage;
        const warningThreshold = predictedFailure * 0.85;

        if (currentMileage >= warningThreshold) {
          const existingReminder = await MaintenanceReminder.findOne({
            vehicle: vehicle._id,
            partName,
            status: 'pending'
          });

          if (!existingReminder) {
            await createReminder({
              vehicle: vehicle._id,
              user: user._id,
              type: 'part_maintenance',
              title: `${partName.replace(/_/g, ' ').toUpperCase()} Maintenance Alert`,
              description: `Based on ${analytics.totalReports} user reports, this part typically needs attention around ${predictedFailure.toLocaleString()} miles`,
              partName,
              dueMileage: predictedFailure,
              priority: currentMileage >= predictedFailure ? 'critical' : 'medium',
              predictionSource: 'user_data',
              averageFailureMileage: predictedFailure,
              userReportsCount: analytics.totalReports
            });
          }
        }
      }
    }

    return true;
  } catch (error) {
    console.error('Error generating predictive reminders:', error);
    return false;
  }
}

/**
 * Creates or updates a maintenance reminder
 */
async function createReminder(reminderData) {
  const existing = await MaintenanceReminder.findOne({
    vehicle: reminderData.vehicle,
    type: reminderData.type,
    partName: reminderData.partName,
    status: 'pending'
  });

  if (existing) {
    return await MaintenanceReminder.findByIdAndUpdate(
      existing._id,
      { $set: reminderData },
      { new: true }
    );
  }

  return await MaintenanceReminder.create(reminderData);
}

/**
 * Checks and generates tag renewal reminders
 */
export async function checkTagRenewalReminders(vehicle, user) {
  const now = new Date();
  const oneMonthFromNow = new Date();
  oneMonthFromNow.setMonth(oneMonthFromNow.getMonth() + 1);

  // Registration renewal
  if (vehicle.registrationExpiry) {
    const expiryDate = new Date(vehicle.registrationExpiry);
    if (expiryDate <= oneMonthFromNow && expiryDate > now) {
      await createReminder({
        vehicle: vehicle._id,
        user: user._id,
        type: 'registration_renewal',
        title: 'Registration Renewal Due',
        description: `Your vehicle registration expires on ${expiryDate.toLocaleDateString()}`,
        dueDate: expiryDate,
        priority: 'high',
        predictionSource: 'manual'
      });
    }
  }

  // Inspection renewal
  if (vehicle.inspectionExpiry) {
    const expiryDate = new Date(vehicle.inspectionExpiry);
    if (expiryDate <= oneMonthFromNow && expiryDate > now) {
      await createReminder({
        vehicle: vehicle._id,
        user: user._id,
        type: 'inspection_renewal',
        title: 'Inspection Due',
        description: `Your vehicle inspection expires on ${expiryDate.toLocaleDateString()}`,
        dueDate: expiryDate,
        priority: 'high',
        predictionSource: 'manual'
      });
    }
  }
}

export default {
  updatePartAnalytics,
  generatePredictiveReminders,
  checkTagRenewalReminders
};
