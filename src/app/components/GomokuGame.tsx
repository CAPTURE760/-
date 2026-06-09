'use client'

import { useState, useEffect, useCallback, useRef } from 'react'

const BOARD_SIZE = 15

type Cell = 'black' | 'white' | null
type Status = 'waiting' | 'playing' | 'ended'
type Winner = 'black' | 'white' | 'draw' | null

interface RoomState {
  id: string
  board: Cell[]
  current: 'black' | 'white'
  status: Status
  winner: Winner
  winLine?: [number, number, number, number]
  players: { black: string | null; white: string | null }
}

function CellDot({ cell }: { cell: Cell }) {
  if (!cell) return null
  const isBlack = cell === 'black'
  return (
    <div
      className={isBlack
        ? 'absolute rounded-full bg-slate-900 shadow-[0_0_0_1px_rgba(255,255,255,0.3),0_2px_4px_rgba(0,0,0,0.4)]'
        : 'absolute rounded-full bg-white shadow-[0_0_0_1px_rgba(0,0,0,0.15),0_2px_4px_rgba(0,0,0,0.2)]'}
      style={{ width: '70%', height: '70%' }}
    />
  )
}

function isWinCell(row: number, col: number, winLine?: [number, number, number, number]) {
  if (!winLine) return false
  const [r1, c1, r2, c2] = winLine
  const minR = Math.min(r1, r2), maxR = Math.max(r1, r2)
  const minC = Math.min(c1, c2), maxC = Math.max(c1, c2)
  return row >= minR && row <= maxR && col >= minC && col <= maxC
}

export default function GomokuGame({ roomId, playerId }: { roomId: string; playerId: string }) {
  const [room, setRoom] = useState<RoomState | null>(null)
  const [myRole, setMyRole] = useState<'black' | 'white' | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const [roomUrl, setRoomUrl] = useState('')

  useEffect(() => {
    setRoomUrl(window.location.href)
  }, [])

  const fetchRoom = useCallback(async () => {
    try {
      const res = await fetch('/api/game', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'get', id: roomId }),
      })
      const data = await res.json()
      if (!data.ok) { setError(data.error); return }
      setRoom(data.room)
      setLoading(false)
      if (data.room.players.black === playerId) setMyRole('black')
      else if (data.room.players.white === playerId) setMyRole('white')
    } catch {}
  }, [roomId, playerId])

  useEffect(() => {
    fetchRoom()
    pollRef.current = setInterval(fetchRoom, 1000)
    return () => { if (pollRef.current) clearInterval(pollRef.current) }
  }, [fetchRoom])

  const copyLink = () => {
    navigator.clipboard.writeText(roomUrl).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  const handleClick = async (row: number, col: number) => {
    if (!room || room.status !== 'playing' || room.current !== myRole) return
    const index = row * BOARD_SIZE + col
    if (room.board[index] !== null) return

    const newBoard = [...room.board] as Cell[]
    newBoard[index] = myRole
    setRoom(prev => prev ? { ...prev, board: newBoard, current: myRole === 'black' ? 'white' : 'black' } : prev)

    try {
      const res = await fetch('/api/game/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'move', roomId, playerId, index }),
      })
      const data = await res.json()
      if (data.ok) setRoom(data.room)
      else fetchRoom()
    } catch { fetchRoom() }
  }

  if (loading) return (
    <div className= min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100>
      <div className=text-center><div className=text-4xl mb-4>...</div><div className=text-lg text-slate-600>connecting...</div></div>
    </div>
  )

  if (error) return (
    <div className=min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100>
      <div className=text-center><div className=text-4xl mb-4>error</div><div className=text-lg text-red-500 mb-4>{error}</div><a href=\/\ className=\px-4 py-2 bg-slate-900 text-white rounded-lg\>home</a></div>
    </div>
  )

  const isMyTurn = room?.current === myRole
  const statusLabel = room?.status === 'waiting' ? 'waiting for opponent...' :
    room?.status === 'playing' ? (isMyTurn ? 'your turn' : 'waiting...') :
    room?.winner === 'draw' ? 'draw!' :
    room?.winner ? (room.winner === 'black' ? 'black wins!' : 'white wins!') : ''
  const statusColor = room?.status === 'waiting' ? 'bg-amber-100 text-amber-700' :
    room?.status === 'ended' ? 'bg-green-100 text-green-700' :
    isMyTurn ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'

  return (
    <div className=\min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex flex-col items-center justify-center p-4\>
      <div className=\mb-4 text-center\>
        <div className=\text-sm text-slate-500 mb-1\>room: <span className=\font-mono font-bold text-slate-700\>{roomId}</span></div>
        <div className={inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium }>
          {statusLabel}
        </div>
        {room?.status === 'waiting' && (
          <div className=\mt-2 flex items-center justify-center gap-2\>
            <span className=\text-xs text-slate-400\>share link with friend:</span>
            <button onClick={copyLink} className=\text-xs px-3 py-1 bg-slate-800 text-white rounded-full hover:bg-slate-700 transition\>
              {copied ? 'copied!' : 'copy link'}
            </button>
          </div>
        )}
      </div>

      <div className=\bg-amber-50 rounded-2xl p-3 shadow-xl border-2 border-amber-200\>
        <div className=\grid gap-0 relative\ style={{ gridTemplateColumns: epeat(, 1fr) }}>
          {Array.from({ length: BOARD_SIZE * BOARD_SIZE }).map((_, i) => {
            const row = Math.floor(i / BOARD_SIZE)
            const col = i % BOARD_SIZE
            return (
              <div key={i}
                className=\w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center relative cursor-pointer\
                onClick={() => handleClick(row, col)}>
                <div className=\absolute inset-0 flex items-center\>
                  {col < BOARD_SIZE - 1 && <div className=\w-full h-px bg-slate-300 absolute\ />}
                </div>
                <div className=\absolute inset-0 flex justify-center\>
                  {row < BOARD_SIZE - 1 && <div className=\h-full w-px bg-slate-300 absolute\ />}
                </div>
                {room?.board[i] && <div className=\relative z-10\><CellDot cell={room.board[i]} /></div>}
                {isWinCell(row, col, room?.winLine) && <div className=\absolute inset-0 z-20 bg-yellow-400/40 rounded-full animate-pulse\ />}
              </div>
            )
          })}
        </div>
      </div>

      <div className=\mt-4 flex gap-8 text-sm\>
        <div className={lex items-center gap-2 }>
          <div className=\w-3 h-3 rounded-full bg-slate-900\ />
          <span className=\text-slate-600\>
            {room?.players.black === playerId ? 'you (black)' : room?.players.black ? 'opponent' : 'empty'}
          </span>
          {room?.current === 'black' && room?.status === 'playing' && <span className=\text-xs text-green-500\>playing</span>}
        </div>
        <div className={lex items-center gap-2 }>
          <div className=\w-3 h-3 rounded-full bg-white border border-slate-300\ />
          <span className=\text-slate-600\>
            {room?.players.white === playerId ? 'you (white)' : room?.players.white ? 'opponent' : 'empty'}
          </span>
          {room?.current === 'white' && room?.status === 'playing' && <span className=\text-xs text-green-500\>playing</span>}
        </div>
      </div>

      {room?.status === 'ended' && (
        <a href=\/\ className=\mt-4 px-6 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition text-sm\>
          play again
        </a>
      )}
    </div>
  )
}
