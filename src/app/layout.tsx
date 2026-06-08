import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Gomoku Online - 在线五子棋对战',
  description: '和朋友实时对战五子棋，15x15标准棋盘',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  )
}
