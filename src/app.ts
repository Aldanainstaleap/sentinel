import * as ServiceLoader from './loaders/services.loader'
import { ApiServerLoader } from './loaders/api-server.load'
import { initializeMiddleware } from './api/middlewares/oauth.middleware'
import { Services } from './interfaces/commons.interfaces'
import 'reflect-metadata'

// Exporting valid environment variables to be used in other files.
export let services: Services

// It loads all the services and then starts the API server
const loadAll = async (): Promise<void> => {
  // Start all the services
  services = await ServiceLoader.load()
  initializeMiddleware()

  // Start the app
  new ApiServerLoader().load()
}
void loadAll()
