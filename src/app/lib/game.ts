// 服务端内存存储（重启丢失，生产环境换 Redis）
export type Player = 'black' | 'white'
export type Cell = Player | null

export interface Room {
  id: string
  board: Cell[]
  current: Player
  status: 'waiting' | 'playing' | 'ended'
  winner: Player | 'draw' | null
  winLine?: [number, number, number, number] // [r1,c1,r2,c2]
  players: { black: string | null; white: string | null }
  createdAt: number
}

// 15x15 = 225
const BOARD_SIZE = 15
const rooms = new Map<string, Room>()

export function createRoom(): Room {
  const id = nanoid(8)
  const room: Room = {
    id,
    board: Array(BOARD_SIZE * BOARD_SIZE).fill(null),
    current: 'black',
    status: 'waiting',
    winner: null,
    players: { black: null, white: null },
    createdAt: Date.now(),
  }
  rooms.set(id, room)
  // 30分钟自动清理
  setTimeout(() => rooms.delete(id), 30 * 60 * 1000)
  return room
}

export function getRoom(id: string): Room | undefined {
  return rooms.get(id)
}

export function joinRoom(id: string, playerId: string): Room | null {
  const room = rooms.get(id)
  if (!room) return null
  if (room.players.black === playerId || room.players.white === playerId) {
    return room // 断线重连
  }
  if (room.players.black === null) {
    room.players.black = playerId
    room.status = 'playing'
  } else if (room.players.white === null) {
    room.players.white = playerId
    room.status = 'playing'
  } else {
    return null // 房间已满
  }
  return room
}

export function makeMove(id: string, playerId: string, index: number): Room | null {
  const room = rooms.get(id)
  if (!room || room.status !== 'playing') return null

  const player: Player = room.players.black === playerId ? 'black'
    : room.players.white === playerId ? 'white'
    : null
  if (!player || room.current !== player) return null
  if (room.board[index] !== null) return null

  room.board[index] = player
  const row = Math.floor(index / BOARD_SIZE)
  const col = index % BOARD_SIZE

  const winResult = checkWin(room.board, row, col, player)
  if (winResult) {
    room.status = 'ended'
    room.winner = player
    room.winLine = winResult
  } else if (room.board.every(c => c !== null)) {
    room.status = 'ended'
    room.winner = 'draw'
  } else {
    room.current = player === 'black' ? 'white' : 'black'
  }
  return room
}

function checkWin(board: Cell[], row: number, col: number, player: Player): [number, number, number, number] | null {
  const dirs = [
    [0, 1],   // 水平
    [1, 0],   // 垂直
    [1, 1],   // 对角
    [1, -1],  // 反对角
  ]
  for (const [dr, dc] of dirs) {
    let r1 = row, c1 = col, r2 = row, c2 = col
    let count = 1

    // 正方向
    for (let i = 1; i < 5; i++) {
      const nr = row + dr * i, nc = col + dc * i
      if (nr < 0 || nr >= BOARD_SIZE || nc < 0 || nc >= BOARD_SIZE) break
      if (board[nr * BOARD_SIZE + nc] !== player) break
      r2 = nr; c2 = nc; count++
    }
    // 反方向
    for (let i = 1; i < 5; i++) {
      const nr = row - dr * i, nc = col - dc * i
      if (nr < 0 || nr >= BOARD_SIZE || nc < 0 || nc >= BOARD_SIZE) break
      if (board[nr * BOARD_SIZE + nc] !== player) break
      r1 = nr; c1 = nc; count++
    }

    if (count >= 5) return [r1, c1, r2, c2]
  }
  return null
}

function nanoid(len: number): string {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let result = ''
  const array = new Uint8Array(len)
  crypto.getRandomValues(array)
  for (const byte of array) {
    result += chars[byte % chars.length]
  }
  return result
}
