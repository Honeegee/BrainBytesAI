const express = require('express');
const axios = require('axios');
const client = require('prom-client');

const app = express();
const port = process.env.PORT || 9595;
const herokuApiToken = process.env.HEROKU_API_TOKEN;

// Create a Registry to register the metrics
const register = new client.Registry();

// Add a default label which is added to all metrics
register.setDefaultLabels({
  app: 'heroku-exporter'
});

// Enable the collection of default metrics
client.collectDefaultMetrics({ register });

// Custom metrics
const herokuAppInfo = new client.Gauge({
  name: 'heroku_app_info',
  help: 'Information about Heroku applications',
  labelNames: ['app_name', 'stack', 'region', 'created_at', 'updated_at'],
  registers: [register]
});

const herokuDynoInfo = new client.Gauge({
  name: 'heroku_dyno_info',
  help: 'Information about Heroku dynos',
  labelNames: ['app_name', 'dyno_id', 'dyno_type', 'state', 'created_at', 'updated_at'],
  registers: [register]
});

const herokuAppQuota = new client.Gauge({
  name: 'heroku_app_quota_used',
  help: 'Heroku app quota usage',
  labelNames: ['app_name', 'quota_type'],
  registers: [register]
});

const herokuReleaseInfo = new client.Gauge({
  name: 'heroku_release_info',
  help: 'Information about Heroku releases',
  labelNames: ['app_name', 'release_version', 'status', 'created_at'],
  registers: [register]
});

// Heroku API client
class HerokuAPI {
  constructor(token) {
    this.token = token;
    this.baseURL = 'https://api.heroku.com';
    this.headers = {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/vnd.heroku+json; version=3',
      'Content-Type': 'application/json'
    };
  }

  async makeRequest(endpoint) {
    try {
      const response = await axios.get(`${this.baseURL}${endpoint}`, {
        headers: this.headers,
        timeout: 10000
      });
      return response.data;
    } catch (error) {
      console.error(`Error fetching ${endpoint}:`, error.message);
      throw error;
    }
  }

  async getApps() {
    return this.makeRequest('/apps');
  }

  async getDynos(appName) {
    return this.makeRequest(`/apps/${appName}/dynos`);
  }

  async getReleases(appName) {
    return this.makeRequest(`/apps/${appName}/releases`);
  }

  async getAccountQuota() {
    return this.makeRequest('/account/quota');
  }
}

// Initialize Heroku API client
let herokuAPI = null;
if (herokuApiToken) {
  herokuAPI = new HerokuAPI(herokuApiToken);
} else {
  console.warn('HEROKU_API_TOKEN not provided. Heroku metrics will not be available.');
}

// Collect Heroku metrics
async function collectHerokuMetrics() {
  if (!herokuAPI) {
    console.log('Heroku API token not configured, skipping metrics collection');
    return;
  }

  try {
    console.log('Collecting Heroku metrics...');
    
    // Get all apps
    const apps = await herokuAPI.getApps();
    console.log(`Found ${apps.length} Heroku apps`);

    // Clear previous metrics
    herokuAppInfo.reset();
    herokuDynoInfo.reset();
    herokuReleaseInfo.reset();

    for (const app of apps) {
      try {
        // Set app info metrics
        herokuAppInfo.set(
          {
            app_name: app.name,
            stack: app.stack?.name || 'unknown',
            region: app.region?.name || 'unknown',
            created_at: app.created_at,
            updated_at: app.updated_at
          },
          1
        );

        // Get dynos for this app
        try {
          const dynos = await herokuAPI.getDynos(app.name);
          for (const dyno of dynos) {
            herokuDynoInfo.set(
              {
                app_name: app.name,
                dyno_id: dyno.id,
                dyno_type: dyno.type,
                state: dyno.state,
                created_at: dyno.created_at,
                updated_at: dyno.updated_at
              },
              1
            );
          }
        } catch (dynoError) {
          console.warn(`Failed to get dynos for app ${app.name}:`, dynoError.message);
        }

        // Get latest release for this app
        try {
          const releases = await herokuAPI.getReleases(app.name);
          if (releases.length > 0) {
            const latestRelease = releases[releases.length - 1];
            herokuReleaseInfo.set(
              {
                app_name: app.name,
                release_version: latestRelease.version.toString(),
                status: latestRelease.status,
                created_at: latestRelease.created_at
              },
              1
            );
          }
        } catch (releaseError) {
          console.warn(`Failed to get releases for app ${app.name}:`, releaseError.message);
        }

      } catch (appError) {
        console.warn(`Failed to process app ${app.name}:`, appError.message);
      }
    }

    // Get account quota
    try {
      const quota = await herokuAPI.getAccountQuota();
      if (quota) {
        herokuAppQuota.set(
          { app_name: 'account', quota_type: 'dyno_hours' },
          quota.account_quota || 0
        );
        herokuAppQuota.set(
          { app_name: 'account', quota_type: 'dyno_hours_used' },
          quota.quota_used || 0
        );
      }
    } catch (quotaError) {
      console.warn('Failed to get account quota:', quotaError.message);
    }

    console.log('Heroku metrics collection completed');
  } catch (error) {
    console.error('Error collecting Heroku metrics:', error.message);
  }
}

// Collect metrics every 30 seconds
if (herokuAPI) {
  setInterval(collectHerokuMetrics, 30000);
  // Collect initial metrics
  collectHerokuMetrics();
}

// Routes
app.get('/metrics', async (req, res) => {
  try {
    res.set('Content-Type', register.contentType);
    const metrics = await register.metrics();
    res.end(metrics);
  } catch (error) {
    console.error('Error generating metrics:', error);
    res.status(500).end('Error generating metrics');
  }
});

app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    heroku_api_configured: !!herokuApiToken
  });
});

app.get('/', (req, res) => {
  res.json({
    name: 'Heroku Exporter',
    version: '1.0.0',
    endpoints: {
      metrics: '/metrics',
      health: '/health'
    },
    heroku_api_configured: !!herokuApiToken
  });
});

// Error handling
app.use((error, req, res, next) => {
  console.error('Unhandled error:', error);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
app.listen(port, '0.0.0.0', () => {
  console.log(`Heroku Exporter listening on port ${port}`);
  console.log(`Heroku API configured: ${!!herokuApiToken}`);
  if (!herokuApiToken) {
    console.log('Set HEROKU_API_TOKEN environment variable to enable Heroku metrics');
  }
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('Received SIGTERM, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('Received SIGINT, shutting down gracefully');
  process.exit(0);
});