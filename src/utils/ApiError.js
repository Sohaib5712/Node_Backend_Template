class ApiError extends Error {
  constructor(statusCode, message, errors = null, errorCode = null) {
    super(message);

    this.statusCode = statusCode;
    this.errors = errors;
    this.errorCode = errorCode;
    this.success = false;

    // Helpful to distinguish expected errors vs bugs
    this.isOperational = true;

    Error.captureStackTrace?.(this, this.constructor);
  }
}

export default ApiError;
