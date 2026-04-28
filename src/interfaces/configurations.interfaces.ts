import { RedbookTenantsConfig } from './redbook.interfaces'

/**
 * Define the global configuration for the project.
 * @field PORT - The Number of the port where app is running I.e, 2600
 * @field ENVIRONMENT - Environment where the project is running. I.e, 'vormir'
 * @field SERVICE_NAME - The name of the service. I.e, 'skrull'
 * @field DB_CONFIG - The Configuration for the database I.e,
 *{
 * "engine": "postgres",
 * "host": "localhost",
 * "username": "asasasa",
 * "password": "password12345",
 * "port": 33333,
 * "dbname": "coulson",
 * "dbInstanceIdentifier": "coulson234"
 * }
 * @field AUTH_CONFIG - Define configuration needed to run auth services. I.e,
 * {
 *    "authType": "OAUTH2.0",
 *    "oauthConfig": {
 *      "clientId": "dvsdvsadv215dsv415s",
 *      "domain": "auth.support..io",
 *      "audience": "https://coulson.io",
 *      "userEmailNameProperty": "https://insta.io/email"
 *    },
 *    "apidocsUsers": {
 *      "support": "lO521d5cv1d5v1s1asevwsebwAmYOuN"
 *    }
 * }
 * @field CORS_CONFIG - configurations for using cors. I,e
 * {
 *  origin: 'coulson.instaleap.io'
 * }
 * @field PG_CONFIG - General postgres settings. I.e, {
 *    "databaseName": "skrull",
 *    "connectionPoolSettings": {
 *          "max:": 20
 *          "idleTimeoutMillis": 30000
 *          "connectionTimeoutMillis": 2000
 *    }
 * }
 * @field AWS_CONFIG - Configuration for AWS services as Secrets Manager. I.e, {
 *  "clientSecretName": "xandar/example/test",
 *  "region": "us-west-1"
 * }
 */
export interface GlobalConfiguration {
  readonly PORT: number
  readonly ENVIRONMENT: string
  readonly SERVICE_NAME: string
  readonly AUTH_CONFIG: AuthConfig
  readonly CORS_CONFIG: CorsConfig
  readonly AWS_CONFIG: AwsConfig
  readonly GATEWAY_CONFIG: GatewayConfig
  readonly EXTERNAL_SERVICES_CONFIG: ExternalServicesConfig
  readonly TENANTS_CONFIG?: RedbookTenantsConfig
  readonly AWS_SECRETS_CONFIG?: AwsSecretsConfig
}

export interface AwsSecretsConfig {
  clientTokensSecretName?: string
}

export interface ExternalServicesConfig {
  auth0: {
    [key: string]: ManagementApiAccessToken
  }
  hawkeye?: {
    secret: string
  }
}

export interface ManagementApiAccessToken {
  clientId: string
  clientSecret: string
  audience: string
  domain: string
}

export interface GatewayConfig {
  [serviceName: string]: {
    headerName: string
    baseUrl: string
    secret?: string
    apiToken?: string
  }
}

/**
 * this interface define the configuration for a database.
 * @field host - host name where the database is hosted I.e, 'localhost'
 * @field username - The name of user of the database I.e, 'coulsonTest'
 * @field password - The password of the database I.e, 'password1234'
 * @field port - The port where run the database I.e, 33333
 * @field dbInstanceIdentifier - The name of the database instance. I.e, internal-tools-test-db
 */
export interface DatabaseConfig {
  host: string
  username: string
  password: string
  port: number
  dbInstanceIdentifier?: string
}

/**
 * Define configuration needed to run auth services.
 * @field authType - The type of the auth used. I.e, "OAUTH"
 * @field oauthConfig - configuration needed to run oauth services. I.e,
 *{
 * "authType": "OAUTH",
 * "oauthConfig": {
 *   "clientId": "eXAMPLEtoken",
 *   "domain": "dev-1u7s05s7avdkye1f.us.auth0.com",
 *   "audience": "https://coulson.example.co",
 *   "userEmailNameProperty": "https://coulson-test.com/email"
 * }
 *@field apidocsUsers - Configuration for authentication with swagger
 *{|
 *   support: 'password1',
 *   solutions: 'password2',
 * }
 *}
 */
export interface AuthConfig {
  authType: string
  oauthConfig: OauthConfig
  apidocsUsers: ApidocsUsers
}

/**
 * Define all configuration needed to run oauth services.
 * @field clientId - The unique identifier of the application created in the oauth service. I.e,
 * 'ySgVDDK1lEXAMPLEEXAMPLEKIDHMe3xCP'.
 * @field domain - The domain of the application created in the oauth service. I.e,
 * 'dev-1u7sExamplee1f.us.auth0.co'.
 * @field audience - The recipients of the token provided in the oauth service. I.e,
 * 'https://coulson.example.co'.
 * @field userEmailNameProperty - The property name of the object decoded from the token
 * received in the authentication process. I.e,
 * 'https://coulson-test.com/email'
 */
export interface OauthConfig {
  clientId: string
  domain: string
  audience: string
  userEmailNameProperty: string
}

/**
 * Represents an object where keys are usernames (strings) and values are passwords (strings). I.e,
 * {
 *   support: 'password1',
 *   solutions: 'password2',
 * }
 */
export interface ApidocsUsers {
  [username: string]: string
}

/**
 * This interface defines the configuration for CORS
 * @field domainsWhiteList - The allowed origins for CORS requests
 */
export interface CorsConfig {
  domainsWhiteList: string[]
}

/**
 * This interface defines the connection configurations with pg.
 * @field databaseName - The name of the database. I.e, "skrull"
 * @field connectionPoolSettings - Connection configurations with a connection pool. I.e, {
 *          "max": 20
 *          "idleTimeoutMillis": 30000
 *          "connectionTimeoutMillis": 2000
 *    }
 * @field databaseSecretName - Name of the secret where the database are obtained from. I.e, 'xandar/example/test/database_config'
 */
export interface PGConfig {
  databaseName: string
  connectionPoolSettings: {
    max: number
    idleTimeoutMillis: number
    connectionTimeoutMillis: number
  }
  databaseSecretName: string
}

/**
 * Defines the necessary configurations for AWS services as Secrets Manager.
 * @field region - The AWS region where the secret is stored. I.e, 'us-west-1'.
 * @field credentials - Object with the AWS credentials. I.e,
 * {
 *  accessKeyId: 'AKIA5UYEJLIVEXAMPLE',
 *  secretAccessKey: 'example_acessKey_JEiWdDLiWvzzwhDSpzToAbAH7D4xKJoHXARj4yZD'
 * }
 */
export interface AwsConfig {
  region: string
  credentials?: AwsCredentials
}

/**
 * Defines the security credentials for an AWS account.
 * @field accessKeyId - Access Key id of credential of securty of you account of AWS I.e,
 * 'AKIA5UYEJLIVEXAMPLE'
 * @field secretAccessKey - Secret access Key of credentials of security of you account of AWS I.e,
 * 'example_acessKey_JEiWdDLiWvzzwhDSpzToAbAH7D4xKJoHXARj4yZD'
 */
export interface AwsCredentials {
  accessKeyId: string
  secretAccessKey: string
}

/**
 * This interface defines the configuration for Redis connection.
 * @field host - The host name where the Redis server is running. I.e, 'localhost'
 * @field port - The port where the Redis server is listening. I.e, 6379
 */
export interface RedisConfig {
  host: string
  port: number
}
