import {
  BaseError,
  DetailsErrors,
  ErrorCategory
} from '@mercadoni/instaleap-utils'

export class BaseServiceError extends BaseError {
  /**
   * This error is triggered when something fails during the execution of the service
   * @param errorDetails - The detail of the captured error. I.e, {
   *         "name": "ClusterNotFoundException",
   *         "$fault": "client",
   *         "$metadata": {
   *             "httpStatusCode": 400,
   *             "requestId": "17d782f0-73b3-4cad-9103-f1731f3e3a2a",
   *             "attempts": 1,
   *             "totalRetryDelay": 0
   *         },
   *         "__type": "ClusterNotFoundException"
   *     }
   * @param userDetails - The detail of the captured error to show to the user. I.e,
   *         "An error has occurred in the Coulson Service. Please try again later."
   */
  constructor(errorDetails: DetailsErrors, userDetails?: DetailsErrors) {
    super(
      ErrorCategory.INTERNAL_ERROR,
      'An error has occurred in the Service',
      1,
      errorDetails,
      userDetails
    )
  }
}
