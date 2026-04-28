import {
  BaseError,
  DetailsErrors,
  ErrorCategory
} from '@mercadoni/instaleap-utils'

export class ResourceNotFoundError extends BaseError {
  /**
   * Throws when a entity or column isn't found in the database.
   * @param message - Descriptive message to be displayed. I.e,
   * 'User with id 'abc03b8a-410d-4287-b333-d3c1ee2e1b97' was not found'
   * @param details - Additional information about the error. I.e, {
   *   category: NOT-FOUND
   *   error: {
   *      message: 'User with id 'abc03b8a-410d-4287-b333-d3c1ee2e1b97' was not found'
   *   },
   * }
   * @param userDetails - Information about the error that occurred. I.e, {
   *   message: 'User not found'
   * }
   */
  constructor(
    message: string,
    details: DetailsErrors,
    userDetails?: DetailsErrors
  ) {
    super(ErrorCategory.NOT_FOUND, message, 5, details, userDetails)
  }
}
