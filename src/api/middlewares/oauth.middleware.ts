import jwksRsa from 'jwks-rsa'
import logger from '@mercadoni/elementals/logger'
import { expressjwt as jwt } from 'express-jwt'
import { GlobalConfiguration } from '../../interfaces/configurations.interfaces'
import { InitializationError } from '../../errors/configuration.errors'
import { RequestHandler } from 'express'
import { services } from '../../app'

// Middleware instance, initialized asynchronously
let checkJwtMiddleware: RequestHandler

export const initializeMiddleware: () => void = () => {
  try {
    const config: GlobalConfiguration = services.configService.getConfig()
    const {
      oauthConfig: { domain, audience }
    } = config.AUTH_CONFIG

    // validate the jwt used in the process of authentication
    checkJwtMiddleware = jwt({
      secret: jwksRsa.expressJwtSecret({
        cache: true,
        rateLimit: true,
        jwksRequestsPerMinute: 5,
        jwksUri: `https://${domain}/.well-known/jwks.json`
      }) as any,
      audience,
      issuer: `https://${domain}/`,
      algorithms: ['RS256']
    })
  } catch (err) {
    logger('InitializationJWTMiddleware').error(
      'Failed to initialize JWT middleware:',
      undefined,
      err
    )
    process.exit(1)
  }
}

/**
 * Returns the initialized JWT middleware. If the middleware has not been initialized yet, it throws an error.
 * @returns The initialized JWT middleware. I.e, { req, res, next } => { ... }
 */
export const getCheckJwtMiddleware: () => RequestHandler =
  (): RequestHandler => {
    if (!checkJwtMiddleware) {
      throw new InitializationError(
        'JWT middleware has not been initialized yet.'
      )
    }
    return checkJwtMiddleware
  }
