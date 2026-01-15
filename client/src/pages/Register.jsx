import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import axios from 'axios'
import './Auth.css'

function Register({ onLogin }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'owner'
  })
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    try {
      const response = await axios.post('/api/auth/register', formData)
      onLogin(response.data.user, response.data.token)
      navigate('/')
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed')
    }
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  return (
    <div className="auth-page">
      <div className="container">
        <div className="auth-card card">
          <div className="falcon-logo-large">🦅</div>
          <h1 className="gradient-text">Join RightPart</h1>
          <p className="auth-subtitle">Create your account and get started</p>

          {error && <div className="error-message">{error}</div>}

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label>Name</label>
              <input
                type="text"
                name="name"
                className="input"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="John Doe"
              />
            </div>

            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                name="email"
                className="input"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="your@email.com"
              />
            </div>

            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                name="password"
                className="input"
                value={formData.password}
                onChange={handleChange}
                required
                minLength="6"
                placeholder="••••••••"
              />
            </div>

            <div className="form-group">
              <label>I am a...</label>
              <select
                name="role"
                className="input"
                value={formData.role}
                onChange={handleChange}
                required
              >
                <option value="owner">Car Owner</option>
                <option value="mechanic">Mechanic/Technician</option>
                <option value="seller">Parts Seller</option>
              </select>
            </div>

            <button type="submit" className="btn-primary btn-full">
              Create Account
            </button>
          </form>

          <p className="auth-footer">
            Already have an account?{' '}
            <Link to="/login" className="auth-link">Login here</Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Register
