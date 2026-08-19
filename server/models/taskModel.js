const pool = require('../config/db')

const createTask = async (
    title,
    description,
    status,
    priority,
    dueDate,
    projectId,
    type,
    stepsToReproduce,
    expectedResult,
    actualResult,
    environment
  ) => {
    const result = await pool.query(
        `INSERT INTO tasks (
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
          environment
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        RETURNING *`,
        [
          title,
          description,
          status,
          priority,
          dueDate,
          projectId,
          type,
          stepsToReproduce,
          expectedResult,
          actualResult,
          environment
        ]
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

const updateTask = async (
    taskId,
    title,
    description,
    status,
    priority,
    dueDate,
    type,
    stepsToReproduce,
    expectedResult,
    actualResult,
    environment
  ) => {
    const result = await pool.query(
        `UPDATE tasks
         SET title = $1,
             description = $2,
             status = $3,
             priority = $4,
             due_date = $5,
             type = $6,
             steps_to_reproduce = $7,
             expected_result = $8,
             actual_result = $9,
             environment = $10,
             updated_at = CURRENT_TIMESTAMP
         WHERE id = $11
         RETURNING *`,
        [
          title,
          description,
          status,
          priority,
          dueDate,
          type,
          stepsToReproduce,
          expectedResult,
          actualResult,
          environment,
          taskId
        ]
      )
  
    return result.rows[0]
  }
  
  const deleteTask = async (taskId) => {
    await pool.query(
      'DELETE FROM tasks WHERE id = $1',
      [taskId]
    )
  }

  const getDashboardStats = async (ownerId) => {
    const result = await pool.query(
      `
      SELECT
        COUNT(DISTINCT projects.id) AS total_projects,
  
        COUNT(tasks.id) FILTER (
          WHERE tasks.status != 'done'
        ) AS open_tasks,
  
        COUNT(tasks.id) FILTER (
          WHERE tasks.status = 'done'
        ) AS completed_tasks,
  
        COUNT(tasks.id) FILTER (
          WHERE tasks.priority = 'high'
          AND tasks.status != 'done'
        ) AS high_priority_tasks
  
      FROM projects
      LEFT JOIN tasks
        ON tasks.project_id = projects.id
  
      WHERE projects.owner_id = $1
        OR EXISTS (
            SELECT 1
            FROM project_members
            WHERE project_members.project_id = projects.id
            AND project_members.user_id = $1
        )
      `,
      [ownerId]
    )
  
    return result.rows[0]
  }

  const getUpcomingDeadlines = async (ownerId) => {
    const result = await pool.query(
      `
      SELECT
        tasks.id,
        tasks.title,
        tasks.due_date,
        tasks.priority,
        projects.name AS project_name
      FROM tasks
      JOIN projects
        ON tasks.project_id = projects.id
      WHERE (
        projects.owner_id = $1
        OR EXISTS (
            SELECT 1
            FROM project_members
            WHERE project_members.project_id = projects.id
            AND project_members.user_id = $1
        )
        )

        AND tasks.due_date IS NOT NULL
        AND tasks.status != 'done'
        AND tasks.due_date >= CURRENT_DATE
      ORDER BY tasks.due_date ASC
      LIMIT 5
      `,
      [ownerId]
    )
  
    return result.rows
  }

  const getTaskById = async (taskId) => {
    const result = await pool.query(
      `SELECT *
       FROM tasks
       WHERE id = $1`,
      [taskId]
    )
  
    return result.rows[0]
  }

  const getPriorityDistribution = async (userId) => {
    const result = await pool.query(
      `
      SELECT
        tasks.priority,
        COUNT(tasks.id) AS count
      FROM tasks
      JOIN projects
        ON tasks.project_id = projects.id
      WHERE (
        projects.owner_id = $1
        OR EXISTS (
          SELECT 1
          FROM project_members
          WHERE project_members.project_id = projects.id
            AND project_members.user_id = $1
        )
      )
      GROUP BY tasks.priority
      `,
      [userId]
    )
  
    return result.rows
  }

  const getProjectProgress = async (userId) => {
    const result = await pool.query(
      `
      SELECT
        projects.id,
        projects.name,
  
        COUNT(tasks.id) AS total_tasks,
  
        COUNT(tasks.id) FILTER (
          WHERE tasks.status = 'done'
        ) AS completed_tasks
  
      FROM projects
  
      LEFT JOIN tasks
        ON tasks.project_id = projects.id
  
      WHERE (
        projects.owner_id = $1
        OR EXISTS (
          SELECT 1
          FROM project_members
          WHERE project_members.project_id = projects.id
            AND project_members.user_id = $1
        )
      )
  
      GROUP BY projects.id, projects.name
      ORDER BY projects.name
      `,
      [userId]
    )
  
    return result.rows
  }


  module.exports = {
    createTask,
    getTasksByProject,
    updateTask,
    deleteTask,
    getDashboardStats,
    getUpcomingDeadlines,
    getTaskById,
    getPriorityDistribution,
    getProjectProgress,
  }