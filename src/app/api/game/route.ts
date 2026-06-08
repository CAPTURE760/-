import { NextRequest } from 'next/server'
import { createRoom, getRoom } from '@/app/lib/game'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}))
  const { action } = body

  if (action === 'create') {
    const room = createRoom()
    return Response.json({ ok: true, room: { id: room.id, status: room.status } })
  }

  if (action === 'get') {
    const id = body.id as string
    if (!id) return Response.json({ ok: false, error: 'missing id' })
    const room = getRoom(id)
    if (!room) return Response.json({ ok: false, error: 'room not found' })
    return Response.json({
      ok: true,
      room: {
        id: room.id,
        status: room.status,
        board: room.board,
        current: room.current,
        winner: room.winner,
        winLine: room.winLine,
        players: room.players,
      }
    })
  }

  return Response.json({ ok: false, error: 'unknown action' })
}
