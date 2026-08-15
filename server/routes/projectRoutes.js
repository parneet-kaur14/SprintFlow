const express = require('express')

const authMiddleware = require('../middleware/authMiddleware')
const {
  getProjects,
  addProject,
} = require('../controllers/projectController')

const router = express.Router()
 
router.use(authMiddleware)

router.get('/', getProjects)
router.post('/', addProject)

module.exports = router