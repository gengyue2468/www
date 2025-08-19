import { useState, useEffect, useRef } from 'react'
import Head from 'next/head'
import Image from 'next/image'
import { Play, Pause, SkipBack, SkipForward, Volume2 } from 'lucide-react'

export default function EmbedPlayer({ song }) {
  const audioRef = useRef(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const [duration, setDuration] = useState(0)
  
  // 加载歌曲信息
  useEffect(() => {
    if (song && song.url) {
      audioRef.current.src = song.url
    }
  }, [song])
  
  // 播放/暂停切换
  const togglePlay = () => {
    if (isPlaying) {
      audioRef.current.pause()
    } else {
      audioRef.current.play()
    }
    setIsPlaying(!isPlaying)
  }
  
  // 更新进度
  const handleTimeUpdate = () => {
    const currentTime = audioRef.current.currentTime
    const totalDuration = audioRef.current.duration
    setProgress((currentTime / totalDuration) * 100)
    setDuration(totalDuration)
  }
  
  // 格式化时间（秒 -> mm:ss）
  const formatTime = (seconds) => {
    if (isNaN(seconds)) return '00:00'
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }
  
  if (!song) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-900">
        <p className="text-gray-500">加载歌曲失败</p>
      </div>
    )
  }
  
  return (
    <div className="bg-gray-900 rounded-lg overflow-hidden shadow-lg">
      <Head>
        <title>{song.name} - 网易云音乐</title>
        <meta name="referrer" content="no-referrer" />
      </Head>
      
      <div className="p-4">
        {/* 歌曲信息 */}
        <div className="flex items-center mb-4">
          <div className="relative w-16 h-16 mr-4 flex-shrink-0">
            <Image 
              src={song.al.picUrl} 
              alt={song.al.name}
              fill
              style={{ objectFit: 'cover', borderRadius: '4px' }}
            />
          </div>
          <div>
            <h3 className="font-medium text-white truncate max-w-[200px]">{song.name}</h3>
            <p className="text-gray-400 text-sm">
              {song.ar.map(artist => artist.name).join(', ')}
            </p>
          </div>
        </div>
        
        {/* 进度条 */}
        <div className="mb-2">
          <div className="h-1 bg-gray-700 rounded-full overflow-hidden">
            <div 
              className="h-full bg-purple-500"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>{formatTime(audioRef.current?.currentTime || 0)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>
        
        {/* 控制按钮 */}
        <div className="flex justify-center items-center space-x-6">
          <button className="text-gray-400 hover:text-white transition-colors">
            <SkipBack size={20} />
          </button>
          <button 
            onClick={togglePlay}
            className="bg-purple-600 hover:bg-purple-700 p-3 rounded-full transition-all"
          >
            {isPlaying ? <Pause size={24} /> : <Play size={24} fill="white" />}
          </button>
          <button className="text-gray-400 hover:text-white transition-colors">
            <SkipForward size={20} />
          </button>
        </div>
      </div>
      
      <audio
        ref={audioRef}
        onTimeUpdate={handleTimeUpdate}
        onEnded={() => setIsPlaying(false)}
        crossOrigin="anonymous"
      />
    </div>
  )
}

// 获取歌曲数据
export async function getServerSideProps({ params }) {
  try {
    // 获取歌曲URL
    const urlRes = await fetch(`${process.env.ncm-cdn}/song/url?id=${params.id}`)
    const urlData = await urlRes.json()
    
    if (!urlData.data || !urlData.data[0].url) {
      return { props: { song: null } }
    }
    
    // 获取歌曲详情
    const detailRes = await fetch(`${process.env.ncm-cdn}/song/detail?ids=${params.id}`)
    const detailData = await detailRes.json()
    
    if (!detailData.songs || !detailData.songs[0]) {
      return { props: { song: null } }
    }
    
    const song = {
      ...detailData.songs[0],
      url: urlData.data[0].url
    }
    
    return {
      props: { song }
    }
  } catch (error) {
    console.error('获取歌曲数据失败:', error)
    return { props: { song: null } }
  }
}