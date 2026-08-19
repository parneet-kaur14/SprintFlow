import { useEffect, useState } from 'react'
import './Analytics.css'

function Analytics() {
  const [stats, setStats] = useState({
    total_projects: 0,
    open_tasks: 0,
    completed_tasks: 0,
    high_priority_tasks: 0,
  })

  const [priorityData, setPriorityData] = useState([])
  const [projectProgress, setProjectProgress] = useState([])
  const [weeklyProductivity, setWeeklyProductivity] = useState([])

  useEffect(() => {
    const token = localStorage.getItem('token')

    fetch('http://localhost:5050/api/tasks/stats/dashboard', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => response.json())
      .then((data) => setStats(data))
      .catch((error) =>
        console.error('Unable to load analytics:', error)
      )

      fetch('http://localhost:5050/api/tasks/stats/priority', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then((response) => response.json())
        .then((data) => setPriorityData(data))
        .catch((error) =>
          console.error('Unable to load priority analytics:', error)
        )

        fetch('http://localhost:5050/api/tasks/stats/projects', {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          })
            .then((response) => response.json())
            .then((data) => setProjectProgress(data))
            .catch((error) =>
              console.error('Unable to load project progress:', error)
            )

            fetch('http://localhost:5050/api/activities/stats/weekly', {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              })
                .then((response) => response.json())
                .then((data) => setWeeklyProductivity(data))
                .catch((error) =>
                  console.error('Unable to load weekly productivity:', error)
                )
  }, [])

  

  const totalTasks =
    Number(stats.open_tasks) + Number(stats.completed_tasks)

  const completionRate =
    totalTasks === 0
      ? 0
      : Math.round(
          (Number(stats.completed_tasks) / totalTasks) * 100
        )

  return (
    <div className="analytics-page">
      <div className="analytics-header">
        <p className="analytics-label">ANALYTICS</p>
        <h1>Productivity Overview</h1>
        <p>
          Track progress across your projects and tasks.
        </p>
      </div>

      <div className="analytics-summary">
        <div className="analytics-card">
          <span>Completion Rate</span>
          <strong>{completionRate}%</strong>

          <div className="analytics-progress">
            <div
              className="analytics-progress-fill"
              style={{ width: `${completionRate}%` }}
            />
          </div>
        </div>

        <div className="analytics-card">
          <span>Tasks Completed</span>
          <strong>{stats.completed_tasks}</strong>
        </div>

        <div className="analytics-card">
          <span>Open Tasks</span>
          <strong>{stats.open_tasks}</strong>
        </div>

        <div className="analytics-card">
          <span>Projects</span>
          <strong>{stats.total_projects}</strong>
        </div>
      </div>

      <div className="analytics-section">
        <h2>Priority Distribution</h2>

        <div className="priority-chart">
            {['high', 'medium', 'low'].map((priority) => {
            const item = priorityData.find(
                (entry) => entry.priority === priority
            )

            const count = Number(item?.count || 0)

            return (
                <div className="priority-row" key={priority}>
                <span className="priority-label">
                    {priority.charAt(0).toUpperCase() + priority.slice(1)}
                </span>

                <div className="priority-bar-track">
                    <div
                    className={`priority-bar priority-bar-${priority}`}
                    style={{ width: `${Math.min(count * 12, 100)}%` }}
                    />
                </div>

                <strong>{count}</strong>
                </div>
            )
            })}
        </div>
        </div>

        <div className="analytics-section">
            <h2>Project Progress</h2>

            <div className="project-progress-list">
                {projectProgress.map((project) => {
                const total = Number(project.total_tasks)
                const completed = Number(project.completed_tasks)

                const percentage =
                    total === 0
                    ? 0
                    : Math.round((completed / total) * 100)

                return (
                    <div className="project-progress-item" key={project.id}>
                    <div className="project-progress-header">
                        <strong>{project.name}</strong>
                        <span>{percentage}%</span>
                    </div>

                    <div className="project-progress-track">
                        <div
                        className="project-progress-fill"
                        style={{ width: `${percentage}%` }}
                        />
                    </div>

                    <p>
                        {completed} of {total} tasks completed
                    </p>
                    </div>
                )
                })}
            </div>
            </div>

            <div className="analytics-section">
            <h2>Tasks Completed This Week</h2>
            <p className="analytics-section-description">
                Completed tasks recorded across your projects this week.
                </p>

                <div className="weekly-productivity">
                    {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => {
                    const item = weeklyProductivity.find(
                        (entry) => entry.day.trim() === day
                    )

                    const count = Number(item?.completed_tasks || 0)

                    return (
                        <div className="weekly-row" key={day}>
                        <span>{day}</span>

                        <div className="weekly-bar-track">
                            <div
                            className="weekly-bar"
                            style={{ width: `${Math.min(count * 18, 100)}%` }}
                            />
                        </div>

                        <strong>{count}</strong>
                        </div>
                    )
                    })}
                </div>
                </div>
    </div>
  )
}

export default Analytics