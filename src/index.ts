import express, { Request, Response, NextFunction } from "express"
import { join } from "path"
import { engine } from 'express-handlebars'
import { registerHandlebarsHelpers } from './handlebarsHelpers'
import http from "http"
import { Server } from "socket.io"
import configs from "./configs"
import {
  createRoomComponent,
  joinRoomComponent,
  getPlayersInRoomComponent,
  renamePlayerComponent,
  deletePlayerComponent,
  deleteRoomComponent,
  startRoomComponent,
  getLastRoundComponent,
  updatePlayerPointsComponent,
  updatePlayerDoublesComponent,
  updatePlayerMahjongComponent,
  updatePlayerEstWindComponent,
  getPlayerComponent
} from "./components"
import { getRoom } from "./dbComponents"

// Setup express app
const app = express()

const server = http.createServer(app)
const io = new Server(server)

type UserInfo = { id: number; name: string; roomCode: string; isHost: boolean }
const users = new Map<string, UserInfo>()

io.on("connection", (socket) => {

  socket.on("register", async ({ id, roomCode }: { id: number; roomCode: string }) => {
    const results = await getPlayerComponent(id)
    if (results.success) {
      const player = results.player
      users.set(socket.id, { id, name: player.name, isHost: player.isHost, roomCode })
      socket.join(roomCode)
  
      // Filtra solo utenti nella stessa stanza
      const roomUsers = Array.from(users.values()).filter(u => u.roomCode === roomCode)
  
      io.to(roomCode).emit("userListUpdate", roomUsers)
    } else {
      socket.emit("registerError", {
        message: "Player not found or could not be registered."
      })
    }
  })

  socket.on("disconnect", () => {
    users.delete(socket.id)
    io.emit("userListUpdate", Array.from(users.values()))
  })
})

// Register Handlebars helpers
registerHandlebarsHelpers()

// Setup handlebars engine with layouts and partials
app.engine("hbs", engine({
  extname: "hbs",
  defaultLayout: "main",
  layoutsDir: join(__dirname, "../views/layouts"),
  partialsDir: join(__dirname, "../views/partials"),
}))
app.set("view engine", "hbs")
app.set("views", join(__dirname, "../views"))

// Middleware for parsing urlencoded bodies (form data)
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Serve static files from /public under /public path
app.use("/public", express.static(join(__dirname, "../public")))

// Routes

app.get('/', (req: Request, res: Response) => {
  const players = Array.from({ length: 4 }, (_, i) => ({
    name: `Player ${i + 1}`,
    isHost: false,
    isClientPlayer: false,
    isEditable: true
  }))

  res.render('home', { title: 'Mahjong Points Calculator', players })
})

app.get('/join-room', (req: Request, res: Response) => {
  res.render('joinRoom', { title: 'Join Room' })
})

app.post('/join-room', async (req: Request, res: Response) => {
  const { roomCode, playerName } = req.body as { roomCode: string, playerName: string }
  const results = await joinRoomComponent(roomCode, playerName)
  if (results.success) {
    io.to(roomCode).emit("userListUpdate", Array.from(users.values()))
    res.redirect(`/lobby-room?isHost=false&roomCode=${results.room.code}&playerId=${results.player.id}`)
  } else {
    res.status(404).render("error", {
      statusCode: 404,
      title: "Room Not Found",
      message: `The room code "${roomCode}" does not exist or is no longer available.`
    })
  }
})

app.get('/create-room', (req: Request, res: Response) => {
  res.render('createRoom', { title: 'Create Room' })
})

app.post('/create-room', async (req: Request, res: Response) => {
  const { hostName } = req.body as { hostName: string }
  const results = await createRoomComponent(hostName)
  if (results.success) {
    res.redirect(`/lobby-room?isHost=true&roomCode=${results.room.code}&playerId=${results.player.id}`)
  } else {
    res.status(500).send(results)
  }
})

app.get('/lobby-room', async (req: Request, res: Response) => {
  const { isHost: host, roomCode, playerId } = req.query as { isHost: string, roomCode: string, playerId: string }
  const isHost = (host === "true")
  const room = await getRoom(roomCode)
  if (room?.isStarted) {
    return res.redirect(`/room?isHost=${isHost}&roomCode=${roomCode}&playerId=${playerId}`)
  }
  const results = await getPlayersInRoomComponent(roomCode)
  if (results.success) {
    const players = results.players.map(player => ({
      ...player,
      isClientPlayer: player.id === parseInt(playerId),
      isEditable: player.id === parseInt(playerId)
    }))
    res.render('lobby', { title: 'Mah-Jong lobby', players, isHost, roomCode })
  } else {
    res.status(404).render("error", {
      statusCode: 404,
      title: "Room Not Found",
      message: `The room code "${roomCode}" does not exist or is no longer available.`
    })
  }
})

app.post("/lobby-room/partial", async (req, res) => {
  const players = req.body.players
  const isHost = req.body.isHost
  try {
    if (players) {
      res.render("partials/updatingLobbyContent", { layout: false, players, isHost })
    } else {
      throw new Error(`Room not found or unavailable.`)
    }
  } catch (err) {
    console.error("Errore nella route /lobby-room/partial/:roomCode", err)
    res.status(500).send("Errore interno del server")
  }
})

app.get('/room', async (req: Request, res: Response) => {
  const { isHost: host, roomCode, playerId } = req.query as { isHost: string, roomCode: string, playerId: string }
  const isHost = (host === "true")
  const room = await getRoom(roomCode)
  if (!(room?.isStarted)) {
    return res.redirect(`/lobby-room?isHost=${isHost}&roomCode=${roomCode}&playerId=${playerId}`)
  }
  const playersResults = await getPlayersInRoomComponent(roomCode)
  const lastRoundResults = await getLastRoundComponent(roomCode)
  if (playersResults.success && lastRoundResults.success) {
    const players = playersResults.players.map(player => {
      const playerScore = lastRoundResults.round.scores.find(s => s.playerId == player.id)
      return {
        ...player,
        playerScore,
        isClientPlayer: player.id === parseInt(playerId),
        isEditable: player.id === parseInt(playerId)
      }
    })
    res.render('room', { title: 'Mah-Jong room', players, isHost, roomCode })
  } else {
    res.status(404).render("error", {
      statusCode: 404,
      title: "Room Not Found",
      message: `The room code "${roomCode}" does not exist or is no longer available.`
    })
  }
})

// API POST endpoints

app.post('/api/rename-player', async (req: Request, res: Response) => {
  const { playerId, newName } = req.body as { playerId: string, newName: string }
  const results = await renamePlayerComponent(parseInt(playerId), newName)
  if (results.success) {
    const userEntry = Array.from(users.entries()).find(([_, u]) => u.id === parseInt(playerId))
    if (userEntry) {
      const [socketId, userInfo] = userEntry
      users.set(socketId, { ...userInfo, name: newName })
      const roomUsers = Array.from(users.values()).filter(u => u.roomCode === userInfo.roomCode)
      io.to(userInfo.roomCode).emit("userListUpdate", roomUsers)
    }
    console.log("player renamed")
    res.send(results)
  } else {
    res.status(500).send(results)
  }
})

app.post('/api/delete-player', async (req: Request, res: Response) => {
  const { playerId } = req.body as { playerId: string }
  const results = await deletePlayerComponent(parseInt(playerId))
  if (results.success) {
    res.send(results)
  } else {
    res.status(500).send(results)
  }
})

app.post('/api/delete-room', async (req: Request, res: Response) => {
  const { roomCode } = req.body as { roomCode: string }
  const results = await deleteRoomComponent(roomCode)
  if (results.success) {
    io.to(roomCode).emit("reloadPage")
    res.send(results)
  } else {
    res.status(500).send(results)
  }
})

app.post('/api/start-room', async (req: Request, res: Response) => {
  const { roomCode } = req.body as { roomCode: string }
  const results = await startRoomComponent(roomCode)
  if (results.success) {
    io.to(roomCode).emit("reloadPage")
    res.send(results)
  } else {
    res.status(500).send(results)
  }
})

app.post('/api/update-points', async (req, res) => {
  const { playerId, points, roomCode } = req.body as { playerId: number, points: number, roomCode: string }
  const results = await updatePlayerPointsComponent(playerId, points)

  if (results.success) {
    io.to(roomCode).emit("playerPointsUpdated", { playerId, points })
    res.send(results)
  } else {
    res.status(500).send(results)
  }
})

app.post('/api/update-doubles', async (req: Request, res: Response) => {
  const { playerId, doubles, roomCode } = req.body as { playerId: number, doubles: number, roomCode: string }
  const results = await updatePlayerDoublesComponent(playerId, doubles)

  if (results.success) {
    io.to(roomCode).emit("playerDoublesUpdated", { playerId, doubles })
    res.send(results)
  } else {
    res.status(500).send(results)
  }
})

app.post('/api/update-mahjong', async (req: Request, res: Response) => {
  console.log("here")
  const { playerId, mahjong, roomCode } = req.body as { playerId: number, mahjong: boolean, roomCode: string }
  const results = await updatePlayerMahjongComponent(playerId, mahjong)
  console.log(results)
  if (results.success) {
    console.log(roomCode)
    io.to(roomCode).emit("playerMahjongUpdated", { playerId, mahjong })
    res.send(results)
  } else {
    res.status(500).send(results)
  }
})

app.post('/api/update-estWind', async (req: Request, res: Response) => {
  const { playerId, estWind, roomCode } = req.body as { playerId: number, estWind: boolean, roomCode: string }
  const results = await updatePlayerEstWindComponent(playerId, estWind)

  if (results.success) {
    io.to(roomCode).emit("playerEstWindUpdated", { playerId, estWind })
    res.send(results)
  } else {
    res.status(500).send(results)
  }
})

// Error handling middleware
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error(err)
  res.status(500).render("error", {
    statusCode: 500,
    title: "Internal Server Error",
    message: "Something went wrong. Please try again later."
  })
})

// Start server
server.listen(Number(configs.PORT), configs.SITE_HOST, (err?: any) => {
  if (err) {
    console.error(err)
    process.exit(1)
  }
  console.log(`✅ Server listening on http://${configs.SITE_HOST}:${configs.PORT}`)
})
