import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import './AppLayout.css'

function AppLayout() {
  const navigate = useNavigate()
  const user = JSON.parse(localStorage.getItem('user'))
  const [profileOpen, setProfileOpen] = useState(false)

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    navigate('/login')
  }

  const getInitials = () => {
    if (!user?.name) return 'U'

    return user.name
      .split(' ')
      .map((part) => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <div className="app-layout">
      <aside className="sidebar">
        <div>
          <h2 className="logo">SprintFlow</h2>

          <nav className="sidebar-nav">
          <NavLink
            to="/dashboard"
            className={({ isActive }) => (isActive ? 'active' : '')}
            >
            Dashboard
            </NavLink>

            <NavLink
            to="/projects"
            className={({ isActive }) => (isActive ? 'active' : '')}
            >
            Projects
            </NavLink>
          </nav>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div>
            <h1>Welcome back</h1>
            <p>Manage your projects and tasks.</p>
          </div>

          <div className="topbar-actions">
            <button
              className="new-project-button"
              onClick={() => navigate('/projects')}
            >
              New Project
            </button>

            <div className="profile-wrapper">
              <button
                className="profile-button"
                onClick={() => setProfileOpen((current) => !current)}
              >
                {getInitials()}
              </button>

              {profileOpen && (
                <div className="profile-menu">
                  <div className="profile-info">
                    <strong>{user?.name}</strong>
                    <span>{user?.email}</span>
                  </div>

                  <button
                    className="logout-button"
                    onClick={handleLogout}
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        <Outlet />
      </main>
    </div>
  )
}

export default AppLayout