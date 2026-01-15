import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { Package, Plus, Clock, CheckCircle, XCircle } from 'lucide-react'
import AddPartModal from '../components/AddPartModal'
import './Dashboard.css'

function SellerDashboard({ user }) {
  const [bids, setBids] = useState([])
  const [parts, setParts] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    if (!user || user.role !== 'seller') {
      navigate('/login')
      return
    }

    fetchData()
  }, [user, navigate])

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token')

      const [bidsRes, partsRes] = await Promise.all([
        axios.get('/api/bids/seller', {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get('/api/parts/search', {
          headers: { Authorization: `Bearer ${token}` }
        })
      ])

      setBids(bidsRes.data)
      setParts(partsRes.data)
    } catch (error) {
      console.error('Failed to fetch data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAcceptBid = async (bidId) => {
    try {
      const token = localStorage.getItem('token')
      await axios.put(`/api/bids/${bidId}/accept`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      })
      fetchData()
    } catch (error) {
      console.error('Failed to accept bid:', error)
      alert('Failed to accept bid')
    }
  }

  const handleRejectBid = async (bidId) => {
    try {
      const token = localStorage.getItem('token')
      await axios.put(`/api/bids/${bidId}/reject`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      })
      fetchData()
    } catch (error) {
      console.error('Failed to reject bid:', error)
      alert('Failed to reject bid')
    }
  }

  const handleAddPartSuccess = () => {
    setShowAddModal(false)
    fetchData()
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

  if (loading) {
    return (
      <div className="dashboard-page">
        <div className="container">
          <div className="loading-message">
            <Package size={48} className="spinning" />
            <p>Loading your dashboard...</p>
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
            <Package size={48} />
          </div>
          <div>
            <h1 className="gradient-text">Seller Dashboard</h1>
            <p>Welcome back, {user?.name}</p>
          </div>
          <button className="btn-primary" onClick={() => setShowAddModal(true)}>
            <Plus size={20} />
            Add Part
          </button>
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
            <h3>Listed Parts</h3>
            <p className="stat-number">{parts.length}</p>
          </div>
        </div>

        <div className="bids-section">
          <h2>Received Bids</h2>
          {bids.length === 0 ? (
            <div className="no-data card">
              <Package size={64} color="var(--iron-gold)" />
              <h3>No bids yet</h3>
              <p>List parts to start receiving bids</p>
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
                      <p className="bid-mechanic">
                        Mechanic: {bid.mechanic?.name}
                      </p>
                    </div>
                    <div className={`status-badge ${bid.status}`}>
                      {getStatusIcon(bid.status)}
                      <span>{bid.status}</span>
                    </div>
                  </div>

                  <div className="bid-details">
                    <div className="detail-row">
                      <span className="detail-label">Your Price:</span>
                      <span className="detail-value">${bid.part?.price}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Bid Offer:</span>
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

                  {bid.status === 'pending' && (
                    <div className="bid-actions">
                      <button
                        className="btn-success"
                        onClick={() => handleAcceptBid(bid._id)}
                      >
                        <CheckCircle size={18} />
                        Accept Bid
                      </button>
                      <button
                        className="btn-danger"
                        onClick={() => handleRejectBid(bid._id)}
                      >
                        <XCircle size={18} />
                        Reject Bid
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {showAddModal && (
        <AddPartModal
          onClose={() => setShowAddModal(false)}
          onSuccess={handleAddPartSuccess}
        />
      )}
    </div>
  )
}

export default SellerDashboard
