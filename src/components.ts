import { ResultSetHeader, RowDataPacket } from "mysql2"
import db from "./db"

type RoomResponse = {
  success: boolean,
  message: string,
  room: {
    id: number,
    code: string,
  } | null,
  player: {
    id: number,
    name: string,
    is_host: boolean,
  } | null
}

export async function createRoom(hostName: string) : Promise<RoomResponse> {
  let code = "";

  for (let i = 0; i < 5; i++) {
    const tempCode = Math.random().toString(36).substring(2, 10).toUpperCase();

    const [existing] = await db.pool.execute(
      "SELECT id FROM rooms WHERE code = ?",
      [tempCode]
    )

    if ((existing as any[]).length === 0) {
      code = tempCode;
      break;
    }
  }

  if (!code) {
    return {
      success: false,
      message: "can't generate a valid code",
      room: null,
      player: null
    }
  }

  try {
    const [roomResult] = await db.pool.execute<ResultSetHeader>(
      "INSERT INTO rooms (code) VALUES (?)",
      [code]
    )
    const roomId = roomResult.insertId;

    const [playerResult] = await db.pool.execute<ResultSetHeader>(
      "INSERT INTO players (room_id, name, is_host) VALUES (?, ?, ?)",
      [roomId, hostName, true]
    )
    const playerId = playerResult.insertId;

    return {
      success: true,
      message: "success",
      room: {
        id: roomId,
        code,
      },
      player: {
        id: playerId,
        name: hostName,
        is_host: true,
      }
    }
  } catch (error) {
    console.error("Errore nella creazione della stanza:", error);
    throw error;
  }
}

export async function joinRoom(roomCode: string, playerName: string) : Promise<RoomResponse> {
  console.log(roomCode)
  try {
    const [rooms] = await db.pool.execute<RowDataPacket[]>(
      "SELECT id FROM rooms WHERE code = ?",
      [roomCode]
    );

    if (rooms.length === 0) {
      return {
        success: false,
        message: "room not found",
        room: null,
        player: null
      }
    }

    const roomId = rooms[0].id;

    const [playerResult] = await db.pool.execute<ResultSetHeader>(
      "INSERT INTO players (room_id, name) VALUES (?, ?)",
      [roomId, playerName]
    );

    const playerId = playerResult.insertId;

    return {
      success: false,
      message: "success",
      room: {
        id: roomId,
        code: roomCode,
      },
      player: {
        id: playerId,
        name: playerName,
        is_host: false,
      }
    };
  } catch (error) {
    console.error("Errore durante l'ingresso nella stanza:", error);
    throw error;
  }
}

export default {
  createRoom,
  joinRoom,
};
