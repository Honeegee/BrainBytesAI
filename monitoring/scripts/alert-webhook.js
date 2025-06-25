const express = require('express');
const app = express();
const PORT = 5001;

app.use(express.json());

// Store recent alerts for display
let recentAlerts = [];

// Webhook endpoint to receive alerts from Alertmanager
app.post('/', (req, res) => {
  const alerts = req.body.alerts || [];
  
  alerts.forEach(alert => {
    const alertInfo = {
      timestamp: new Date().toISOString(),
      status: alert.status,
      alertname: alert.labels.alertname,
      severity: alert.labels.severity,
      summary: alert.annotations.summary,
      description: alert.annotations.description,
      instance: alert.labels.instance,
      startsAt: alert.startsAt,
      endsAt: alert.endsAt
    };
    
    // Add to recent alerts (keep last 50)
    recentAlerts.unshift(alertInfo);
    recentAlerts = recentAlerts.slice(0, 50);
    
    // Console logging
    console.log('\n🚨 ALERT RECEIVED 🚨');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`📅 Time: ${alertInfo.timestamp}`);
    console.log(`🔔 Alert: ${alertInfo.alertname}`);
    console.log(`⚠️  Status: ${alertInfo.status.toUpperCase()}`);
    console.log(`🎯 Severity: ${alertInfo.severity}`);
    console.log(`📋 Summary: ${alertInfo.summary}`);
    console.log(`📝 Description: ${alertInfo.description}`);
    if (alertInfo.instance) {
      console.log(`🖥️  Instance: ${alertInfo.instance}`);
    }
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  });
  
  res.status(200).json({ status: 'received', count: alerts.length });
});

// Web interface to view recent alerts
app.get('/', (req, res) => {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
        <title>BrainBytes Alert Dashboard</title>
        <meta http-equiv="refresh" content="30">
        <style>
            body { font-family: Arial, sans-serif; margin: 20px; background-color: #f5f5f5; }
            .header { background-color: #2c3e50; color: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
            .alert { 
                background-color: white; 
                border-left: 5px solid #e74c3c; 
                padding: 15px; 
                margin: 10px 0; 
                border-radius: 4px; 
                box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            }
            .alert.warning { border-left-color: #f39c12; }
            .alert.info { border-left-color: #3498db; }
            .alert.resolved { border-left-color: #2ecc71; opacity: 0.7; }
            .timestamp { color: #7f8c8d; font-size: 0.9em; }
            .alertname { font-weight: bold; color: #2c3e50; font-size: 1.1em; }
            .severity { 
                display: inline-block; 
                padding: 2px 8px; 
                border-radius: 12px; 
                font-size: 0.8em; 
                color: white; 
                margin-left: 10px;
            }
            .severity.critical { background-color: #e74c3c; }
            .severity.warning { background-color: #f39c12; }
            .severity.info { background-color: #3498db; }
            .no-alerts { text-align: center; padding: 40px; color: #7f8c8d; }
            .stats { 
                display: flex; 
                gap: 20px; 
                margin-bottom: 20px;
            }
            .stat-card { 
                background-color: white; 
                padding: 15px; 
                border-radius: 8px; 
                box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                flex: 1;
                text-align: center;
            }
            .stat-number { font-size: 2em; font-weight: bold; color: #2c3e50; }
            .stat-label { color: #7f8c8d; font-size: 0.9em; }
        </style>
    </head>
    <body>
        <div class="header">
            <h1>🚨 BrainBytes Alert Dashboard</h1>
            <p>Real-time monitoring alerts for your application</p>
        </div>
        
        <div class="stats">
            <div class="stat-card">
                <div class="stat-number">${recentAlerts.length}</div>
                <div class="stat-label">Total Alerts</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">${recentAlerts.filter(a => a.status === 'firing').length}</div>
                <div class="stat-label">Active Alerts</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">${recentAlerts.filter(a => a.severity === 'critical').length}</div>
                <div class="stat-label">Critical Alerts</div>
            </div>
        </div>
        
        ${recentAlerts.length > 0 ? 
          recentAlerts.map(alert => `
            <div class="alert ${alert.severity} ${alert.status === 'resolved' ? 'resolved' : ''}">
                <div class="alertname">
                    ${alert.alertname}
                    <span class="severity ${alert.severity}">${alert.severity}</span>
                </div>
                <div class="timestamp">${alert.timestamp}</div>
                <div style="margin: 8px 0;"><strong>Summary:</strong> ${alert.summary}</div>
                <div><strong>Description:</strong> ${alert.description}</div>
                ${alert.instance ? `<div><strong>Instance:</strong> ${alert.instance}</div>` : ''}
                <div style="margin-top: 8px; font-size: 0.9em; color: #7f8c8d;">
                    Status: ${alert.status.toUpperCase()}
                    ${alert.startsAt ? ` | Started: ${new Date(alert.startsAt).toLocaleString()}` : ''}
                </div>
            </div>
          `).join('') 
          : 
          '<div class="no-alerts">✅ No alerts received yet. Your system is running smoothly!</div>'
        }
        
        <div style="margin-top: 30px; text-align: center; color: #7f8c8d; font-size: 0.9em;">
            <p>This page auto-refreshes every 30 seconds</p>
            <p>📊 <a href="http://localhost:9090" target="_blank">Prometheus</a> | 
               🔔 <a href="http://localhost:9093" target="_blank">Alertmanager</a></p>
        </div>
    </body>
    </html>
  `;
  
  res.send(html);
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy',
    alertsReceived: recentAlerts.length,
    activeAlerts: recentAlerts.filter(a => a.status === 'firing').length
  });
});

// API endpoint to get alerts as JSON
app.get('/api/alerts', (req, res) => {
  res.json({ alerts: recentAlerts });
});

app.listen(PORT, () => {
  console.log(`\n🔔 BrainBytes Alert Webhook Server running on port ${PORT}`);
  console.log(`📊 Dashboard: http://localhost:${PORT}`);
  console.log(`🚨 Webhook URL: http://localhost:${PORT}/`);
  console.log(`🩺 Health Check: http://localhost:${PORT}/health`);
  console.log(`📡 API Endpoint: http://localhost:${PORT}/api/alerts\n`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n👋 Alert webhook server shutting down...');
  process.exit(0);
});