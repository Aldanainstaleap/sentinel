import { AccessNotPermittedError } from '../../errors/auth.errors'
import { NextFunction, Request, Response } from 'express'

/**
 * Middleaware to handllig all errors in the process of authenticate
 * @param error The captured error in the process of autenticate
 * @param req Express request object
 * @param res Express response object
 * @param next Executes the middleware succeeding the current middleware
 */
export const oauthErrorHandlerMiddleware = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (err) {
    const error =
      err.name === 'UnauthorizedError'
        ? new AccessNotPermittedError(err.message, req.originalUrl)
        : err
    next(error)
  } else {
    next()
  }
}
