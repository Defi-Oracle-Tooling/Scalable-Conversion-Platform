/**
 * Async handler middleware
 * Wraps async route handlers to catch errors and pass them to the error handler
 * Eliminates the need for try/catch blocks in route handlers
 */
const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

module.exports = asyncHandler;
