import {
  CreateRoomReturnType,
  DeletePlayerReturnType,
  DeleteRoomReturnType,
  GetLastRoundReturnType,
  GetPlayersInRoomReturnType,
  JoinRoomReturnType,
  RenamePlayerReturnType,
  StartRoomReturnType,
  UpdatePlayerPointsReturnType,
  UpdatePlayerDoublesReturnType,
  UpdatePlayerMahjongReturnType,
  UpdatePlayerEstWindReturnType,
  GetPlayerReturnType,
} from "./types"

import {
  createPlayer,
  createRoom,
  deletePlayer,
  deleteRoom,
  getPlayers,
  getRoom,
  renamePlayer,
  startRoom,
  getLastRound,
  updatePlayerPoints,
  updatePlayerDoubles,
  updatePlayerMahjong,
  updatePlayerEstWind,
  getPlayer,
  getRoomFromId,
} from "./dbComponents"


export async function createRoomComponent(hostName: string): Promise<CreateRoomReturnType> {
  let roomCode = ""

  for (let i = 0; i < 5; i++) {
    const tempCode = Math.random().toString(36).substring(2, 10).toUpperCase()
    const room = await getRoom(tempCode)

    if (!room) {
      roomCode = tempCode
      break
    }
  }

  if (!roomCode) {
    return {
      success: false,
      message: "can't generate a valid code",
      room: null,
      player: null,
    }
  }

  try {
    const room = await createRoom(roomCode)
    const player = await createPlayer(room.id, hostName, true)

    return {
      success: true,
      message: "success",
      room,
      player,
    }
  } catch (error) {
    console.error("Errore nella creazione della stanza:", error)
    return { 
      success: false, 
      message: "Database error", 
      player: null, 
      room: null 
    }
  }
}

export async function joinRoomComponent(roomCode: string, playerName: string): Promise<JoinRoomReturnType> {
  try {
    const room = await getRoom(roomCode)

    if (!room) {
      return {
        success: false,
        message: "room not found",
        room: null,
        player: null,
      }
    }

    const players = await getPlayers(room.id)

    if (players.length >= 4) {
      return {
        success: false,
        message: "room is full",
        room: null,
        player: null,
      }
    }

    const player = await createPlayer(room.id, playerName, false)

    return {
      success: true,
      message: "success",
      room,
      player,
    }
  } catch (error) {
    console.error("Errore durante l'ingresso nella stanza:", error)
    return { 
      success: false, 
      message: "Database error", 
      player: null, 
      room: null 
    }
  }
}

export async function startRoomComponent(roomCode: string): Promise<StartRoomReturnType> {
  try {
    const room = await startRoom(roomCode)
    if (!room) {
      return {
        success: false,
        message: "Room not found",
        room: null,
      }
    }

    return {
      success: true,
      message: "Room started",
      room,
    }
  } catch (error) {
    console.error("Errore nell'avvio della stanza:", error)
    return {
      success: false,
      message: "Database error",
      room: null,
    }
  }
}

export async function getPlayersInRoomComponent(roomCode: string): Promise<GetPlayersInRoomReturnType> {
  try {
    const room = await getRoom(roomCode)

    if (!room) {
      return { success: false, message: "Room not found", players: null, room: null }
    }

    const players = await getPlayers(room.id)

    return {
      success: true,
      message: "Players retrieved",
      room,
      players,
    }
  } catch (err) {
    console.error("Errore nel recupero dei giocatori:", err)
    return { 
      success: false, 
      message: "Database error", 
      players: null, 
      room: null 
    }
  }
}

export async function getPlayerComponent(playerId: number): Promise<GetPlayerReturnType> {
  try {
    const player = await getPlayer(playerId)
    if (!player) {
      return {
        success: false,
        message: "Player not found",
        player: null,
      }
    }
    return {
      success: true,
      message: "Player retrieved",
      player,
    }
  } catch (error) {
    console.error("Errore nel recupero del giocatore:", error)
    return {
      success: false,
      message: "Database error",
      player: null,
    }
  }
}

export async function renamePlayerComponent(playerId: number, newName: string): Promise<RenamePlayerReturnType> {
  if (!newName || newName.trim() === "") {
    return {
      success: false,
      message: "Invalid name",
      player: null,
    }
  }

  try {
    const updatedPlayer = await renamePlayer(playerId, newName.trim())
    if (!updatedPlayer) {
      return {
        success: false,
        message: "Player not found",
        player: null,
      }
    }

    return {
      success: true,
      message: "Player renamed",
      player: updatedPlayer,
    }
  } catch (error) {
    console.error("Errore nella rinomina del giocatore:", error)
    return { 
      success: false, 
      message: "Database error", 
      player: null 
    }
  }
}

export async function deletePlayerComponent(playerId: number): Promise<DeletePlayerReturnType> {
  try {
    const deletedPlayer = await deletePlayer(playerId)
    if (!deletedPlayer) {
      return {
        success: false,
        message: "Player not found",
        player: null
      }
    }

    return {
      success: true,
      message: "Player deleted",
      player: deletedPlayer
    }
  } catch (error) {
    console.error("Errore nella cancellazione del giocatore:", error)
    return {
      success: false,
      message: "Database error",
      player: null
    }
  }
}

export async function deleteRoomComponent(roomCode: string): Promise<DeleteRoomReturnType> {
  try {
    const room = await getRoom(roomCode)
    if (!room) {
      return {
        success: false,
        message: "Room not found",
        room: null
      }
    }
    const deletedRoom = await deleteRoom(room.id)
    if (!deletedRoom) {
      return {
        success: false,
        message: "Room not found",
        room: null
      }
    }

    return {
      success: true,
      message: "Room deleted",
      room: deletedRoom
    }
  } catch (error) {
    console.error("Errore nella cancellazione della stanza:", error)
    return {
      success: false,
      message: "Database error",
      room: null
    }
  }
}

export async function getLastRoundComponent(roomCode: string): Promise<GetLastRoundReturnType> {
  try {
    const room = await getRoom(roomCode)
    if (!room) {
      return {
        success: false,
        message: "Room not found",
        round: null
      }
    }
    const round = await getLastRound(room.id)
    if (!round) {
      return {
        success: false,
        message: "No round found",
        round: null
      }
    }
    return {
      success: true,
      message: "Last round retrieved",
      round
    }
  } catch (error) {
    console.error("Errore nel recupero dell'ultimo round:", error)
    return {
      success: false,
      message: "Database error",
      round: null
    }
  }
}

export async function updatePlayerPointsComponent(playerId: number, newPoints: number): Promise<UpdatePlayerPointsReturnType> {
  try {
    const player = await getPlayer(playerId)
    if (!player || !player.roomId) {
      return {
        success: false,
        message: "Player not found",
        score: null,
      }
    }
    const room = await getRoomFromId(player.roomId)
    if (!room) {
      return {
        success: false,
        message: "Room not found",
        score: null,
      }
    }
    const lastRound = await getLastRound(room.id)
    const roundNumber = lastRound ? lastRound.roundNumber : 1
    const score = await updatePlayerPoints(playerId, roundNumber, newPoints)
    if (!score) {
      return {
        success: false,
        message: "Score not found",
        score: null,
      }
    }
    return {
      success: true,
      message: "Points updated",
      score,
    }
  } catch (error) {
    console.error("Errore nell'aggiornamento dei punti:", error)
    return {
      success: false,
      message: "Database error",
      score: null,
    }
  }
}

export async function updatePlayerDoublesComponent(playerId: number, doubles: number): Promise<UpdatePlayerDoublesReturnType> {
  try {
    const player = await getPlayer(playerId)
    if (!player || !player.roomId) {
      return {
        success: false,
        message: "Player not found",
        score: null,
      }
    }
    const room = await getRoomFromId(player.roomId)
    if (!room) {
      return {
        success: false,
        message: "Room not found",
        score: null,
      }
    }
    const lastRound = await getLastRound(room.id)
    const roundNumber = lastRound ? lastRound.roundNumber : 1
    const score = await updatePlayerDoubles(playerId, roundNumber, doubles)
    if (!score) {
      return {
        success: false,
        message: "Score not found",
        score: null,
      }
    }
    return {
      success: true,
      message: "Doubles updated",
      score,
    }
  } catch (error) {
    console.error("Errore nell'aggiornamento dei doubles:", error)
    return {
      success: false,
      message: "Database error",
      score: null,
    }
  }
}

export async function updatePlayerMahjongComponent(playerId: number, mahjong: boolean): Promise<UpdatePlayerMahjongReturnType> {
  try {
    const player = await getPlayer(playerId)
    if (!player || !player.roomId) {
      return {
        success: false,
        message: "Player not found",
        score: null,
      }
    }
    const room = await getRoomFromId(player.roomId)
    if (!room) {
      return {
        success: false,
        message: "Room not found",
        score: null,
      }
    }
    const lastRound = await getLastRound(room.id)
    const roundNumber = lastRound ? lastRound.roundNumber : 1
    const score = await updatePlayerMahjong(playerId, roundNumber, mahjong)
    if (!score) {
      return {
        success: false,
        message: "Score not found",
        score: null,
      }
    }
    return {
      success: true,
      message: "Mahjong updated",
      score,
    }
  } catch (error) {
    console.error("Errore nell'aggiornamento del mahjong:", error)
    return {
      success: false,
      message: "Database error",
      score: null,
    }
  }
}

export async function updatePlayerEstWindComponent(playerId: number, estWind: boolean): Promise<UpdatePlayerEstWindReturnType> {
  try {
    const player = await getPlayer(playerId)
    if (!player || !player.roomId) {
      return {
        success: false,
        message: "Player not found",
        score: null,
      }
    }
    const room = await getRoomFromId(player.roomId)
    if (!room) {
      return {
        success: false,
        message: "Room not found",
        score: null,
      }
    }
    const lastRound = await getLastRound(room.id)
    const roundNumber = lastRound ? lastRound.roundNumber : 1
    const score = await updatePlayerEstWind(playerId, roundNumber, estWind)
    if (!score) {
      return {
        success: false,
        message: "Score not found",
        score: null,
      }
    }
    return {
      success: true,
      message: "Est wind updated",
      score,
    }
  } catch (error) {
    console.error("Errore nell'aggiornamento dell'est wind:", error)
    return {
      success: false,
      message: "Database error",
      score: null,
    }
  }
}
