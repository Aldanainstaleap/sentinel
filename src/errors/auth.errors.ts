import {
  BaseError,
  DetailsErrors,
  ErrorCategory
} from '@mercadoni/instaleap-utils'

export class AccessNotPermittedError extends BaseError {
  /**
   * This error is thrown when authentication is invalid.
   * @param errorDetails - The details of the error captured. I.e, {
   *         "name": "AccessNotPermittedError",
   *         "$fault": "client",
   *         "$metadata": {
   *             "httpStatusCode": 403,
   *             "requestId": "17d782f0-73b3-4cad-9103-f1731f3e3a2a",
   *             "attempts": 1,
   *             "totalRetryDelay": 0
   *         },
   *         "__type": "AccessNotPermittedError"
   *     }
   * @param request - The request that triggered the error. I.e, 'GET /api/user'
   * @param token - The token used for authentication. I.e, '<token>'
   */
  constructor(errorDetails: DetailsErrors, request: string, token?: string) {
    const details: DetailsErrors = {
      errorDetails: errorDetails,
      request: request,
      token: token
    }
    super(
      ErrorCategory.AUTHENTICATION,
      'An error occurred during authentication, please check the details.',
      2,
      details,
      errorDetails
    )
  }
}
