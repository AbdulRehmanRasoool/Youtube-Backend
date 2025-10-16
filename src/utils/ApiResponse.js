class ApiResponse { 
    constructor(success, statusCode, message, data = null, errors = []) {
        this.success = success;
        this.statusCode = statusCode;
        this.message = message;
        this.data = data;
        this.errors = errors;
    }
}

export { ApiResponse }