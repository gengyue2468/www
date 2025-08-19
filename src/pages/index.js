import { useState, useEffect, useRef } from 'react'
import Head from 'next/head'
import Image from 'next/image'
import { Search, Play, Pause, SkipBack, SkipForward, Volume2, Share2, Copy } from 'lucide-react'
import { usePlayer } from './_app'
import MusicPlayer from '../components/MusicPlayer'
import EmbedCodeGenerator from '../components/EmbedCodeGenerator'

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [isSearching, setIsSearching] = useState(false)
  const [showEmbedCode, setShowEmbedCode] = useState(false)
  const { currentSong, setCurrentSong } = usePlayer()
  
  // 搜索歌曲
  const searchSongs = async (query) => {
    if (!query.trim()) return
    
    setIsSearching(true)
    try {
      const res = await fetch(`/api/netease/search?keywords=${encodeURIComponent(query)}`)
      const data = await res.json()
      
      if (data.result?.songs) {
        setSearchResults(data.result.songs)
      }
    } catch (error) {
      console.error('搜索失败:', error)
    } finally {
      setIsSearching(false)
    }
  }
  
  // 处理搜索提交
  const handleSearchSubmit = (e) => {
    e.preventDefault()
    searchSongs(searchQuery)
  }
  
  // 选择歌曲播放
  const handleSelectSong = (song) => {
    // 获取歌曲详情，包含播放URL
    fetch(`/api/netease/song/url?id=${song.id}`)
      .then(res => res.json())
      .then(data => {
        if (data.data && data.data[0].url) {
          const songWithUrl = {
            ...song,
            url: data.data[0].url
          }
          setCurrentSong(songWithUrl)
        }
      })
  }
  
  // 显示嵌入代码生成器
  const handleShowEmbed = () => {
    setShowEmbedCode(true)
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white">
      <Head>
        <title>网易云音乐外链播放器</title>
        <meta name="description" content="网易云音乐外链播放器，支持嵌入到任何网站" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <h1 className="text-4xl font-bold mb-8 text-center bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-500">
          网易云音乐外链播放器
        </h1>
        
        {/* 搜索框 */}
        <form onSubmit={handleSearchSubmit} className="mb-8 relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="搜索歌曲、歌手或专辑..."
            className="w-full px-5 py-3 bg-gray-700 rounded-full focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
          />
          <button 
            type="submit" 
            disabled={isSearching}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-purple-600 hover:bg-purple-700 p-2 rounded-full transition-all"
          >
            <Search size={20} />
          </button>
        </form>
        
        {/* 搜索结果 */}
        {searchResults.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-semibold mb-4">搜索结果 ({searchResults.length})</h2>
            <div className="space-y-3">
              {searchResults.map(song => (
                <div 
                  key={song.id}
                  className="flex items-center p-3 bg-gray-800 rounded-lg hover:bg-gray-700 transition-all cursor-pointer"
                  onClick={() => handleSelectSong(song)}
                >
                  <div className="relative w-12 h-12 mr-4 flex-shrink-0">
                    {song.al.picUrl && (
                      <Image 
                        src={song.al.picUrl} 
                        alt={song.al.name}
                        fill
                        style={{ objectFit: 'cover', borderRadius: '4px' }}
                      />
                    )}
                  </div>
                  <div className="flex-grow">
                    <h3 className="font-medium">{song.name}</h3>
                    <p className="text-gray-400 text-sm">
                      {song.ar.map(artist => artist.name).join(', ')} - {song.al.name}
                    </p>
                  </div>
                  <button className="p-2 text-purple-400 hover:text-purple-300 transition-colors">
                    <Play size={18} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* 当前播放的歌曲信息 */}
        {currentSong && (
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-semibold">当前播放</h2>
              <button 
                onClick={handleShowEmbed}
                className="flex items-center text-purple-400 hover:text-purple-300 transition-colors"
              >
                <Share2 size={18} className="mr-1" />
                <span>获取嵌入代码</span>
              </button>
            </div>
            
            {/* 音乐播放器 */}
            <MusicPlayer />
            
            {/* 嵌入代码生成器 */}
            {showEmbedCode && (
              <EmbedCodeGenerator 
                songId={currentSong.id}
                onClose={() => setShowEmbedCode(false)}
              />
            )}
          </div>
        )}
      </main>
      
      <footer className="text-center py-6 text-gray-500 text-sm">
        <p>网易云音乐外链播放器 &copy; {new Date().getFullYear()}</p>
      </footer>
    </div>
  )
}