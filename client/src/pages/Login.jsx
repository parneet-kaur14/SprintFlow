import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { API_URL } from '../api'
import './Login.css'

function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const navigate = useNavigate()
  const DEMO_EMAIL = 'demo1@sprintflow.app'
  const DEMO_PASSWORD = 'pepvow-Xoxxaf-1reske'

  const handleSubmit = async (event) => {
    event.preventDefault()

    try {
        const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setMessage(data.message)
        return
      }

      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify(data.user))

      navigate('/dashboard')
    } catch (error) {
      setMessage('Unable to connect to server')
    }
  }

  const handleDemoLogin = async () => {
    setMessage('')

    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: DEMO_EMAIL,
          password: DEMO_PASSWORD,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setMessage(data.message || 'Unable to access demo account')
        return
      }

      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify(data.user))

      navigate('/dashboard')
    } catch (error) {
      setMessage('Unable to connect to server')
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-card">
        <div className="auth-brand">
          <h1>SprintFlow</h1>
          <p>Sign in to manage your projects and tasks.</p>
        </div>
  
        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="auth-field">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </div>
  
          <div className="auth-field">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </div>
  
          <button className="auth-button" type="submit">
            Login
          </button>
          <div className="auth-divider">
            <span>or</span>
            </div>

            <button
            className="demo-button"
            type="button"
            onClick={handleDemoLogin}
            >
            Try Demo Account
            </button>
        </form>
  
        <p className="auth-footer">
          Don't have an account? <Link to="/register">Create one</Link>
        </p>
  
        {message && <p className="auth-message">{message}</p>}
      </section>
    </main>
  )
}

export default Login