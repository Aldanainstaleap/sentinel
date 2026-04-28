import {
  AwsConfig,
  GlobalConfiguration
} from '../interfaces/configurations.interfaces'
import { ConfigService, createSingleton } from '@mercadoni/instaleap-utils'
import {
  GetSecretValueCommand,
  GetSecretValueCommandOutput,
  SecretsManagerClient,
  SecretsManagerClientConfig
} from '@aws-sdk/client-secrets-manager'
import {
  InitializationError,
  InvalidConfigError
} from '../errors/configuration.errors'
import { ResourceNotFoundError } from '../errors/not-found.error'
import { SecretValue, ServiceParams } from '../interfaces/commons.interfaces'

export class SecretsService extends createSingleton<SecretsService>() {
  private readonly configService: ConfigService<GlobalConfiguration>
  private secretsManagerSDK!: SecretsManagerClient

  /**
   * Initializes the SecretsService singleton using AWS Secrets Manager SDK.
   * This service is responsible for retrieving secrets from AWS Secrets Manager.
   * In local environment, it uses provided credentials if available.
   */
  private constructor(config: ServiceParams) {
    super()
    if (!config?.configService) {
      throw new InitializationError(
        'SecretsService requires an instance of ConfigService for initialization'
      )
    }
    this.configService = config.configService
    this.initializeSecretsManager()
  }

  /**
   * Initializes the AWS Secrets Manager client with the configuration from ConfigService.
   * This method is called during construction and can be called again if credentials need to be refreshed.
   */
  private initializeSecretsManager(): void {
    const awsConfig: AwsConfig = this.configService.getConfig().AWS_CONFIG
    const clientConfig: SecretsManagerClientConfig = {
      region: awsConfig.region
    }

    // If running in local environment and credentials are provided, use them explicitly
    if (
      this.configService.getConfig().ENVIRONMENT === 'local' &&
      awsConfig.credentials
    ) {
      clientConfig.credentials = {
        accessKeyId: awsConfig.credentials.accessKeyId,
        secretAccessKey: awsConfig.credentials.secretAccessKey
      }
    }

    this.secretsManagerSDK = new SecretsManagerClient(clientConfig)
  }

  /**
   * Retrieves a secret from AWS Secrets Manager.
   * * @template T The expected type of the secret value. Can be an object (when parseAsJson=true or default)
   * or string (when parseAsJson=false). I.e:
   *  - For JSON objects: DatabaseConfig, ApiCredentials, etc.
   *  - For strings: string (API keys, tokens, passwords, etc.)
   * @param secretName - The identifier of the secret to retrieve. I.e, 'xandar/example/db_config'.
   * @param parseAsJson - If true, parses as JSON (strict - throws error if invalid). If false, returns raw string. By default is true.
   * @returns A promise that resolves to the parsed secret object of type T. I.e, {
   *  "host": "xandar.example.com",
   *  "username": "asasasa",
   *  "databaseName": 'Nexus',
   *  "password": "password12345",
   * }
   */
  public async retrieveSecret<T = SecretValue>(
    secretName: string,
    parseAsJson: boolean = true
  ): Promise<T> {
    try {
      const command: GetSecretValueCommand = new GetSecretValueCommand({
        SecretId: secretName
      })
      const secretValueOutput: GetSecretValueCommandOutput =
        await this.secretsManagerSDK.send(command)

      if (!secretValueOutput.SecretString) {
        throw new ResourceNotFoundError(
          `SecretString not found or is empty for secret ID: ${secretName}.`,
          { secretId: secretName },
          'Secret not found or empty.'
        )
      }

      const secretString: string = secretValueOutput.SecretString

      // If it should not be parsed as JSON, return the value as is
      if (!parseAsJson) {
        return secretString as T
      }

      // Attempt to parse as JSON
      try {
        const parsedValue: T = JSON.parse(secretString)

        // Reject parsed null values (the secret is 'null' in AWS Secrets Manager)
        if (parsedValue === null) {
          throw new InvalidConfigError(
            `Secret ${secretName} contains null value which is not allowed`,
            {
              secretName,
              secretTriedValue: secretString
            }
          )
        }

        return parsedValue
      } catch (parseError) {
        throw new InvalidConfigError(
          `Failed to parse secret ${secretName} as JSON: ${parseError.message}`,
          {
            secretName,
            secretTriedValue: secretString,
            parseError: parseError.message
          }
        )
      }
    } catch (error) {
      if (
        error instanceof ResourceNotFoundError ||
        error instanceof InvalidConfigError
      ) {
        throw error
      }
      throw error
    }
  }
}
