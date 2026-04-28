import { createRouter } from '../api/routes/index.routes'
import express, { type Express, type Router } from 'express'
import { type Loader } from './loader'
import { services } from '../app'

export class ApiServerLoader implements Loader {
  serviceName = 'app'
  port: number
  router: Router = express.Router()
  app: Express
  constructor() {
    this.app = express()
  }

  async load(): Promise<Express> {
    this.port = services.configService.getConfig().PORT
    this.app.use(express.json())
    this.app.use('/', createRouter())
    this.startServer(this.port)
    return this.app
  }

  /**
   * Starts an Express server
   * @param port Port to listen requests
   */
  private readonly startServer = (port: number): void => {
    this.app.listen(port, () => {
      console.log(`API server running in port ${port}`)
    })
  }
}
