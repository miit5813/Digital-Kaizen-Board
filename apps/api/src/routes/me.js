import { prisma } from '../db.js'

export default async function meRoutes(app) {
  app.get(
    '/me',
    {
      onRequest: [app.authenticate],
      schema: {
        tags: ['auth'],
        security: [{ bearerAuth: [] }],
        response: {
          200: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              login: { type: 'string' },
              fullName: { type: 'string' },
              email: { type: 'string', nullable: true },
            },
          },
        },
      },
    },
    async (request, reply) => {
      const user = await prisma.user.findUnique({
        where: { id: request.user.sub },
      })

      if (!user || !user.isActive) {
        return reply.code(401).send({ message: 'Пользователь не найден или отключён' })
      }

      return user
    }
  )
}