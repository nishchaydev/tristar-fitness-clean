const winston = require('winston');

// Simple logger configuration
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.printf(({ timestamp, level, message }) => {
      return `${timestamp} ${level}: ${message}`;
    })
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    })
  ],
  exitOnError: false
});

// Create a stream object for Morgan
logger.stream = {
  write: (message) => {
    logger.info(message.trim());
  }
};

// Helper methods
logger.logAPI = (req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.info(`${req.method} ${req.originalUrl} - ${res.statusCode} - ${duration}ms`);
  });
  
  next();
};

logger.logError = (error, req = null, additionalInfo = {}) => {
  logger.error(`Error: ${error.message}`, { stack: error.stack, ...additionalInfo });
};

logger.logSecurity = (event, details) => {
  logger.warn(`Security Event: ${event}`, details);
};

logger.logPerformance = (operation, duration, metadata = {}) => {
  logger.info(`Performance: ${operation} - ${duration}ms`, metadata);
};

module.exports = logger;