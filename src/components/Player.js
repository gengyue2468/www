import { useState, useRef, useEffect } from "react";
import { LazyLoadImage } from "react-lazy-load-image-component";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";

export default function Player({ id, title, artist, pic }) {
  const [playing, setPlaying] = useState(false);
  const audioRef = useRef(null);

  useEffect(() => {
    if (audioRef.current) {
      if (playing) {
        audioRef.current.play().catch((err) => {
          console.error("播放失败:", err);
          setPlaying(false);
        });
      } else {
        audioRef.current.pause();
      }
    }
  }, [playing]);
  return (
    <div className="rounded-md mb-4">
      <div className="flex flex-row space-x-2 text-balance items-center">
        <div className="relative size-12">
          <LazyLoadImage
            src={pic}
            className={cn(
              "size-12 rounded-md transition-all duration-300",
              playing ? "brightness-100" : "brightness-75"
            )}
          />
          <Button
            onClick={() => setPlaying(!playing)}
            variant="ghost"
            className={cn(
              "absolute size-8 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white bg-opacity-50 hover:bg-opacity-50! backdrop-blur-md cursor-pointer",
              playing &&
                "transition-all duration-300 opacity-0 hover:opacity-100"
            )}
          >
            {playing ? <PauseIcon /> : <PlayIcon />}
          </Button>
        </div>

        <div className="flex flex-col">
          <h1 className="font-semibold">
            {title} {playing}
          </h1>
          <h2 className="opacity-75">{artist}</h2>
        </div>
        
        <div></div>
      </div>
      <audio
        ref={audioRef}
        src={`https://music.163.com/song/media/outer/url?id=${id}.mp3`}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
      />
    </div>
  );
}

const PlayIcon = () => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      className="size-5"
    >
      <path d="M6.3 2.84A1.5 1.5 0 0 0 4 4.11v11.78a1.5 1.5 0 0 0 2.3 1.27l9.344-5.891a1.5 1.5 0 0 0 0-2.538L6.3 2.841Z" />
    </svg>
  );
};

const PauseIcon = () => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      className="size-5"
    >
      <path d="M5.75 3a.75.75 0 0 0-.75.75v12.5c0 .414.336.75.75.75h1.5a.75.75 0 0 0 .75-.75V3.75A.75.75 0 0 0 7.25 3h-1.5ZM12.75 3a.75.75 0 0 0-.75.75v12.5c0 .414.336.75.75.75h1.5a.75.75 0 0 0 .75-.75V3.75a.75.75 0 0 0-.75-.75h-1.5Z" />
    </svg>
  );
};
