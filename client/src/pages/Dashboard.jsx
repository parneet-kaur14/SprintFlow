import { useNavigate } from 'react-router-dom'

function Dashboard() {
  const navigate = useNavigate()

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')

    navigate('/login')
  }

  return (
    <main>
      <h1>Dashboard</h1>
      <p>Welcome to SprintFlow.</p>

      <button onClick={handleLogout}>
        Logout
      </button>
    </main>
  )
}

export default Dashboard