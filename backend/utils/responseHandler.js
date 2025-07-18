const { HTTP_STATUS, ERROR_MESSAGES, SUCCESS_MESSAGES } = require('../config/constants');
const logger = require('./logger');

class ResponseHandler {
  // Success responses
  static success(res, data = null, message = SUCCESS_MESSAGES.OPERATION_SUCCESS, statusCode = HTTP_STATUS.OK) {
    const response = {
      success: true,
      message,
      ...(data && { data }),
      timestamp: new Date().toISOString(),
    };

    logger.info('API Success Response', {
      statusCode,
      message,
      url: res.req?.url,
      method: res.req?.method,
    });

    return res.status(statusCode).json(response);
  }

  static created(res, data = null, message = SUCCESS_MESSAGES.USER_CREATED) {
    return this.success(res, data, message, HTTP_STATUS.CREATED);
  }

  static noContent(res) {
    return res.status(HTTP_STATUS.NO_CONTENT).send();
  }

  // Error responses
  static error(res, message = ERROR_MESSAGES.SERVER_ERROR, statusCode = HTTP_STATUS.INTERNAL_SERVER_ERROR, error = null) {
    const response = {
      success: false,
      message,
      timestamp: new Date().toISOString(),
      ...(process.env.NODE_ENV === 'development' && error && { error: error.stack }),
    };

    logger.error('API Error Response', error, {
      statusCode,
      message,
      url: res.req?.url,
      method: res.req?.method,
    });

    return res.status(statusCode).json(response);
  }

  static badRequest(res, message = ERROR_MESSAGES.VALIDATION_ERROR, error = null) {
    return this.error(res, message, HTTP_STATUS.BAD_REQUEST, error);
  }

  static unauthorized(res, message = ERROR_MESSAGES.UNAUTHORIZED, error = null) {
    return this.error(res, message, HTTP_STATUS.UNAUTHORIZED, error);
  }

  static forbidden(res, message = ERROR_MESSAGES.FORBIDDEN, error = null) {
    return this.error(res, message, HTTP_STATUS.FORBIDDEN, error);
  }

  static notFound(res, message = ERROR_MESSAGES.NOT_FOUND, error = null) {
    return this.error(res, message, HTTP_STATUS.NOT_FOUND, error);
  }

  static conflict(res, message = ERROR_MESSAGES.DUPLICATE_ENTRY, error = null) {
    return this.error(res, message, HTTP_STATUS.CONFLICT, error);
  }

  static tooManyRequests(res, message = ERROR_MESSAGES.RATE_LIMIT_EXCEEDED, error = null) {
    return this.error(res, message, HTTP_STATUS.TOO_MANY_REQUESTS, error);
  }

  static unprocessableEntity(res, message = ERROR_MESSAGES.VALIDATION_ERROR, error = null) {
    return this.error(res, message, HTTP_STATUS.UNPROCESSABLE_ENTITY, error);
  }

  // Pagination response
  static paginated(res, data, pagination, message = SUCCESS_MESSAGES.OPERATION_SUCCESS) {
    const response = {
      success: true,
      message,
      data,
      pagination: {
        currentPage: pagination.currentPage || 1,
        totalPages: pagination.totalPages || 1,
        totalItems: pagination.totalItems || 0,
        itemsPerPage: pagination.itemsPerPage || 20,
        hasNextPage: pagination.hasNextPage || false,
        hasPrevPage: pagination.hasPrevPage || false,
      },
      timestamp: new Date().toISOString(),
    };

    logger.info('API Paginated Response', {
      statusCode: HTTP_STATUS.OK,
      message,
      url: res.req?.url,
      method: res.req?.method,
      totalItems: pagination.totalItems,
      currentPage: pagination.currentPage,
    });

    return res.status(HTTP_STATUS.OK).json(response);
  }

  // File response
  static file(res, filePath, fileName = null) {
    logger.info('API File Response', {
      statusCode: HTTP_STATUS.OK,
      url: res.req?.url,
      method: res.req?.method,
      fileName,
    });

    if (fileName) {
      res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    }
    return res.sendFile(filePath);
  }

  // Stream response
  static stream(res, stream, fileName = null) {
    logger.info('API Stream Response', {
      statusCode: HTTP_STATUS.OK,
      url: res.req?.url,
      method: res.req?.method,
      fileName,
    });

    if (fileName) {
      res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    }
    return stream.pipe(res);
  }

  // Health check response
  static health(res, status, details = {}) {
    const response = {
      status,
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV,
      version: process.env.npm_package_version || '1.0.0',
      ...details,
    };

    const statusCode = status === 'healthy' ? HTTP_STATUS.OK : HTTP_STATUS.SERVICE_UNAVAILABLE;

    return res.status(statusCode).json(response);
  }
}

module.exports = ResponseHandler; 