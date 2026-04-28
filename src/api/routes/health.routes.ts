import { Router } from 'express'

const router = Router()

/**
 * @swagger
 * paths:
 *  /health:
 *    get:
 *      tags:
 *        - Status
 *      summary: "Status"
 *      responses:
 *        200:
 *          description: OK
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  status:
 *                    type: string
 *                    example: healthy
 */
router.all('/', (_req: any, res: any) => {
  res.json({ status: 'healthy' })
})

export default router
