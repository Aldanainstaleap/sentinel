import cache from 'memory-cache'
import lodash from 'lodash'
import { Auth0Service } from './auth0.service'
import { GlobalConfiguration } from '../interfaces/configurations.interfaces'
import { SecretsService } from './secrets.service'
import { HttpHandler, ResponseData } from '@mercadoni/instaleap-utils'
import { RedbookTenantsConfig, RedbookTenantsData } from '../interfaces/redbook.interfaces'
import { ServiceTokenError } from '../errors/gateway.errors'

const CACHE_DURATION_MS = 1800000 // 30 minutes

export class PrivacyService {
  private readonly config: GlobalConfiguration
  private readonly secretsService: SecretsService

  constructor(config: GlobalConfiguration, secretsService: SecretsService) {
    this.config = config
    this.secretsService = secretsService
  }

  /**
   * Retrieves the Nebula token from AWS Secrets Manager.
   * @returns The Nebula token with Bearer prefix. I.e, 'Bearer asf21wq5f1a50w1fa635f4ew'
   */
  public async getNebulaToken(): Promise<string> {
    const nebulaConfig = this.config.GATEWAY_CONFIG.nebula
    const cacheKey = nebulaConfig?.secret ?? 'nebula-token'
    const cachedToken = cache.get(cacheKey)
    if (cachedToken) {
      return cachedToken
    }

    const apiToken = nebulaConfig?.apiToken
    if (apiToken) {
      const token = `Bearer ${apiToken}`
      cache.put(cacheKey, token, CACHE_DURATION_MS)
      return token
    }

    const secretName = nebulaConfig?.secret
    if (!secretName) {
      throw new ServiceTokenError('Nebula secret name not configured.')
    }

    const secret = await this.secretsService.retrieveSecret<string>(secretName, false)
    const token = `Bearer ${secret}`
    cache.put(cacheKey, token, CACHE_DURATION_MS)
    return token
  }

  /**
   * Retrieves Bifrost client token from AWS Secrets Manager.
   * @param clientId - Client ID. I.e, 'BODEGA_AURRERA'
   * @returns The client token. I.e, 'zw6sWNYjwEXAMPLE9V2nsS29TqG4yx9ziySjGJc'
   */
  public async getBifrostClientToken(clientId: string): Promise<string> {
    const cachedClientToken = cache.get(`bifrost-${clientId}`)
    if (cachedClientToken) {
      return cachedClientToken
    }

    const secretName = this.config.AWS_SECRETS_CONFIG?.clientTokensSecretName
    if (!secretName) {
      throw new ServiceTokenError('AWS clientTokensSecretName not configured for Bifrost.')
    }

    const bifrostApiTokens = await this.secretsService.retrieveSecret<Record<string, string>>(secretName)
    const bifrostTokens = lodash.invert(bifrostApiTokens)
    const clientToken = bifrostTokens[clientId]

    if (!clientToken) {
      throw new ServiceTokenError(`No Bifrost token found for client: ${clientId}`)
    }

    cache.put(`bifrost-${clientId}`, clientToken, CACHE_DURATION_MS)
    return clientToken
  }

  /**
   * Retrieves Redbook tenant data from the Redbook tenants API.
   * @param clientId - Optional client ID to filter tenants. I.e, 'COULSON'
   * @returns Array of tenant data.
   */
  public async getRedbookTenantsData(clientId?: string): Promise<RedbookTenantsData[]> {
    const tenantsConfig: RedbookTenantsConfig | undefined = this.config.TENANTS_CONFIG
    if (!tenantsConfig) {
      throw new ServiceTokenError('TENANTS_CONFIG not configured for Redbook.')
    }

    const environment = this.config.ENVIRONMENT === 'vormir' ? 'xandar' : this.config.ENVIRONMENT
    const envConfig = tenantsConfig.environments[environment]

    if (!envConfig?.baseUrl) {
      throw new ServiceTokenError(`Environment ${environment} is not supported for Redbook tenants.`)
    }

    let requestUrl = envConfig.baseUrl + tenantsConfig.tenantsBaseUrl
    if (clientId) {
      requestUrl += `&clientName=${clientId}`
    }

    const httpHandler = new HttpHandler(requestUrl, {
      'x-api-key': envConfig.token
    })

    const response: ResponseData = await httpHandler.get()
    if (response.statusCode !== 200 || !response.data?.tenantss?.length) {
      throw new ServiceTokenError(
        `Failed to retrieve Redbook tenants. Status: ${response.statusCode}`,
        { response: response.data }
      )
    }

    return response.data.tenantss
  }

  /**
   * Retrieves Redbook client token for a given client ID.
   * @param clientId - Client ID. I.e, 'OXXO'
   * @returns Client token. I.e, 'byxmNURedsgf5a4f6gwq3e5485gweds2vcq'
   */
  public async getRedbookClientToken(clientId: string): Promise<string> {
    const cachedClientToken = cache.get(`redbook-${clientId}`)
    if (cachedClientToken) {
      return cachedClientToken
    }

    const clientTenantData = (await this.getRedbookTenantsData(clientId))[0]
    const clientTenantToken = clientTenantData?.apiToken
    if (!clientTenantToken) {
      throw new ServiceTokenError(`No Redbook token found for client: ${clientId}`)
    }

    cache.put(`redbook-${clientId}`, clientTenantToken, CACHE_DURATION_MS)
    return clientTenantToken
  }

  /**
   * Retrieves Hawkeye token from AWS Secrets Manager.
   * The secret is a JSON object where keys are tokens and values are client IDs.
   * @param clientId - The client ID. I.e, 'BODEGA_AURRERA'
   * @returns Hawkeye token. I.e, '4J4zyw7geXUJD5NtFuL6ymnmh'
   */
  public async getHawkeyeToken(clientId: string): Promise<string> {
    const hawkeyeSecret = this.config.EXTERNAL_SERVICES_CONFIG?.hawkeye?.secret
    if (!hawkeyeSecret) {
      throw new ServiceTokenError('Hawkeye secret not configured.')
    }

    const environmentMapping: { [key: string]: string } = {
      xandar: 'xandar',
      production: 'production',
      'special-sailfish': 'production'
    }

    const targetEnv = environmentMapping[this.config.ENVIRONMENT] ?? this.config.ENVIRONMENT
    const hawkeyeToken = await this.secretsService.retrieveSecret<Record<string, string>>(hawkeyeSecret)
    const tokens = hawkeyeToken

    for (const [key, value] of Object.entries(tokens)) {
      if (value === clientId) {
        return key
      }
    }

    throw new ServiceTokenError(`No Hawkeye token found for client: ${clientId}`)
  }

  /**
   * Retrieves Nexus token from Auth0.
   * @returns The Nexus token with Bearer prefix.
   */
  public async getNexusToken(): Promise<string> {
    return this.getAuth0Token('nexus')
  }

  /**
   * Retrieves Kingpin token from Auth0.
   * @returns The Kingpin token with Bearer prefix.
   */
  public async getKingpinToken(): Promise<string> {
    return this.getAuth0Token('kingpin')
  }

  /**
   * Retrieves Lola token from Auth0.
   * @returns The Lola token with Bearer prefix.
   */
  public async getLolaToken(): Promise<string> {
    return this.getAuth0Token('lola')
  }

  private async getAuth0Token(serviceName: string): Promise<string> {
    const credentials = this.config.EXTERNAL_SERVICES_CONFIG.auth0[`${serviceName}AccessCredentials`]
    if (!credentials) {
      throw new ServiceTokenError(`Auth0 credentials not configured for service: ${serviceName}`)
    }

    const auth0 = new Auth0Service(credentials)
    const token = await auth0.getAccessToken()
    return `Bearer ${token}`
  }

  /**
   * Retrieves the appropriate service token based on service name and client ID.
   * @param serviceName - Name of the service. I.e, 'redbook'
   * @param clientId - The client ID. I.e, 'OXXO'
   * @returns The service token.
   */
  public async getServiceToken(serviceName: string, clientId: string = ''): Promise<string> {
    switch (serviceName) {
      case 'redbook': {
        if (!clientId.trim()) {
          throw new ServiceTokenError('clientId is required for redbook service token.')
        }
        return this.getRedbookClientToken(clientId)
      }
      case 'bifrost': {
        if (!clientId.trim()) {
          throw new ServiceTokenError('clientId is required for bifrost service token.')
        }
        return this.getBifrostClientToken(clientId)
      }
      case 'nebula':
        return this.getNebulaToken()
      case 'dormammu': {
        const token = this.config.GATEWAY_CONFIG.dormammu?.apiToken
        return token ? `Bearer ${token}` : ''
      }
      case 'nexus':
        return this.getNexusToken()
      case 'kingpin':
        return this.getKingpinToken()
      case 'lola':
        return this.getLolaToken()
      case 'hawkeye': {
        if (!clientId.trim()) {
          throw new ServiceTokenError('clientId is required for hawkeye service token.')
        }
        return this.getHawkeyeToken(clientId)
      }
      default:
        return ''
    }
  }
}
