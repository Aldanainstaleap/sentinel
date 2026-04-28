import { services } from '../app'
export class BaseController {
  protected processId: string

  /** The CoulsonController acts as a base class for other controllers in the application.
   * It provides centralized access to services and environment variables.
   * @param processId - Identifier of the process that is running. I.e,
   * '03ee45c2-6bc2-4cc8-ad0f-c571a741e142'
   */
  constructor(processId?: string) {
    this.processId = processId ?? ''
  }

  protected services = services
  protected getConfig = services.configService.getConfig()
}
