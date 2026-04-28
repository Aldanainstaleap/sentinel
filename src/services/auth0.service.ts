import { HttpHandler, ResponseData } from '@mercadoni/instaleap-utils'
import { ManagementApiAccessToken } from '../interfaces/configurations.interfaces'

export class Auth0Service {
  private readonly httpHandler: HttpHandler

  constructor(private readonly credentials: ManagementApiAccessToken) {
    this.httpHandler = new HttpHandler(`https://${this.credentials.domain}/`)
  }

  public async getAccessToken(): Promise<string> {
    const response: ResponseData = await this.httpHandler.post(
      'oauth/token',
      { 'Content-Type': 'application/json' },
      {
        client_id: this.credentials.clientId,
        client_secret: this.credentials.clientSecret,
        audience: this.credentials.audience,
        grant_type: 'client_credentials'
      }
    )

    if (response.statusCode !== 200) {
      throw new Error(`Auth0: Failed to retrieve access token: ${JSON.stringify(response.data)}`)
    }

    return response.data.access_token
  }
}
