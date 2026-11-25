import Fastify from "fastify"
import swagger from "@fastify/swagger"
import swaggerUi from "@fastify/swagger-ui"
import jwt from "@fastify/jwt"
import authRoutes from "./routes/auth.js"
import authPlugin from "./plugins/auth.js"
import meRoutes from "./routes/me.js"

export async function BuildApp() {
  const app = Fastify({ logger: true })

  await app.register(swagger, {
    openapi: { 
        info: { title: "Kaizen API", version: "0.1.0" },
        components: {
            securitySchemes: {
                bearerAuth: {type: 'http', scheme: 'bearer', bearerFormat: 'JWT'}
            }
        }
    },
  })
  await app.register(swaggerUi, { routePrefix: "/docs" })

  await app.register(jwt, { secret: process.env.JWT_SECRET })
  await app.register(authPlugin)
  await app.register(authRoutes)
  await app.register(meRoutes)

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