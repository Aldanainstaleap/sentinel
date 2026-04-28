import {
  BaseError,
  DetailsErrors,
  ErrorCategory
} from '@mercadoni/instaleap-utils'

export class GatewayError extends BaseError {
  /**
   * This error is thrown when a gateway operation fails.
   * It typically occurs during request forwarding, authentication strategy application,
   * or when a downstream service is not properly configured.
   * @param errorMessage - A descriptive message explaining the context of the failure.
   * I.e, 'Service nexus is not properly configured in GATEWAY_CONFIG.'
   * @param errorDetails - Optional object containing the original error or any relevant debug data.
   */
  constructor(errorMessage: string, errorDetails?: DetailsErrors) {
    super(ErrorCategory.DEPENDENCY_FAILURE, errorMessage, 5, errorDetails)
  }
}

export class ServiceTokenError extends BaseError {
  /**
   * This error is thrown when a service token cannot be retrieved.
   * It typically occurs when AWS Secrets Manager is unreachable, the secret is missing,
   * or an external token provider (Auth0, Redbook) returns an error.
   * @param errorMessage - A descriptive message explaining the context of the failure.
   * I.e, 'Failed to retrieve token for service: bifrost'
   * @param errorDetails - Optional object containing the original error or any relevant debug data.
   */
  constructor(errorMessage: string, errorDetails?: DetailsErrors) {
    super(ErrorCategory.DEPENDENCY_FAILURE, errorMessage, 6, errorDetails)
  }
}
