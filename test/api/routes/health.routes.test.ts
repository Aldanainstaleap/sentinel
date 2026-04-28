import { describe, it, expect } from 'vitest'
import request from 'supertest'
import express from 'express'
import healthRouter from '../../../src/api/routes/health.routes'

const app = express()
app.use('/health', healthRouter)

describe('health.routes', () => {
  it('should return 200 on GET /health', async () => {
    const response = await request(app).get('/health')
    expect(response.status).toBe(200)
    expect(response.body).toEqual({ status: 'healthy' })
  })
})
