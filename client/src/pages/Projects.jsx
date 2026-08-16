import { useEffect, useState } from 'react'
import './Projects.css'
import { Link, useNavigate } from 'react-router-dom'

function Projects() {
  const [projects, setProjects] = useState([])
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    const token = localStorage.getItem('token')

    fetch('http://localhost:5050/api/projects', {
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
  
    const token = localStorage.getItem('token')
  
    try {
      const response = await fetch('http://localhost:5050/api/projects', {
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

  return (
    <div className="projects-page">
      <h1>Projects</h1>

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

      {projects.length === 0 && (
        <p>No projects yet. Create your first project.</p>
      )}

      {projects.map((project) => (
        <Link to={`/projects/${project.id}`} key={project.id}>
          <div className="project-card">
            <h2>{project.name}</h2>
            <p>{project.description}</p>
          </div>
        </Link>
      ))}
    </div>
  )
}

export default Projects