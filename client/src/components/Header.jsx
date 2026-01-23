import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

export default function Header() {
  const { token, logout, user } = useAuth()
  const navigate = useNavigate()
  if (!token) return null

  function onLogout() {
    logout()
    navigate('/login')
  }

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-light mb-3 shadow-sm">
      <div className="container">
        <NavLink className="navbar-brand" to="/">SocialApp</NavLink>
        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#mainNavbar" aria-controls="mainNavbar" aria-expanded="false" aria-label="Toggle navigation">
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="mainNavbar">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            <li className="nav-item">
              <NavLink className="nav-link" to="/">Inicio</NavLink>
            </li>
            <li className="nav-item">
              <NavLink className="nav-link" to="/stories">Historias</NavLink>
            </li>
            <li className="nav-item">
              <NavLink className="nav-link" to="/profile/me">Perfil</NavLink>
            </li>
          </ul>
          <div className="d-flex align-items-center gap-2">
            {user && <span className="text-muted small">{user.name || user.email}</span>}
            <button className="btn btn-outline-secondary btn-sm" onClick={onLogout}>Salir</button>
          </div>
        </div>
      </div>
    </nav>
  )
}
