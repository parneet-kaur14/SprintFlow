const pool = require('../config/db')

const createTask = async (title, description, status, priority, dueDate, projectId) => {
  const result = await pool.query(
    `INSERT INTO tasks (title, description, status, priority, due_date, project_id)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [title, description, status, priority, dueDate, projectId]
  )

  return result.rows[0]
}

const getTasksByProject = async (projectId) => {
  const result = await pool.query(
    'SELECT * FROM tasks WHERE project_id = $1 ORDER BY created_at DESC',
    [projectId]
  )

  return result.rows
}

const updateTask = async (taskId, title, description, status, priority, dueDate) => {
    const result = await pool.query(
      `UPDATE tasks
       SET title = $1,
           description = $2,
           status = $3,
           priority = $4,
           due_date = $5,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $6
       RETURNING *`,
      [title, description, status, priority, dueDate, taskId]
    )
  
    return result.rows[0]
  }
  
  const deleteTask = async (taskId) => {
    await pool.query(
      'DELETE FROM tasks WHERE id = $1',
      [taskId]
    )
  }

  module.exports = {
    createTask,
    getTasksByProject,
    updateTask,
    deleteTask,
  }