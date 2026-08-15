import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import './ProjectBoard.css'

function ProjectBoard() {
  const { projectId } = useParams()
  const [tasks, setTasks] = useState([])
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState('medium')
  const [dueDate, setDueDate] = useState('')

  useEffect(() => {
    const token = localStorage.getItem('token')

    fetch(`http://localhost:5050/api/tasks/project/${projectId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => response.json())
      .then((data) => setTasks(data))
      .catch((error) => console.error('Unable to load tasks:', error))
  }, [projectId])

  const handleCreateTask = async (event) => {
    event.preventDefault()

    const token = localStorage.getItem('token')

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

    const newTask = await response.json()

    setTasks((current) => [newTask, ...current])
    setTitle('')
    setDescription('')
    setPriority('medium')
    setDueDate('')
  }

  const handleStatusChange = async (task, newStatus) => {
    const token = localStorage.getItem('token')

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

    const updatedTask = await response.json()

    setTasks((current) =>
      current.map((item) =>
        item.id === updatedTask.id ? updatedTask : item
      )
    )
  }

  const handleDeleteTask = async (taskId) => {
    const token = localStorage.getItem('token')

    const response = await fetch(`http://localhost:5050/api/tasks/${taskId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    if (response.ok) {
      setTasks((current) =>
        current.filter((task) => task.id !== taskId)
      )
    }
  }

  return (
    <div className="project-board">
      <h1>Project Board</h1>

      <form className="task-form" onSubmit={handleCreateTask}>
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

        <button type="submit">Add Task</button>
      </form>

      <div className="kanban-board">
        <div className="kanban-column">
          <h2>TODO</h2>

          {tasks
            .filter((task) => task.status === 'todo')
            .map((task) => (
              <div className="task-card" key={task.id}>
                <h3>{task.title}</h3>
                <p>{task.priority}</p>
                <p>{task.due_date}</p>

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
          <h2>IN PROGRESS</h2>

          {tasks
            .filter((task) => task.status === 'in-progress')
            .map((task) => (
              <div className="task-card" key={task.id}>
                <h3>{task.title}</h3>
                <p>{task.priority}</p>
                <p>{task.due_date}</p>

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
          <h2>DONE</h2>

          {tasks
            .filter((task) => task.status === 'done')
            .map((task) => (
              <div className="task-card" key={task.id}>
                <h3>{task.title}</h3>
                <p>{task.priority}</p>
                <p>{task.due_date}</p>

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