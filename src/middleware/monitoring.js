const fs = require('fs');
const path = require('path');
const os = require('os');

/**
 * Middleware for monitoring API requests and system performance
 */
const monitoringMiddleware = (req, res, next) => {
  // Start time for request duration calculation
  const startTime = process.hrtime();
  
  // Capture original end method
  const originalEnd = res.end;
  
  // Override end method to calculate duration and log metrics
  res.end = function(chunk, encoding) {
    // Calculate request duration
    const hrTime = process.hrtime(startTime);
    const duration = hrTime[0] * 1000 + hrTime[1] / 1000000; // in ms
    
    // Collect metrics
    const metrics = {
      timestamp: new Date().toISOString(),
      method: req.method,
      url: req.originalUrl,
      statusCode: res.statusCode,
      duration: `${duration.toFixed(2)}ms`,
      userAgent: req.get('user-agent') || 'unknown',
      ip: req.ip || req.connection.remoteAddress,
      contentLength: res.get('content-length') || 0,
      systemMetrics: {
        freeMemory: `${(os.freemem() / 1024 / 1024).toFixed(2)}MB`,
        totalMemory: `${(os.totalmem() / 1024 / 1024).toFixed(2)}MB`,
        cpuLoad: os.loadavg(),
        uptime: os.uptime()
      }
    };
    
    // Log metrics to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`[MONITOR] ${req.method} ${req.originalUrl} ${res.statusCode} - ${duration.toFixed(2)}ms`);
    }
    
    // Log metrics to file in production
    if (process.env.NODE_ENV === 'production') {
      const logDir = path.join(__dirname, '../../logs');
      
      // Create logs directory if it doesn't exist
      if (!fs.existsSync(logDir)) {
        fs.mkdirSync(logDir, { recursive: true });
      }
      
      const logFile = path.join(logDir, `api-metrics-${new Date().toISOString().split('T')[0]}.log`);
      
      fs.appendFile(
        logFile,
        JSON.stringify(metrics) + '\n',
        (err) => {
          if (err) console.error('Error writing to metrics log:', err);
        }
      );
    }
    
    // Call original end method
    originalEnd.apply(res, arguments);
  };
  
  next();
};

/**
 * Function to get system health metrics
 * @returns {Object} System health metrics
 */
const getSystemHealth = () => {
  const totalMem = os.totalmem();
  const freeMem = os.freemem();
  const usedMem = totalMem - freeMem;
  
  return {
    status: 'ok',
    uptime: os.uptime(),
    timestamp: new Date().toISOString(),
    cpu: {
      loadAvg: os.loadavg(),
      cores: os.cpus().length
    },
    memory: {
      total: `${(totalMem / 1024 / 1024 / 1024).toFixed(2)}GB`,
      free: `${(freeMem / 1024 / 1024 / 1024).toFixed(2)}GB`,
      used: `${(usedMem / 1024 / 1024 / 1024).toFixed(2)}GB`,
      usagePercentage: `${((usedMem / totalMem) * 100).toFixed(2)}%`
    },
    os: {
      platform: os.platform(),
      release: os.release(),
      hostname: os.hostname()
    }
  };
};

module.exports = {
  monitoringMiddleware,
  getSystemHealth
};
