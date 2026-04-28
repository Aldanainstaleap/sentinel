import { describe, it, expect, vi } from 'vitest'
import { GatewayService } from '../../src/services/gateway.service'
import { PrivacyService } from '../../src/services/privacy.service'
import { GatewayError } from '../../src/errors/gateway.errors'
import type { GlobalConfiguration } from '../../src/interfaces/configurations.interfaces'

const mockConfig: GlobalConfiguration = {
  PORT: 3000,
  ENVIRONMENT: 'local',
  SERVICE_NAME: 'sentinel-service',
  AUTH_CONFIG: { authType: 'OAUTH2.0', oauthConfig: { clientId: '', domain: '', audience: '', userEmailNameProperty: '' }, apidocsUsers: {} },
  CORS_CONFIG: { domainsWhiteList: ['*'] },
  AWS_CONFIG: { region: 'us-east-1' },
  GATEWAY_CONFIG: {
    nexus: { headerName: 'Authorization', baseUrl: 'https://nexus.test.io' },
    antman: { headerName: 'Authorization', baseUrl: 'https://antman.test.io' },
    redbook: { headerName: 'x-api-key', baseUrl: 'https://redbook.test.io' }
  },
  EXTERNAL_SERVICES_CONFIG: { auth0: {} }
}

const mockPrivacyService = {
  getServiceToken: vi.fn().mockResolvedValue('Bearer mock-token')
} as unknown as PrivacyService

describe('gateway.service', () => {
  it('should throw GatewayError for unconfigured service', async () => {
    const service = new GatewayService('test-process', mockConfig, mockPrivacyService)

    await expect(service.performRequest({
      url: '/test',
      method: 'GET',
      headers: {},
      body: {},
      params: { serviceName: 'unknown-service' }
    })).rejects.toThrow(GatewayError)
  })

  it('should throw GatewayError for PASSTHROUGH without authorization', async () => {
    const service = new GatewayService('test-process', mockConfig, mockPrivacyService)

    await expect(service.performRequest({
      url: '/test',
      method: 'GET',
      headers: {},
      body: {},
      params: { serviceName: 'antman' }
    })).rejects.toThrow(GatewayError)
  })

  it('should throw GatewayError for REBUILD_JWT without bearer token', async () => {
    const service = new GatewayService('test-process', mockConfig, mockPrivacyService)

    await expect(service.performRequest({
      url: '/test',
      method: 'GET',
      headers: {},
      body: {},
      params: { serviceName: 'nexus' }
    })).rejects.toThrow(GatewayError)
  })
})
