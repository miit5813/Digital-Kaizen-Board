import Fastify from "fastify"
import swagger from "@fastify/swagger"
import swaggerUi from "@fastify/swagger-ui"

export async function BuildApp() {
    const app = Fastify({logger: true})
    await app.register(swagger, {
        openapi: { info : {title: "Kaizen API", version: "0.1.0"}}
    })

    await app.register(swaggerUi, {routerfix: "/docs"})
    app.get(
        '/ping',
        {schema: {
            tags: ['system'],

        }},
    async () => ({status: 'ok'})
    )

    app.get(
        '/health',
        {
            schema: { 
            tags: ['system'],
            response: {
                200: {type: 'object', properrties: { status: {type: 'string'} } }
                },
            },
        },
        async () => ({status: 'ok' })
    )
    return app 
}