import swaggerJSDoc, {
  type OAS3Definition,
  type OAS3Options
} from 'swagger-jsdoc'
import { existsSync } from 'fs'

const swaggerDefinition: OAS3Definition = {
  openapi: '3.0.3',
  info: {
    title: 'Sentinel Gateway',
    version: '1.0.0'
  },
  servers: [
    {
      url: 'http://localhost:2600'
    }
  ],
  components: {
    schemas: {}
  }
}

const swaggerOptions: OAS3Options = {
  swaggerDefinition,
  apis: [
    existsSync('./src/api/routes')
      ? './src/api/routes/*.ts'
      : './src/api/routes/*.js'
  ]
}

export default swaggerJSDoc(swaggerOptions)
