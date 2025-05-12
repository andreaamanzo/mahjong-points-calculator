import { CreateRoomReturnType, GetPlayersInRoomReturnType, JoinRoomReturnType, RenamePlayerReturnType } from "./types"
import { createPlayer, createRoom, getPlayers, getRoom, renamePlayer as renamePlayerDb } from "./dbComponents"

export async function hostCreateNewRoom(hostName: string): Promise<CreateRoomReturnType> {
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

export async function joinRoom(roomCode: string, playerName: string): Promise<JoinRoomReturnType> {
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

export async function getPlayersInRoom(roomCode: string): Promise<GetPlayersInRoomReturnType> {
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

export async function renamePlayerComponent(playerId: number, newName: string): Promise<RenamePlayerReturnType> {
  if (!newName || newName.trim() === "") {
    return {
      success: false,
      message: "Invalid name",
      player: null,
    }
  }

  try {
    const updatedPlayer = await renamePlayerDb(playerId, newName.trim())
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

export default {
  hostCreateNewRoom,
  joinRoom,
  getPlayersInRoom,
  renamePlayerComponent,
}
