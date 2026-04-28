import { describe, it, expect } from 'vitest'
import { globalConfigurationSchema } from '../../src/schemas/config.schemas'
import Ajv from 'ajv'

const ajv = new Ajv({ strict: false })

describe('config.schemas', () => {
  it('should validate a correct configuration', () => {
    const validConfig = {
      PORT: 3000,
      ENVIRONMENT: 'local',
      SERVICE_NAME: 'sentinel-service',
      AUTH_CONFIG: { authType: 'OAUTH2.0', oauthConfig: {}, apidocsUsers: {} },
      CORS_CONFIG: { domainsWhiteList: ['*'] },
      AWS_CONFIG: { region: 'us-east-1' },
      GATEWAY_CONFIG: {},
      EXTERNAL_SERVICES_CONFIG: { auth0: {} }
    }

    const validate = ajv.compile(globalConfigurationSchema)
    const valid = validate(validConfig)
    expect(valid).toBe(true)
  })

  it('should invalidate a configuration missing required fields', () => {
    const invalidConfig = {
      PORT: 3000
    }

    const validate = ajv.compile(globalConfigurationSchema)
    const valid = validate(invalidConfig)
    expect(valid).toBe(false)
    expect(validate.errors).toBeDefined()
  })
})
