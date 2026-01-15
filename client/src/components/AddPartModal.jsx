import { useState } from 'react'
import axios from 'axios'
import { X } from 'lucide-react'
import './BidModal.css'

function AddPartModal({ onClose, onSuccess }) {
  const [partData, setPartData] = useState({
    name: '',
    description: '',
    carMake: '',
    carModel: '',
    year: '',
    price: '',
    condition: 'new',
    quantity: 1,
    location: '',
    country: '',
    partNumber: '',
    category: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const token = localStorage.getItem('token')
      await axios.post('/api/parts', partData, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      onSuccess()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add part')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    setPartData({
      ...partData,
      [e.target.name]: e.target.value
    })
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Add New Part</h2>
          <button className="close-button" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <div className="modal-body">
          {error && <div className="error-message">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Part Name *</label>
              <input
                type="text"
                name="name"
                className="input"
                value={partData.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Description *</label>
              <textarea
                name="description"
                className="input"
                value={partData.description}
                onChange={handleChange}
                rows="3"
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Car Make *</label>
                <input
                  type="text"
                  name="carMake"
                  className="input"
                  value={partData.carMake}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Car Model *</label>
                <input
                  type="text"
                  name="carModel"
                  className="input"
                  value={partData.carModel}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Year</label>
                <input
                  type="text"
                  name="year"
                  className="input"
                  value={partData.year}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label>Part Number</label>
                <input
                  type="text"
                  name="partNumber"
                  className="input"
                  value={partData.partNumber}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Price ($) *</label>
                <input
                  type="number"
                  name="price"
                  className="input"
                  value={partData.price}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  required
                />
              </div>

              <div className="form-group">
                <label>Condition *</label>
                <select
                  name="condition"
                  className="input"
                  value={partData.condition}
                  onChange={handleChange}
                  required
                >
                  <option value="new">New</option>
                  <option value="used">Used</option>
                  <option value="refurbished">Refurbished</option>
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Location *</label>
                <input
                  type="text"
                  name="location"
                  className="input"
                  value={partData.location}
                  onChange={handleChange}
                  placeholder="City"
                  required
                />
              </div>

              <div className="form-group">
                <label>Country *</label>
                <input
                  type="text"
                  name="country"
                  className="input"
                  value={partData.country}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Quantity</label>
                <input
                  type="number"
                  name="quantity"
                  className="input"
                  value={partData.quantity}
                  onChange={handleChange}
                  min="1"
                />
              </div>

              <div className="form-group">
                <label>Category</label>
                <input
                  type="text"
                  name="category"
                  className="input"
                  value={partData.category}
                  onChange={handleChange}
                  placeholder="e.g., Engine, Brakes"
                />
              </div>
            </div>

            <div className="modal-actions">
              <button type="button" className="btn-secondary" onClick={onClose}>
                Cancel
              </button>
              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? 'Adding...' : 'Add Part'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default AddPartModal
