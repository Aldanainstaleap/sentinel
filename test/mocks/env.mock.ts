/**
 * Mock environment variables for testing.
 * This file sets up the minimum required environment variables
 * so that the application can load without errors during tests.
 */

process.env.PORT = '3000'
process.env.ENVIRONMENT = 'local'
process.env.SERVICE_NAME = 'sentinel-service'
process.env.AUTH_CONFIG = JSON.stringify({
  authType: 'OAUTH2.0',
  oauthConfig: {
    clientId: 'test-client-id',
    domain: 'test-domain.auth0.com',
    audience: 'https://test.audience',
    userEmailNameProperty: 'https://test.com/email'
  },
  apidocsUsers: { admin: 'test-password' }
})
process.env.CORS_CONFIG = JSON.stringify({ domainsWhiteList: ['*'] })
process.env.AWS_CONFIG = JSON.stringify({ region: 'us-east-1' })
process.env.GATEWAY_CONFIG = JSON.stringify({
  nexus: { headerName: 'Authorization', baseUrl: 'https://nexus.test.io' },
  redbook: { headerName: 'x-api-key', baseUrl: 'https://redbook.test.io' },
  bifrost: { headerName: 'x-api-key', baseUrl: 'https://bifrost.test.io' },
  nebula: { headerName: 'Authorization', baseUrl: 'https://nebula.test.io', secret: 'test/nebula/secret' },
  tesseract: { headerName: 'Authorization', baseUrl: 'https://tesseract.test.io' },
  antman: { headerName: 'Authorization', baseUrl: 'https://antman.test.io' },
  dormammu: { headerName: 'Authorization', baseUrl: 'https://dormammu.test.io', apiToken: 'test-token' },
  kingpin: { headerName: 'Authorization', baseUrl: 'https://kingpin.test.io' },
  lola: { headerName: 'Authorization', baseUrl: 'https://lola.test.io' },
  deadpool: { headerName: 'Authorization', baseUrl: 'https://deadpool.test.io' },
  cerberus: { headerName: 'Authorization', baseUrl: 'https://cerberus.test.io' }
})
process.env.EXTERNAL_SERVICES_CONFIG = JSON.stringify({
  auth0: {
    nexusAccessCredentials: {
      clientId: 'test-nexus-id',
      clientSecret: 'test-nexus-secret',
      audience: 'https://nexus.audience',
      domain: 'test.auth0.com'
    },
    kingpinAccessCredentials: {
      clientId: 'test-kingpin-id',
      clientSecret: 'test-kingpin-secret',
      audience: 'https://kingpin.audience',
      domain: 'test.auth0.com'
    },
    lolaAccessCredentials: {
      clientId: 'test-lola-id',
      clientSecret: 'test-lola-secret',
      audience: 'https://lola.audience',
      domain: 'test.auth0.com'
    }
  }
})
