import {
  BaseError,
  DetailsErrors,
  ErrorCategory
} from '@mercadoni/instaleap-utils'

export class InvalidConfigError extends BaseError {
  /**
   * This error occurs when an expected configuration is invalid or malformed.
   * It is typically thrown when required fields are missing, types are incorrect,
   * or the structure of a configuration.
   * @param errorMessage - The customized error message to be displayed.
   * I.e, 'Configuration must have script property.', 'Secret JSON is malformed.'
   * @param errorDetails - Information about the error that occurred. I.e., {
   *  secretName: 'xandar/db',
   *  originalError: 'Unexpected token } in JSON'
   * }
   */
  constructor(errorMessage: string, errorDetails: DetailsErrors) {
    super(ErrorCategory.CONFIGURATION_ERROR, errorMessage, 3, errorDetails)
  }
}

export class InitializationError extends BaseError {
  /**
   * This error occurs when the initialization of a service or component fails.
   * It is typically thrown when required dependencies are missing or invalid.
   * @param errorMessage - The customized error message to be displayed.
   * I.e, 'Failed to initialize database connection.', 'Service dependencies are not met.'
   * @param errorDetails - Information about the error that occurred. I.e., {
   *  serviceName: 'UserService',
   *  originalError: 'Database connection timeout'
   * }
   */
  constructor(errorMessage: string, errorDetails?: DetailsErrors) {
    super(ErrorCategory.INTERNAL_ERROR, errorMessage, 6, errorDetails)
  }
}
