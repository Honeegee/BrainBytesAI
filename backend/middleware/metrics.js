const client = require('prom-client');

// Create a Registry which registers the metrics
const register = new client.Registry();

// Add a default label which is added to all metrics
register.setDefaultLabels({
  app: 'brainbytes-backend',
});

// Enable the collection of default metrics
client.collectDefaultMetrics({ register });

// Custom metrics for BrainBytes application

// HTTP Request metrics
const httpRequestDuration = new client.Histogram({
  name: 'brainbytes_http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.1, 0.3, 0.5, 0.7, 1, 3, 5, 7, 10],
  registers: [register],
});

const httpRequestsTotal = new client.Counter({
  name: 'brainbytes_http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code'],
  registers: [register],
});

// Active sessions gauge
const activeSessions = new client.Gauge({
  name: 'brainbytes_active_sessions',
  help: 'Number of currently active user sessions',
  registers: [register],
});

// AI Response Time metrics
const aiResponseTimeHistogram = new client.Histogram({
  name: 'brainbytes_ai_response_time_seconds',
  help: 'Time taken for AI to generate responses',
  labelNames: ['subject', 'complexity'],
  buckets: [0.1, 0.5, 1, 2, 5, 10],
  registers: [register],
});

// Tutoring Session metrics
const tutoringSessions = new client.Counter({
  name: 'brainbytes_tutoring_sessions_total',
  help: 'Total number of tutoring sessions',
  labelNames: ['subject', 'grade_level'],
  registers: [register],
});

const questionCounter = new client.Counter({
  name: 'brainbytes_questions_total',
  help: 'Total number of questions asked',
  labelNames: ['subject', 'grade_level', 'status'],
  registers: [register],
});

// Database operation metrics
const dbOperationDuration = new client.Histogram({
  name: 'brainbytes_db_operation_duration_seconds',
  help: 'Duration of database operations',
  labelNames: ['operation', 'collection'],
  buckets: [0.01, 0.05, 0.1, 0.5, 1, 2, 5],
  registers: [register],
});

const dbConnectionsActive = new client.Gauge({
  name: 'brainbytes_db_connections_active',
  help: 'Number of active database connections',
  registers: [register],
});

// Philippine context metrics
const mobilePlatformCounter = new client.Counter({
  name: 'brainbytes_mobile_requests_total',
  help: 'Total requests from mobile devices',
  labelNames: ['platform', 'network_type'],
  registers: [register],
});

const payloadSizeHistogram = new client.Histogram({
  name: 'brainbytes_response_size_bytes',
  help: 'Size of HTTP responses in bytes',
  labelNames: ['endpoint'],
  buckets: [1000, 10000, 50000, 100000, 500000],
  registers: [register],
});

const connectionDropCounter = new client.Counter({
  name: 'brainbytes_connection_drops_total',
  help: 'Number of dropped connections',
  labelNames: ['reason'],
  registers: [register],
});

// User engagement metrics
const userEngagementDuration = new client.Histogram({
  name: 'brainbytes_user_session_duration_seconds',
  help: 'Duration of user sessions',
  labelNames: ['user_type'],
  buckets: [60, 300, 600, 1800, 3600, 7200],
  registers: [register],
});

// Middleware function to collect HTTP metrics
const collectHttpMetrics = (req, res, next) => {
  const start = Date.now();

  res.on('finish', () => {
    const duration = (Date.now() - start) / 1000;
    const route = req.route ? req.route.path : req.path;
    const method = req.method;
    const statusCode = res.statusCode;

    httpRequestDuration.labels(method, route, statusCode).observe(duration);

    httpRequestsTotal.labels(method, route, statusCode).inc();

    // Track response size
    const contentLength = res.get('Content-Length');
    if (contentLength) {
      payloadSizeHistogram.labels(route).observe(parseInt(contentLength));
    }

    // Detect mobile requests
    const userAgent = req.get('User-Agent') || '';
    if (
      userAgent.includes('Mobile') ||
      userAgent.includes('Android') ||
      userAgent.includes('iPhone')
    ) {
      const platform = userAgent.includes('Android')
        ? 'android'
        : userAgent.includes('iPhone')
          ? 'ios'
          : 'mobile';
      mobilePlatformCounter.labels(platform, 'unknown').inc();
    }
  });

  next();
};

// Function to update active sessions
const updateActiveSessions = count => {
  activeSessions.set(count);
};

// Function to record AI response time
const recordAiResponseTime = (
  duration,
  subject = 'general',
  complexity = 'medium'
) => {
  aiResponseTimeHistogram.labels(subject, complexity).observe(duration);
};

// Function to record tutoring session
const recordTutoringSession = (subject = 'general', gradeLevel = 'unknown') => {
  tutoringSessions.labels(subject, gradeLevel).inc();
};

// Function to record question
const recordQuestion = (
  subject = 'general',
  gradeLevel = 'unknown',
  status = 'success'
) => {
  questionCounter.labels(subject, gradeLevel, status).inc();
};

// Function to record database operation
const recordDbOperation = (operation, collection, duration) => {
  dbOperationDuration.labels(operation, collection).observe(duration);
};

// Function to update database connections
const updateDbConnections = count => {
  dbConnectionsActive.set(count);
};

// Function to record connection drop
const recordConnectionDrop = (reason = 'unknown') => {
  connectionDropCounter.labels(reason).inc();
};

// Function to record user engagement
const recordUserEngagement = (duration, userType = 'student') => {
  userEngagementDuration.labels(userType).observe(duration);
};

module.exports = {
  register,
  collectHttpMetrics,
  updateActiveSessions,
  recordAiResponseTime,
  recordTutoringSession,
  recordQuestion,
  recordDbOperation,
  updateDbConnections,
  recordConnectionDrop,
  recordUserEngagement,
  // Export individual metrics for direct access if needed
  metrics: {
    httpRequestDuration,
    httpRequestsTotal,
    activeSessions,
    aiResponseTimeHistogram,
    tutoringSessions,
    questionCounter,
    dbOperationDuration,
    dbConnectionsActive,
    mobilePlatformCounter,
    payloadSizeHistogram,
    connectionDropCounter,
    userEngagementDuration,
  },
};
