import { HttpMethod } from '@mercadoni/instaleap-utils'

export interface GatewayRequest {
  url: string
  method: HttpMethod
  headers: Record<string, any>
  body: any
  params: {
    serviceName: string
    clientId?: string
  }
}
