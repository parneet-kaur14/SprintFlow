const {
    getProjectActivities,
  } = require('../models/activityModel')
  
  const { getProjectById } = require('../models/projectModel')
  
  const getActivities = async (req, res) => {
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
  
      const activities = await getProjectActivities(
        req.params.projectId
      )
  
      res.json(activities)
    } catch (error) {
      console.error('Unable to retrieve activities:', error.message)
  
      res.status(500).json({
        message: 'Unable to retrieve activities',
      })
    }
  }
  
  module.exports = {
    getActivities,
  }