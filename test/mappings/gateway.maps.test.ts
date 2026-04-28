import { describe, it, expect } from 'vitest'
import { SERVICE_CONFIG, ServiceAuthStrategy } from '../../src/mappings/gateway.maps'

describe('gateway.maps', () => {
  it('should have REBUILD_JWT strategy for nexus, lola, kingpin', () => {
    expect(SERVICE_CONFIG.nexus.authStrategy).toBe(ServiceAuthStrategy.REBUILD_JWT)
    expect(SERVICE_CONFIG.lola.authStrategy).toBe(ServiceAuthStrategy.REBUILD_JWT)
    expect(SERVICE_CONFIG.kingpin.authStrategy).toBe(ServiceAuthStrategy.REBUILD_JWT)
  })

  it('should have PASSTHROUGH strategy for tesseract, antman, deadpool, cerberus', () => {
    expect(SERVICE_CONFIG.tesseract.authStrategy).toBe(ServiceAuthStrategy.PASSTHROUGH)
    expect(SERVICE_CONFIG.antman.authStrategy).toBe(ServiceAuthStrategy.PASSTHROUGH)
    expect(SERVICE_CONFIG.deadpool.authStrategy).toBe(ServiceAuthStrategy.PASSTHROUGH)
    expect(SERVICE_CONFIG.cerberus.authStrategy).toBe(ServiceAuthStrategy.PASSTHROUGH)
  })

  it('should default to SERVICE_TOKEN for unmapped services', () => {
    const unmappedService = SERVICE_CONFIG['unknown-service']
    expect(unmappedService).toBeUndefined()
    expect(ServiceAuthStrategy.SERVICE_TOKEN).toBe('SERVICE_TOKEN')
  })
})
