import { config as loadDotenv, DotenvConfigOutput } from 'dotenv'
import {
  AWSConfiguration,
  ConfigService,
  ConfigServiceParams
} from '@mercadoni/instaleap-utils'
import { GlobalConfiguration } from '../interfaces/configurations.interfaces'
import { globalConfigurationSchema } from '../schemas/config.schemas'
import { SecretsService } from '../services/secrets.service'
import { Services } from '../interfaces/commons.interfaces'
const dotenvResult: DotenvConfigOutput = loadDotenv()

class MockConfigService {
  private config: GlobalConfiguration
  
  constructor(config: GlobalConfiguration) {
    this.config = config
  }

  getConfig(): GlobalConfiguration {
    return this.config
  }
}

export async function load(): Promise<Services> {
  const serviceName: string = process.env.SERVICE_NAME as string
  const environment: string = process.env.ENVIRONMENT as string
  const awsConfig: AWSConfiguration = JSON.parse(process.env.AWS_CONFIG || '{}')

  const systemVars: GlobalConfiguration =
    environment === 'local'
      ? (dotenvResult.parsed as unknown as GlobalConfiguration)
      : (process.env as unknown as GlobalConfiguration)

  const configServiceParams: ConfigServiceParams<GlobalConfiguration> = {
    serviceName,
    environment,
    schema: globalConfigurationSchema as any,
    awsConfig,
    systemVars
  } as any

  try {
    await ConfigService.initialize<GlobalConfiguration>(configServiceParams)
  } catch (error) {
    console.warn('Failed to initialize ConfigService (Redis connection?), falling back to local env vars:', error.message)
  }

  let configService: ConfigService<GlobalConfiguration>
  try {
    configService = ConfigService.getInstance<GlobalConfiguration>()
  } catch {
    console.warn('Using MockConfigService because ConfigService is not initialized.')
    
    // Manual parsing of environment variables for the mock
    const parsedVars: any = { ...systemVars }
    for (const key in parsedVars) {
      const value = parsedVars[key]
      if (typeof value === 'string' && (value.trim().startsWith('{') || value.trim().startsWith('['))) {
        try {
          parsedVars[key] = JSON.parse(value)
        } catch (e) {
          console.warn(`[MockConfigService] Failed to parse env var ${key} as JSON:`, e.message)
        }
      }
    }
    
    
    configService = new MockConfigService(parsedVars as GlobalConfiguration) as any
  }

  const services: Services = {
    configService,
    secretsService: SecretsService.getInstance({ configService })
  }
  return services
}
