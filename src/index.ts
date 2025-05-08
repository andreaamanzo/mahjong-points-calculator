import fastify, { FastifyInstance } from "fastify"
import { FastifyStaticOptions } from "@fastify/static"
import { join } from "path"

const app: FastifyInstance = fastify()

const PORT = 8080

app.register(require('@fastify/static'), {
    root: join(__dirname, '../public'),
    prefix: '/public/',
} as FastifyStaticOptions)

app.register(require("@fastify/formbody"))

app.get('/', (_, reply) => {
    return reply.sendFile("html/index.html")
})


app.listen({ port: PORT }, (err, address) => {
    if (err) {
        console.error(err)
        process.exit(1)
    }
    console.log(`server listening on ${address}`)
})