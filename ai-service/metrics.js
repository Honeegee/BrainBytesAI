const client = require('prom-client');

// Create a Registry which registers the metrics
const register = new client.Registry();

// Add a default label which is added to all metrics
register.setDefaultLabels({
  app: 'brainbytes-ai-service',
});

// Enable the collection of default metrics
client.collectDefaultMetrics({ register });

// AI Service specific metrics

// AI Request processing time
const aiRequestDuration = new client.Histogram({
  name: 'brainbytes_ai_request_duration_seconds',
  help: 'Duration of AI request processing in seconds',
  labelNames: ['endpoint', 'model', 'status'],
  buckets: [0.1, 0.5, 1, 2, 5, 10, 30],
  registers: [register],
});

// AI Request counter
const aiRequestsTotal = new client.Counter({
  name: 'brainbytes_ai_requests_total',
  help: 'Total number of AI requests',
  labelNames: ['endpoint', 'model', 'status'],
  registers: [register],
});

// AI Response quality metrics
const aiResponseLength = new client.Histogram({
  name: 'brainbytes_ai_response_length_chars',
  help: 'Length of AI responses in characters',
  labelNames: ['model', 'subject'],
  buckets: [50, 100, 200, 500, 1000, 2000, 5000],
  registers: [register],
});

// Token usage metrics (if using OpenAI or similar)
const tokenUsage = new client.Counter({
  name: 'brainbytes_ai_tokens_used_total',
  help: 'Total number of tokens used',
  labelNames: ['model', 'type'], // type: prompt, completion
  registers: [register],
});

// AI Model errors
const aiErrors = new client.Counter({
  name: 'brainbytes_ai_errors_total',
  help: 'Total number of AI errors',
  labelNames: ['error_type', 'model'],
  registers: [register],
});

// Queue metrics for AI requests
const aiQueueSize = new client.Gauge({
  name: 'brainbytes_ai_queue_size',
  help: 'Current size of AI request queue',
  registers: [register],
});

// Subject-specific metrics
const subjectRequests = new client.Counter({
  name: 'brainbytes_ai_subject_requests_total',
  help: 'Total AI requests by subject',
  labelNames: ['subject', 'grade_level'],
  registers: [register],
});

// Middleware function to collect AI metrics
const collectAiMetrics = (req, res, next) => {
  const start = Date.now();

  res.on('finish', () => {
    const duration = (Date.now() - start) / 1000;
    const endpoint = req.route ? req.route.path : req.path;
    const status = res.statusCode >= 400 ? 'error' : 'success';

    aiRequestDuration.labels(endpoint, 'default', status).observe(duration);

    aiRequestsTotal.labels(endpoint, 'default', status).inc();
  });

  next();
};

// Function to record AI response
const recordAiResponse = (
  responseText,
  model = 'default',
  subject = 'general'
) => {
  if (responseText && typeof responseText === 'string') {
    aiResponseLength.labels(model, subject).observe(responseText.length);
  }
};

// Function to record token usage
const recordTokenUsage = (tokens, model = 'default', type = 'completion') => {
  tokenUsage.labels(model, type).inc(tokens);
};

// Function to record AI errors
const recordAiError = (errorType, model = 'default') => {
  aiErrors.labels(errorType, model).inc();
};

// Function to update queue size
const updateQueueSize = size => {
  aiQueueSize.set(size);
};

// Function to record subject request
const recordSubjectRequest = (subject = 'general', gradeLevel = 'unknown') => {
  subjectRequests.labels(subject, gradeLevel).inc();
};

module.exports = {
  register,
  collectAiMetrics,
  recordAiResponse,
  recordTokenUsage,
  recordAiError,
  updateQueueSize,
  recordSubjectRequest,
  // Export individual metrics for direct access if needed
  metrics: {
    aiRequestDuration,
    aiRequestsTotal,
    aiResponseLength,
    tokenUsage,
    aiErrors,
    aiQueueSize,
    subjectRequests,
  },
};
