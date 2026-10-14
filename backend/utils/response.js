/**
 * Response Utilities
 * Standardized response format for API
 */

const sendSuccess = (res, statusCode, data, message = "Success") => {
  res.status(statusCode).json({
    success: true,
    message,
    data,
    timestamp: new Date().toISOString(),
  });
};

const sendError = (res, statusCode, message, errors = null) => {
  // In production, do not leak internal database or server error details on 500s
  const sanitizedErrors =
    process.env.NODE_ENV === "production" && statusCode >= 500
      ? null
      : errors;

  res.status(statusCode).json({
    success: false,
    message,
    errors: sanitizedErrors,
    timestamp: new Date().toISOString(),
  });
};

const sendPaginated = (
  res,
  statusCode,
  data,
  pagination,
  message = "Success",
) => {
  res.status(statusCode).json({
    success: true,
    message,
    data,
    pagination,
    timestamp: new Date().toISOString(),
  });
};

module.exports = {
  sendSuccess,
  sendError,
  sendPaginated,
};
