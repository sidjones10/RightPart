import { useState } from 'react'
import axios from 'axios'
import CarModel3D from '../components/CarModel3D'
import { Search, Mail, AlertCircle } from 'lucide-react'
import './DiagnosticPage.css'

function DiagnosticPage() {
  const [formData, setFormData] = useState({
    carMake: '',
    carModel: '',
    year: '',
    issue: '',
    userEmail: ''
  })
  const [affectedParts, setAffectedParts] = useState([])
  const [diagnostic, setDiagnostic] = useState(null)
  const [loading, setLoading] = useState(false)
  const [emailSent, setEmailSent] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleDiagnose = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setEmailSent(false)

    try {
      const response = await axios.post('/api/diagnostics/diagnose', formData)
      setDiagnostic(response.data.diagnostic)
      setAffectedParts(response.data.affectedParts)
    } catch (err) {
      setError('Failed to generate diagnosis. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleSendEmail = async () => {
    if (!formData.userEmail) {
      setError('Please enter an email address')
      return
    }

    setLoading(true)
    setError('')

    try {
      await axios.post('/api/diagnostics/send-report', {
        email: formData.userEmail,
        carMake: formData.carMake,
        carModel: formData.carModel,
        year: formData.year,
        issue: formData.issue,
        affectedParts
      })
      setEmailSent(true)
    } catch (err) {
      setError('Failed to send email. Please check your email configuration.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="diagnostic-page">
      <div className="container">
        <div className="diagnostic-header">
          <h1 className="gradient-text">Car Diagnostic Tool</h1>
          <p>Enter your car details and issue to get an instant 3D diagnostic report</p>
        </div>

        <div className="diagnostic-content">
          <div className="diagnostic-form-section">
            <form onSubmit={handleDiagnose} className="diagnostic-form card">
              <h2>Vehicle Information</h2>

              <div className="form-group">
                <label>Car Make</label>
                <input
                  type="text"
                  name="carMake"
                  className="input"
                  value={formData.carMake}
                  onChange={handleChange}
                  placeholder="e.g., Toyota, Ford, Honda"
                  required
                />
              </div>

              <div className="form-group">
                <label>Car Model</label>
                <input
                  type="text"
                  name="carModel"
                  className="input"
                  value={formData.carModel}
                  onChange={handleChange}
                  placeholder="e.g., Camry, F-150, Accord"
                  required
                />
              </div>

              <div className="form-group">
                <label>Year</label>
                <input
                  type="text"
                  name="year"
                  className="input"
                  value={formData.year}
                  onChange={handleChange}
                  placeholder="e.g., 2020"
                  required
                />
              </div>

              <div className="form-group">
                <label>Issue Description</label>
                <textarea
                  name="issue"
                  className="input"
                  value={formData.issue}
                  onChange={handleChange}
                  placeholder="Describe the issue you're experiencing..."
                  rows="4"
                  required
                />
                <small className="input-hint">
                  Keywords: engine noise, brake issues, steering, suspension, battery, exhaust, transmission, cooling
                </small>
              </div>

              <div className="form-group">
                <label>Email (optional - for report)</label>
                <input
                  type="email"
                  name="userEmail"
                  className="input"
                  value={formData.userEmail}
                  onChange={handleChange}
                  placeholder="your@email.com"
                />
              </div>

              <button type="submit" className="btn-primary btn-full" disabled={loading}>
                <Search size={20} />
                {loading ? 'Analyzing...' : 'Diagnose Issue'}
              </button>
            </form>
          </div>

          <div className="diagnostic-result-section">
            {!diagnostic ? (
              <div className="diagnostic-placeholder card">
                <AlertCircle size={64} color="var(--iron-gold)" />
                <h3>No Diagnostic Yet</h3>
                <p>Fill out the form and click "Diagnose Issue" to see your car's 3D model with affected parts highlighted</p>
              </div>
            ) : (
              <>
                <div className="car-model-container">
                  <CarModel3D affectedParts={affectedParts} />
                  <div className="model-controls">
                    <small>Click and drag to rotate • Scroll to zoom • Right-click to pan</small>
                  </div>
                </div>

                <div className="diagnostic-results card">
                  <h2>Diagnostic Results</h2>
                  <div className="result-info">
                    <p><strong>Vehicle:</strong> {formData.carMake} {formData.carModel} {formData.year}</p>
                    <p><strong>Issue:</strong> {formData.issue}</p>
                  </div>

                  <h3>Affected Parts:</h3>
                  <ul className="affected-parts-list">
                    {affectedParts.map((part, index) => (
                      <li key={index} className="affected-part-item">
                        <span className="part-indicator"></span>
                        {part.name}
                      </li>
                    ))}
                  </ul>

                  {formData.userEmail && (
                    <div className="email-section">
                      {emailSent ? (
                        <div className="success-message">
                          <Mail size={20} />
                          Report sent to {formData.userEmail}!
                        </div>
                      ) : (
                        <button
                          onClick={handleSendEmail}
                          className="btn-primary"
                          disabled={loading}
                        >
                          <Mail size={20} />
                          {loading ? 'Sending...' : 'Email Report'}
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </>
            )}

            {error && (
              <div className="error-message">{error}</div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default DiagnosticPage
