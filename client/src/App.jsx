import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { useState, useEffect } from 'react'
import Navbar from './components/Navbar'
import MaintenanceAlerts from './components/MaintenanceAlerts'
import Home from './pages/Home'
import DiagnosticPage from './pages/DiagnosticPage'
import MechanicDashboard from './pages/MechanicDashboard'
import SellerDashboard from './pages/SellerDashboard'
import PartsSearch from './pages/PartsSearch'
import MaintenancePage from './pages/MaintenancePage'
import Login from './pages/Login'
import Register from './pages/Register'

function App() {
  const [user, setUser] = useState(null)

  useEffect(() => {
    const token = localStorage.getItem('token')
    const userData = localStorage.getItem('user')
    if (token && userData) {
      setUser(JSON.parse(userData))
    }
  }, [])

  const handleLogin = (userData, token) => {
    setUser(userData)
    localStorage.setItem('token', token)
    localStorage.setItem('user', JSON.stringify(userData))
  }

  const handleLogout = () => {
    setUser(null)
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  }

  return (
    <Router>
      <div className="App">
        <Navbar user={user} onLogout={handleLogout} />
        {user && <MaintenanceAlerts />}
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/diagnostic" element={<DiagnosticPage />} />
          <Route path="/maintenance" element={<MaintenancePage />} />
          <Route path="/parts" element={<PartsSearch user={user} />} />
          <Route path="/mechanic" element={<MechanicDashboard user={user} />} />
          <Route path="/seller" element={<SellerDashboard user={user} />} />
          <Route path="/login" element={<Login onLogin={handleLogin} />} />
          <Route path="/register" element={<Register onLogin={handleLogin} />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App
