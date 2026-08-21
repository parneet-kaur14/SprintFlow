import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { API_URL } from '../api'

function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const navigate = useNavigate()

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

  return (
    <main>
      <h1>Login</h1>

      <form onSubmit={handleSubmit}>
        <div>
          <label>Email</label>
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </div>

        <div>
          <label>Password</label>
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </div>

        <button type="submit">Login</button>
      </form>

      <p>
        Don't have an account? <Link to="/register">Create one</Link>
        </p>

      {message && <p>{message}</p>}
    </main>
  )
}

export default Login