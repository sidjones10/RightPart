import { useState } from 'react'
import axios from 'axios'
import { X } from 'lucide-react'
import './BidModal.css'

function BidModal({ part, onClose, onSuccess }) {
  const [bidData, setBidData] = useState({
    amount: part.price,
    message: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const token = localStorage.getItem('token')
      await axios.post(
        '/api/bids',
        {
          partId: part._id,
          amount: bidData.amount,
          message: bidData.message
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      )
      onSuccess()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to place bid')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    setBidData({
      ...bidData,
      [e.target.name]: e.target.value
    })
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Place Bid</h2>
          <button className="close-button" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <div className="modal-body">
          <div className="part-info">
            <h3>{part.name}</h3>
            <p>{part.carMake} {part.carModel}</p>
            <p className="asking-price">Asking Price: ${part.price}</p>
          </div>

          {error && <div className="error-message">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Your Bid Amount ($)</label>
              <input
                type="number"
                name="amount"
                className="input"
                value={bidData.amount}
                onChange={handleChange}
                min="1"
                step="0.01"
                required
              />
            </div>

            <div className="form-group">
              <label>Message to Seller (optional)</label>
              <textarea
                name="message"
                className="input"
                value={bidData.message}
                onChange={handleChange}
                placeholder="Add any notes or questions..."
                rows="3"
              />
            </div>

            <div className="modal-actions">
              <button type="button" className="btn-secondary" onClick={onClose}>
                Cancel
              </button>
              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? 'Placing Bid...' : 'Place Bid'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default BidModal
