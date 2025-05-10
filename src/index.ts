import fastify, { FastifyInstance } from "fastify"
import { FastifyStaticOptions } from "@fastify/static"
import { join } from "path"
import configs from "./configs"
import { createRoom, joinRoom } from "./components"

const app: FastifyInstance = fastify()


app.register(require('@fastify/static'), {
    root: join(__dirname, '../public'),
    prefix: '/public/',
} as FastifyStaticOptions)

app.register(require("@fastify/formbody"))

app.get('/', (request, reply) => {
    return reply.sendFile("html/index.html")
})


app.get('/join-room', (reqest, reply) => {
    return reply.sendFile("html/joinRoom.html")
})

app.post('/join-room', async (request, reply) => {
    const { roomCode, playerName } = request.body as { roomCode: string, playerName: string }
    const results = await joinRoom(roomCode, playerName);
    if (results.room) {
        reply.redirect(`/room?host=false&roomCode=${results.room.code}&playerName=${playerName}`)
    } else {
        reply.status(500).send(results)
    }
})

app.get('/create-room', (request, reply) => {
    return reply.sendFile("html/createRoom.html")
})

app.post('/create-room', async (request, reply) => {
    const { hostName } = request.body as { hostName: string }
    const results = await createRoom(hostName)
    if (results.room) {
        reply.redirect(`/room?host=true&roomCode=${results.room.code}&playerName=${hostName}`)
    } else {
        reply.status(500).send(results)
    }
})

app.get('/room', (request,reply) => {
    const { host, roomCode, playerName } = request.query as { host: boolean, roomCode: string, playerName: string }
    return reply.sendFile("html/room.html")
})

app.listen({ host: configs.SITE_HOST, port: Number(configs.PORT),  }, (err, address) => {
    if (err) {
        console.error(err)
        process.exit(1)
    }
    console.log(`server listening on ${address}`)
})