import { useState } from 'react'
import { Link } from 'react-router-dom'
import { API_URL } from '../api'
import './Login.css'

function Register() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')

  const handleSubmit = async (event) => {
    event.preventDefault()

    try {
        const response = await fetch(`${API_URL}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          email,
          password,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setMessage(data.message)
        return
      }

      setMessage('Account created successfully')
    } catch (error) {
      setMessage('Unable to connect to server')
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-card">
        <div className="auth-brand">
          <h1>SprintFlow</h1>
          <p>Create an account to start managing your projects.</p>
        </div>
  
        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="auth-field">
            <label>Name</label>
            <input
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
          </div>
  
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
            Create Account
          </button>
        </form>
  
        <p className="auth-footer">
          Already have an account? <Link to="/login">Log in</Link>
        </p>
  
        {message && <p className="auth-message">{message}</p>}
      </section>
    </main>
  )
}

export default Register