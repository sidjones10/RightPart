import { Link } from 'react-router-dom'
import { Search, Wrench, Globe, Zap } from 'lucide-react'
import './Home.css'

function Home() {
  return (
    <div className="home">
      <section className="hero">
        <div className="container">
          <div className="hero-content">
            <div className="falcon-hero">🦅</div>
            <h1 className="hero-title">
              <span className="gradient-text">RightPart</span>
            </h1>
            <p className="hero-subtitle">
              The Global Car Parts Marketplace - Powered by Innovation
            </p>
            <p className="hero-description">
              Advanced 3D diagnostics for car owners • Global parts search for mechanics • Seamless bidding system
            </p>
            <div className="hero-buttons">
              <Link to="/diagnostic" className="btn-primary btn-large">
                <Search size={20} />
                Start Diagnostic
              </Link>
              <Link to="/parts" className="btn-secondary btn-large">
                <Globe size={20} />
                Browse Parts
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="features">
        <div className="container">
          <h2 className="section-title gradient-text">Features</h2>
          <div className="features-grid">
            <div className="feature-card card">
              <div className="feature-icon">
                <Search size={48} />
              </div>
              <h3>3D Car Diagnostics</h3>
              <p>
                Input your car details and issue. Our advanced system will show you a 3D model
                with highlighted affected parts. Get detailed reports sent to your email.
              </p>
            </div>

            <div className="feature-card card">
              <div className="feature-icon">
                <Globe size={48} />
              </div>
              <h3>Global Parts Search</h3>
              <p>
                Mechanics can search for car parts from around the world. Find the best prices,
                compare suppliers, and get parts delivered anywhere.
              </p>
            </div>

            <div className="feature-card card">
              <div className="feature-icon">
                <Wrench size={48} />
              </div>
              <h3>Bidding System</h3>
              <p>
                Mechanics can bid on parts. Sellers can review offers and accept or reject bids.
                Fair pricing through competitive bidding.
              </p>
            </div>

            <div className="feature-card card">
              <div className="feature-icon">
                <Zap size={48} />
              </div>
              <h3>Fast & Reliable</h3>
              <p>
                Iron Man inspired design with lightning-fast performance. Real-time updates,
                instant notifications, and seamless transactions.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="cta">
        <div className="container">
          <div className="cta-content card">
            <h2 className="gradient-text">Ready to Get Started?</h2>
            <p>Join thousands of car owners and mechanics using RightPart</p>
            <Link to="/register" className="btn-primary btn-large">
              Create Account
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Home
