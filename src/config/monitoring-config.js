/**
 * Configuration for monitoring functionality
 */
module.exports = {
  // Log directory for production logs
  logDirectory: process.env.LOG_DIR || 'logs',
  
  // Log file prefix
  logFilePrefix: 'api-metrics-',
  
  // Whether to log request body (may contain sensitive data)
  logRequestBody: false,
  
  // Maximum log file size in bytes (10MB)
  maxLogFileSize: 10 * 1024 * 1024,
  
  // Maximum number of log files to keep
  maxLogFiles: 30,
  
  // Metrics collection interval in milliseconds (1 minute)
  metricsInterval: 60 * 1000,
  
  // Whether to enable detailed logging in development
  detailedDevLogs: true,
  
  // Whether to log to console in production (in addition to files)
  logToConsoleInProduction: false,
  
  // Metrics to collect
  metrics: {
    system: true,
    request: true,
    response: true,
    database: true
  }
};
