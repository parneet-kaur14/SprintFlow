const express = require('express')
const authMiddleware = require('../middleware/authMiddleware')
const {
  getActivities,
} = require('../controllers/activityController')

const router = express.Router()

router.use(authMiddleware)

router.get('/project/:projectId', getActivities)

module.exports = router