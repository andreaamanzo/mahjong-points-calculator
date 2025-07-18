export type Player = {
  id: number,
  name: string,
  isHost: boolean,
  roomId: number
}

export type Room = {
  id: number,
  code: string,
  isStarted: boolean
}

export type Score = {
  id: number,
  playerId: number
  points: number,
  doubles: number,
  estWind: boolean,
  mahjong: boolean
}

export type Round = {
  id: number,
  roundNumber: number,
  roomId: number,
  limit: number,
  scores: [Score, Score, Score, Score]
}

export type RoundResult = {
  playerId: number,
  playerName: string,
  basePoints: number,
  finalPoints: number,
  estWind: boolean,
  mahjong: boolean
}

export type CreateRoomReturnType = {
  success: true,
  message: string,
  room:  Room,
  player: Player
} | {
  success: false,
  message: string,
  room:  null,
  player: null
}

export type JoinRoomReturnType = CreateRoomReturnType

export type GetPlayersInRoomReturnType = {
  success: true,
  message: string,
  room: Room ,
  players: Player[] 
} | {
  success: false,
  message: string,
  room: null ,
  players: null 
}

export type RenamePlayerReturnType = {
  success: true,
  message: string,
  player: Player
} | {
  success: false,
  message: string,
  player: null
}

export type GetPlayerReturnType = RenamePlayerReturnType

export type DeletePlayerReturnType = RenamePlayerReturnType

export type DeleteRoomReturnType = {
  success: true,
  message: string,
  room: Room
} | {
  success: false,
  message: string,
  room: null
}

export type StartRoomReturnType = DeleteRoomReturnType

export type GetRoundReturnType = {
  success: true,
  message: string,
  round: Round
} | {
  success: false,
  message: string,
  round: null
}

export type GetRoundResultsReturnType = {
  success: true,
  message: string,
  roundResults: [RoundResult, RoundResult, RoundResult, RoundResult]
} | {
  success: false,
  message: string,
  roundResults: null
}

export type CalculatePointsReturnType =  GetRoundResultsReturnType

export type UpdatePlayerPointsReturnType = {
  success: true,
  message: string,
  score: Score
} | {
  success: false,
  message: string,
  score: null
}

export type UpdatePlayerDoublesReturnType = UpdatePlayerPointsReturnType

export type UpdatePlayerMahjongReturnType = UpdatePlayerPointsReturnType

export type UpdatePlayerEstWindReturnType = UpdatePlayerPointsReturnType

export type UpdateRoundLimitReturnType = {
  success: true,
  message: string,
  limit: number
} | {
  success: false,
  message: string,
  limit: null
}

export type CalculateRoomScoreboardReturnType = {
  success: true,
  message: string,
  scoreboard: {
    player: Player,
    points: number,
  }[]
  gamesPlayed: number
} | {
  success: false,
  message: string,
  scoreboard: null,
  gamesPlayed: null
}