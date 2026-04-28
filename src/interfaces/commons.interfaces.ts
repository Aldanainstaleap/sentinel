import { ConfigService } from '@mercadoni/instaleap-utils'
import { GlobalConfiguration } from './configurations.interfaces'
import { SecretsService } from '../services/secrets.service'

export interface Services {
  configService: ConfigService<GlobalConfiguration>
  secretsService: SecretsService
}

export interface Loader {
  serviceName: string
  load: () => Promise<any>
}

export type SecretValue = string | number | boolean | object

export interface ServiceParams {
  configService: ConfigService<GlobalConfiguration>
}
