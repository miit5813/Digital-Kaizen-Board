import bcrypt from "bcryptjs"
import {prisma} from "../db.js"

export default async function authRoutes(app) {
    app.post(
        '/auth/login',
        {
        schema: {
        tags: ['auth'],
        body: {
            type: 'object',
            required: ['login', 'password'],
            properties: {
            login: { type: 'string' },
            password: { type: 'string' },
            },
        },
        response: {
            200: { type: 'object', properties: { token: { type: 'string' } } },
        },
        },
        },
        async (request, reply) => {
        const { login, password } = request.body

        const user = await prisma.user.findUnique({ where: { login } })
        const ok =
            user && user.isActive && (await bcrypt.compare(password, user.passwordHash))

        if (!ok) {
            return reply.code(401).send({ message: 'Неверный логин или пароль' })
        }

        const token = app.jwt.sign(
            { sub: user.id, login: user.login },
            { expiresIn: '8h' }
        )
        return { token }
    }
    )
    
}