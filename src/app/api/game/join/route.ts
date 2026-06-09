import { NextRequest } from 'next/server'
import { joinRoom, makeMove, getRoom } from '@/app/lib/game'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}))
    const { action, roomId, playerId, index } = body

    if (action === 'join') {
      if (!roomId || !playerId) return Response.json({ ok: false, error: 'missing params' })
      const room = joinRoom(roomId, playerId)
      if (!room) return Response.json({ ok: false, error: 'join failed' })
      return Response.json({ ok: true, room: { id: room.id, status: room.status, players: room.players } })
    }

    if (action === 'move') {
      if (!roomId || !playerId || index === undefined) return Response.json({ ok: false, error: 'missing params' })
      const room = makeMove(roomId, playerId, index)
      if (!room) return Response.json({ ok: false, error: 'move invalid' })
      return Response.json({
        ok: true,
        room: {
          id: room.id,
          board: room.board,
          current: room.current,
          status: room.status,
          winner: room.winner,
          winLine: room.winLine,
          players: room.players,
        }
      })
    }

    if (action === 'get') {
      const room = getRoom(roomId)
      if (!room) return Response.json({ ok: false, error: 'room not found' })
      return Response.json({
        ok: true,
        room: {
          id: room.id,
          board: room.board,
          current: room.current,
          status: room.status,
          winner: room.winner,
          winLine: room.winLine,
          players: room.players,
        }
      })
    }

    return Response.json({ ok: false, error: 'unknown action' })
  } catch (e: any) {
    return Response.json({ ok: false, error: e.message }, { status: 500 })
  }
}
