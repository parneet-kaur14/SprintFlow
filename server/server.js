const express = require('express')
const cors = require('cors')

const authRoutes = require('./routes/authRoutes')
const pool = require('./config/db')
const projectRoutes = require('./routes/projectRoutes')
const taskRoutes = require('./routes/taskRoutes')

const app = express()

app.use(cors())
app.use(express.json())
app.use('/api/auth', authRoutes)
app.use('/api/projects', projectRoutes)
app.use('/api/tasks', taskRoutes)

app.use('/api/auth', authRoutes)

const PORT = 5050

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' })
})

pool
  .connect()
  .then(() => {
    console.log('Connected to PostgreSQL')
  })
  .catch((err) => {
    console.error('Database connection failed')
    console.error(err.message)
  })

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})