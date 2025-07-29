export default function handler(req, res) {
  res.status(200).json({
    deploymentId: process.env.VERCEL_DEPLOYMENT_ID,
    deployedAt: process.env.VERCEL_DEPLOYED_AT,
    isVercel: process.env.VERCEL ? 'Yes' : 'No'
  });
}