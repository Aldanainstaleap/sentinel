import { describe, it, expect, vi } from 'vitest'
import { SecretsService } from '../../src/services/secrets.service'
import { ConfigService } from '@mercadoni/instaleap-utils'

// Mock AWS SDK
vi.mock('@aws-sdk/client-secrets-manager', () => ({
  SecretsManagerClient: vi.fn().mockImplementation(() => ({
    send: vi.fn()
  })),
  GetSecretValueCommand: vi.fn().mockImplementation((params) => params)
}))

describe('secrets.service', () => {
  it('should be a singleton', () => {
    const mockConfigService = {
      getConfig: vi.fn().mockReturnValue({
        ENVIRONMENT: 'local',
        AWS_CONFIG: { region: 'us-east-1' }
      })
    } as unknown as ConfigService<any>

    const instance1 = SecretsService.getInstance({ configService: mockConfigService })
    const instance2 = SecretsService.getInstance({ configService: mockConfigService })

    expect(instance1).toBe(instance2)
  })
})
