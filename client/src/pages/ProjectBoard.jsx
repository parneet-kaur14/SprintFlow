import { useParams } from 'react-router-dom'

function ProjectBoard() {
  const { projectId } = useParams()

  return (
    <div>
      <h1>Project Board</h1>
      <p>Project ID: {projectId}</p>
    </div>
  )
}

export default ProjectBoard