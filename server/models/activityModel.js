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

module.exports = {
  createActivity,
  getProjectActivities,
}