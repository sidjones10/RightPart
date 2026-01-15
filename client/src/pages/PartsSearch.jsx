import { useState, useEffect } from 'react'
import axios from 'axios'
import { Search, Globe, DollarSign, MapPin, Package } from 'lucide-react'
import BidModal from '../components/BidModal'
import './PartsSearch.css'

function PartsSearch({ user }) {
  const [searchQuery, setSearchQuery] = useState('')
  const [filters, setFilters] = useState({
    make: '',
    model: '',
    country: '',
    minPrice: '',
    maxPrice: ''
  })
  const [parts, setParts] = useState([])
  const [loading, setLoading] = useState(false)
  const [selectedPart, setSelectedPart] = useState(null)
  const [showBidModal, setShowBidModal] = useState(false)

  const handleSearch = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        query: searchQuery,
        ...filters
      })
      const response = await axios.get(`/api/parts/search?${params}`)
      setParts(response.data)
    } catch (error) {
      console.error('Search failed:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    handleSearch()
  }, [])

  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value
    })
  }

  const handleBid = (part) => {
    if (!user) {
      alert('Please login to place a bid')
      return
    }
    if (user.role !== 'mechanic') {
      alert('Only mechanics can place bids')
      return
    }
    setSelectedPart(part)
    setShowBidModal(true)
  }

  const handleBidSuccess = () => {
    setShowBidModal(false)
    setSelectedPart(null)
    alert('Bid placed successfully!')
  }

  return (
    <div className="parts-search-page">
      <div className="container">
        <div className="search-header">
          <h1 className="gradient-text">Global Parts Search</h1>
          <p>Find car parts from sellers around the world</p>
        </div>

        <div className="search-section card">
          <div className="search-bar">
            <Search size={20} />
            <input
              type="text"
              className="search-input"
              placeholder="Search for parts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
            <button className="btn-primary" onClick={handleSearch}>
              Search
            </button>
          </div>

          <div className="filters">
            <input
              type="text"
              name="make"
              className="input filter-input"
              placeholder="Car Make"
              value={filters.make}
              onChange={handleFilterChange}
            />
            <input
              type="text"
              name="model"
              className="input filter-input"
              placeholder="Car Model"
              value={filters.model}
              onChange={handleFilterChange}
            />
            <input
              type="text"
              name="country"
              className="input filter-input"
              placeholder="Country"
              value={filters.country}
              onChange={handleFilterChange}
            />
            <input
              type="number"
              name="minPrice"
              className="input filter-input"
              placeholder="Min Price"
              value={filters.minPrice}
              onChange={handleFilterChange}
            />
            <input
              type="number"
              name="maxPrice"
              className="input filter-input"
              placeholder="Max Price"
              value={filters.maxPrice}
              onChange={handleFilterChange}
            />
          </div>
        </div>

        {loading ? (
          <div className="loading-message">
            <Globe size={48} className="spinning" />
            <p>Searching worldwide...</p>
          </div>
        ) : (
          <div className="parts-grid">
            {parts.length === 0 ? (
              <div className="no-results card">
                <Package size={64} color="var(--iron-gold)" />
                <h3>No parts found</h3>
                <p>Try adjusting your search criteria</p>
              </div>
            ) : (
              parts.map((part) => (
                <div key={part._id} className="part-card card">
                  <div className="part-header">
                    <h3>{part.name}</h3>
                    <span className={`condition-badge ${part.condition}`}>
                      {part.condition}
                    </span>
                  </div>

                  <p className="part-description">{part.description}</p>

                  <div className="part-details">
                    <div className="detail-item">
                      <strong>Car:</strong> {part.carMake} {part.carModel}
                    </div>
                    {part.year && (
                      <div className="detail-item">
                        <strong>Year:</strong> {part.year}
                      </div>
                    )}
                    {part.partNumber && (
                      <div className="detail-item">
                        <strong>Part #:</strong> {part.partNumber}
                      </div>
                    )}
                  </div>

                  <div className="part-footer">
                    <div className="part-location">
                      <MapPin size={16} />
                      {part.location}, {part.country}
                    </div>
                    <div className="part-price">
                      <DollarSign size={20} />
                      <span className="price-amount">{part.price}</span>
                    </div>
                  </div>

                  <div className="part-seller">
                    <small>Seller: {part.seller?.name || 'Unknown'}</small>
                  </div>

                  {user && user.role === 'mechanic' && (
                    <button
                      className="btn-primary btn-full"
                      onClick={() => handleBid(part)}
                    >
                      Place Bid
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {showBidModal && (
        <BidModal
          part={selectedPart}
          onClose={() => setShowBidModal(false)}
          onSuccess={handleBidSuccess}
        />
      )}
    </div>
  )
}

export default PartsSearch
