import { Response } from 'express'
import { StandardResponse } from '@mercadoni/instaleap-utils'

export class ResponseHttpHandler {
  private readonly processId: string
  private readonly res: Response

  /**
   * Handle standard HTTP responses.
   * @param processId - The processId of the process you want to execute.
   * @param res - This respons is necessary to be able to build the responses
   * }
   */
  constructor(res: Response) {
    this.processId = res.locals.processId
    this.res = res
  }

  /**
   * This method is responsible for responding to the request in a successful standard way.
   * @param message The message that will be returned
   * @param payload The payload with the response to be returned. I.e, {
   *  "validCredentiasl": true
   * }
   */
  public handleSuccess(
    message?: string,
    operationPayload?: object,
    statusCode: number = 200
  ): void {
    const response: StandardResponse = {
      processId: this.processId,
      message:
        message ??
        `Process scheduled with ID ${this.processId} wait for more details in slack channel`,
      operationPayload: operationPayload
    }
    this.res.status(statusCode).send(response)
  }
}
