const {
    createTask,
    getTasksByProject,
    updateTask,
    deleteTask,
    getDashboardStats,
    getUpcomingDeadlines,
    getTaskById,
  } = require('../models/taskModel')
  
  const { getProjectById } = require('../models/projectModel')
  const { createActivity } = require('../models/activityModel')
  
  
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
  
      // Make sure user owns the project or is a project member
      const project = await getProjectById(
        project_id,
        req.user.userId
      )
  
      if (!project) {
        return res.status(403).json({
          message: 'You do not have access to this project',
        })
      }
  
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

      await createActivity(
        project_id,
        req.user.userId,
        'task_created',
        `Created task "${task.title}"`
      )
  
      res.status(201).json(task)
    } catch (error) {
      console.error('Unable to create task:', error.message)
  
      res.status(500).json({
        message: 'Unable to create task',
      })
    }
  }
  
  
  const getProjectTasks = async (req, res) => {
    try {
      // Make sure user owns the project or is a project member
      const project = await getProjectById(
        req.params.projectId,
        req.user.userId
      )
  
      if (!project) {
        return res.status(403).json({
          message: 'You do not have access to this project',
        })
      }
  
      const tasks = await getTasksByProject(req.params.projectId)
  
      res.json(tasks)
    } catch (error) {
      console.error('Unable to get tasks:', error.message)
  
      res.status(500).json({
        message: 'Unable to get tasks',
      })
    }
  }
  
  
  const editTask = async (req, res) => {
    try {
      const existingTask = await getTaskById(req.params.taskId)
  
      if (!existingTask) {
        return res.status(404).json({
          message: 'Task not found',
        })
      }
  
      // Check access to the project that owns this task
      const project = await getProjectById(
        existingTask.project_id,
        req.user.userId
      )
  
      if (!project) {
        return res.status(403).json({
          message: 'You do not have access to this project',
        })
      }
  
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

      if (existingTask.status !== task.status) {
        const action =
          task.status === 'done'
            ? 'task_completed'
            : 'task_moved'
      
            const statusLabels = {
                todo: 'Todo',
                'in-progress': 'In Progress',
                done: 'Done',
              }
              
              const details =
                task.status === 'done'
                  ? `Completed task "${task.title}"`
                  : `Moved "${task.title}" to ${statusLabels[task.status]}`
      
        await createActivity(
          task.project_id,
          req.user.userId,
          action,
          details
        )
      }

      if (
        existingTask.title !== task.title ||
        existingTask.description !== task.description ||
        existingTask.priority !== task.priority ||
        String(existingTask.due_date) !== String(task.due_date)
      ) {
        await createActivity(
          task.project_id,
          req.user.userId,
          'task_updated',
          `Updated task "${task.title}"`
        )
      }
  
      res.json(task)
    } catch (error) {
      console.error('Unable to update task:', error.message)
  
      res.status(500).json({
        message: 'Unable to update task',
      })
    }
  }
  
  
  const removeTask = async (req, res) => {
    try {
      const existingTask = await getTaskById(req.params.taskId)
  
      if (!existingTask) {
        return res.status(404).json({
          message: 'Task not found',
        })
      }
  
      // Check access to the project that owns this task
      const project = await getProjectById(
        existingTask.project_id,
        req.user.userId
      )
  
      if (!project) {
        return res.status(403).json({
          message: 'You do not have access to this project',
        })
      }
  
      await deleteTask(req.params.taskId)

      await createActivity(
        existingTask.project_id,
        req.user.userId,
        'task_deleted',
        `Deleted task "${existingTask.title}"`
      )
  
      res.json({
        message: 'Task deleted successfully',
      })
    } catch (error) {
      console.error('Unable to delete task:', error.message)
  
      res.status(500).json({
        message: 'Unable to delete task',
      })
    }
  }
  
  
  const getStats = async (req, res) => {
    try {
      const stats = await getDashboardStats(req.user.userId)
  
      res.json(stats)
    } catch (error) {
      console.error(
        'Unable to retrieve dashboard stats:',
        error.message
      )
  
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
      console.error(
        'Unable to retrieve upcoming deadlines:',
        error.message
      )
  
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