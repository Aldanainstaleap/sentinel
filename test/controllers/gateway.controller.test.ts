import { describe, it, expect, vi } from 'vitest'
import { GatewayController } from '../../src/controllers/gateway.controller'
import type { Request, Response, NextFunction } from 'express'

// Mock the services module
vi.mock('../../src/app', () => ({
  services: {
    configService: {
      getConfig: vi.fn().mockReturnValue({
        PORT: 3000,
        ENVIRONMENT: 'local',
        SERVICE_NAME: 'sentinel-service',
        AUTH_CONFIG: { authType: 'NONE', oauthConfig: { clientId: '', domain: '', audience: '', userEmailNameProperty: '' }, apidocsUsers: {} },
        CORS_CONFIG: { domainsWhiteList: ['*'] },
        AWS_CONFIG: { region: 'us-east-1' },
        GATEWAY_CONFIG: {},
        EXTERNAL_SERVICES_CONFIG: { auth0: {} }
      })
    },
    secretsService: {}
  }
}))

describe('gateway.controller', () => {
  it('should handle OPTIONS request', async () => {
    const controller = new GatewayController('test-process-id')
    const req = { method: 'OPTIONS', url: '/test', headers: {}, body: {}, params: { service: 'nexus' }, query: {} } as unknown as Request
    const res = { status: vi.fn().mockReturnThis(), send: vi.fn() } as unknown as Response
    const next = vi.fn() as NextFunction

    await controller.handleRequest(req, res, next)

    expect(res.status).toHaveBeenCalledWith(200)
    expect(res.send).toHaveBeenCalledWith('Ok')
  })
})
