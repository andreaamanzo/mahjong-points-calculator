export type Player = {
  id: number,
  name: string,
  isHost: boolean,
}

export type Room = {
    id: number,
    code: string,
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