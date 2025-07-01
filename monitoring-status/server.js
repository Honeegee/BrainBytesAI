const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files
app.use(express.static(__dirname));

// Main route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'BrainBytesAI Monitoring Status',
    monitoring: {
      local_grafana: 'http://localhost:3003',
      local_prometheus: 'http://localhost:9090',
      production_apps: {
        backend: 'https://brainbytes-backend-production-d355616d0f1f.herokuapp.com',
        ai_service: 'https://brainbytes-ai-production-3833f742ba79.herokuapp.com',
        staging_backend: 'https://brainbytes-backend-staging-de872da2939f.herokuapp.com', 
        staging_ai: 'https://brainbytes-ai-service-staging-4b75c77cf53a.herokuapp.com'
      }
    }
  });
});

// API endpoint to check service status
app.get('/api/status', async (req, res) => {
  const services = [
    {
      name: 'Production Backend',
      url: 'https://brainbytes-backend-production-d355616d0f1f.herokuapp.com/health'
    },
    {
      name: 'Production AI Service', 
      url: 'https://brainbytes-ai-production-3833f742ba79.herokuapp.com/health'
    },
    {
      name: 'Staging Backend',
      url: 'https://brainbytes-backend-staging-de872da2939f.herokuapp.com/health'
    },
    {
      name: 'Staging AI Service',
      url: 'https://brainbytes-ai-service-staging-4b75c77cf53a.herokuapp.com/health'
    }
  ];

  res.json({
    timestamp: new Date().toISOString(),
    services: services.map(service => ({
      name: service.name,
      url: service.url,
      status: 'configured',
      message: 'Monitoring endpoints available'
    }))
  });
});

app.listen(PORT, () => {
  console.log(`🚀 BrainBytesAI Monitoring Status running on port ${PORT}`);
  console.log(`📊 Access at: http://localhost:${PORT}`);
});