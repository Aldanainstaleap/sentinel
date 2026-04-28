import { Router } from 'express'
import { GatewayController } from '../../controllers/gateway.controller'

const router = Router()

router.use('/:service', (req, res, next) => {
  const gatewayController = new GatewayController(res.locals.processId)
  void gatewayController.handleRequest(req, res, next)
})

export default router
