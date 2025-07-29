import { useState, useEffect } from "react"
import axios from "axios"

const LastDeploymentTime = () => {
  const [deploymentInfo, setDeploymentInfo] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchDeploymentTime = async () => {
      try {
        setLoading(true)
        const response = await axios.get("/api/deployment-time")
        setDeploymentInfo(response.data)
        setError(null)
      } catch (err) {
        setError("无法获取部署时间信息")
        console.error("获取部署时间失败:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchDeploymentTime()
  }, [])

  if (loading) {
    return <div className="text-gray-500">加载部署信息中...</div>
  }

  if (error || !deploymentInfo) {
    return <div className="text-red-500">{error || "未找到部署信息"}</div>
  }

  return (
    <div className="">
      {deploymentInfo.formattedDate}
    </div>
  )
}

export default LastDeploymentTime