const {
    getProjectsByOwner,
    createProject,
    getProjectById,
    getOwnedProjectById,
    updateProject,
    deleteProject,
    addProjectMember,
    getProjectMembers,
    removeProjectMember,
    getUserByEmail,
  } = require('../models/projectModel')

  const { createActivity } = require('../models/activityModel')
  
  const getProjects = async (req, res) => {
    try {
      const projects = await getProjectsByOwner(req.user.userId)
  
      res.json(projects)
    } catch (error) {
      console.error('Unable to retrieve projects:', error.message)
  
      res.status(500).json({
        message: 'Unable to retrieve projects',
      })
    }
  }
  
  const addProject = async (req, res) => {
    try {
      const { name, description } = req.body
  
      if (!name) {
        return res.status(400).json({
          message: 'Project name is required',
        })
      }
  
      const project = await createProject(
        name,
        description,
        req.user.userId
      )
  
      res.status(201).json(project)
    } catch (error) {
      console.error('Unable to create project:', error.message)
  
      res.status(500).json({
        message: 'Unable to create project',
      })
    }
  }

  const getProject = async (req, res) => {
    try {
      const project = await getProjectById(
        req.params.projectId,
        req.user.userId
      )
  
      if (!project) {
        return res.status(404).json({
          message: 'Project not found',
        })
      }
  
      res.json(project)
    } catch (error) {
      console.error('Unable to retrieve project:', error.message)
  
      res.status(500).json({
        message: 'Unable to retrieve project',
      })
    }
  }

  const editProject = async (req, res) => {
    try {
      const { name, description } = req.body
  
      if (!name) {
        return res.status(400).json({
          message: 'Project name is required',
        })
      }
  
      const project = await updateProject(
        req.params.projectId,
        name,
        description,
        req.user.userId
      )
  
      if (!project) {
        return res.status(404).json({
          message: 'Project not found',
        })
      }
  
      res.json(project)
    } catch (error) {
      console.error('Unable to update project:', error.message)
  
      res.status(500).json({
        message: 'Unable to update project',
      })
    }
  }

  const removeProject = async (req, res) => {
    try {
      const project = await deleteProject(
        req.params.projectId,
        req.user.userId
      )
  
      if (!project) {
        return res.status(404).json({
          message: 'Project not found',
        })
      }
  
      res.json({
        message: 'Project deleted successfully',
      })
    } catch (error) {
      console.error('Unable to delete project:', error.message)
  
      res.status(500).json({
        message: 'Unable to delete project',
      })
    }
  }

  const addMember = async (req, res) => {
    try {
      const { email } = req.body
  
      if (!email) {
        return res.status(400).json({
          message: 'Email is required',
        })
      }
  
      const project = await getOwnedProjectById(
        req.params.projectId,
        req.user.userId
      )
  
      if (!project) {
        return res.status(403).json({
          message: 'Only the project owner can add members',
        })
      }
  
      const user = await getUserByEmail(email)
  
      if (!user) {
        return res.status(404).json({
          message: 'User not found',
        })
      }
  
      const member = await addProjectMember(
        req.params.projectId,
        user.id,
        'member'
      )

      await createActivity(
        req.params.projectId,
        req.user.userId,
        'member_added',
        `Added ${user.name} to the project`
      )
  
      res.status(201).json({
        ...member,
        name: user.name,
        email: user.email,
      })
    } catch (error) {
      console.error('Unable to add project member:', error.message)
  
      res.status(500).json({
        message: 'Unable to add project member',
      })
    }
  }
  
  const listMembers = async (req, res) => {
    try {
      const project = await getProjectById(
        req.params.projectId,
        req.user.userId
      )
  
      if (!project) {
        return res.status(403).json({
          message: 'You do not have access to this project',
        })
      }
  
      const members = await getProjectMembers(req.params.projectId)
  
      res.json(members)
    } catch (error) {
      console.error('Unable to retrieve project members:', error.message)
  
      res.status(500).json({
        message: 'Unable to retrieve project members',
      })
    }
  }
  
  const removeMember = async (req, res) => {
    try {
        const project = await getOwnedProjectById(
            req.params.projectId,
            req.user.userId
          )
  
      if (!project) {
        return res.status(403).json({
          message: 'Only the project owner can remove members',
        })
      }
  
      const member = await removeProjectMember(
        req.params.projectId,
        req.params.userId
      )

      await createActivity(
        req.params.projectId,
        req.user.userId,
        'member_removed',
        `Removed a member from the project`
      )
  
      if (!member) {
        return res.status(404).json({
          message: 'Project member not found',
        })
      }
  
      res.json({
        message: 'Project member removed successfully',
      })
    } catch (error) {
      console.error('Unable to remove project member:', error.message)
  
      res.status(500).json({
        message: 'Unable to remove project member',
      })
    }
  }
  
  module.exports = {
    getProjects,
    addProject,
    getProject,
    editProject,
    removeProject,
    addMember,
    listMembers,
    removeMember,
  }