/**
 * Custom API Error class
 */
class ApiError extends Error {
  /**
   * Create a new API Error
   * @param {number} statusCode - HTTP status code
   * @param {string} message - Error message
   * @param {Object} errors - Additional error details
   */
  constructor(statusCode, message, errors = null) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
    this.success = false;
  }
}

export default ApiError;