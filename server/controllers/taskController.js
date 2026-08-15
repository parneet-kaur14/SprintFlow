const {
    createTask,
    getTasksByProject,
    updateTask,
    deleteTask,
  } = require('../models/taskModel')
  
  const addTask = async (req, res) => {
    try {
      const { title, description, status, priority, due_date, project_id } = req.body
  
      const task = await createTask(
        title,
        description,
        status || 'todo',
        priority || 'medium',
        due_date,
        project_id
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
      const { title, description, status, priority, due_date } = req.body
  
      const task = await updateTask(
        req.params.taskId,
        title,
        description,
        status,
        priority,
        due_date
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
  
  module.exports = {
    addTask,
    getProjectTasks,
    editTask,
    removeTask,
  }