'use client'

import dynamic from 'next/dynamic'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

function generateId() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36)
}

export default function RoomPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [ready, setReady] = useState(false)

  useEffect(() => {
    let playerId = sessionStorage.getItem('playerId')
    if (!playerId) {
      playerId = generateId()
      sessionStorage.setItem('playerId', playerId)
    }

    fetch('/api/game/join', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'join', roomId: params.id, playerId }),
    }).then(res => res.json()).then(data => {
      if (!data.ok) {
        router.push('/')
      } else {
        setReady(true)
      }
    }).catch(() => router.push('/'))
  }, [params.id, router])

  if (!ready) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <div className="text-5xl mb-4 animate-pulse">⏳</div>
          <div className="text-slate-400">进入房间...</div>
        </div>
      </div>
    )
  }

  const GomokuGame = dynamic(() => import('@/app/components/GomokuGame'), { ssr: false })
  return <GomokuGame roomId={params.id} playerId={sessionStorage.getItem('playerId') || ''} />
}
