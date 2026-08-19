const express = require('express')
const authMiddleware = require('../middleware/authMiddleware')
const {
  getActivities,
  getWeeklyStats,
} = require('../controllers/activityController')

const router = express.Router()

router.use(authMiddleware)

router.get('/stats/weekly', getWeeklyStats)
router.get('/project/:projectId', getActivities)

module.exports = router