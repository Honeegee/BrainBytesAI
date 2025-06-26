// Frontend Health Check API endpoint for Heroku monitoring
// This provides a simple health check for the Next.js frontend

export default function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const healthData = {
    status: 'healthy',
    service: 'brainbytes-frontend',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    version: process.env.npm_package_version || '1.0.0',
    uptime: process.uptime(),
    features: {
      chat: true,
      learning: true,
      authentication: true,
      dashboard: true,
    },
    backend: {
      url: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000',
      aiService:
        process.env.NEXT_PUBLIC_AI_SERVICE_URL || 'http://localhost:3002',
    },
  };

  // Add heroku-specific information if available
  if (process.env.HEROKU_APP_NAME) {
    healthData.heroku = {
      appName: process.env.HEROKU_APP_NAME,
      dynoId: process.env.DYNO,
      slug: process.env.HEROKU_SLUG_COMMIT,
    };
  }

  res.status(200).json(healthData);
}
