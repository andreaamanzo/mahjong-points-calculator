import { ResultSetHeader, RowDataPacket } from "mysql2"
import db from "./db"
import { Player, Room, Score, Round } from "./types"

export async function getRoom(roomCode: string): Promise<Room | null> {
	const [rooms] = await db.pool.execute<RowDataPacket[]>(
		"SELECT id, code, is_started FROM rooms WHERE code = ?",
		[roomCode]
	)

	if (rooms.length === 0) {
		return null
	}

	const room = rooms[0]
	return {
		id: room.id,
		code: room.code,
		isStarted: room.is_started
	}
}

export async function getRoomFromId(roomId: number): Promise<Room | null> {
	const [rooms] = await db.pool.execute<RowDataPacket[]>(
		"SELECT id, code, is_started FROM rooms WHERE id = ?",
		[roomId]
	)

	if (rooms.length === 0) {
		return null
	}

	const room = rooms[0]
	return {
		id: room.id,
		code: room.code,
		isStarted: room.is_started
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
		isStarted: false
	}
}

export async function startRoom(roomCode: string): Promise<Room | null> {
	const [result] = await db.pool.execute<ResultSetHeader>(
		"UPDATE rooms SET is_started = 1 WHERE code = ?",
		[roomCode]
	)
	await db.pool.execute<ResultSetHeader>(
		"INSERT INTO rounds (room_id, round_number) VALUES ((SELECT id FROM rooms WHERE code = ?), 1)",
		[roomCode]
	)
	const [players] = await db.pool.execute<RowDataPacket[]>(
		"SELECT id FROM players WHERE room_id = (SELECT id FROM rooms WHERE code = ?)",
		[roomCode]
	)

	const [roundRows] = await db.pool.execute<RowDataPacket[]>(
		"SELECT id FROM rounds WHERE room_id = (SELECT id FROM rooms WHERE code = ?) AND round_number = 1",
		[roomCode]
	)
	const roundId = roundRows[0].id

	for (const player of players) {
		await db.pool.execute<ResultSetHeader>(
			"INSERT INTO scores (player_id, round_id, points, doubles, est_wind, mahjong) VALUES (?, ?, 0, 0, 0, 0)",
			[player.id, roundId]
		)
	}

	if (result.affectedRows === 0) {
		return null
	}

	return getRoom(roomCode)
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
		roomId
	}
}

export async function getPlayers(roomId: number): Promise<Player[]> {
	const [playerRows] = await db.pool.execute<RowDataPacket[]>(
		"SELECT id, name, is_host, room_id FROM players WHERE room_id = ?",
		[roomId]
	)

	return playerRows.map((player) => ({
		id: player.id,
		name: player.name,
		isHost: player.is_host,
		roomId: player.room_id
	}))
}

export async function getPlayer(playerId: number): Promise<Player | null> {
	const [playerRows] = await db.pool.execute<RowDataPacket[]>(
		"SELECT id, name, is_host, room_id FROM players WHERE id = ?",
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
		roomId: player.room_id
	}
}

export async function renamePlayer(playerId: number, newName: string): Promise<Player | null> {
	await db.pool.execute(
		"UPDATE players SET name = ? WHERE id = ?",
		[newName, playerId]
	)

	const [playerRows] = await db.pool.execute<RowDataPacket[]>(
		"SELECT id, name, is_host, room_id FROM players WHERE id = ?",
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
		roomId: player.room_id
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

export async function deleteRoom(roomId: number): Promise<Room | null> {
	const [roomRows] = await db.pool.execute<RowDataPacket[]>(
		"SELECT id, code, is_started FROM rooms WHERE id = ?",
		[roomId]
	)

	if (roomRows.length === 0) {
		return null
	}

	const room = roomRows[0]

	await db.pool.execute(
		"DELETE FROM rooms WHERE id = ?",
		[roomId]
	)

	return {
		id: room.id,
		code: room.code,
		isStarted: room.is_started
	}
}

export async function getPlayerScore(playerId: number, roundNumber: number): Promise<Score | null> {
	const [scoreRows] = await db.pool.execute<RowDataPacket[]>(
		`SELECT s.id, s.player_id, s.points, s.doubles, s.est_wind, s.mahjong
		 FROM scores s
		 JOIN rounds r ON s.round_id = r.id
		 WHERE s.player_id = ? AND r.round_number = ?`,
		[playerId, roundNumber]
	)

	if (scoreRows.length === 0) {
		return null
	}

	const score = scoreRows[0]
	return {
		id: score.id,
		playerId: score.player_id,
		points: score.points,
		doubles: score.doubles,
		estWind: score.est_wind,
		mahjong: score.mahjong
	}
}

export async function getPlayerLastScore(playerId: number): Promise<Score | null> {
	const [scoreRows] = await db.pool.execute<RowDataPacket[]>(
		`SELECT s.round_id, r.round_number
		 FROM scores s
		 JOIN rounds r ON s.round_id = r.id
		 WHERE s.player_id = ?
		 ORDER BY r.round_number DESC
		 LIMIT 1`,
		[playerId]
	)

	if (scoreRows.length === 0) {
		return null
	}

	const lastRoundNumber = scoreRows[0].round_number
	return getPlayerScore(playerId, lastRoundNumber)
}

// export async function getPlayerLastScore(playerId: number): Promise<Score | null> {
//     const [scoreRows] = await db.pool.execute<RowDataPacket[]>(
//         "SELECT id, player_id, points, doubles, est_wind, mahjong, round_number FROM scores WHERE player_id = ? ORDER BY round_number DESC LIMIT 1",
//         [playerId]
//     )

//     if (scoreRows.length === 0) {
//         return null
//     }

//     const score = scoreRows[0]
//     return {
//         id: score.id,
//         playerId: score.player_id,
//         points: score.points,
//         doubles: score.doubles,
//         estWind: score.est_wind,
//         mahjong: score.mahjong
//     }
// }

export async function getRound(roomId: number, roundNumber: number): Promise<Round | null> {
	const [roundRows] = await db.pool.execute<RowDataPacket[]>(
		"SELECT id, room_id, round_number FROM rounds WHERE room_id = ? AND round_number = ?",
		[roomId, roundNumber]
	)

	if (roundRows.length === 0) {
		return null
	}

	const round = roundRows[0]
	const players = await getPlayers(round.room_id)
	
	if (players.length != 4) {
		return null
	}

	const scores = await Promise.all(players.map(p => getPlayerScore(p.id, round.round_number)))

	if (scores.some(score => score === null)) {
		return null
	}

	return {
		id: round.id,
		roundNumber: round.round_number,
		roomId: round.room_id,
		scores: scores as [Score, Score, Score, Score]
	}
}

export async function getLastRound(roomId: number): Promise<Round | null> {
	const [roundRows] = await db.pool.execute<RowDataPacket[]>(
		"SELECT round_number FROM rounds WHERE room_id = ? ORDER BY round_number DESC LIMIT 1",
		[roomId]
	)

	if (roundRows.length === 0) {
		return null
	}

	const lastRoundNumber = roundRows[0].round_number
	return getRound(roomId, lastRoundNumber)
}

export async function updatePlayerPoints(playerId: number, roundNumber: number, points: number): Promise<Score | null> {
	const [result] = await db.pool.execute<ResultSetHeader>(
		`UPDATE scores 
		 SET points = ?
		 WHERE player_id = ? AND round_id = (SELECT id FROM rounds WHERE round_number = ? AND room_id = (SELECT room_id FROM players WHERE id = ?))`,
		[points, playerId, roundNumber, playerId]
	)

	if (result.affectedRows === 0) {
		return null
	}

	return getPlayerScore(playerId, roundNumber)
}

export async function updatePlayerDoubles(playerId: number, roundNumber: number, doubles: number): Promise<Score | null> {
	const [result] = await db.pool.execute<ResultSetHeader>(
		`UPDATE scores 
		 SET doubles = ?
		 WHERE player_id = ? AND round_id = (SELECT id FROM rounds WHERE round_number = ? AND room_id = (SELECT room_id FROM players WHERE id = ?))`,
		[doubles, playerId, roundNumber, playerId]
	)

	if (result.affectedRows === 0) {
		return null
	}

	return getPlayerScore(playerId, roundNumber)
}

export async function updatePlayerMahjong(playerId: number, roundNumber: number, mahjong: boolean): Promise<Score | null> {
	if (mahjong) {
		await db.pool.execute(
			`UPDATE scores 
			 SET mahjong = 0 
			 WHERE round_id = (
				 SELECT id FROM rounds WHERE round_number = ? AND room_id = (SELECT room_id FROM players WHERE id = ?)
			 ) AND player_id != ?`,
			[roundNumber, playerId, playerId]
		)
	}

	const [result] = await db.pool.execute<ResultSetHeader>(
		`UPDATE scores 
		 SET mahjong = ?
		 WHERE player_id = ? AND round_id = (SELECT id FROM rounds WHERE round_number = ? AND room_id = (SELECT room_id FROM players WHERE id = ?))`,
		[mahjong, playerId, roundNumber, playerId]
	)

	if (result.affectedRows === 0) {
		return null
	}

	return getPlayerScore(playerId, roundNumber)
}

export async function updatePlayerEstWind(playerId: number, roundNumber: number, estWind: boolean): Promise<Score | null> {
	if (estWind) {
		await db.pool.execute(
			`UPDATE scores 
			 SET est_wind = 0 
			 WHERE round_id = (
				 SELECT id FROM rounds WHERE round_number = ? AND room_id = (SELECT room_id FROM players WHERE id = ?)
			 ) AND player_id != ?`,
			[roundNumber, playerId, playerId]
		)
	}
	const [result] = await db.pool.execute<ResultSetHeader>(
		`UPDATE scores 
		 SET est_wind = ?
		 WHERE player_id = ? AND round_id = (SELECT id FROM rounds WHERE round_number = ? AND room_id = (SELECT room_id FROM players WHERE id = ?))`,
		[estWind, playerId, roundNumber, playerId]
	)

	if (result.affectedRows === 0) {
		return null
	}

	return getPlayerScore(playerId, roundNumber)
}