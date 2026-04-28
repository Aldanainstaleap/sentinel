import { describe, it, expect, vi } from 'vitest'
import { PrivacyService } from '../../src/services/privacy.service'
import { SecretsService } from '../../src/services/secrets.service'
import { ServiceTokenError } from '../../src/errors/gateway.errors'
import type { GlobalConfiguration } from '../../src/interfaces/configurations.interfaces'

const mockConfig: GlobalConfiguration = {
  PORT: 3000,
  ENVIRONMENT: 'local',
  SERVICE_NAME: 'sentinel-service',
  AUTH_CONFIG: { authType: 'OAUTH2.0', oauthConfig: { clientId: '', domain: '', audience: '', userEmailNameProperty: '' }, apidocsUsers: {} },
  CORS_CONFIG: { domainsWhiteList: ['*'] },
  AWS_CONFIG: { region: 'us-east-1' },
  GATEWAY_CONFIG: {
    nebula: { headerName: 'Authorization', baseUrl: 'https://nebula.test.io', secret: 'test/nebula/secret' },
    dormammu: { headerName: 'Authorization', baseUrl: 'https://dormammu.test.io', apiToken: 'test-token' }
  },
  EXTERNAL_SERVICES_CONFIG: { auth0: {} }
}

const mockSecretsService = {
  retrieveSecret: vi.fn().mockResolvedValue('mock-secret-value')
} as unknown as SecretsService

describe('privacy.service', () => {
  it('should return dormammu apiToken', async () => {
    const service = new PrivacyService(mockConfig, mockSecretsService)
    const token = await service.getServiceToken('dormammu')
    expect(token).toBe('Bearer test-token')
  })

  it('should throw ServiceTokenError for redbook without clientId', async () => {
    const service = new PrivacyService(mockConfig, mockSecretsService)
    await expect(service.getServiceToken('redbook')).rejects.toThrow(ServiceTokenError)
  })

  it('should throw ServiceTokenError for bifrost without clientId', async () => {
    const service = new PrivacyService(mockConfig, mockSecretsService)
    await expect(service.getServiceToken('bifrost')).rejects.toThrow(ServiceTokenError)
  })

  it('should retrieve nebula token from secret', async () => {
    const service = new PrivacyService(mockConfig, mockSecretsService)
    const token = await service.getServiceToken('nebula')
    expect(token).toBe('Bearer mock-secret-value')
    expect(mockSecretsService.retrieveSecret).toHaveBeenCalledWith('test/nebula/secret', false)
  })
})
