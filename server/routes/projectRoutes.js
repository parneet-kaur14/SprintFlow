const express = require('express')

const authMiddleware = require('../middleware/authMiddleware')
const {
    getProjects,
    addProject,
    getProject,
    editProject,
    removeProject,
  } = require('../controllers/projectController')

const router = express.Router()
 
router.use(authMiddleware)

router.get('/', getProjects)
router.get('/:projectId', getProject)
router.post('/', addProject)
router.put('/:projectId', editProject)
router.delete('/:projectId', removeProject)

module.exports = router