import { BaseController } from './base.controller'
import { GatewayService } from '../services/gateway.service'
import { PrivacyService } from '../services/privacy.service'
import { GatewayRequest } from '../interfaces/gateway.interface'
import { HttpMethod } from '@mercadoni/instaleap-utils'
import { Request, Response, NextFunction } from 'express'
import { services } from '../app'

export class GatewayController extends BaseController {
  private readonly gatewayService: GatewayService

  constructor(processId: string) {
    super(processId)
    const privacyService = new PrivacyService(this.getConfig, services.secretsService)
    this.gatewayService = new GatewayService(this.processId, this.getConfig, privacyService)
  }

  public handleRequest = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (req.method === 'OPTIONS') {
        res.status(200).send('Ok')
        return
      }

      const gatewayRequest: GatewayRequest = {
        url: req.url,
        method: req.method as HttpMethod,
        headers: req.headers,
        body: req.body,
        params: {
          serviceName: (req.params.service as string) ?? '',
          clientId: req.query.clientId ? String(req.query.clientId) : undefined
        }
      }

      const responseData = await this.gatewayService.performRequest(gatewayRequest)
      res.status(responseData.statusCode).send(responseData.data)
    } catch (error) {
      next(error)
    }
  }
}
