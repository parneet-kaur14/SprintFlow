import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import './Projects.css'

function Projects() {
  const [projects, setProjects] = useState([])
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')

  useEffect(() => {
    const token = localStorage.getItem('token')

    fetch('http://localhost:5050/api/projects', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => response.json())
      .then((data) => setProjects(data))
      .catch((error) => console.error('Unable to load projects:', error))
  }, [])

  const handleCreateProject = async (event) => {
    event.preventDefault()

    const token = localStorage.getItem('token')

    const response = await fetch('http://localhost:5050/api/projects', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ name, description }),
    })

    const newProject = await response.json()

    setProjects((current) => [newProject, ...current])
    setName('')
    setDescription('')
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