import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './MaintenanceAlerts.css';

function MaintenanceAlerts() {
  const [alerts, setAlerts] = useState([]);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    fetchAlerts();
    // Refresh alerts every 5 minutes
    const interval = setInterval(fetchAlerts, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const fetchAlerts = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const res = await fetch('http://localhost:5000/api/maintenance/stats', {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.ok) {
        const stats = await res.json();
        const urgentAlerts = [];

        if (stats.critical > 0) {
          urgentAlerts.push({
            type: 'critical',
            message: `${stats.critical} critical maintenance ${stats.critical === 1 ? 'item' : 'items'} require immediate attention!`
          });
        }

        if (stats.high > 0) {
          urgentAlerts.push({
            type: 'high',
            message: `${stats.high} high priority maintenance ${stats.high === 1 ? 'item' : 'items'} due soon.`
          });
        }

        setAlerts(urgentAlerts);
      }
    } catch (error) {
      console.error('Error fetching maintenance alerts:', error);
    }
  };

  if (!visible || alerts.length === 0) return null;

  return (
    <div className="maintenance-alerts">
      <div className="container">
        {alerts.map((alert, index) => (
          <div key={index} className={`alert alert-${alert.type}`}>
            <div className="alert-content">
              <span className="alert-icon">
                {alert.type === 'critical' ? '🚨' : '⚠️'}
              </span>
              <span className="alert-message">{alert.message}</span>
              <Link to="/maintenance" className="alert-link">
                View Details →
              </Link>
            </div>
            <button
              className="alert-close"
              onClick={() => setVisible(false)}
              aria-label="Dismiss"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default MaintenanceAlerts;
