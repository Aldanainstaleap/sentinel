/**
 * This file contains the mapping of service names to their respective authentication strategies.
 * @field REBUILD_JWT: This strategy rebuilds the JWT for the user to access the service.
 * @field PASSTHROUGH: This strategy allows the request to pass through without modifying the JWT.
 * @field SERVICE_TOKEN: This strategy uses a service token for authentication.
 */
export enum ServiceAuthStrategy {
  REBUILD_JWT = 'REBUILD_JWT',
  PASSTHROUGH = 'PASSTHROUGH',
  SERVICE_TOKEN = 'SERVICE_TOKEN'
}

export interface ServiceMapping {
  authStrategy: ServiceAuthStrategy
}

/**
 * This object maps service names to their authentication strategies.
 * Each service can have a different strategy based on its requirements.
 * Services not explicitly listed default to SERVICE_TOKEN.
 */
export const SERVICE_CONFIG: Record<string, ServiceMapping> = {
  nexus: { authStrategy: ServiceAuthStrategy.REBUILD_JWT },
  lola: { authStrategy: ServiceAuthStrategy.REBUILD_JWT },
  kingpin: { authStrategy: ServiceAuthStrategy.REBUILD_JWT },
  tesseract: { authStrategy: ServiceAuthStrategy.PASSTHROUGH },
  antman: { authStrategy: ServiceAuthStrategy.PASSTHROUGH },
  deadpool: { authStrategy: ServiceAuthStrategy.PASSTHROUGH },
  cerberus: { authStrategy: ServiceAuthStrategy.PASSTHROUGH }
}
