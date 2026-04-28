import cors from 'cors'
import express, { Router } from 'express'
import healthRouter from './health.routes'
import gatewayRouter from './gateway.route'
import swaggerSetup from '../../docs/swagger'
import swaggerUi from 'swagger-ui-express'
import { errorHandlerMiddleware } from '../middlewares/error-handler.middleware'
import { getCheckJwtMiddleware } from '../middlewares/oauth.middleware'
import { GlobalConfiguration } from '../../interfaces/configurations.interfaces'
import { oauthErrorHandlerMiddleware } from '../middlewares/oauth-error-handling.middleware'
import { services } from '../../app'

export function createRouter(): express.Router {
  const router: Router = express.Router()
  const config: GlobalConfiguration = services.configService.getConfig()

  const origin = config.CORS_CONFIG.domainsWhiteList[0] === '*' ? '*' : config.CORS_CONFIG.domainsWhiteList
  router.use(cors({ origin, preflightContinue: true }))

  router.use('/health', healthRouter)
  
  router.all('/', (_req: express.Request, res: express.Response) => {
    res.status(200).json({ mensaje: 'Welcome to Sentinel Gateway!' })
  })

  router.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSetup))

  if (config.AUTH_CONFIG.authType === 'OAUTH2.0') {
    router.use(getCheckJwtMiddleware())
    router.use(oauthErrorHandlerMiddleware)
  }

  // Gateway route should be at the end or handle specifically
  router.use('/gateway', gatewayRouter)

  router.use(errorHandlerMiddleware)
  return router
}
