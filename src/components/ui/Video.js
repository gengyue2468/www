import React, { useState, useRef, useEffect } from "react";
import { Slider } from "@radix-ui/react-slider";
import cn from "classnames";
import {
  ForwardIcon,
  FullscreenIcon,
  VolumeXIcon,
  PauseIcon,
  PlayIcon,
  RewindIcon,
  LoaderCircleIcon,
  VolumeIcon,
  RotateCcwIcon,
  RotateCwIcon,
  Volume2Icon,
  Volume1Icon,
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
  const [isBuffering, setIsBuffering] = useState(false);
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);

  const playerRef = useRef(null);
  const containerRef = useRef(null);
  const controlsTimeout = useRef(null);
  const bufferTimeout = useRef(null);
  const volumeSliderRef = useRef(null);
  const volumeTimeout = useRef(null);

  // 格式化时间显示
  const formatTime = (seconds) => {
    if (isNaN(seconds) || !isFinite(seconds) || seconds === 0) return "00:00";
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${minutes.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  // 切换播放/暂停状态
  const togglePlay = () => {
    if (playerRef.current) {
      if (playing) {
        playerRef.current.pause();
      } else {
        playerRef.current.play().catch((err) => {
          console.error("播放失败:", err);
        });
      }
    }
    showControlsTemporarily();
  };

  // 处理进度条拖动
  const handleProgressChange = (value) => {
    const newProgress = value[0];
    setProgress(newProgress);

    if (playerRef.current && duration > 0) {
      const seekTime = (newProgress / 100) * duration;
      setIsBuffering(true);
      playerRef.current.currentTime = seekTime;
      setPlayedSeconds(seekTime);

      clearTimeout(bufferTimeout.current);
      bufferTimeout.current = setTimeout(() => setIsBuffering(false), 1000);
    }
  };

  // 处理音量变化
  const handleVolumeChange = (value) => {
    const newVolume = value[0];
    setVolume(newVolume);
    if (playerRef.current) {
      playerRef.current.volume = newVolume / 100;
    }
    if (newVolume > 0 && muted) {
      setMuted(false);
    }
  };

  // 音量控制相关事件处理
  const handleVolumeMouseEnter = () => {
    clearTimeout(volumeTimeout.current);
    setShowVolumeSlider(true);
  };

  const handleVolumeMouseLeave = () => {
    volumeTimeout.current = setTimeout(() => {
      setShowVolumeSlider(false);
    }, 300);
  };

  // 移动端触摸事件
  const handleVolumeTouchStart = (e) => {
    e.stopPropagation();
    setShowVolumeSlider((prev) => !prev);
  };

  // 快进10秒
  const skipForward = (e) => {
    e?.stopPropagation();
    if (playerRef.current && duration > 0) {
      const newTime = Math.min(playerRef.current.currentTime + 10, duration);
      playerRef.current.currentTime = newTime;
      setPlayedSeconds(newTime);
      setProgress((newTime / duration) * 100);
      setIsBuffering(true);
      clearTimeout(bufferTimeout.current);
      bufferTimeout.current = setTimeout(() => setIsBuffering(false), 1000);
    }
  };

  // 后退10秒
  const skipBack = (e) => {
    e?.stopPropagation();
    if (playerRef.current && duration > 0) {
      const newTime = Math.max(playerRef.current.currentTime - 10, 0);
      playerRef.current.currentTime = newTime;
      setPlayedSeconds(newTime);
      setProgress((newTime / duration) * 100);
      setIsBuffering(true);
      clearTimeout(bufferTimeout.current);
      bufferTimeout.current = setTimeout(() => setIsBuffering(false), 1000);
    }
  };

  // 切换全屏状态
  const toggleFullScreen = (e) => {
    e?.stopPropagation();
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen().catch((err) => {
        console.error(`全屏模式错误: ${err.message}`);
      });
      setIsFullScreen(true);
    } else {
      document.exitFullscreen();
      setIsFullScreen(false);
    }
    showControlsTemporarily();
  };

  // 切换静音状态
  const toggleMute = (e) => {
    e?.stopPropagation();
    setMuted(!muted);
    if (playerRef.current) {
      playerRef.current.muted = !muted;
    }
  };

  // 增加音量
  const increaseVolume = () => {
    setVolume((prev) => {
      const newVolume = Math.min(prev + 10, 100);
      if (playerRef.current) {
        playerRef.current.volume = newVolume / 100;
      }
      if (muted && newVolume > 0) setMuted(false);
      return newVolume;
    });
  };

  // 减少音量
  const decreaseVolume = () => {
    setVolume((prev) => {
      const newVolume = Math.max(prev - 10, 0);
      if (playerRef.current) {
        playerRef.current.volume = newVolume / 100;
      }
      if (newVolume === 0) setMuted(true);
      return newVolume;
    });
  };

  // 临时显示控制栏
  const showControlsTemporarily = () => {
    setShowControls(true);
    clearTimeout(controlsTimeout.current);

    if (playing) {
      controlsTimeout.current = setTimeout(() => {
        setShowControls(false);
      }, 3000);
    }
  };

  // 处理鼠标移动显示控制栏
  const handleMouseMove = () => {
    showControlsTemporarily();
  };

  // 点击音量滑块外部关闭滑块
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        volumeSliderRef.current &&
        !volumeSliderRef.current.contains(event.target)
      ) {
        setShowVolumeSlider(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // 清理定时器
  useEffect(() => {
    return () => {
      clearTimeout(controlsTimeout.current);
      clearTimeout(bufferTimeout.current);
      clearTimeout(volumeTimeout.current);
    };
  }, []);

  // 键盘快捷键
  useEffect(() => {
    const handleKeyDown = (e) => {
      // 只在视频播放器获得焦点时响应快捷键
      if (document.activeElement !== containerRef.current) return;

      // 防止快捷键与浏览器默认行为冲突
      const tagName = document.activeElement?.tagName.toLowerCase();
      if (tagName === "input" || tagName === "textarea") return;

      switch (e.key) {
        case " ":
          e.preventDefault();
          togglePlay();
          break;
        case "ArrowRight":
          e.preventDefault();
          skipForward();
          break;
        case "ArrowLeft":
          e.preventDefault();
          skipBack();
          break;
        case "ArrowUp":
          e.preventDefault();
          increaseVolume();
          break;
        case "ArrowDown":
          e.preventDefault();
          decreaseVolume();
          break;
        case "m":
        case "M":
          e.preventDefault();
          toggleMute();
          break;
        case "f":
        case "F":
          e.preventDefault();
          toggleFullScreen();
          break;
        case "0":
        case "1":
        case "2":
        case "3":
        case "4":
        case "5":
        case "6":
        case "7":
        case "8":
        case "9":
          if (playerRef.current && duration > 0) {
            e.preventDefault();
            const percentage = parseInt(e.key) / 10;
            const seekTime = duration * percentage;
            playerRef.current.currentTime = seekTime;
            setPlayedSeconds(seekTime);
            setProgress(percentage * 100);
          }
          break;
        default:
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [playing, duration, muted, volume]);

  // 监听全屏状态变化
  useEffect(() => {
    const handleFullScreenChange = () => {
      setIsFullScreen(!!document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", handleFullScreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullScreenChange);
    };
  }, []);

  // 初始化视频设置
  useEffect(() => {
    if (playerRef.current) {
      playerRef.current.volume = volume / 100;
      playerRef.current.muted = muted;
    }
  }, [volume, muted]);

  const buttonStyle =
    "text-white transition-all duration-300 opacity-80 hover:opacity-100 focus:outline-none";

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative bg-black p-0! rounded-none sm:rounded-xl overflow-hidden cursor-pointer transition-all duration-500 min-h-48 sm:min-h-96",
        isFullScreen
          ? "h-screen"
          : "max-w-screen -translate-x-8 sm:-translate-x-48 w-[calc(100%+4rem)]! sm:w-[calc(100%+24rem)]!"
      )}
      onMouseMove={handleMouseMove}
      onClick={togglePlay}
      tabIndex={0}
    >
      <video
        ref={playerRef}
        src={src}
        className={cn(
          "w-full h-full object-contain object-center aspect-auto",
          isFullScreen ? "fixed inset-0 z-40 w-full h-full" : ""
        )}
        autoPlay={false}
        playsInline
        onTimeUpdate={(e) => {
          const video = e.target;
          if (!isDragging) {
            setPlayedSeconds(video.currentTime);
            setProgress((video.currentTime / duration) * 100);
          }
        }}
        onDurationChange={(e) => setDuration(e.target.duration)}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onWaiting={() => setIsBuffering(true)}
        onCanPlay={() => setIsBuffering(false)}
        onPlaying={() => setIsBuffering(false)}
        onSeeking={() => setIsBuffering(true)}
        onSeeked={() => setIsBuffering(false)}
      />

      {/* 播放/缓冲按钮覆盖层 */}
      <div
        className={cn(
          "absolute inset-0 z-50 flex items-center justify-center transition-all duration-300",
          showControls || !playing || isBuffering
            ? "opacity-100 translate-y-0"
            : "opacity-0 translate-y-8 pointer-events-none"
        )}
      >
        {isBuffering ? (
          <LoaderCircleIcon className="size-8 sm:size-12 text-white animate-spin" />
        ) : playing ? (
          <PauseIcon className="size-8 sm:size-12 text-white fill-white" />
        ) : (
          <PlayIcon className="size-8 sm:size-12 text-white fill-white" />
        )}
      </div>

      {/* 控制栏 */}
      <div
        className={cn(
          "absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent py-4 transition-all duration-300 z-50",
          showControls || isDragging || isBuffering
            ? "opacity-100 translate-y-0"
            : "opacity-0 translate-y-4 pointer-events-none"
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between w-full px-2 sm:px-8 max-w-2xl mx-auto">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <button
              onClick={skipBack}
              className={buttonStyle}
              aria-label="后退10秒"
            >
              <RotateCcwIcon className="size-4" />
            </button>
            <button
              onClick={skipForward}
              className={buttonStyle}
              aria-label="快进10秒"
            >
              <RotateCwIcon className="size-4" />
            </button>

            <div className="flex items-center gap-2 flex-1 min-w-0">
              <span className="text-xs text-white whitespace-nowrap">
                {formatTime(playedSeconds)}
              </span>

              <div className="relative h-2 flex-1 cursor-pointer group">
                <div className="absolute inset-0 bg-white/20 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-white rounded-full transition-all duration-150"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <Slider
                  value={[progress]}
                  min={0}
                  max={100}
                  step={0.1}
                  onValueChange={handleProgressChange}
                  onDragStart={() => {
                    setIsDragging(true);
                    showControlsTemporarily();
                  }}
                  onDragEnd={() => setIsDragging(false)}
                  className="absolute inset-0 opacity-0"
                />
              </div>

              <span className="text-xs text-white whitespace-nowrap">
                {formatTime(duration)}
              </span>
            </div>
          </div>

          <div className="flex flex-row items-center gap-2 sm:gap-4 ml-4 mt-1.5">
            {/* 音量控制区域 */}
            <div
              ref={volumeSliderRef}
              className="relative"
              onClick={(e) => e.stopPropagation()}
            >
              {/* 音量按钮 */}
              <button
                onClick={toggleMute}
                onMouseEnter={handleVolumeMouseEnter}
                onMouseLeave={handleVolumeMouseLeave}
                onTouchStart={handleVolumeTouchStart}
                className={buttonStyle}
                aria-label={muted ? "取消静音" : "静音"}
              >
                {muted || volume === 0 ? (
                  <VolumeXIcon className="size-5 fill-white" />
                ) : volume < 50 ? (
                  <Volume1Icon className="size-5 fill-white" />
                ) : (
                  <Volume2Icon className="size-5 fill-white" />
                )}
              </button>

              {/* 竖直音量滑块 */}
              <div
                className={`absolute bottom-full mb-2 right-1/2 transform translate-x-1/2 transition-all duration-200 ease-in-out flex flex-col items-center ${
                  showVolumeSlider
                    ? "opacity-100 scale-100"
                    : "opacity-0 scale-90 pointer-events-none"
                }`}
                onMouseEnter={handleVolumeMouseEnter}
                onMouseLeave={handleVolumeMouseLeave}
                onTouchStart={handleVolumeTouchStart}
              >
                <div className="relative h-32 w-8 flex items-center justify-center">
                  <div className="absolute h-full w-1.5 bg-neutral-600/50 rounded-full">
                    <div
                      className="bg-white rounded-full absolute bottom-0 left-0 right-0 transition-all duration-200"
                      style={{
                        height: `${muted ? 0 : volume}%`,
                      }}
                    />
                  </div>

                  {/* 实际滑块控件 */}
                  <Slider
                    value={[muted ? 0 : volume]}
                    min={0}
                    max={100}
                    step={1}
                    orientation="vertical"
                    onValueChange={handleVolumeChange}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />

                  {/* 滑块指示器 */}
                  <div
                    className="absolute size-3 bg-white translate-y-3 rounded-full z-10 transition-all duration-200"
                    style={{
                      bottom: `${muted ? 0 : volume}%`,
                    }}
                  />
                </div>
              </div>
            </div>

            <button
              onClick={toggleFullScreen}
              className={cn(buttonStyle, "-mt-1.5")}
              aria-label={isFullScreen ? "退出全屏" : "进入全屏"}
            >
              <FullscreenIcon className="size-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Video;
