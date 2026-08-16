const {
    createTask,
    getTasksByProject,
    updateTask,
    deleteTask,
    getDashboardStats,
    getUpcomingDeadlines,
  } = require('../models/taskModel')
  
  const addTask = async (req, res) => {
    try {
        const {
            title,
            description,
            status,
            priority,
            due_date,
            project_id,
            type,
            steps_to_reproduce,
            expected_result,
            actual_result,
            environment,
          } = req.body
  
          const task = await createTask(
            title,
            description,
            status || 'todo',
            priority || 'medium',
            due_date,
            project_id,
            type || 'task',
            steps_to_reproduce || null,
            expected_result || null,
            actual_result || null,
            environment || null
          )
  
      res.status(201).json(task)
    } catch (error) {
      res.status(500).json({ message: 'Unable to create task' })
    }
  }
  
  const getProjectTasks = async (req, res) => {
    try {
      const tasks = await getTasksByProject(req.params.projectId)
      res.json(tasks)
    } catch (error) {
      res.status(500).json({ message: 'Unable to get tasks' })
    }
  }

  const editTask = async (req, res) => {
    try {
        const {
            title,
            description,
            status,
            priority,
            due_date,
            type,
            steps_to_reproduce,
            expected_result,
            actual_result,
            environment,
          } = req.body
  
          const task = await updateTask(
            req.params.taskId,
            title,
            description,
            status,
            priority,
            due_date,
            type || 'task',
            steps_to_reproduce || null,
            expected_result || null,
            actual_result || null,
            environment || null
          )
  
      res.json(task)
    } catch (error) {
      res.status(500).json({ message: 'Unable to update task' })
    }
  }
  
  const removeTask = async (req, res) => {
    try {
      await deleteTask(req.params.taskId)
  
      res.json({ message: 'Task deleted successfully' })
    } catch (error) {
      res.status(500).json({ message: 'Unable to delete task' })
    }
  }

  const getStats = async (req, res) => {
    try {
      const stats = await getDashboardStats(req.user.userId)
  
      res.json(stats)
    } catch (error) {
      console.error('Unable to retrieve dashboard stats:', error.message)
  
      res.status(500).json({
        message: 'Unable to retrieve dashboard stats',
      })
    }
  }

  const getDeadlines = async (req, res) => {
    try {
      const deadlines = await getUpcomingDeadlines(req.user.userId)
      res.json(deadlines)
    } catch (error) {
      console.error('Unable to retrieve upcoming deadlines:', error.message)
  
      res.status(500).json({
        message: 'Unable to retrieve upcoming deadlines',
      })
    }
  }
  
  module.exports = {
    addTask,
    getProjectTasks,
    editTask,
    removeTask,
    getStats,
    getDeadlines,
  }