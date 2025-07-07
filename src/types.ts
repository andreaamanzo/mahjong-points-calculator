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
  scores: [Score, Score, Score, Score]
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

export type GetLastRoundReturnType = {
  success: true,
  message: string,
  round: Round
} | {
  success: false,
  message: string,
  round: null
}

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