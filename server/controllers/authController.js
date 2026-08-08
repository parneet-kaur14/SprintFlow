const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

const {
  findUserByEmail,
  createUser,
} = require('../models/userModel')

const register = async (req, res) => {
  try {
    const { name, email, password } = req.body

    if (!name || !email || !password) {
      return res.status(400).json({
        message: 'Name, email and password are required',
      })
    }

    const existingUser = await findUserByEmail(email)

    if (existingUser) {
      return res.status(409).json({
        message: 'An account with this email already exists',
      })
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const user = await createUser(
      name,
      email,
      hashedPassword
    )

    res.status(201).json({
      message: 'Account created successfully',
      user,
    })
  } catch (error) {
    console.error('Registration failed:', error.message)

    res.status(500).json({
      message: 'Unable to create account',
    })
  }
}

const login = async (req, res) => {
    try {
      const { email, password } = req.body
  
      if (!email || !password) {
        return res.status(400).json({
          message: 'Email and password are required',
        })
      }
  
      const user = await findUserByEmail(email)
  
      if (!user) {
        return res.status(401).json({
          message: 'Invalid email or password',
        })
      }
  
      const passwordMatches = await bcrypt.compare(password, user.password)
  
      if (!passwordMatches) {
        return res.status(401).json({
          message: 'Invalid email or password',
        })
      }
  
      const token = jwt.sign(
        { userId: user.id },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      )
  
      res.json({
        message: 'Login successful',
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
        },
      })
    } catch (error) {
      console.error('Login failed:', error.message)
  
      res.status(500).json({
        message: 'Unable to log in',
      })
    }
  }

  module.exports = {
    register,
    login,
  }