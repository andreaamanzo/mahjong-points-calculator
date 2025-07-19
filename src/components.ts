import {
  CreateRoomReturnType,
  DeletePlayerReturnType,
  DeleteRoomReturnType,
  GetRoundReturnType,
  GetPlayersInRoomReturnType,
  JoinRoomReturnType,
  RenamePlayerReturnType,
  StartRoomReturnType,
  UpdatePlayerPointsReturnType,
  UpdatePlayerDoublesReturnType,
  UpdatePlayerMahjongReturnType,
  UpdatePlayerEstWindReturnType,
  GetPlayerReturnType,
  GetRoundResultsReturnType,
  RoundResult,
  CalculatePointsReturnType,
  CalculateRoomScoreboardReturnType,
  UpdateRoundLimitReturnType,
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
  getRound,
  startNewRound,
  getRoomRounds,
  updateRoundLimit,
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

export async function getLastRoundComponent(roomCode: string): Promise<GetRoundReturnType> {
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

export async function getRoundComponent(roomId: number, roundNumber: number): Promise<GetRoundReturnType>
export async function getRoundComponent(roundId: number): Promise<GetRoundReturnType>
export async function getRoundComponent(param1: number, param2?: number): Promise<GetRoundReturnType> {
  try {
    let round
    if (param2 !== undefined) {
      // Caso con roomId e roundNumber
      round = await getRound(param1, param2)
    } else {
      // Caso con roundId
      round = await getRound(param1)
    }

    if (!round) {
      return {
        success: false,
        message: "Round not found",
        round: null
      }
    }

    return {
      success: true,
      message: "Round retrieved",
      round
    }
  } catch (error) {
    console.error("Errore nel recupero del round:", error)
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

export async function getRoundResultsComponent(roundId: number): Promise<GetRoundResultsReturnType> {
  try {
    const round = await getRound(roundId)
    if (!round) {
      return {
        success: false,
        message: "Round not found",
        roundResults: null
      }
    }

    const roundResults = await Promise.all(
      round.scores.map(async (score) => {
        const player = await getPlayer(score.playerId)
        return {
          playerId: score.playerId,
          playerName: player?.name ?? "",
          mahjong: score.mahjong,
          estWind: score.estWind,
          basePoints: score.points * Math.pow(2, score.doubles + (score.estWind ? 1 : 0)),
          finalPoints: 0
        }
      })
    ) as [RoundResult, RoundResult, RoundResult, RoundResult]

    roundResults.forEach(player => {
      const limit = round.limit * (player.estWind ? 2 : 1)
      if (player.basePoints > limit) player.basePoints = limit
    })

    roundResults.forEach(player => {
      if (!player.mahjong) {
        roundResults.forEach(otherPlayer => {
          if (!(otherPlayer === player)) {
            const pointsToPay = player.estWind ? (otherPlayer.basePoints * 2) : (otherPlayer.basePoints)
            otherPlayer.finalPoints += pointsToPay
            player.finalPoints -= pointsToPay
          }
        })
      }
    })
    return {
      success: true,
      message: "Round retrieved",
      roundResults: roundResults
    }
  } catch (error){
    console.error("Errore nel recuperare i round results:", error)
    return {
      success: false,
      message: "Database error",
      roundResults: null,
    }
  }

} 

export async function calculatePointsComponent(roomCode: string, limit: number): Promise<CalculatePointsReturnType> {
  const lastRoundResults = await getLastRoundComponent(roomCode)
  if (!lastRoundResults.success) {
    return {
      success: false,
      message: lastRoundResults.message,
      roundResults: null
    }
  }
  const mahjong = lastRoundResults.round.scores.find(score => score.mahjong)
  const estWind = lastRoundResults.round.scores.find(score => score.estWind)

  if (!mahjong || !estWind) {
    return {
      success: false,
      message: "Mahjng or EstWind player not selected",
      roundResults: null
    }
  }

  const roundResultsResults = await getRoundResultsComponent(lastRoundResults.round.id)
  if (!roundResultsResults.success) {
    return {
      success: false,
      message: roundResultsResults.message,
      roundResults: null
    }
  }

  try {
    const roomId = (await getRoom(roomCode))?.id
    if (!roomId) {
      throw new Error("Can't get roomId")
    }
    await startNewRound(roomId)

    return {
      success: true,
      message: "Round registrated",
      roundResults: roundResultsResults.roundResults
    }

  } catch (error) {
    console.error("Errore nel calcolo dei punti:", error)
    return {
      success: false,
      message: "Database error",
      roundResults: null,
    }
  }

}

export async function calculateRoomScoreboardComponent(roomCode: string): Promise<CalculateRoomScoreboardReturnType> {
  try {
    const players = (await getPlayersInRoomComponent(roomCode)).players
    if (!players) {
      return {
        success: false,
        message: "Players not found",
        scoreboard: null,
        gamesPlayed: null
      }
    }


    const rounds = await getRoomRounds(roomCode)
    if (!rounds) {
      return {
        success: false,
        message: "Rounds not found",
        scoreboard: null,
        gamesPlayed: null
      }
    }
    rounds.pop()
    
    const roundResults = await Promise.all(
      rounds.map(async (round) => {
        const result = await getRoundResultsComponent(round.id)
        if (!result.success) {
          throw new Error(`Failed to retrieve results for round ${round.id}`)
        }
        return result.roundResults
      })
    )


    const scoreboard = [0, 1, 2, 3].map(i => {
      return {
        player: players[i],
        points: 0,
      }
    })

    roundResults.forEach(round => {
      round.forEach(playerScore => {
        scoreboard.find(p => p.player.id == playerScore.playerId)!.points += playerScore.finalPoints
      })
    })

    scoreboard.sort((a, b) => b.points - a.points)

    return {
      success: true,
      message: "Scoreboard calculated",
      scoreboard,
      gamesPlayed: roundResults.length
    }

  } catch (error) {
    console.error("Errore nel calcolare la scoreboard:", error)
    return {
      success: false,
      message: "Database error",
      scoreboard: null,
      gamesPlayed: null
    }
  }
}

export async function updateRoundLimitComponent(roundId: number, newLimit: number): Promise<UpdateRoundLimitReturnType> {
  try {
    const round = await getRound(roundId)
    if (!round) {
      return {
        success: false,
        message: "Round not found",
        limit: null,
      }
    }

    const updatedLimit = await updateRoundLimit(roundId, newLimit)

    if (updatedLimit === null) {
      return {
        success: false,
        message: "Failed to update round limit",
        limit: null,
      }
    }

    return {
      success: true,
      message: "Round limit updated successfully",
      limit: newLimit
    }
  } catch (error) {
    console.error("Errore nell'aggiornamento del limite del round:", error)
    return {
      success: false,
      message: "Database error",
      limit: null,
    }
  }
}

