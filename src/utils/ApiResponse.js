/**
 * Standard API Response class
 */
class ApiResponse {
  /**
   * Create a success response
   * @param {Object} data - Response data
   * @param {string} message - Success message
   * @param {number} statusCode - HTTP status code
   * @returns {Object} Formatted response object
   */
  static success(data = null, message = "Success", statusCode = 200) {
    return {
      success: true,
      message,
      data,
      statusCode,
    };
  }

  /**
   * Create an error response
   * @param {string} message - Error message
   * @param {number} statusCode - HTTP status code
   * @param {Object} errors - Additional error details
   * @returns {Object} Formatted error response object
   */
  static error(message = "Error", statusCode = 500, errors = null) {
    return {
      success: false,
      message,
      errors,
      statusCode,
    };
  }
}

export default ApiResponse;