import { ErrorCategory } from '@mercadoni/instaleap-utils'
import { HttpErrorMapping } from '../interfaces/error.interfaces'

/**
 * Maps error categories to their corresponding HTTP status codes and logging levels
 */
export const httpErrorMapping: {
  [category: string]: HttpErrorMapping
} = {
  [ErrorCategory.VALIDATION]: {
    statusCode: 400,
    level: 'warn'
  },
  [ErrorCategory.NOT_FOUND]: {
    statusCode: 404,
    level: 'info'
  },
  [ErrorCategory.CONFLICT]: {
    statusCode: 409,
    level: 'warn'
  },
  [ErrorCategory.AUTHENTICATION]: {
    statusCode: 401,
    level: 'warn'
  },
  [ErrorCategory.AUTHORIZATION]: {
    statusCode: 403,
    level: 'warn'
  },
  [ErrorCategory.DEPENDENCY_FAILURE]: {
    statusCode: 502, // Bad Gateway
    level: 'error'
  },
  [ErrorCategory.INFRASTRUCTURE_FAILURE]: {
    statusCode: 500,
    level: 'error'
  },
  [ErrorCategory.TIMEOUT]: {
    statusCode: 504, // Gateway Timeout
    level: 'error'
  },
  [ErrorCategory.RESOURCE_EXHAUSTED]: {
    statusCode: 429, // Too Many Requests
    level: 'warn'
  },
  [ErrorCategory.CONFIGURATION_ERROR]: {
    statusCode: 400,
    level: 'error'
  },
  [ErrorCategory.INTERNAL_ERROR]: {
    statusCode: 500,
    level: 'error'
  }
}
