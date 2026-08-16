const {
    getProjectsByOwner,
    createProject,
    getProjectById,
  } = require('../models/projectModel')
  
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
  
  module.exports = {
    getProjects,
    addProject,
    getProject,
  }