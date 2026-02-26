class ApiResponse {
  static success(data = null, message = "Success") {
    return {
      success: true,
      message,
      data,
    };
  }

  static error(message = "Error", errors = null) {
    return {
      success: false,
      message,
      errors,
    };
  }
}

export default ApiResponse;
