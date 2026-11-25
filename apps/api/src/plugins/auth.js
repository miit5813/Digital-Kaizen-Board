import fp from 'fastify-plugin'

export default fp(async function authPlugin(app) {
  app.decorate('authenticate', async function (request, reply) {
    try {
      await request.jwtVerify()
    } catch (err) {
      return reply.code(401).send({ message: 'Требуется вход в систему' })
    }
  })
})