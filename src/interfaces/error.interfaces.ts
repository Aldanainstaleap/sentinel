import { DetailsErrors } from '@mercadoni/instaleap-utils'

/**
 * Interface defining HTTP error mapping properties.
 * @field statusCode - HTTP status code to be returned in the response. I.e, 404, 500.
 * @field level - Logging level for the error. I.e, 'info', 'warn', 'error'
 */
export interface HttpErrorMapping {
  statusCode: number
  level: 'info' | 'warn' | 'error'
}

/**
 * Represents error log details, including error identification, category, and request context.
 * @field errorId - Unique identifier for the error. I.e, "err-12345".
 * @field category - Category of the error. I.e, "DatabaseError".
 * @field message - Description of the error. I.e, "Connection timeout".
 * @field code - Application-specific error code. I.e, 1001.
 * @field statusCode - HTTP status code related to the error. I.e, 500.
 * @field details - Additional details about the error. I.e, {
 *   stack: 'Error: Connection timeout at ...',
 *   timestamp: '2023-01-01T00:00:00Z'
 * }
 * @field url - URL where the error occurred. I.e, "/api/users".
 * @field method - HTTP method used in the request. I.e, "GET".
 * @field userAgent - User agent string of the client. I.e, "Mozilla/5.0".
 */
export interface ErrorLogData {
  errorId: string
  category: string
  message: string
  code: number
  statusCode: number
  details: DetailsErrors
  url: string
  method: string
  userAgent: string
}
