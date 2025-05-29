import fastify, { FastifyInstance } from "fastify"
import { FastifyStaticOptions } from "@fastify/static"
import { join } from 'path'
import fastifyView from '@fastify/view'
import handlebars from 'handlebars'
import { registerHandlebarsHelpers } from './handlebarsHelpers'
import configs from "./configs"
import { createRoomComponent, joinRoom, getPlayersInRoom, renamePlayerComponent, deletePlayerComponent, deleteRoomComponent, startRoomComponent } from "./components"
import { Player, Room } from "./types"
import { getRoom } from "./dbComponents"

const app: FastifyInstance = fastify()

registerHandlebarsHelpers()

app.register(fastifyView, {
  engine: { handlebars },
  root: join(__dirname, "../views"),
  layout: "layouts/main",
  viewExt: "hbs",
  includeViewExtension: true,
  options: {
    partials: {
      playerCard: "partials/playerCard.hbs",
      playerCardMinimal: "partials/playerCardMinimal.hbs",
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
		isHost: false,
    isClientPlayer: false,
    isEditable: true
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
    reply.redirect(`/lobby-room?isHost=false&roomCode=${results.room.code}&playerId=${results.player.id}`)
  } else {
    return reply.status(404).view("error", {
      statusCode: 404,
      title: "Room Not Found",
      message: `The room code "${roomCode}" does not exist or is no longer available.`
    })
  }
})

app.get('/create-room', (request, reply) => {
  return reply.view('createRoom', { title: 'Create Room' })
})

app.post('/create-room', async (request, reply) => {
  const { hostName } = request.body as { hostName: string }
  const results = await createRoomComponent(hostName)
  if (results.success) {
    reply.redirect(`/lobby-room?isHost=true&roomCode=${results.room.code}&playerId=${results.player.id}`)
  } else {
    reply.status(500).send(results)
  }
})

app.get('/lobby-room', async (request, reply) => {
  const { isHost: host, roomCode, playerId } = request.query as { isHost: string, roomCode: string, playerId: string }
  const isHost = (host === "true" ? true : false)
  const room = await getRoom(roomCode)
  if (room?.isStarted) {
    return reply.redirect(`/room?isHost=${isHost}&roomCode=${roomCode}&playerId=${playerId}`)
  }
  const results = await getPlayersInRoom(roomCode)
  if (results.success) {
    const players = results.players.map(player => {
      return {
        ...player,
        isClientPlayer: player.id === parseInt(playerId),
        isEditable: player.id === parseInt(playerId)
      }
    })
    return reply.view('lobby', { title: 'Mah-Jong lobby', players, isHost, roomCode })
  } else {
    return reply.status(404).view("error", {
      statusCode: 404,
      title: "Room Not Found",
      message: `The room code "${roomCode}" does not exist or is no longer available.`
    })
  }
})

app.get('/room', async (request, reply) => {
  const { isHost: host, roomCode, playerId } = request.query as { isHost: string, roomCode: string, playerId: string }
  const isHost = (host === "true" ? true : false)
  const room = await getRoom(roomCode)
  if (!(room?.isStarted)) {
    return reply.redirect(`/lobby-room?isHost=${isHost}&roomCode=${roomCode}&playerId=${playerId}`)
  }
  const results = await getPlayersInRoom(roomCode)
  if (results.success) {
    const players = results.players.map(player => {
      return {
        ...player,
        isClientPlayer: player.id === parseInt(playerId),
        isEditable: player.id === parseInt(playerId)
      }
    })
    return reply.view('room', { title: 'Mah-Jong room', players, isHost, roomCode })
  } else {
    return reply.status(404).view("error", {
      statusCode: 404,
      title: "Room Not Found",
      message: `The room code "${roomCode}" does not exist or is no longer available.`
    })
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

app.post('/api/delete-player', async (request, reply) => {
  const { playerId } = request.body as { playerId: string }
  const results = await deletePlayerComponent(parseInt(playerId))
  if (results.success) {
    reply.send(results)
  } else {
    reply.status(500).send(results)
  }
})

app.post('/api/delete-room', async (request, reply) => {
  const { roomCode } = request.body as { roomCode: string }
  const results = await deleteRoomComponent(roomCode)
  if (results.success) {
    reply.send(results)
  } else {
    reply.status(500).send(results)
  }
})

app.post('/api/start-room', async (request, reply) => {
  const { roomCode } = request.body as { roomCode: string }
  const results = await startRoomComponent(roomCode)
  if (results.success) {
    reply.send(results)
  } else {
    reply.status(500).send(results)
  }
})

app.setErrorHandler((error, request, reply) => {
  console.error(error)

  reply.status(500).view("error", {
    statusCode: 500,
    title: "Internal Server Error",
    message: "Something went wrong. Please try again later."
  })
})


app.listen({ host: configs.SITE_HOST, port: Number(configs.PORT) }, (err, address) => {
  if (err) {
    console.error(err)
    process.exit(1)
  }
  console.log(`server listening on ${address}`)
})
