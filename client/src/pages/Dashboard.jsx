import './Dashboard.css'

function Dashboard() {
  return (
    <div className="dashboard-page">
      <div className="dashboard-cards">
        <div className="summary-card">
          <p>Total Projects</p>
          <h2>2</h2>
        </div>

        <div className="summary-card">
          <p>Open Tasks</p>
          <h2>3</h2>
        </div>

        <div className="summary-card">
          <p>Completed Tasks</p>
          <h2>1</h2>
        </div>

        <div className="summary-card">
          <p>High Priority</p>
          <h2>1</h2>
        </div>
      </div>
    </div>
  )
}

export default Dashboard