const pool = require('../config/db')

const getProjectsByOwner = async (ownerId) => {
  const result = await pool.query(
    `SELECT *
     FROM projects
     WHERE owner_id = $1
     ORDER BY created_at DESC`,
    [ownerId]
  )

  return result.rows
}

const createProject = async (name, description, ownerId) => {
  const result = await pool.query(
    `INSERT INTO projects (name, description, owner_id)
     VALUES ($1, $2, $3)
     RETURNING *`,
    [name, description, ownerId]
  )

  return result.rows[0]
}

const getProjectById = async (projectId, ownerId) => {
    const result = await pool.query(
      `SELECT *
       FROM projects
       WHERE id = $1 AND owner_id = $2`,
      [projectId, ownerId]
    )
  
    return result.rows[0]
  }

  const updateProject = async (projectId, name, description, ownerId) => {
    const result = await pool.query(
      `UPDATE projects
       SET name = $1,
           description = $2
       WHERE id = $3 AND owner_id = $4
       RETURNING *`,
      [name, description, projectId, ownerId]
    )
  
    return result.rows[0]
  }

  const deleteProject = async (projectId, ownerId) => {
    const result = await pool.query(
      `DELETE FROM projects
       WHERE id = $1 AND owner_id = $2
       RETURNING *`,
      [projectId, ownerId]
    )
  
    return result.rows[0]
  }

  module.exports = {
    getProjectsByOwner,
    createProject,
    getProjectById,
    updateProject,
    deleteProject,
  }