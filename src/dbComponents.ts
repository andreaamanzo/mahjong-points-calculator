import { ResultSetHeader, RowDataPacket } from "mysql2"
import db from "./db"
import { Player, Room } from "./types"

export async function getRoom(roomCode: string): Promise<Room | null> {
    const [rooms] = await db.pool.execute<RowDataPacket[]>(
        "SELECT id, code FROM rooms WHERE code = ?",
        [roomCode]
    )

    if (rooms.length === 0) {
        return null
    }

    const room = rooms[0]
    return {
        id: room.id,
        code: room.code,
    }
}

export async function createRoom(roomCode: string): Promise<Room> {
    const [roomResult] = await db.pool.execute<ResultSetHeader>(
        "INSERT INTO rooms (code) VALUES (?)",
        [roomCode]
    )

    return {
        id: roomResult.insertId,
        code: roomCode,
    }
}

export async function createPlayer(roomId: number, playerName: string, isHost: boolean): Promise<Player> {
    const [playerResult] = await db.pool.execute<ResultSetHeader>(
        "INSERT INTO players (room_id, name, is_host) VALUES (?, ?, ?)",
        [roomId, playerName, isHost]
    )

    return {
        id: playerResult.insertId,
        name: playerName,
        isHost,
    }
}

export async function getPlayers(roomId: number): Promise<Player[]> {
    const [playerRows] = await db.pool.execute<RowDataPacket[]>(
        "SELECT id, name, is_host FROM players WHERE room_id = ?",
        [roomId]
    )

    return playerRows.map((player) => ({
        id: player.id,
        name: player.name,
        isHost: player.is_host,
    }))
}

export async function getPlayer(playerId: number): Promise<Player | null> {
    const [playerRows] = await db.pool.execute<RowDataPacket[]>(
        "SELECT id, name, is_host FROM players WHERE id = ?",
        [playerId]
    )

    if (playerRows.length === 0) {
        return null
    }

    const player = playerRows[0]
    return {
        id: player.id,
        name: player.name,
        isHost: player.is_host,
    }
}

export async function renamePlayer(playerId: number, newName: string): Promise<Player | null> {
    await db.pool.execute(
        "UPDATE players SET name = ? WHERE id = ?",
        [newName, playerId]
    )

    const [playerRows] = await db.pool.execute<RowDataPacket[]>(
        "SELECT id, name, is_host FROM players WHERE id = ?",
        [playerId]
    )

    if (playerRows.length === 0) {
        return null
    }

    const player = playerRows[0]
    return {
        id: player.id,
        name: player.name,
        isHost: player.is_host,
    }
}

export async function deletePlayer(playerId: number): Promise<Player | null> {
    const player = getPlayer(playerId)

    if (!player) {
        return null
    }

    await db.pool.execute(
        "DELETE FROM players WHERE id = ?",
        [playerId]
    )

    return player
}

export async function deleteRoom(roomCode: string): Promise<Room | null> {
    const room = await getRoom(roomCode)

    if (!room) {
        return null
    }

    await db.pool.execute(
        "DELETE FROM rooms WHERE id = ?",
        [room.id]
    )

    return room
}