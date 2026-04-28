import jwt from 'jsonwebtoken'
import { GatewayRequest } from '../interfaces/gateway.interface'
import { GlobalConfiguration, ManagementApiAccessToken } from '../interfaces/configurations.interfaces'
import { HttpHandler, HttpMethod, ResponseData } from '@mercadoni/instaleap-utils'
import { jwtDecode, JwtPayload } from 'jwt-decode'
import { SERVICE_CONFIG, ServiceAuthStrategy } from '../mappings/gateway.maps'
import { PrivacyService } from './privacy.service'
import { GatewayError } from '../errors/gateway.errors'

export class GatewayService {
  private readonly processId: string
  private readonly config: GlobalConfiguration
  private readonly privacyService: PrivacyService

  constructor(processId: string, config: GlobalConfiguration, privacyService: PrivacyService) {
    this.processId = processId
    this.config = config
    this.privacyService = privacyService
  }

  public async performRequest(req: GatewayRequest): Promise<ResponseData> {
    const { serviceName, clientId = '' } = req.params
    const serviceGateConfig = this.config.GATEWAY_CONFIG[serviceName]

    if (!serviceGateConfig?.baseUrl || !serviceGateConfig.headerName) {
      throw new GatewayError(
        `Service ${serviceName} is not properly configured in GATEWAY_CONFIG.`,
        { serviceName, baseUrl: serviceGateConfig?.baseUrl, headerName: serviceGateConfig?.headerName }
      )
    }

    const authStrategy = SERVICE_CONFIG[serviceName]?.authStrategy ?? ServiceAuthStrategy.SERVICE_TOKEN
    const httpHandler = new HttpHandler(serviceGateConfig.baseUrl)
    const downstreamHeaders = this.cleanHeaders(req.headers)

    await this.applyAuthStrategy(authStrategy, serviceName, clientId, req.headers, downstreamHeaders, serviceGateConfig.headerName)

    let requestBodyArg: string | undefined
    if (req.method !== 'GET') {
      requestBodyArg = req.body && Object.keys(req.body).length > 0 ? JSON.stringify(req.body) : '{}'
    }

    return await httpHandler.request(
      req.url,
      req.method,
      downstreamHeaders,
      requestBodyArg
    )
  }

  private async applyAuthStrategy(
    strategy: ServiceAuthStrategy,
    serviceName: string,
    clientId: string,
    incomingHeaders: Record<string, any>,
    downstreamHeaders: Record<string, any>,
    headerName: string
  ): Promise<void> {
    switch (strategy) {
      case ServiceAuthStrategy.REBUILD_JWT: {
        const authHeader = incomingHeaders.authorization
        if (!authHeader?.toLowerCase().startsWith('bearer ')) {
          throw new GatewayError(`Bearer token is required for service: ${serviceName}`)
        }
        const userToken = authHeader.replace(/bearer /i, '').trim()
        const newUserJWT = this.buildNewJWT(userToken, serviceName)
        downstreamHeaders['X-User-Auth-Token'] = newUserJWT
        downstreamHeaders[headerName] = await this.privacyService.getServiceToken(serviceName, clientId)
        break
      }
      case ServiceAuthStrategy.PASSTHROUGH: {
        if (!incomingHeaders.authorization) {
          throw new GatewayError(`Authorization header is required for ${serviceName}`)
        }
        downstreamHeaders[headerName] = incomingHeaders.authorization
        break
      }
      case ServiceAuthStrategy.SERVICE_TOKEN: {
        downstreamHeaders[headerName] = await this.privacyService.getServiceToken(serviceName, clientId)
        break
      }
    }
  }

  private buildNewJWT(userToken: string, service: string): string {
    const auth0Config = this.config.EXTERNAL_SERVICES_CONFIG?.auth0 || {}
    const credentialsKey = `${service}AccessCredentials`
    const credentials = auth0Config[credentialsKey]

    if (!credentials?.clientSecret) {
      throw new GatewayError(`Auth0 clientSecret not configured for service: ${service}`)
    }

    try {
      const decodedToken = jwtDecode<JwtPayload>(userToken)
      const { exp, iat, nbf, aud, iss, ...payloadToSign } = decodedToken

      return jwt.sign(payloadToSign, credentials.clientSecret, {
        algorithm: 'HS256',
        expiresIn: '5m'
      })
    } catch (error) {
      throw new GatewayError(
        `Failed to build new JWT for service ${service}: ${error instanceof Error ? error.message : String(error)}`,
        { originalError: error }
      )
    }
  }

  private cleanHeaders(headers: Record<string, any>): Record<string, any> {
    const cleaned = { ...headers }
    const toRemove = [
      'connection', 'keep-alive', 'proxy-authenticate', 'proxy-authorization',
      'te', 'trailers', 'transfer-encoding', 'upgrade', 'authorization',
      'host', 'content-length'
    ]
    for (const key in cleaned) {
      if (toRemove.includes(key.toLowerCase())) {
        delete cleaned[key]
      }
    }
    return cleaned
  }
}
