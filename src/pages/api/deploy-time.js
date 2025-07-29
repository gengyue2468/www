export default function handler(req, res) {
  try {
    // 从Vercel环境变量获取部署时间
    const deployedAt = process.env.VERCEL_DEPLOYED_AT;
    const deploymentId = process.env.VERCEL_DEPLOYMENT_ID || null;

    if (!deployedAt) {
      return res.status(404).json({ error: "部署时间信息未找到" });
    }

    // 格式化日期为人类可读格式
    const date = new Date(parseInt(deployedAt, 10));
    const formattedDate = new Intl.DateTimeFormat("zh-CN", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      timeZone: "Asia/Shanghai",
    }).format(date);

    res.status(200).json({
      deployedAt,
      formattedDate,
      deploymentId,
    });
  } catch (error) {
    res.status(500).json({ error: "获取部署时间失败" });
  }
}
