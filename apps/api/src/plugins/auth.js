import fp from 'fastify-plugin'
import { getUserAccess } from '../services/access.js'

export default fp(async function authPlugin(app) {
  app.decorate('authenticate', async function (request, reply) {
    try {
      await request.jwtVerify()
    } catch (err) {
      return reply.code(401).send({ message: 'Требуется вход в систему' })
    }
  })

  app.decorate('requirePermission', (code) => async (request, reply) => {
    const { permissions } = await getUserAccess(request.user.sub)
    if (!permissions.includes(code)) {
        return reply.code(403).send({message: 'Недостаточно прав'})
    }
  })
})