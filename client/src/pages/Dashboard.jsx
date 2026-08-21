import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { API_URL } from '../api'
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
  const [recentActivity, setRecentActivity] = useState([])

  useEffect(() => {
    const token = localStorage.getItem('token')

    fetch(`${API_URL}/api/projects`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then((response) => response.json())
        .then((data) => setProjects(data))
        .catch((error) =>
          console.error('Unable to load projects:', error)
        )

        fetch(`${API_URL}/api/tasks/stats/dashboard`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => response.json())
      .then((data) => setStats(data))
      .catch((error) =>
        console.error('Unable to load dashboard stats:', error)
      )

      fetch(`${API_URL}/api/tasks/deadlines/upcoming`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => response.json())
      .then((data) => setDeadlines(data))
      .catch((error) =>
        console.error('Unable to load deadlines:', error)
      )

      fetch(`${API_URL}/api/projects`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then((response) => response.json())
        .then(async (projects) => {
          const activityResults = await Promise.all(
            projects.slice(0, 3).map((project) =>
              fetch(
                `${API_URL}/api/activities/project/${project.id}`,
                {
                  headers: {
                    Authorization: `Bearer ${token}`,
                  },
                }
              ).then((response) => response.json())
            )
          )
      
          const combined = activityResults
            .flat()
            .sort(
              (a, b) =>
                new Date(b.created_at) - new Date(a.created_at)
            )
            .slice(0, 5)
      
          setRecentActivity(combined)
        })
        .catch((error) =>
          console.error('Unable to load recent activity:', error)
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

        <div className="dashboard-scroll-list">
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
        </div>

        <div className="dashboard-section">
            <h2>Recent Projects</h2>

            <div className="dashboard-scroll-list">
            {projects.slice(0, 3).map((project) => (
                <Link
                    to={`/projects/${project.id}`}
                    key={project.id}
                    className="dashboard-project-link"
                >
                    <div className="deadline-card">
                    <div>
                        <h3>{project.name}</h3>
                        <p>{project.description}</p>
                    </div>
                    </div>
                </Link>
                ))}
            </div>
            </div>

            <div className="dashboard-section">
            <h2>Recent Activity</h2>

            <div className="dashboard-scroll-list">
                {recentActivity.length === 0 ? (
                <p>No recent activity.</p>
                ) : (
                recentActivity.map((activity) => (
                    <div className="activity-preview" key={activity.id}>
                    <div>
                        <strong>{activity.user_name}</strong>
                        <p>{activity.details}</p>
                    </div>

                    <span>
                        {new Date(activity.created_at).toLocaleString()}
                    </span>
                    </div>
                ))
                )}
            </div>
            </div>
    </div>
  )
}

export default Dashboard