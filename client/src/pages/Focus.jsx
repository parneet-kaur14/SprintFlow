import { useEffect, useState } from 'react'
import './Focus.css'
import { API_URL } from '../api'

function Focus() {
  const [focusMinutes, setFocusMinutes] = useState(25)
  const [breakMinutes, setBreakMinutes] = useState(5)
  const [tasks, setTasks] = useState([])
  const [selectedTaskId, setSelectedTaskId] = useState('')

  const [mode, setMode] = useState('focus')
  const [secondsLeft, setSecondsLeft] = useState(25 * 60)
  const [isRunning, setIsRunning] = useState(false)
  const [endTime, setEndTime] = useState(null)
  const [timerLoaded, setTimerLoaded] = useState(false)
  const [sessionsToday, setSessionsToday] = useState(0)
  const [focusTimeToday, setFocusTimeToday] = useState(0)

  useEffect(() => {
    if (!timerLoaded) return
    localStorage.setItem(
      'focusTimer',
      JSON.stringify({
        focusMinutes,
        breakMinutes,
        mode,
        secondsLeft,
        isRunning,
        endTime,
        selectedTaskId,
      })
    )
  }, [
    timerLoaded,
    focusMinutes,
    breakMinutes,
    mode,
    secondsLeft,
    isRunning,
    endTime,
    selectedTaskId,
  ])


  useEffect(() => {
    const savedTimer = JSON.parse(
      localStorage.getItem('focusTimer')
    )
  
    if (!savedTimer) {
        setTimerLoaded(true)
        return
      }
  
    setFocusMinutes(savedTimer.focusMinutes || 25)
    setBreakMinutes(savedTimer.breakMinutes || 5)
    setMode(savedTimer.mode || 'focus')
    setSelectedTaskId(savedTimer.selectedTaskId || '')
  
    if (savedTimer.isRunning && savedTimer.endTime) {
      const remaining = Math.max(
        0,
        Math.ceil((savedTimer.endTime - Date.now()) / 1000)
      )
  
      setSecondsLeft(remaining)
      setEndTime(savedTimer.endTime)
  
      if (remaining > 0) {
        setIsRunning(true)
      }
    } else {
      setSecondsLeft(savedTimer.secondsLeft || 25 * 60)
    }
    setTimerLoaded(true)
  }, [])

  useEffect(() => {
    const today = new Date().toLocaleDateString()
    const savedStats = JSON.parse(
      localStorage.getItem('focusStats')
    )
  
    if (savedStats && savedStats.date === today) {
      setSessionsToday(savedStats.sessions)
      setFocusTimeToday(savedStats.minutes)
    } else {
      localStorage.setItem(
        'focusStats',
        JSON.stringify({
          date: today,
          sessions: 0,
          minutes: 0,
        })
      )
    }
  }, [])

  useEffect(() => {
    const token = localStorage.getItem('token')
  
    fetch(`${API_URL}/api/projects`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => response.json())
      .then(async (projects) => {
        const taskResults = await Promise.all(
          projects.map((project) =>
            fetch(
              `${API_URL}/api/tasks/project/${project.id}`,
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              }
            ).then((response) => response.json())
          )
        )
  
        const allTasks = taskResults
          .flat()
          .filter((task) => task.status !== 'done')
  
        setTasks(allTasks)
      })
      .catch((error) => {
        console.error('Unable to load focus tasks:', error)
      })
  }, [])

  useEffect(() => {
    if (!isRunning || !endTime) return
  
    const interval = setInterval(() => {
      const remaining = Math.max(
        0,
        Math.ceil((endTime - Date.now()) / 1000)
      )
  
      setSecondsLeft(remaining)
  
      if (remaining === 0) {
        setIsRunning(false)
        setEndTime(null)
      
        if (mode === 'focus') {
          const newSessions = sessionsToday + 1
          const newFocusTime = focusTimeToday + focusMinutes
          const today = new Date().toLocaleDateString()
      
          setSessionsToday(newSessions)
          setFocusTimeToday(newFocusTime)
      
          localStorage.setItem(
            'focusStats',
            JSON.stringify({
              date: today,
              sessions: newSessions,
              minutes: newFocusTime,
            })
          )
      
          setMode('break')
          setSecondsLeft(breakMinutes * 60)
        } else {
          setMode('focus')
          setSecondsLeft(focusMinutes * 60)
        }
      }
    }, 250)
  
    return () => clearInterval(interval)
  }, [isRunning, endTime, mode, focusMinutes, breakMinutes, sessionsToday, focusTimeToday,])

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60

    return `${String(minutes).padStart(2, '0')}:${String(
      remainingSeconds
    ).padStart(2, '0')}`
  }

  const handleStart = () => {
    const end = Date.now() + secondsLeft * 1000
  
    setEndTime(end)
    setIsRunning(true)
  }

  const handlePause = () => {
    setIsRunning(false)
    setEndTime(null)
  }

  const handleReset = () => {
    setIsRunning(false)
    setEndTime(null)

    if (mode === 'focus') {
      setSecondsLeft(focusMinutes * 60)
    } else {
      setSecondsLeft(breakMinutes * 60)
    }
  }

  const handleFocusDurationChange = (event) => {
    const minutes = Number(event.target.value)

    setFocusMinutes(minutes)

    if (!isRunning && mode === 'focus') {
      setSecondsLeft(minutes * 60)
    }
  }

  const handleBreakDurationChange = (event) => {
    const minutes = Number(event.target.value)

    setBreakMinutes(minutes)

    if (!isRunning && mode === 'break') {
      setSecondsLeft(minutes * 60)
    }
  }

  return (
    <div className="focus-page">
      <div className="focus-header">
        <p className="focus-label">FOCUS MODE</p>
        <h1>Time to focus</h1>
        <p>Choose your session length and work without distractions.</p>
      </div>

      <div className="focus-card">
        <div className="focus-mode">
          {mode === 'focus' ? 'Focus Session' : 'Break Time'}
        </div>

        <div className="timer-display">
          {formatTime(secondsLeft)}
        </div>

        <div className="duration-settings">
          <div>
            <label>Focus duration</label>

            <select
              value={focusMinutes}
              onChange={handleFocusDurationChange}
              disabled={isRunning}
            >
                <option value="1">1 minute (Test)</option>
              <option value="15">15 minutes</option>
              <option value="25">25 minutes</option>
              <option value="30">30 minutes</option>
              <option value="45">45 minutes</option>
              <option value="60">60 minutes</option>
            </select>
          </div>

          <div>
            <label>Break duration</label>

            <select
              value={breakMinutes}
              onChange={handleBreakDurationChange}
              disabled={isRunning}
            >
                <option value="1">1 minute (Test)</option>
              <option value="5">5 minutes</option>
              <option value="10">10 minutes</option>
              <option value="15">15 minutes</option>
            </select>
          </div>
        </div>

        <div className="focus-task">
            <label>Focus on a task <span>Optional</span></label>

            <select
                value={selectedTaskId}
                onChange={(event) => setSelectedTaskId(event.target.value)}
                disabled={isRunning}
            >
                <option value="">No task selected</option>

                {tasks.map((task) => (
                <option value={task.id} key={task.id}>
                    {task.title}
                </option>
                ))}
            </select>
            </div>


            {selectedTaskId && (
            <div className="selected-focus-task">
                <span>Current Task</span>

                <strong>
                {
                    tasks.find(
                    (task) => String(task.id) === String(selectedTaskId)
                    )?.title
                }
                </strong>
            </div>
            )}

        <div className="focus-actions">
        <button onClick={handleStart}>
        {mode === 'focus' ? 'Start Focus' : 'Start Break'}
        </button>

          <button onClick={handlePause}>
            Pause
          </button>

          <button onClick={handleReset}>
            Reset
          </button>
        </div>
        <div className="focus-today">
            <h2>Today</h2>

            <div className="focus-stats">
                <div className="focus-stat-card">
                <span>Sessions Completed</span>
                <strong>{sessionsToday}</strong>
                </div>

                <div className="focus-stat-card">
                <span>Focus Time</span>
                <strong>{focusTimeToday} min</strong>
                </div>
            </div>
            </div>
      </div>
    </div>
  )
}

export default Focus