import { useEffect, useState } from 'react'
import './Projects.css'
import { Link, useNavigate } from 'react-router-dom'
import { API_URL } from '../api'

function Projects() {
  const [projects, setProjects] = useState([])
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()
  const [editingProject, setEditingProject] = useState(null)
  const [editName, setEditName] = useState('')
  const [editDescription, setEditDescription] = useState('')
  const [projectToDelete, setProjectToDelete] = useState(null)
  const [projectError, setProjectError] = useState('')

  useEffect(() => {
    const token = localStorage.getItem('token')

    fetch(`${API_URL}/api/projects`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    .then((response) => {
        if (response.status === 401) {
          localStorage.removeItem('token')
          localStorage.removeItem('user')
          navigate('/login')
          throw new Error('Session expired')
        }
      
        if (!response.ok) {
          throw new Error('Unable to load projects')
        }
      
        return response.json()
      })
      .then((data) => {
        setProjects(data)
        setLoading(false)
      })
      .catch((error) => {
        console.error('Unable to load projects:', error)
        setProjects([])
        setLoading(false)
      })
  }, [])

  const handleCreateProject = async (event) => {
    event.preventDefault()

    setProjectError('')

    if (name.trim().length < 3) {
    setProjectError('Project name must be at least 3 characters.')
    return
    }
  
    const token = localStorage.getItem('token')
  
    try {
        const response = await fetch(`${API_URL}/api/projects`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name, description }),
      })
  
      if (response.status === 401) {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        navigate('/login')
        return
      }
  
      if (!response.ok) {
        throw new Error('Unable to create project')
      }
  
      const newProject = await response.json()
  
      setProjects((current) => [newProject, ...current])
      setName('')
      setDescription('')
    } catch (error) {
      console.error('Unable to create project:', error)
    }
  }

  if (loading) {
    return <p>Loading projects...</p>
  }

  const handleEditProject = async (event) => {
    event.preventDefault()
    setProjectError('')

    if (editName.trim().length < 3) {
    setProjectError('Project name must be at least 3 characters.')
    return
    }
  
    const token = localStorage.getItem('token')
  
    const response = await fetch(
      `${API_URL}/api/projects/${editingProject.id}`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: editName,
          description: editDescription,
        }),
      }
    )
  
    const updatedProject = await response.json()
  
    setProjects((current) =>
        current.map((project) =>
          project.id === updatedProject.id
            ? {
                ...project,
                ...updatedProject,
              }
            : project
        )
      )
  
    setEditingProject(null)
  }

  const handleDeleteProject = async () => {
    const token = localStorage.getItem('token')
  
    try {
      const response = await fetch(
        `${API_URL}/api/projects/${projectToDelete.id}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )
  
      if (!response.ok) {
        throw new Error('Unable to delete project')
      }
  
      setProjects((current) =>
        current.filter((project) => project.id !== projectToDelete.id)
      )
  
      setProjectToDelete(null)
    } catch (error) {
      console.error('Unable to delete project:', error)
    }
  }


  return (
    <div className="projects-page">
      <h1>Projects</h1>

      {projectError && (
        <p className="form-error">{projectError}</p>
        )}

            <div className="create-project-card">
            <div className="create-project-heading">
                <div>
                <h2>Create a project</h2>
                <p>Start a new workspace for your tasks and team.</p>
                </div>
            </div>

            <form className="project-form" onSubmit={handleCreateProject}>
                <input
                type="text"
                placeholder="Project name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                required
                />

                <input
                type="text"
                placeholder="Description"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                />

                <button type="submit">Create Project</button>
            </form>
            </div>

            <div className="projects-list-header">
            <div>
                <h2>Your Projects</h2>
                <p>Open a project to manage its tasks and progress.</p>
            </div>

            {projects.length > 0 && (
                <span>
                {projects.length} {projects.length === 1 ? 'project' : 'projects'}
                </span>
            )}
            </div>

            {projects.length === 0 ? (
            <div className="projects-empty-state">
                <h3>No projects yet</h3>
                <p>Create your first project above to get started.</p>
            </div>
            ) : (
            projects.map((project) => (
        <div className="project-card" key={project.id}>
            <div className="project-card-main">
                <Link
                    to={`/projects/${project.id}`}
                    className="project-card-content"
                >
                    <h2>{project.name}</h2>
                    <p>{project.description}</p>

                    {project.user_role === 'member' && (
                    <span className="shared-badge">Shared with you</span>
                    )}
                </Link>

                <Link
                    to={`/projects/${project.id}`}
                    className="open-project-link"
                >
                    Open Board →
                </Link>
                </div>

            {project.user_role === 'owner' && (
            <div className="project-actions">
                <button
                type="button"
                onClick={() => {
                    setProjectError('')
                    setEditingProject(project)
                    setEditName(project.name)
                    setEditDescription(project.description || '')
                }}
                >
                Edit
                </button>

                <button
                type="button"
                onClick={() => setProjectToDelete(project)}
                >
                Delete
                </button>
            </div>
            )}
        </div>
        ))
    )}


        {editingProject && (
        <div className="modal-overlay">
            <div className="project-modal">
            <h2>Edit Project</h2>

            {projectError && (
            <p className="form-error">{projectError}</p>
            )}

            <form onSubmit={handleEditProject}>
                <input
                type="text"
                value={editName}
                onChange={(event) => setEditName(event.target.value)}
                placeholder="Project name"
                required
                />

                <input
                type="text"
                value={editDescription}
                onChange={(event) => setEditDescription(event.target.value)}
                placeholder="Description"
                />

                <div className="modal-actions">
                <button
                    type="button"
                    onClick={() => setEditingProject(null)}
                >
                    Cancel
                </button>

                <button type="submit">
                    Save Changes
                </button>
                </div>
            </form>
            </div>
        </div>
        )}

        {projectToDelete && (
        <div className="modal-overlay">
            <div className="project-modal">
            <h2>Delete Project</h2>

            <p>
                Are you sure you want to delete "{projectToDelete.name}"?
            </p>

            <div className="modal-actions">
                <button
                type="button"
                onClick={() => setProjectToDelete(null)}
                >
                Cancel
                </button>

                <button
                type="button"
                onClick={handleDeleteProject}
                >
                Delete Project
                </button>
            </div>
            </div>
        </div>
        )}
    </div>

    
  )
}

export default Projects