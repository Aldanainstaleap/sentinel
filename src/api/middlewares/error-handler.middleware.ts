import logger from '@mercadoni/elementals/logger'
import {
  ErrorLogData,
  HttpErrorMapping
} from '../../interfaces/error.interfaces'
import { httpErrorMapping } from '../../mappings/error.maps'
import { BaseError, ErrorCategory } from '@mercadoni/instaleap-utils'
import { NextFunction, Request, Response } from 'express'
import { v4 as uuidv4 } from 'uuid'

/**
 * Helper function to safely serialize objects with circular references.
 * Creates a deep copy while replacing circular references with a placeholder string.
 * @param obj - The object to serialize. I.e, {
 *    key: 'value'
 * }
 * @returns A JSON-safe version of the object. I.e, {
 *    key: 'value'
 * }
 */
function safeJsonStringify<T extends Record<string, any>>(obj: T): T {
  const seen: WeakSet<WeakKey> = new WeakSet()
  return JSON.parse(
    JSON.stringify(obj, (key, value) => {
      if (typeof value === 'object' && value !== null) {
        if (seen.has(value)) {
          return '[Circular Reference]'
        }
        seen.add(value)
      }
      return value
    })
  )
}

/**
 * This middleware handles errors in the application by logging relevant details and sending an appropriate response.
 * If the error is an instance of `BaseError`, its properties are used; otherwise, a generic error message is returned.
 * @param err - The error encountered during request processing. I.e, a `BaseError` or an unknown error.
 * @param req - The Express request object.
 * @param res - The Express response object.
 * @param next - The next middleware function in the Express pipeline.
 */
export const errorHandlerMiddleware = (
  err: any,
  req: Request,
  res: Response,
  // The line that ignores the ESLint error is added because `next` is internally used when rendering errors.
  // If removed, errors are not displayed correctly.
  next: NextFunction
): void => {
  let category: string = ErrorCategory.INTERNAL_ERROR
  let message: string
  let code: number = 1000
  let details: any = null
  let userDetails: any = null
  const errorId: string = uuidv4()

  if (err instanceof BaseError) {
    category = err.category
    message = err.message
    code = err.code
    details = err.details
    userDetails = err.userDetails ?? null
  } else {
    message = `Uncaught exception: ${err.message ?? 'Unknown error'}`
    const safeErrorProps: Record<string, any> = {}
    if (typeof err === 'object' && err !== null) {
      for (const key of Object.keys(err)) {
        try {
          JSON.stringify(err[key])
          safeErrorProps[key] = err[key]
        } catch {
          safeErrorProps[key] = '[Circular Reference]'
        }
      }
    }
    details = {
      stack: err.stack,
      ...safeErrorProps
    }
  }

  const httpMapping: HttpErrorMapping =
    httpErrorMapping[category] || httpErrorMapping[ErrorCategory.INTERNAL_ERROR]

  const logData: ErrorLogData = {
    errorId,
    category,
    message,
    code,
    statusCode: httpMapping.statusCode,
    details,
    url: req.originalUrl,
    method: req.method,
    userAgent: req.get('User-Agent') ?? 'none'
  }

  switch (httpMapping.level) {
    case 'info':
      logger('error').info(`[${errorId}] ${message}`, logData)
      break
    case 'warn':
      logger('error').info(`[${errorId}] WARN: ${message}`, logData)
      break
    case 'error':
    default:
      logger('error').error(`[${errorId}] ${message}`, logData, err)
  }

  // Safely serialize the response to handle circular references
  const safeResponse: Partial<ErrorLogData> = safeJsonStringify({
    category,
    message,
    code,
    details: userDetails,
    errorId
  })

  res.status(httpMapping.statusCode).json(safeResponse)
}
