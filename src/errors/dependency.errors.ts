import {
  BaseError,
  DetailsErrors,
  ErrorCategory
} from '@mercadoni/instaleap-utils'

export class DependencyError extends BaseError {
  /**
   * This error is thrown when a downstream dependency fails.
   * It typically occurs during external service calls, secret retrieval,
   * or when a required service is unavailable.
   * @param errorMessage - A descriptive message explaining the context of the failure.
   * I.e, 'Failed to connect to external service: bifrost'
   * @param errorDetails - Optional object containing the original error or any relevant debug data.
   */
  constructor(errorMessage: string, errorDetails?: DetailsErrors) {
    super(ErrorCategory.DEPENDENCY_FAILURE, errorMessage, 4, errorDetails)
  }
}
