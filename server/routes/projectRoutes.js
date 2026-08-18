const express = require('express')

const authMiddleware = require('../middleware/authMiddleware')
const {
    getProjects,
    addProject,
    getProject,
    editProject,
    removeProject,
    addMember,
    listMembers,
    removeMember,
  } = require('../controllers/projectController')

const router = express.Router()
 
router.use(authMiddleware)

router.get('/', getProjects)
router.post('/', addProject)

router.get('/:projectId/members', listMembers)
router.post('/:projectId/members', addMember)
router.delete('/:projectId/members/:userId', removeMember)

router.get('/:projectId', getProject)
router.put('/:projectId', editProject)
router.delete('/:projectId', removeProject)

module.exports = router