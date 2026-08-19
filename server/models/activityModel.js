const pool = require('../config/db')

const createActivity = async (projectId, userId, action, details) => {
  const result = await pool.query(
    `
    INSERT INTO activities (
      project_id,
      user_id,
      action,
      details
    )
    VALUES ($1, $2, $3, $4)
    RETURNING *
    `,
    [projectId, userId, action, details]
  )

  return result.rows[0]
}

const getProjectActivities = async (projectId) => {
  const result = await pool.query(
    `
    SELECT
      activities.id,
      activities.action,
      activities.details,
      activities.created_at,
      users.name AS user_name
    FROM activities
    JOIN users
      ON users.id = activities.user_id
    WHERE activities.project_id = $1
    ORDER BY activities.created_at DESC
    LIMIT 20
    `,
    [projectId]
  )

  return result.rows
}

const getWeeklyProductivity = async (userId) => {
    const result = await pool.query(
      `
      SELECT
        TO_CHAR(activities.created_at, 'Dy') AS day,
        DATE(activities.created_at) AS activity_date,
        COUNT(*) AS completed_tasks
  
      FROM activities
  
      JOIN projects
        ON activities.project_id = projects.id
  
      WHERE activities.action = 'task_completed'
        AND activities.created_at >= DATE_TRUNC('week', CURRENT_DATE)
        AND (
          projects.owner_id = $1
          OR EXISTS (
            SELECT 1
            FROM project_members
            WHERE project_members.project_id = projects.id
              AND project_members.user_id = $1
          )
        )
  
      GROUP BY
        DATE(activities.created_at),
        TO_CHAR(activities.created_at, 'Dy')
  
      ORDER BY DATE(activities.created_at)
      `,
      [userId]
    )
  
    return result.rows
  }

module.exports = {
  createActivity,
  getProjectActivities,
  getWeeklyProductivity,
}