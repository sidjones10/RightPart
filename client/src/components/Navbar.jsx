import { Link } from 'react-router-dom'
import { User, LogOut, Wrench, Package, Search } from 'lucide-react'
import './Navbar.css'

function Navbar({ user, onLogout }) {
  return (
    <nav className="navbar">
      <div className="container navbar-content">
        <Link to="/" className="navbar-brand">
          <div className="falcon-logo">🦅</div>
          <span className="gradient-text">RightPart</span>
        </Link>

        <div className="navbar-links">
          <Link to="/diagnostic" className="nav-link">
            <Search size={18} />
            Diagnostic
          </Link>
          <Link to="/parts" className="nav-link">
            <Package size={18} />
            Parts Search
          </Link>

          {user && user.role === 'mechanic' && (
            <Link to="/mechanic" className="nav-link">
              <Wrench size={18} />
              Dashboard
            </Link>
          )}

          {user && user.role === 'seller' && (
            <Link to="/seller" className="nav-link">
              <Package size={18} />
              My Parts
            </Link>
          )}

          {user ? (
            <div className="user-menu">
              <span className="user-name">
                <User size={18} />
                {user.name}
              </span>
              <button onClick={onLogout} className="btn-logout">
                <LogOut size={18} />
                Logout
              </button>
            </div>
          ) : (
            <div className="auth-links">
              <Link to="/login" className="btn-secondary">Login</Link>
              <Link to="/register" className="btn-primary">Register</Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}

export default Navbar
