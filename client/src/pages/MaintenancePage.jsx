import React, { useState, useEffect } from 'react';
import './MaintenancePage.css';

function MaintenancePage() {
  const [vehicles, setVehicles] = useState([]);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [reminders, setReminders] = useState([]);
  const [stats, setStats] = useState({ pending: 0, critical: 0, high: 0, overdue: 0 });
  const [showAddVehicle, setShowAddVehicle] = useState(false);
  const [showAddReminder, setShowAddReminder] = useState(false);
  const [loading, setLoading] = useState(true);

  const [vehicleForm, setVehicleForm] = useState({
    make: '',
    model: '',
    year: '',
    vin: '',
    currentMileage: '',
    lastOilChange: { mileage: '', date: '' },
    registrationExpiry: '',
    inspectionExpiry: ''
  });

  const [reminderForm, setReminderForm] = useState({
    vehicle: '',
    type: 'general',
    title: '',
    description: '',
    dueDate: '',
    dueMileage: '',
    priority: 'medium'
  });

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (selectedVehicle) {
      fetchReminders(selectedVehicle);
    } else {
      fetchAllReminders();
    }
  }, [selectedVehicle]);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      const [vehiclesRes, statsRes] = await Promise.all([
        fetch('http://localhost:5000/api/vehicles', { headers }),
        fetch('http://localhost:5000/api/maintenance/stats', { headers })
      ]);

      if (vehiclesRes.ok) {
        const vehiclesData = await vehiclesRes.json();
        setVehicles(vehiclesData);
      }

      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData);
      }

      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setLoading(false);
    }
  };

  const fetchAllReminders = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/maintenance/reminders?status=pending', {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.ok) {
        const data = await res.json();
        setReminders(data);
      }
    } catch (error) {
      console.error('Error fetching reminders:', error);
    }
  };

  const fetchReminders = async (vehicleId) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5000/api/maintenance/reminders/vehicle/${vehicleId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.ok) {
        const data = await res.json();
        setReminders(data);
      }
    } catch (error) {
      console.error('Error fetching reminders:', error);
    }
  };

  const handleAddVehicle = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/vehicles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          ...vehicleForm,
          currentMileage: parseInt(vehicleForm.currentMileage) || 0,
          lastOilChange: {
            mileage: parseInt(vehicleForm.lastOilChange.mileage) || undefined,
            date: vehicleForm.lastOilChange.date || undefined
          }
        })
      });

      if (res.ok) {
        setShowAddVehicle(false);
        setVehicleForm({
          make: '', model: '', year: '', vin: '', currentMileage: '',
          lastOilChange: { mileage: '', date: '' },
          registrationExpiry: '', inspectionExpiry: ''
        });
        fetchData();
      }
    } catch (error) {
      console.error('Error adding vehicle:', error);
    }
  };

  const handleUpdateMileage = async (vehicleId, mileage) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5000/api/vehicles/${vehicleId}/mileage`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ currentMileage: parseInt(mileage) })
      });

      if (res.ok) {
        fetchData();
        if (selectedVehicle) fetchReminders(selectedVehicle);
      }
    } catch (error) {
      console.error('Error updating mileage:', error);
    }
  };

  const handleCompleteReminder = async (reminderId) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5000/api/maintenance/reminders/${reminderId}/complete`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.ok) {
        fetchData();
        if (selectedVehicle) {
          fetchReminders(selectedVehicle);
        } else {
          fetchAllReminders();
        }
      }
    } catch (error) {
      console.error('Error completing reminder:', error);
    }
  };

  const handleDismissReminder = async (reminderId) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5000/api/maintenance/reminders/${reminderId}/dismiss`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.ok) {
        fetchData();
        if (selectedVehicle) {
          fetchReminders(selectedVehicle);
        } else {
          fetchAllReminders();
        }
      }
    } catch (error) {
      console.error('Error dismissing reminder:', error);
    }
  };

  const refreshReminders = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/maintenance/refresh', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.ok) {
        fetchData();
        if (selectedVehicle) {
          fetchReminders(selectedVehicle);
        } else {
          fetchAllReminders();
        }
      }
    } catch (error) {
      console.error('Error refreshing reminders:', error);
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'critical': return '#ef4444';
      case 'high': return '#f59e0b';
      case 'medium': return '#10b981';
      case 'low': return '#6b7280';
      default: return '#6b7280';
    }
  };

  const getReminderIcon = (type) => {
    switch (type) {
      case 'oil_change': return '🛢️';
      case 'part_maintenance': return '🔧';
      case 'registration_renewal': return '📋';
      case 'inspection_renewal': return '✅';
      default: return '⚠️';
    }
  };

  if (loading) {
    return <div className="container"><div className="loading">Loading maintenance data...</div></div>;
  }

  return (
    <div className="maintenance-page">
      <div className="container">
        <div className="maintenance-header">
          <div className="header-content">
            <span className="header-icon">🔧</span>
            <div>
              <h1>Maintenance Hub</h1>
              <p>Track your vehicle maintenance and get predictive reminders</p>
            </div>
          </div>
          <button className="btn btn-primary" onClick={() => setShowAddVehicle(true)}>
            ➕ Add Vehicle
          </button>
        </div>

        <div className="stats-grid">
          <div className="stat-card">
            <h3>Pending Reminders</h3>
            <div className="stat-number">{stats.pending}</div>
          </div>
          <div className="stat-card">
            <h3>Critical</h3>
            <div className="stat-number" style={{ color: '#ef4444' }}>{stats.critical}</div>
          </div>
          <div className="stat-card">
            <h3>High Priority</h3>
            <div className="stat-number" style={{ color: '#f59e0b' }}>{stats.high}</div>
          </div>
          <div className="stat-card">
            <h3>Overdue</h3>
            <div className="stat-number" style={{ color: '#dc2626' }}>{stats.overdue}</div>
          </div>
        </div>

        <div className="vehicles-section">
          <div className="section-header">
            <h2>Your Vehicles</h2>
            <button className="btn btn-secondary" onClick={refreshReminders}>
              🔄 Refresh Reminders
            </button>
          </div>

          {vehicles.length === 0 ? (
            <div className="no-data">
              <span style={{ fontSize: '64px' }}>🚗</span>
              <h3>No Vehicles Added</h3>
              <p>Add your first vehicle to start tracking maintenance</p>
            </div>
          ) : (
            <div className="vehicles-grid">
              {vehicles.map((vehicle) => (
                <div
                  key={vehicle._id}
                  className={`vehicle-card ${selectedVehicle === vehicle._id ? 'selected' : ''}`}
                  onClick={() => setSelectedVehicle(selectedVehicle === vehicle._id ? null : vehicle._id)}
                >
                  <div className="vehicle-icon">🚗</div>
                  <h3>{vehicle.year} {vehicle.make} {vehicle.model}</h3>
                  <div className="vehicle-info">
                    <p>📊 {vehicle.currentMileage?.toLocaleString() || 0} miles</p>
                    {vehicle.lastOilChange?.mileage && (
                      <p>🛢️ Last Oil: {vehicle.lastOilChange.mileage.toLocaleString()} mi</p>
                    )}
                  </div>
                  <input
                    type="number"
                    placeholder="Update mileage"
                    className="input"
                    onClick={(e) => e.stopPropagation()}
                    onBlur={(e) => {
                      if (e.target.value) {
                        handleUpdateMileage(vehicle._id, e.target.value);
                        e.target.value = '';
                      }
                    }}
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="reminders-section">
          <h2>
            {selectedVehicle ? 'Vehicle Reminders' : 'All Reminders'}
          </h2>

          {reminders.length === 0 ? (
            <div className="no-data">
              <span style={{ fontSize: '64px' }}>✅</span>
              <h3>No Pending Reminders</h3>
              <p>You're all caught up!</p>
            </div>
          ) : (
            <div className="reminders-list">
              {reminders.map((reminder) => (
                <div key={reminder._id} className="reminder-card">
                  <div className="reminder-header">
                    <div className="reminder-title">
                      <span className="reminder-icon">{getReminderIcon(reminder.type)}</span>
                      <div>
                        <h3>{reminder.title}</h3>
                        {reminder.vehicle && (
                          <p className="vehicle-name">
                            {reminder.vehicle.year} {reminder.vehicle.make} {reminder.vehicle.model}
                          </p>
                        )}
                      </div>
                    </div>
                    <span
                      className="priority-badge"
                      style={{ backgroundColor: `${getPriorityColor(reminder.priority)}20`, color: getPriorityColor(reminder.priority) }}
                    >
                      {reminder.priority}
                    </span>
                  </div>

                  {reminder.description && (
                    <p className="reminder-description">{reminder.description}</p>
                  )}

                  <div className="reminder-details">
                    {reminder.dueMileage && (
                      <div className="detail-item">
                        <span>📊 Due at:</span>
                        <strong>{reminder.dueMileage.toLocaleString()} miles</strong>
                      </div>
                    )}
                    {reminder.dueDate && (
                      <div className="detail-item">
                        <span>📅 Due date:</span>
                        <strong>{new Date(reminder.dueDate).toLocaleDateString()}</strong>
                      </div>
                    )}
                    {reminder.userReportsCount > 0 && (
                      <div className="detail-item">
                        <span>📈 Based on:</span>
                        <strong>{reminder.userReportsCount} user reports</strong>
                      </div>
                    )}
                  </div>

                  <div className="reminder-actions">
                    <button
                      className="btn btn-success"
                      onClick={() => handleCompleteReminder(reminder._id)}
                    >
                      ✓ Complete
                    </button>
                    <button
                      className="btn btn-secondary"
                      onClick={() => handleDismissReminder(reminder._id)}
                    >
                      ✕ Dismiss
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {showAddVehicle && (
          <div className="modal-overlay" onClick={() => setShowAddVehicle(false)}>
            <div className="modal-content card" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Add New Vehicle</h2>
                <button className="close-button" onClick={() => setShowAddVehicle(false)}>✕</button>
              </div>
              <form onSubmit={handleAddVehicle}>
                <div className="form-row">
                  <div className="form-group">
                    <label>Make *</label>
                    <input
                      type="text"
                      className="input"
                      required
                      value={vehicleForm.make}
                      onChange={(e) => setVehicleForm({ ...vehicleForm, make: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Model *</label>
                    <input
                      type="text"
                      className="input"
                      required
                      value={vehicleForm.model}
                      onChange={(e) => setVehicleForm({ ...vehicleForm, model: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Year *</label>
                    <input
                      type="text"
                      className="input"
                      required
                      value={vehicleForm.year}
                      onChange={(e) => setVehicleForm({ ...vehicleForm, year: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Current Mileage</label>
                    <input
                      type="number"
                      className="input"
                      value={vehicleForm.currentMileage}
                      onChange={(e) => setVehicleForm({ ...vehicleForm, currentMileage: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>VIN (Optional)</label>
                  <input
                    type="text"
                    className="input"
                    value={vehicleForm.vin}
                    onChange={(e) => setVehicleForm({ ...vehicleForm, vin: e.target.value })}
                  />
                </div>

                <h3 style={{ marginTop: '24px', marginBottom: '16px' }}>Maintenance Info</h3>

                <div className="form-row">
                  <div className="form-group">
                    <label>Last Oil Change (miles)</label>
                    <input
                      type="number"
                      className="input"
                      value={vehicleForm.lastOilChange.mileage}
                      onChange={(e) => setVehicleForm({
                        ...vehicleForm,
                        lastOilChange: { ...vehicleForm.lastOilChange, mileage: e.target.value }
                      })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Last Oil Change (date)</label>
                    <input
                      type="date"
                      className="input"
                      value={vehicleForm.lastOilChange.date}
                      onChange={(e) => setVehicleForm({
                        ...vehicleForm,
                        lastOilChange: { ...vehicleForm.lastOilChange, date: e.target.value }
                      })}
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Registration Expiry</label>
                    <input
                      type="date"
                      className="input"
                      value={vehicleForm.registrationExpiry}
                      onChange={(e) => setVehicleForm({ ...vehicleForm, registrationExpiry: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Inspection Expiry</label>
                    <input
                      type="date"
                      className="input"
                      value={vehicleForm.inspectionExpiry}
                      onChange={(e) => setVehicleForm({ ...vehicleForm, inspectionExpiry: e.target.value })}
                    />
                  </div>
                </div>

                <div className="modal-actions">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowAddVehicle(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Add Vehicle
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default MaintenancePage;
