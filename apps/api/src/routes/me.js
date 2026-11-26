import { use } from 'react'
import { prisma } from '../db.js'
import { getUserAccess } from '../services/access.js'

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
              roles: { type: 'array', items: {type: 'string'}},
              permissions: {type: 'array', items: {type: 'string'}},
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
      const access = await getUserAccess(user.id)
      return {
        id: user.id,
        login: user.login,
        fullName: user.fullName,
        email: user.email,
        roles: access.roles,
        permissions: access.permissions,
      }
    }
  )
}