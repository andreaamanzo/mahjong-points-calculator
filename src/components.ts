import { CreateRoomReturnType, DeletePlayerReturnType, DeleteRoomReturnType, GetPlayersInRoomReturnType, JoinRoomReturnType, RenamePlayerReturnType } from "./types"
import { createPlayer, createRoom, deletePlayer, deleteRoom, getPlayers, getRoom, renamePlayer as renamePlayerDb } from "./dbComponents"

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
    const deletedRoom = await deleteRoom(roomCode)
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

export default {
  createRoomComponent,
  joinRoom,
  getPlayersInRoom,
  renamePlayerComponent,
}
