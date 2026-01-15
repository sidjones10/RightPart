import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { Wrench, Clock, CheckCircle, XCircle } from 'lucide-react'
import './Dashboard.css'

function MechanicDashboard({ user }) {
  const [bids, setBids] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    if (!user || user.role !== 'mechanic') {
      navigate('/login')
      return
    }

    fetchBids()
  }, [user, navigate])

  const fetchBids = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.get('/api/bids/mechanic', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      setBids(response.data)
    } catch (error) {
      console.error('Failed to fetch bids:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'accepted':
        return <CheckCircle size={20} color="#22c55e" />
      case 'rejected':
        return <XCircle size={20} color="#ef4444" />
      default:
        return <Clock size={20} color="#fbbf24" />
    }
  }

  const getStatusClass = (status) => {
    return `status-badge ${status}`
  }

  if (loading) {
    return (
      <div className="dashboard-page">
        <div className="container">
          <div className="loading-message">
            <Wrench size={48} className="spinning" />
            <p>Loading your bids...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="dashboard-page">
      <div className="container">
        <div className="dashboard-header">
          <div className="header-icon">
            <Wrench size={48} />
          </div>
          <div>
            <h1 className="gradient-text">Mechanic Dashboard</h1>
            <p>Welcome back, {user?.name}</p>
          </div>
        </div>

        <div className="dashboard-stats">
          <div className="stat-card card">
            <h3>Total Bids</h3>
            <p className="stat-number">{bids.length}</p>
          </div>
          <div className="stat-card card">
            <h3>Pending</h3>
            <p className="stat-number">{bids.filter(b => b.status === 'pending').length}</p>
          </div>
          <div className="stat-card card">
            <h3>Accepted</h3>
            <p className="stat-number">{bids.filter(b => b.status === 'accepted').length}</p>
          </div>
          <div className="stat-card card">
            <h3>Rejected</h3>
            <p className="stat-number">{bids.filter(b => b.status === 'rejected').length}</p>
          </div>
        </div>

        <div className="bids-section">
          <h2>Your Bids</h2>
          {bids.length === 0 ? (
            <div className="no-data card">
              <Wrench size={64} color="var(--iron-gold)" />
              <h3>No bids yet</h3>
              <p>Start bidding on parts to see them here</p>
            </div>
          ) : (
            <div className="bids-list">
              {bids.map((bid) => (
                <div key={bid._id} className="bid-card card">
                  <div className="bid-header">
                    <div>
                      <h3>{bid.part?.name}</h3>
                      <p className="bid-part-info">
                        {bid.part?.carMake} {bid.part?.carModel}
                      </p>
                    </div>
                    <div className={getStatusClass(bid.status)}>
                      {getStatusIcon(bid.status)}
                      <span>{bid.status}</span>
                    </div>
                  </div>

                  <div className="bid-details">
                    <div className="detail-row">
                      <span className="detail-label">Asking Price:</span>
                      <span className="detail-value">${bid.part?.price}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Your Bid:</span>
                      <span className="detail-value bid-amount">${bid.amount}</span>
                    </div>
                    {bid.message && (
                      <div className="bid-message">
                        <span className="detail-label">Message:</span>
                        <p>{bid.message}</p>
                      </div>
                    )}
                    <div className="detail-row">
                      <span className="detail-label">Bid Date:</span>
                      <span className="detail-value">
                        {new Date(bid.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default MechanicDashboard
