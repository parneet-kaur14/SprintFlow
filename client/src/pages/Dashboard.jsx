import { useEffect, useState } from 'react'
import './Dashboard.css'

function Dashboard() {
  const [stats, setStats] = useState({
    total_projects: 0,
    open_tasks: 0,
    completed_tasks: 0,
    high_priority_tasks: 0,
  })

  const [deadlines, setDeadlines] = useState([])
  const [projects, setProjects] = useState([])

  useEffect(() => {
    const token = localStorage.getItem('token')

    fetch('http://localhost:5050/api/projects', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then((response) => response.json())
        .then((data) => setProjects(data))
        .catch((error) =>
          console.error('Unable to load projects:', error)
        )

    fetch('http://localhost:5050/api/tasks/stats/dashboard', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => response.json())
      .then((data) => setStats(data))
      .catch((error) =>
        console.error('Unable to load dashboard stats:', error)
      )

    fetch('http://localhost:5050/api/tasks/deadlines/upcoming', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => response.json())
      .then((data) => setDeadlines(data))
      .catch((error) =>
        console.error('Unable to load deadlines:', error)
      )
  }, [])

  return (
    <div className="dashboard-page">
      <div className="dashboard-cards">
        <div className="summary-card">
          <p>Total Projects</p>
          <h2>{stats.total_projects}</h2>
        </div>

        <div className="summary-card">
          <p>Open Tasks</p>
          <h2>{stats.open_tasks}</h2>
        </div>

        <div className="summary-card">
          <p>Completed Tasks</p>
          <h2>{stats.completed_tasks}</h2>
        </div>

        <div className="summary-card">
          <p>High Priority</p>
          <h2>{stats.high_priority_tasks}</h2>
        </div>
      </div>

      <div className="dashboard-section">
        <h2>Upcoming Deadlines</h2>

        {deadlines.length === 0 ? (
          <p>No upcoming deadlines.</p>
        ) : (
          deadlines.map((task) => (
            <div className="deadline-card" key={task.id}>
              <div>
                <h3>{task.title}</h3>
                <p>{task.project_name}</p>
              </div>

              <span>{task.due_date?.slice(0, 10)}</span>
            </div>
          ))
        )}
      </div>

      <div className="dashboard-section">
        <h2>Recent Projects</h2>

        {projects.slice(0, 3).map((project) => (
            <div className="deadline-card" key={project.id}>
            <div>
                <h3>{project.name}</h3>
                <p>{project.description}</p>
            </div>
            </div>
        ))}
        </div>
    </div>
  )
}

export default Dashboard