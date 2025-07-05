import express, { Request, Response, NextFunction } from "express"
import { join } from "path"
import { engine } from 'express-handlebars'
import { registerHandlebarsHelpers } from './handlebarsHelpers'
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
  updatePlayerEstWindComponent
} from "./components"
import { getRoom } from "./dbComponents"

// Setup express app
const app = express()

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
    res.send(results)
  } else {
    res.status(500).send(results)
  }
})

app.post('/api/start-room', async (req: Request, res: Response) => {
  const { roomCode } = req.body as { roomCode: string }
  const results = await startRoomComponent(roomCode)
  if (results.success) {
    res.send(results)
  } else {
    res.status(500).send(results)
  }
})

app.post('/api/update-points', async (req: Request, res: Response) => {
  const { playerId, points } = req.body as { playerId: number, points: number }
  const results = await updatePlayerPointsComponent(playerId, points)
  if (results.success) {
    res.send(results)
  } else {
    res.status(500).send(results)
  }
})

app.post('/api/update-doubles', async (req: Request, res: Response) => {
  const { playerId, doubles } = req.body as { playerId: number, doubles: number }
  const results = await updatePlayerDoublesComponent(playerId, doubles)
  if (results.success) {
    res.send(results)
  } else {
    res.status(500).send(results)
  }
})

app.post('/api/update-mahjong', async (req: Request, res: Response) => {
  const { playerId, mahjong } = req.body as { playerId: number, mahjong: boolean }
  const results = await updatePlayerMahjongComponent(playerId, mahjong)
  if (results.success) {
    res.send(results)
  } else {
    res.status(500).send(results)
  }
})

app.post('/api/update-estWind', async (req: Request, res: Response) => {
  const { playerId, estWind } = req.body as { playerId: number, estWind: boolean }
  const results = await updatePlayerEstWindComponent(playerId, estWind)
  if (results.success) {
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
app.listen(Number(configs.PORT), configs.SITE_HOST, (err?: any) => {
  if (err) {
    console.error(err)
    process.exit(1)
  }
  console.log(`server listening on http://${configs.SITE_HOST}:${configs.PORT}`)
})
