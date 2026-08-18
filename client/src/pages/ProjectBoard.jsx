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
  const [editingTask, setEditingTask] = useState(null)
  const [editTaskTitle, setEditTaskTitle] = useState('')
  const [editTaskDescription, setEditTaskDescription] = useState('')
  const [editTaskPriority, setEditTaskPriority] = useState('medium')
  const [editTaskDueDate, setEditTaskDueDate] = useState('')
  const [editTaskType, setEditTaskType] = useState('task')
  const [editStepsToReproduce, setEditStepsToReproduce] = useState('')
  const [editExpectedResult, setEditExpectedResult] = useState('')
  const [editActualResult, setEditActualResult] = useState('')
  const [editEnvironment, setEditEnvironment] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [priorityFilter, setPriorityFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [formError, setFormError] = useState('')
  const [type, setType] = useState('task')
  const [stepsToReproduce, setStepsToReproduce] = useState('')
  const [expectedResult, setExpectedResult] = useState('')
  const [actualResult, setActualResult] = useState('')
  const [environment, setEnvironment] = useState('')
  const [members, setMembers] = useState([])
  const [memberEmail, setMemberEmail] = useState('')
  const [showMembers, setShowMembers] = useState(false)
  const [memberError, setMemberError] = useState('')
  const [activities, setActivities] = useState([])
  const [showActivity, setShowActivity] = useState(false)

  const loadActivities = () => {
    const token = localStorage.getItem('token')
  
    fetch(`http://localhost:5050/api/activities/project/${projectId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => response.json())
      .then((data) => setActivities(data))
      .catch((error) => {
        console.error('Unable to load activities:', error)
      })
  }
  
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

      fetch(`http://localhost:5050/api/projects/${projectId}/members`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then((response) => response.json())
        .then((data) => {
          setMembers(data)
        })
        .catch((error) => {
          console.error('Unable to load project members:', error)
        })

        loadActivities()

  }, [projectId])

  const handleCreateTask = async (event) => {
    event.preventDefault()

    setFormError('')

    if (title.trim().length < 3) {
    setFormError('Task title must be at least 3 characters.')
    return
    }

    if (!dueDate) {
    setFormError('Please select a due date.')
    return
    }
  
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
            type,
            steps_to_reproduce: type === 'bug' ? stepsToReproduce : null,
            expected_result: type === 'bug' ? expectedResult : null,
            actual_result: type === 'bug' ? actualResult : null,
            environment: type === 'bug' ? environment : null,
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
      loadActivities()
        setTitle('')
        setDescription('')
        setPriority('medium')
        setDueDate('')
        setType('task')
        setStepsToReproduce('')
        setExpectedResult('')
        setActualResult('')
        setEnvironment('')
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
            type: task.type || 'task',
            steps_to_reproduce: task.steps_to_reproduce || null,
            expected_result: task.expected_result || null,
            actual_result: task.actual_result || null,
            environment: task.environment || null,
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
      loadActivities()
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
      loadActivities()
    } catch (error) {
      console.error('Unable to delete task:', error)
    }
  }

  const handleEditTask = async (event) => {
    event.preventDefault()

    setFormError('')

    if (editTaskTitle.trim().length < 3) {
    setFormError('Task title must be at least 3 characters.')
    return
    }

    if (!editTaskDueDate) {
    setFormError('Please select a due date.')
    return
    }
  
    const token = localStorage.getItem('token')
  
    try {
      const response = await fetch(
        `http://localhost:5050/api/tasks/${editingTask.id}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            title: editTaskTitle,
            description: editTaskDescription,
            status: editingTask.status,
            priority: editTaskPriority,
            due_date: editTaskDueDate,
            type: editTaskType,
            steps_to_reproduce:
              editTaskType === 'bug' ? editStepsToReproduce : null,
            expected_result:
              editTaskType === 'bug' ? editExpectedResult : null,
            actual_result:
              editTaskType === 'bug' ? editActualResult : null,
            environment:
              editTaskType === 'bug' ? editEnvironment : null,
          }),
        }
      )
  
      if (!response.ok) {
        throw new Error('Unable to update task')
      }
  
      const updatedTask = await response.json()
  
      setTasks((current) =>
        current.map((task) =>
          task.id === updatedTask.id ? updatedTask : task
        )
      )
      loadActivities()
  
      setEditingTask(null)
    } catch (error) {
      console.error('Unable to update task:', error)
    }
  }

  const handleAddMember = async (event) => {
    event.preventDefault()
  
    setMemberError('')
  
    if (!memberEmail.trim()) {
      setMemberError('Please enter an email.')
      return
    }
  
    const token = localStorage.getItem('token')
  
    try {
      const response = await fetch(
        `http://localhost:5050/api/projects/${projectId}/members`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            email: memberEmail,
          }),
        }
      )
  
      const data = await response.json()
  
      if (!response.ok) {
        setMemberError(data.message || 'Unable to add member')
        return
      }
  
      setMembers((current) => [...current, data])
      loadActivities()
      setMemberEmail('')
    } catch (error) {
      setMemberError('Unable to add member')
    }
  }

  const handleRemoveMember = async (userId) => {
    const token = localStorage.getItem('token')
  
    try {
      const response = await fetch(
        `http://localhost:5050/api/projects/${projectId}/members/${userId}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )
  
      if (!response.ok) {
        throw new Error('Unable to remove member')
      }
  
      setMembers((current) =>
        current.filter((member) => member.id !== userId)
      )
      loadActivities()
    } catch (error) {
      setMemberError('Unable to remove member')
    }
  }

  const currentUser = JSON.parse(localStorage.getItem('user'))

    const isOwner = members.some(
    (member) =>
        member.id === currentUser?.id &&
        member.role === 'owner'
    )

  if (loading) {
    return <p>Loading tasks...</p>
  }

  const completedTasks = tasks.filter((task) => task.status === 'done').length
    const totalTasks = tasks.length

    const progress =
    totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100)

  return (
    <div className="project-board">
      <div className="board-header">
        <div>
            <p className="board-label">PROJECT BOARD</p>
            <h1>{project?.name || 'Project Board'}</h1>
            <p>{project?.description}</p>
            <div className="project-progress">
            <div className="progress-info">
                <span>Progress</span>
                <span>{progress}%</span>
            </div>

            <div className="progress-bar">
                <div
                className="progress-fill"
                style={{ width: `${progress}%` }}
                />
            </div>
            </div>
        </div>
      </div>

      <button
        className="open-task-modal"
        onClick={() => {
            setFormError('')
            setShowTaskForm(true)
          }}
        >
        + Add Task
        </button>

        <button
        className="members-button"
        onClick={() => {
            setMemberError('')
            setShowMembers(true)
        }}
        >
        Members ({members.length})
        </button>

        <button
        className="members-button"
        onClick={() => setShowActivity(true)}
        >
        Activity
        </button>

        <input
        className="task-search"
        type="text"
        placeholder="Search tasks..."
        value={searchTerm}
        onChange={(event) => setSearchTerm(event.target.value)}
        />

        <select
        className="task-filter"
        value={priorityFilter}
        onChange={(event) => setPriorityFilter(event.target.value)}
        >
        <option value="all">All Priorities</option>
        <option value="low">Low</option>
        <option value="medium">Medium</option>
        <option value="high">High</option>
        </select>

        <select
        className="task-filter"
        value={statusFilter}
        onChange={(event) => setStatusFilter(event.target.value)}
        >
        <option value="all">All Statuses</option>
        <option value="todo">Todo</option>
        <option value="in-progress">In Progress</option>
        <option value="done">Done</option>
        </select>

        {showTaskForm && (
        <div className="modal-overlay">
            <div className="task-modal">
            <h2>Add Task</h2>

            {formError && (
            <p className="form-error">{formError}</p>
            )}

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
                    value={type}
                    onChange={(event) => setType(event.target.value)}
                    >
                    <option value="task">Task</option>
                    <option value="bug">Bug</option>
                    <option value="feature">Feature</option>
                    <option value="improvement">Improvement</option>
                </select>

                {type === 'bug' && (
                <>
                    <textarea
                    placeholder="Steps to reproduce"
                    value={stepsToReproduce}
                    onChange={(event) => setStepsToReproduce(event.target.value)}
                    />

                    <textarea
                    placeholder="Expected result"
                    value={expectedResult}
                    onChange={(event) => setExpectedResult(event.target.value)}
                    />

                    <textarea
                    placeholder="Actual result"
                    value={actualResult}
                    onChange={(event) => setActualResult(event.target.value)}
                    />

                    <input
                    type="text"
                    placeholder="Environment / Browser"
                    value={environment}
                    onChange={(event) => setEnvironment(event.target.value)}
                    />
                </>
                )}

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

        {showMembers && (
        <div className="modal-overlay">
            <div className="task-modal">
            <h2>Project Members</h2>

            {memberError && (
                <p className="form-error">{memberError}</p>
            )}

            {isOwner && (
            <form onSubmit={handleAddMember}>
                <input
                type="email"
                placeholder="Add member by email"
                value={memberEmail}
                onChange={(event) => setMemberEmail(event.target.value)}
                />

                <button type="submit">
                Add Member
                </button>
            </form>
            )}

            <div className="members-list">
                {members.length === 0 ? (
                <p>No members yet.</p>
                ) : (
                members.map((member) => (
                    <div key={member.id} className="member-item">
                    <div>
                        <strong>{member.name}</strong>
                        <p>{member.email}</p>
                    </div>

                    <span>{member.role}</span>

                    {isOwner && member.role !== 'owner' && (
                    <button
                        type="button"
                        onClick={() => handleRemoveMember(member.id)}
                    >
                        Remove
                    </button>
                    )}
                    </div>
                ))
                )}
            </div>

            <button
                type="button"
                onClick={() => setShowMembers(false)}
            >
                Close
            </button>
            </div>
        </div>
        )}

        {showActivity && (
        <div className="modal-overlay">
            <div className="task-modal">
            <h2>Project Activity</h2>

            <div className="activity-list">
                {activities.length === 0 ? (
                <p>No activity yet.</p>
                ) : (
                activities.map((activity) => (
                    <div className="activity-item" key={activity.id}>
                    <div>
                    <div className="activity-heading">
                    <strong>{activity.user_name}</strong>

                    <span className="activity-type">
                        {activity.action.replaceAll('_', ' ')}
                    </span>
                    </div>

<p>{activity.details}</p>
                    </div>

                    <span>
                        {new Date(activity.created_at).toLocaleString()}
                    </span>
                    </div>
                ))
                )}
            </div>

            <button
                type="button"
                onClick={() => setShowActivity(false)}
            >
                Close
            </button>
            </div>
        </div>
        )}

        {editingTask && (
        <div className="modal-overlay">
            <div className="task-modal">
            <h2>Edit Task</h2>

            {formError && (
            <p className="form-error">{formError}</p>
            )}

            <form onSubmit={handleEditTask}>
                <input
                type="text"
                value={editTaskTitle}
                onChange={(event) => setEditTaskTitle(event.target.value)}
                placeholder="Task title"
                required
                />

                <input
                type="text"
                value={editTaskDescription}
                onChange={(event) => setEditTaskDescription(event.target.value)}
                placeholder="Description"
                />

                <select
                value={editTaskType}
                onChange={(event) => setEditTaskType(event.target.value)}
                >
                <option value="task">Task</option>
                <option value="bug">Bug</option>
                <option value="feature">Feature</option>
                <option value="improvement">Improvement</option>
                </select>

                {editTaskType === 'bug' && (
                <>
                    <textarea
                    placeholder="Steps to reproduce"
                    value={editStepsToReproduce}
                    onChange={(event) => setEditStepsToReproduce(event.target.value)}
                    />

                    <textarea
                    placeholder="Expected result"
                    value={editExpectedResult}
                    onChange={(event) => setEditExpectedResult(event.target.value)}
                    />

                    <textarea
                    placeholder="Actual result"
                    value={editActualResult}
                    onChange={(event) => setEditActualResult(event.target.value)}
                    />

                    <input
                    type="text"
                    placeholder="Environment / Browser"
                    value={editEnvironment}
                    onChange={(event) => setEditEnvironment(event.target.value)}
                    />
                </>
                )}

                <select
                value={editTaskPriority}
                onChange={(event) => setEditTaskPriority(event.target.value)}
                >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                </select>

                <input
                type="date"
                value={editTaskDueDate}
                onChange={(event) => setEditTaskDueDate(event.target.value)}
                />

                <div className="modal-actions">
                <button
                    type="button"
                    onClick={() => setEditingTask(null)}
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
            .filter(
                (task) =>
                  task.status === 'todo' &&
                  task.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
                  (priorityFilter === 'all' || task.priority === priorityFilter) &&
                  (statusFilter === 'all' || statusFilter === 'todo')
              )
            .map((task) => (
              <div className="task-card" key={task.id}>
                <h3>{task.title}</h3>
                <p className={`type-badge type-${task.type}`}>
                {task.type}
                </p>
                {task.description && (
                <p className="task-description">
                    {task.description}
                </p>
                )}
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

                <button
                type="button"
                onClick={() => {
                    setFormError('')
                    setEditingTask(task)
                    setEditTaskTitle(task.title)
                    setEditTaskDescription(task.description || '')
                    setEditTaskPriority(task.priority)
                    setEditTaskDueDate(task.due_date?.slice(0, 10) || '')
                    setEditTaskType(task.type || 'task')
                    setEditStepsToReproduce(task.steps_to_reproduce || '')
                    setEditExpectedResult(task.expected_result || '')
                    setEditActualResult(task.actual_result || '')
                    setEditEnvironment(task.environment || '')
                }}
                >
                Edit
                </button>

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
            .filter(
                (task) =>
                  task.status === 'in-progress' &&
                  task.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
                  (priorityFilter === 'all' || task.priority === priorityFilter) &&
                  (statusFilter === 'all' || statusFilter === 'in-progress')
              )
            .map((task) => (
              <div className="task-card" key={task.id}>
                <h3>{task.title}</h3>
                <p className={`type-badge type-${task.type}`}>
                {task.type}
                </p>
                {task.description && (
                <p className="task-description">
                    {task.description}
                </p>
                )}
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

                <button
                type="button"
                onClick={() => {
                    setFormError('')
                    setEditingTask(task)
                    setEditTaskTitle(task.title)
                    setEditTaskDescription(task.description || '')
                    setEditTaskPriority(task.priority)
                    setEditTaskDueDate(task.due_date?.slice(0, 10) || '')
                    setEditTaskType(task.type || 'task')
                    setEditStepsToReproduce(task.steps_to_reproduce || '')
                    setEditExpectedResult(task.expected_result || '')
                    setEditActualResult(task.actual_result || '')
                    setEditEnvironment(task.environment || '')
                }}
                >
                Edit
                </button>

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
            .filter(
                (task) =>
                  task.status === 'done' &&
                  task.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
                  (priorityFilter === 'all' || task.priority === priorityFilter) &&
                  (statusFilter === 'all' || statusFilter === 'done')
              )
            .map((task) => (
              <div className="task-card" key={task.id}>
                <h3>{task.title}</h3>
                <p className={`type-badge type-${task.type}`}>
                {task.type}
                </p>
                {task.description && (
                <p className="task-description">
                    {task.description}
                </p>
                )}
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

                <button
                type="button"
                onClick={() => {
                    setFormError('')
                    setEditingTask(task)
                    setEditTaskTitle(task.title)
                    setEditTaskDescription(task.description || '')
                    setEditTaskPriority(task.priority)
                    setEditTaskDueDate(task.due_date?.slice(0, 10) || '')
                    setEditTaskType(task.type || 'task')
                    setEditStepsToReproduce(task.steps_to_reproduce || '')
                    setEditExpectedResult(task.expected_result || '')
                    setEditActualResult(task.actual_result || '')
                    setEditEnvironment(task.environment || '')
                }}
                >
                Edit
                </button>

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