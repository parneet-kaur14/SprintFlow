import { useEffect, useState } from 'react'
import './ProjectBoard.css'
import { useNavigate, useParams } from 'react-router-dom'

function ProjectBoard() {
  const { projectId } = useParams()
  const [tasks, setTasks] = useState([])
  const [project, setProject] = useState(null)
  const [loading, setLoading] = useState(true)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState('medium')
  const [dueDate, setDueDate] = useState('')
  const navigate = useNavigate()
  const [showTaskForm, setShowTaskForm] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem('token')
    fetch(`http://localhost:5050/api/projects/${projectId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then((response) => response.json())
        .then((data) => setProject(data))
        .catch((error) => console.error('Unable to load project:', error))

    fetch(`http://localhost:5050/api/tasks/project/${projectId}`, {
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
      
        return response.json()
      })
      .then((data) => {
        setTasks(data)
        setLoading(false)
      })
      .catch((error) => {
        console.error('Unable to load tasks:', error)
        setTasks([])
        setLoading(false)
      })
  }, [projectId])

  const handleCreateTask = async (event) => {
    event.preventDefault()
  
    const token = localStorage.getItem('token')
  
    try {
      const response = await fetch('http://localhost:5050/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title,
          description,
          status: 'todo',
          priority,
          due_date: dueDate,
          project_id: projectId,
        }),
      })
  
      if (response.status === 401) {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        navigate('/login')
        return
      }
  
      if (!response.ok) {
        throw new Error('Unable to create task')
      }
  
      const newTask = await response.json()
  
      setTasks((current) => [newTask, ...current])
      setTitle('')
      setDescription('')
      setPriority('medium')
      setDueDate('')
      setShowTaskForm(false)
    } catch (error) {
      console.error('Unable to create task:', error)
    }
  }

  const handleStatusChange = async (task, newStatus) => {
    const token = localStorage.getItem('token')
  
    try {
      const response = await fetch(`http://localhost:5050/api/tasks/${task.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: task.title,
          description: task.description,
          status: newStatus,
          priority: task.priority,
          due_date: task.due_date,
        }),
      })
  
      if (response.status === 401) {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        navigate('/login')
        return
      }
  
      if (!response.ok) {
        throw new Error('Unable to update task')
      }
  
      const updatedTask = await response.json()
  
      setTasks((current) =>
        current.map((item) =>
          item.id === updatedTask.id ? updatedTask : item
        )
      )
    } catch (error) {
      console.error('Unable to update task:', error)
    }
  }

  const handleDeleteTask = async (taskId) => {
    const token = localStorage.getItem('token')
  
    try {
      const response = await fetch(`http://localhost:5050/api/tasks/${taskId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
  
      if (response.status === 401) {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        navigate('/login')
        return
      }
  
      if (!response.ok) {
        throw new Error('Unable to delete task')
      }
  
      setTasks((current) =>
        current.filter((task) => task.id !== taskId)
      )
    } catch (error) {
      console.error('Unable to delete task:', error)
    }
  }

  if (loading) {
    return <p>Loading tasks...</p>
  }

  return (
    <div className="project-board">
      <div className="board-header">
        <div>
            <p className="board-label">PROJECT BOARD</p>
            <h1>{project?.name || 'Project Board'}</h1>
            <p>{project?.description}</p>
        </div>
      </div>

      <button
        className="open-task-modal"
        onClick={() => setShowTaskForm(true)}
        >
        + Add Task
        </button>

        {showTaskForm && (
        <div className="modal-overlay">
            <div className="task-modal">
            <h2>Add Task</h2>

            <form onSubmit={handleCreateTask}>
                <input
                type="text"
                placeholder="Task title"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                required
                />

                <input
                type="text"
                placeholder="Description"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                />

                <select
                value={priority}
                onChange={(event) => setPriority(event.target.value)}
                >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                </select>

                <input
                type="date"
                value={dueDate}
                onChange={(event) => setDueDate(event.target.value)}
                />

                <div className="modal-actions">
                <button
                    type="button"
                    onClick={() => setShowTaskForm(false)}
                >
                    Cancel
                </button>

                <button type="submit">
                    Add Task
                </button>
                </div>
            </form>
            </div>
        </div>
        )}

      {tasks.length === 0 && (
        <p>No tasks yet. Add your first task.</p>
      )}

      <div className="kanban-board">
        <div className="kanban-column">
        <div className="column-header">
        <h2>TODO</h2>
        <span>
        {tasks.filter((task) => task.status === 'todo').length}
        </span>
        </div>

          {tasks
            .filter((task) => task.status === 'todo')
            .map((task) => (
              <div className="task-card" key={task.id}>
                <h3>{task.title}</h3>
                <p className={`priority-badge priority-${task.priority}`}>
                {task.priority}
                </p>

                <p className="task-date">
                Due: {task.due_date?.slice(0, 10)}
                </p>

                <select
                  value={task.status}
                  onChange={(event) =>
                    handleStatusChange(task, event.target.value)
                  }
                >
                  <option value="todo">Todo</option>
                  <option value="in-progress">In Progress</option>
                  <option value="done">Done</option>
                </select>

                <button onClick={() => handleDeleteTask(task.id)}>
                  Delete
                </button>
              </div>
            ))}
        </div>

        <div className="kanban-column">
        <div className="column-header">
        <h2>IN PROGRESS</h2>
        <span>
        {tasks.filter((task) => task.status === 'in-progress').length}
        </span>
        </div>

          {tasks
            .filter((task) => task.status === 'in-progress')
            .map((task) => (
              <div className="task-card" key={task.id}>
                <h3>{task.title}</h3>
                <p className={`priority-badge priority-${task.priority}`}>
                {task.priority}
                </p>

                <p className="task-date">
                Due: {task.due_date?.slice(0, 10)}
                </p>

                <select
                  value={task.status}
                  onChange={(event) =>
                    handleStatusChange(task, event.target.value)
                  }
                >
                  <option value="todo">Todo</option>
                  <option value="in-progress">In Progress</option>
                  <option value="done">Done</option>
                </select>

                <button onClick={() => handleDeleteTask(task.id)}>
                  Delete
                </button>
              </div>
            ))}
        </div>

        <div className="kanban-column">
        <div className="column-header">
        <h2>DONE</h2>
        <span>
        {tasks.filter((task) => task.status === 'done').length}
        </span>
        </div>

          {tasks
            .filter((task) => task.status === 'done')
            .map((task) => (
              <div className="task-card" key={task.id}>
                <h3>{task.title}</h3>
                <p className={`priority-badge priority-${task.priority}`}>
                {task.priority}
                </p>

                <p className="task-date">
                Due: {task.due_date?.slice(0, 10)}
                </p>

                <select
                  value={task.status}
                  onChange={(event) =>
                    handleStatusChange(task, event.target.value)
                  }
                >
                  <option value="todo">Todo</option>
                  <option value="in-progress">In Progress</option>
                  <option value="done">Done</option>
                </select>

                <button onClick={() => handleDeleteTask(task.id)}>
                  Delete
                </button>
              </div>
            ))}
        </div>
      </div>
    </div>
  )
}

export default ProjectBoard