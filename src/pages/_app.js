import '../styles/globals.css'
import { useState, createContext, useContext } from 'react'

// 创建音乐播放状态上下文
const PlayerContext = createContext()

export default function App({ Component, pageProps }) {
  // 播放器状态管理
  const [currentSong, setCurrentSong] = useState(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const [duration, setDuration] = useState(0)
  
  // 提供上下文值
  const playerValue = {
    currentSong,
    setCurrentSong,
    isPlaying,
    setIsPlaying,
    progress,
    setProgress,
    duration,
    setDuration,
  }
  
  return (
    <PlayerContext.Provider value={playerValue}>
      <Component {...pageProps} />
    </PlayerContext.Provider>
  )
}

// 自定义Hook方便使用上下文
export const usePlayer = () => useContext(PlayerContext)