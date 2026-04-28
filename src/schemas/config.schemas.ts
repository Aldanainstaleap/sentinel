import { JSONSchemaType } from 'ajv'
import { GlobalConfiguration } from '../interfaces/configurations.interfaces'

export const globalConfigurationSchema: JSONSchemaType<GlobalConfiguration> = {
  type: 'object',
  additionalProperties: true,
  properties: {
    PORT: { type: 'number', 'x-source': 'system' } as any,
    ENVIRONMENT: { type: 'string', 'x-source': 'system' },
    SERVICE_NAME: { type: 'string', 'x-source': 'system' },
    AUTH_CONFIG: { type: 'object' } as any,
    CORS_CONFIG: { type: 'object' } as any,
    AWS_CONFIG: { type: 'object' } as any,
    GATEWAY_CONFIG: { type: 'object' } as any,
    EXTERNAL_SERVICES_CONFIG: { type: 'object' } as any,
    TENANTS_CONFIG: { type: 'object' } as any,
    AWS_SECRETS_CONFIG: { type: 'object' } as any
  },
  required: ['PORT', 'ENVIRONMENT', 'SERVICE_NAME', 'AUTH_CONFIG', 'CORS_CONFIG', 'AWS_CONFIG', 'GATEWAY_CONFIG', 'EXTERNAL_SERVICES_CONFIG']
} as any
