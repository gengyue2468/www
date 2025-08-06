import React, { useState, useRef, useEffect } from "react";
import ReactPlayer from "react-player";
import { Slider } from "@radix-ui/react-slider";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  SkipForward,
  SkipBack,
  Maximize
} from "lucide-react";

const Video = ({ src, alt }) => {
  const [playing, setPlaying] = useState(false);
  const [volume, setVolume] = useState(80); 
  const [muted, setMuted] = useState(false);
  const [progress, setProgress] = useState(0); 
  const [duration, setDuration] = useState(0);
  const [playedSeconds, setPlayedSeconds] = useState(0);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [isDragging, setIsDragging] = useState(false);

  const playerRef = useRef(null);
  const containerRef = useRef(null);
  const controlsTimeout = useRef(null);

  const formatTime = (seconds) => {
    if (isNaN(seconds)) return "00:00";
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${minutes.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const handleProgress = (state) => {
    if (!isDragging) {
      setProgress(state.played * 100);
      setPlayedSeconds(state.playedSeconds);
    }
  };

  const handleDuration = (duration) => {
    setDuration(duration);
  };


  const togglePlay = () => {
    setPlaying(!playing);
    showControlsTemporarily();
  };

  const handleProgressChange = (value) => {
    const newProgress = value[0];
    setProgress(newProgress);

    const seekTime = (newProgress / 100) * duration;
    if (playerRef.current) {
      playerRef.current.seekTo(seekTime, "seconds");
    }
  };

  const handleDragStart = () => {
    setIsDragging(true);
  };


  const handleDragEnd = () => {
    setIsDragging(false);
  };

  const handleVolumeChange = (value) => {
    const newVolume = value[0];
    setVolume(newVolume);
    setMuted(newVolume === 0);
  };

  const toggleMute = () => {
    setMuted(!muted);
  };

  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch((err) => {
        console.error(`全屏模式错误: ${err.message}`);
      });
      setIsFullScreen(true);
    } else {
      document.exitFullscreen();
      setIsFullScreen(false);
    }
    showControlsTemporarily();
  };

  const skipForward = (e) => {
    e.stopPropagation();
    const newTime = Math.min(playedSeconds + 10, duration);
    playerRef.current.seekTo(newTime, "seconds");
    setPlayedSeconds(newTime);
    setProgress((newTime / duration) * 100);
  };

  const skipBack = (e) => {
    e.stopPropagation();
    const newTime = Math.max(playedSeconds - 10, 0);
    playerRef.current.seekTo(newTime, "seconds");
    setPlayedSeconds(newTime);
    setProgress((newTime / duration) * 100);
  };

  const showControlsTemporarily = () => {
    setShowControls(true);

    if (controlsTimeout.current) {
      clearTimeout(controlsTimeout.current);
    }

    if (playing) {
      controlsTimeout.current = setTimeout(() => {
        setShowControls(false);
      }, 3000);
    }
  };

  const handleMouseMove = () => {
    showControlsTemporarily();
  };

  useEffect(() => {
    return () => {
      if (controlsTimeout.current) {
        clearTimeout(controlsTimeout.current);
      }
    };
  }, []);

  useEffect(() => {
    const handleFullScreenChange = () => {
      setIsFullScreen(!!document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", handleFullScreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullScreenChange);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative aspect-video bg-black rounded-none sm:rounded-xl -translate-x-8 w-[calc(100%+4rem)] overflow-hidden cursor-pointer"
      onMouseMove={handleMouseMove}
      onClick={togglePlay}
    >
      <ReactPlayer
        ref={playerRef}
        url={src}
        alt={alt}
        playing={playing}
        volume={muted ? 0 : volume / 100}
        onProgress={handleProgress}
        onDuration={handleDuration}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        width="100%"
        height="100%"
        className="object-contain"
        config={{
          file: {
            attributes: {
              controlsList: "nodownload",
              disablePictureInPicture: true,
            },
          },
        }}
      />
      {!playing && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-20 h-20 rounded-full bg-black/30 flex items-center justify-center backdrop-blur-sm transition-all duration-300 hover:scale-110 hover:bg-black/40">
            <Play className="w-12 h-12 text-white fill-white ml-1" />
          </div>
        </div>
      )}

      {/* 控制栏 */}
      <div
        className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 transition-opacity duration-300 ${
          showControls ? "opacity-100" : "opacity-0"
        }`}
      >
        {/* 进度条 */}
        <div className="mb-4" onClick={(e) => e.stopPropagation()}>
          <Slider
            value={[progress]}
            min={0}
            max={100}
            step={0.1}
            onValueChange={handleProgressChange}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            className="cursor-pointer"
          />
          <div className="flex justify-between text-white text-sm mt-1">
            <span>{formatTime(playedSeconds)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* 控制按钮组 */}
        <div
          className="flex items-center justify-between"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center gap-4">
            <button
              onClick={skipBack}
              className="text-white hover:text-gray-300 transition-colors focus:outline-none focus:ring-2 focus:ring-white/50 rounded-full p-1"
              aria-label="后退10秒"
            >
              <SkipBack className="w-6 h-6" />
            </button>
            <button
              onClick={togglePlay}
              className="text-white hover:text-gray-300 transition-colors focus:outline-none focus:ring-2 focus:ring-white/50 rounded-full p-1"
              aria-label={playing ? "暂停" : "播放"}
            >
              {playing ? (
                <Pause className="w-6 h-6" />
              ) : (
                <Play className="w-6 h-6 ml-0.5" />
              )}
            </button>
            <button
              onClick={skipForward}
              className="text-white hover:text-gray-300 transition-colors focus:outline-none focus:ring-2 focus:ring-white/50 rounded-full p-1"
              aria-label="快进10秒"
            >
              <SkipForward className="w-6 h-6" />
            </button>

            <div className="flex items-center gap-2 w-32">
              <button
                onClick={toggleMute}
                className="text-white hover:text-gray-300 transition-colors focus:outline-none focus:ring-2 focus:ring-white/50 rounded-full p-1"
                aria-label={muted ? "取消静音" : "静音"}
              >
                {muted || volume === 0 ? (
                  <VolumeX className="w-5 h-5" />
                ) : (
                  <Volume2 className="w-5 h-5" />
                )}
              </button>
              <Slider
                value={[muted ? 0 : volume]}
                min={0}
                max={100}
                step={1}
                onValueChange={handleVolumeChange}
                className="cursor-pointer"
                aria-label="音量控制"
              />
            </div>
          </div>

          <button
            onClick={toggleFullScreen}
            className="text-white hover:text-gray-300 transition-colors focus:outline-none focus:ring-2 focus:ring-white/50 rounded-full p-1"
            aria-label={isFullScreen ? "退出全屏" : "进入全屏"}
          >
            <Maximize className="w-6 h-6" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Video;
