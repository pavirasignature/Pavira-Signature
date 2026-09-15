/**
 * Structured Logger for backend services
 * Outputs JSON format which is easily ingestible by Datadog, CloudWatch, ELK, etc.
 */
const formatMessage = (level, message, metadata = {}) => {
  const logObj = {
    timestamp: new Date().toISOString(),
    level,
    message,
    ...metadata,
  };
  
  if (metadata.error instanceof Error) {
    logObj.error = {
      message: metadata.error.message,
      stack: metadata.error.stack,
      name: metadata.error.name
    };
  }
  
  return JSON.stringify(logObj);
};

const logger = {
  info: (message, metadata) => {
    console.log(formatMessage("info", message, metadata));
  },
  warn: (message, metadata) => {
    console.warn(formatMessage("warn", message, metadata));
  },
  error: (message, metadata) => {
    console.error(formatMessage("error", message, metadata));
  },
  debug: (message, metadata) => {
    if (process.env.NODE_ENV !== "production") {
      console.debug(formatMessage("debug", message, metadata));
    }
  }
};

module.exports = logger;
