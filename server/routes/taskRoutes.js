const express = require('express')
const authMiddleware = require('../middleware/authMiddleware')

const {
    addTask,
    getProjectTasks,
    editTask,
    removeTask,
    getStats,
    getDeadlines,
    getPriorityStats,
    getProjectProgressStats,
  } = require('../controllers/taskController')

const router = express.Router()

router.use(authMiddleware)

router.post('/', addTask)
router.get('/stats/dashboard', getStats)
router.get('/stats/priority', getPriorityStats)
router.get('/stats/projects', getProjectProgressStats)
router.get('/deadlines/upcoming', getDeadlines)
router.get('/project/:projectId', getProjectTasks)
router.put('/:taskId', editTask)
router.delete('/:taskId', removeTask)


module.exports = router