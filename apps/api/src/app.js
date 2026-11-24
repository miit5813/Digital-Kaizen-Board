import Fastify from "fastify"
import swagger from "@fastify/swagger"
import swaggerUi from "@fastify/swagger-ui"
import jwt from "@fastify/jwt"
import authRoutes from "./routes/auth.js"

export async function BuildApp() {
  const app = Fastify({ logger: true })

  await app.register(swagger, {
    openapi: { info: { title: "Kaizen API", version: "0.1.0" } },
  })
  await app.register(swaggerUi, { routePrefix: "/docs" })

  await app.register(jwt, { secret: process.env.JWT_SECRET })
  await app.register(authRoutes)

  app.get(
    "/health",
    {
      schema: {
        tags: ["system"],
        response: {
          200: { type: "object", properties: { status: { type: "string" } } },
        },
      },
    },
    async () => ({ status: "ok" })
  )

  return app
}