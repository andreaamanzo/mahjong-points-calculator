import fastify, { FastifyInstance } from "fastify"
import { FastifyStaticOptions } from "@fastify/static"
import { join } from 'path'
import fastifyView from '@fastify/view'
import handlebars from 'handlebars'
import configs from "./configs"
import { hostCreateNewRoom, joinRoom, getPlayersInRoom, renamePlayerComponent } from "./components"
import { Player, Room } from "./types"

const app: FastifyInstance = fastify()

app.register(fastifyView, {
  engine: { handlebars },
  root: join(__dirname, "../views"),
  layout: "layouts/main",
  viewExt: "hbs",
  includeViewExtension: true,
  options: {
    partials: {
      playerCard: "partials/playerCard.hbs",
    }
  }
})

app.register(require('@fastify/static'), {
  root: join(__dirname, '../public'),
  prefix: '/public/',
} as FastifyStaticOptions)

app.register(require("@fastify/formbody"))

app.get('/', (request, reply) => {
	const players = Array.from({ length: 4 }, (_, i) => ({
		name: `Player ${i + 1}`,
		isHost: false
	}))
  return reply.view('home', { title: 'Mahjong Points Calculator', players })
})

app.get('/join-room', (request, reply) => {
  return reply.view('joinRoom', { title: 'Join Room' })
})

app.post('/join-room', async (request, reply) => {
  const { roomCode, playerName } = request.body as { roomCode: string, playerName: string }
  const results = await joinRoom(roomCode, playerName);
  if (results.success) {
    reply.redirect(`/room?host=false&roomCode=${results.room.code}&playerId=${results.player.id}`)
  } else {
    reply.status(500).send(results)
  }
})

app.get('/create-room', (request, reply) => {
  return reply.view('createRoom', { title: 'Create Room' })
})

app.post('/create-room', async (request, reply) => {
  const { hostName } = request.body as { hostName: string }
  const results = await hostCreateNewRoom(hostName)
  if (results.success) {
    reply.redirect(`/room?host=true&roomCode=${results.room.code}&playerId=${results.player.id}`)
  } else {
    reply.status(500).send(results)
  }
})

app.get('/room', async (request, reply) => {
  const { host, roomCode, playerId } = request.query as { host: boolean, roomCode: string, playerId: string }
  const results = await getPlayersInRoom(roomCode)
  if (results.success) {
    const players = results.players.map(player => {
      return {
        ...player,
        isClientPlayer: player.id === parseInt(playerId)
      }
    })
    return reply.view('room', { title: 'Mah-Jong room', players })

  }
})

app.post('/api/rename-player', async (request, reply) => {
  const { playerId, newName } = request.body as { playerId: string, newName: string }
  const results = await renamePlayerComponent(parseInt(playerId), newName)
  if (results.success) {
    reply.send(results)
  } else {
    reply.status(500).send(results)
  }
})

app.listen({ host: configs.SITE_HOST, port: Number(configs.PORT) }, (err, address) => {
  if (err) {
    console.error(err)
    process.exit(1)
  }
  console.log(`server listening on ${address}`)
})
