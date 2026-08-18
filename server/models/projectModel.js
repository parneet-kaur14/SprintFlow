const pool = require('../config/db')

const getProjectsByOwner = async (userId) => {
    const result = await pool.query(
      `
      SELECT DISTINCT
        projects.*,
        CASE
          WHEN projects.owner_id = $1 THEN 'owner'
          ELSE project_members.role
        END AS user_role
      FROM projects
      LEFT JOIN project_members
        ON project_members.project_id = projects.id
        AND project_members.user_id = $1
      WHERE projects.owner_id = $1
         OR project_members.user_id = $1
      ORDER BY projects.created_at DESC
      `,
      [userId]
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

const getProjectById = async (projectId, userId) => {
    const result = await pool.query(
      `SELECT DISTINCT projects.*
       FROM projects
       LEFT JOIN project_members
         ON project_members.project_id = projects.id
       WHERE projects.id = $1
         AND (
           projects.owner_id = $2
           OR project_members.user_id = $2
         )`,
      [projectId, userId]
    )
  
    return result.rows[0]
  }

  const getOwnedProjectById = async (projectId, ownerId) => {
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

  const addProjectMember = async (projectId, userId, role = 'member') => {
    const result = await pool.query(
      `INSERT INTO project_members (project_id, user_id, role)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [projectId, userId, role]
    )
  
    return result.rows[0]
  }
  
  const getProjectMembers = async (projectId) => {
    const result = await pool.query(
      `
      SELECT
        users.id,
        users.name,
        users.email,
        'owner' AS role
      FROM projects
      JOIN users
        ON users.id = projects.owner_id
      WHERE projects.id = $1
  
      UNION ALL
  
      SELECT
        users.id,
        users.name,
        users.email,
        project_members.role
      FROM project_members
      JOIN users
        ON users.id = project_members.user_id
      WHERE project_members.project_id = $1
      `,
      [projectId]
    )
  
    return result.rows
  }
  
  const removeProjectMember = async (projectId, userId) => {
    const result = await pool.query(
      `DELETE FROM project_members
       WHERE project_id = $1 AND user_id = $2
       RETURNING *`,
      [projectId, userId]
    )
  
    return result.rows[0]
  }
  
  const getUserByEmail = async (email) => {
    const result = await pool.query(
      `SELECT id, name, email
       FROM users
       WHERE email = $1`,
      [email]
    )
  
    return result.rows[0]
  }

  module.exports = {
    getProjectsByOwner,
    createProject,
    getProjectById,
    getOwnedProjectById,
    updateProject,
    deleteProject,
    addProjectMember,
    getProjectMembers,
    removeProjectMember,
    getUserByEmail,
  }