'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

function generateId() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36)
}

export default function Home() {
  const [joinId, setJoinId] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const createRoom = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/game', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'create' }),
      })
      const data = await res.json()
      if (!data.ok) { setError(data.error); return }
      const playerId = generateId()
      sessionStorage.setItem('playerId', playerId)
      sessionStorage.setItem('isCreator', 'true')
      router.push(`/room/${data.room.id}`)
    } catch {
      setError('创建失败，请重试')
    } finally {
      setLoading(false)
    }
  }

  const joinRoom = async () => {
    if (!joinId.trim()) return
    setLoading(true)
    setError('')
    try {
      // 先验证房间是否存在
      const res = await fetch('/api/game', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'get', id: joinId.trim() }),
      })
      const data = await res.json()
      if (!data.ok || !data.room) { setError('房间不存在'); return }

      const playerId = generateId()
      sessionStorage.setItem('playerId', playerId)
      sessionStorage.setItem('isCreator', 'false')
      router.push(`/room/${joinId.trim()}`)
    } catch {
      setError('加入失败，请重试')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="text-6xl mb-4">⚫</div>
          <h1 className="text-4xl font-bold text-white mb-2">Gomoku Online</h1>
          <p className="text-slate-400">和朋友实时对战五子棋</p>
        </div>

        {/* 棋盘装饰 */}
        <div className="flex justify-center mb-8 opacity-20">
          <div className="grid grid-cols-15 gap-0 w-48 h-48 bg-amber-100 p-2 rounded-xl border border-amber-300">
            {Array.from({ length: 15 * 15 }).map((_, i) => (
              <div key={i} className="border border-amber-300/50 flex items-center justify-center">
                {i === 112 && <div className="w-2 h-2 rounded-full bg-slate-800" />}
                {i === 16 && <div className="w-1.5 h-1.5 rounded-full bg-slate-800" />}
                {i === 28 && <div className="w-1.5 h-1.5 rounded-full bg-slate-800" />}
                {i === 196 && <div className="w-1.5 h-1.5 rounded-full bg-slate-800" />}
                {i === 208 && <div className="w-1.5 h-1.5 rounded-full bg-slate-800" />}
              </div>
            ))}
          </div>
        </div>

        {/* 功能卡片 */}
        <div className="space-y-4">
          {/* 创建房间 */}
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
            <h2 className="text-white font-semibold mb-1">🎮 创建房间</h2>
            <p className="text-slate-400 text-sm mb-4">创建房间后分享链接给朋友</p>
            <button
              onClick={createRoom}
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-yellow-500 to-amber-500 text-slate-900 font-bold rounded-xl hover:from-yellow-400 hover:to-amber-400 transition disabled:opacity-50"
            >
              {loading ? '创建中...' : '创建房间 +'}
            </button>
          </div>

          {/* 加入房间 */}
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
            <h2 className="text-white font-semibold mb-1">🔗 加入房间</h2>
            <p className="text-slate-400 text-sm mb-4">输入朋友发来的房间号或链接</p>
            <div className="flex gap-2">
              <input
                type="text"
                value={joinId}
                onChange={(e) => setJoinId(e.target.value)}
                placeholder="输入房间号..."
                className="flex-1 px-4 py-3 bg-white/10 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                onKeyDown={(e) => e.key === 'Enter' && joinRoom()}
              />
              <button
                onClick={joinRoom}
                disabled={loading || !joinId.trim()}
                className="px-6 py-3 bg-white/20 text-white font-medium rounded-xl hover:bg-white/30 transition disabled:opacity-50"
              >
                加入
              </button>
            </div>
          </div>

          {error && (
            <div className="text-center text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-xl py-2">
              {error}
            </div>
          )}
        </div>

        <p className="text-center text-slate-600 text-xs mt-8">
          15×15 标准棋盘 · 黑棋先行 · 五子连珠获胜
        </p>
      </div>
    </div>
  )
}
