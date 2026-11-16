import { BuildApp } from "./app.js";

const app = await BuildApp()
const port = Number(process.env.port) || 3000

try {
    await app.listen({ port , host: '0.0.0.0'})
} catch (err) {
    app.log.error(err)
    process.exit(1)
}