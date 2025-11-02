import classNames from "classnames";
import { motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { PlayIcon, SkipBackIcon, SkipForwardIcon } from "lucide-react";

function IconButton({ children, ...props }) {
  return (
    <motion.button
      whileTap={{ scale: 0.95 }}
      {...props}
      className="rounded-lg p-2 hover:bg-neutral-300 dark:hover:bg-neutral-700 *:text-black *:fill-black dark:*:fill-white dark:*:text-white"
    >
      {children}
    </motion.button>
  );
}

export default function Player() {
  const [fullscreen, setFullscreen] = useState(false);
  const [lyricsData, setLyricsData] = useState([]);
  const [currentLyricIndex, setCurrentLyricIndex] = useState(-1);
  const playerRef = useRef(null);
  const lyricRefs = useRef([]);

  const parseTime = (timeString) => {
    const [minutes, seconds] = timeString.split(":");
    return Number(minutes) * 60 + Number(seconds);
  };

  const updateCurrentLyric = () => {
    if (!playerRef.current || lyricsData.length === 0) return;
    
    const currentTime = playerRef.current.currentTime;
    for (let i = currentLyricIndex + 1; i < lyricsData.length; i++) {
      const lyricTime = parseTime(lyricsData[i].time);
      if (currentTime < lyricTime) {
        const targetIndex = i - 1;
        if (targetIndex !== currentLyricIndex) {
          setCurrentLyricIndex(targetIndex);
          lyricRefs.current[targetIndex]?.scrollIntoView({
            behavior: "smooth",
            block: "center"
          });
        }
        return;
      }
    }
    if (currentLyricIndex !== lyricsData.length - 1) {
      setCurrentLyricIndex(lyricsData.length - 1);
    }
  };

  const getFormattedLyrics = async () => {
    try {
      const response = await axios.get(
        "https://ncm-api.huster.fun/lyric?id=1357374736"
      );
      const { lrc } = response.data;
      if (!lrc?.lyric) return [];

      const lyricLines = lrc.lyric.split("\n");
      const formattedLyrics = [];

      const timeRegex = /^\[(\d{2}:\d{2}\.\d{3})\](.*)$/;

      lyricLines.forEach((line) => {
        const trimmedLine = line.trim();
        if (!trimmedLine) return;

        const match = trimmedLine.match(timeRegex);
        if (match) {
          formattedLyrics.push({
            time: match[1],
            text: match[2].trim(),
          });
        }
      });

      setLyricsData(formattedLyrics);
    } catch (error) {
      console.error(error);
      return [];
    }
  };

  useEffect(() => {
    getFormattedLyrics();
  }, []);

  useEffect(() => {
    const audio = playerRef.current;
    if (!audio) return;

    audio.addEventListener("timeupdate", updateCurrentLyric);
    return () => {
      audio.removeEventListener("timeupdate", updateCurrentLyric);
    };
  }, [lyricsData, currentLyricIndex]);

  return (
    <motion.div
      onClick={(e) => {
        if (!e.target.closest("button") && !e.target.closest("audio")) {
          setFullscreen(!fullscreen);
        }
      }}
      layout
      className={classNames(
        "bg-neutral-200 dark:bg-neutral-800",
        fullscreen
          ? "fixed inset-0 w-full h-full z-50"
          : "fixed bottom-4 max-w-xs mx-auto inset-x-0 rounded-xl"
      )}
    >
      <motion.div
        layout
        className={classNames(
          "flex flex-row gap-8 items-center justify-center max-w-7xl mx-auto",
          fullscreen && ""
        )}
      >
        <motion.div
          className={classNames(
            "rounded-3xl flex gap-4 items-center w-full",
            fullscreen ? "flex-1 flex-col box-border" : "flex-row p-2 "
          )}
          layout
        >
          <motion.img
            src="https://p2.music.126.net/iAwVf8ag_45csIUuh1wSZg==/109951168912558470.jpg"
            layout
            className={classNames(
              fullscreen
                ? "w-full object-cover rounded-3xl"
                : "size-12 rounded-xl"
            )}
          />
          <motion.div
            layout
            className={classNames(
              "flex",
              fullscreen
                ? "flex-col gap-8"
                : " w-full flex-row justify-between items-center"
            )}
          >
            <motion.div
              layout
              className={classNames(
                "flex flex-col",
                fullscreen && "text-center"
              )}
            >
              <motion.h1
                className={classNames("font-semibold", fullscreen && "text-xl")}
              >
                海阔天空
              </motion.h1>
              <motion.h2
                layout
                className={classNames(
                  "font-medium text-neutral-500",
                  fullscreen && "text-xl"
                )}
              >
                Beyond
              </motion.h2>
            </motion.div>
            <motion.div
              layout
              className="flex flex-row justify-center gap-1 items-center"
            >
              <IconButton>
                <SkipBackIcon
                  className={classNames(fullscreen ? "size-6" : "size-5")}
                />
              </IconButton>

              <IconButton onClick={() => {
                const audio = playerRef.current;
                audio.paused ? audio.play() : audio.pause();
              }}>
                <PlayIcon
                  className={classNames(fullscreen ? "size-9" : "size-7")}
                />
              </IconButton>

              <IconButton>
                <SkipForwardIcon
                  className={classNames(fullscreen ? "size-6" : "size-5")}
                />
              </IconButton>

              <audio
                ref={playerRef}
                controls
                src="https://music.163.com/song/media/outer/url?id=1357374736.mp3"
                className="min-w-[200px]"
              />
            </motion.div>
          </motion.div>
        </motion.div>
        <motion.div
          layout
          className={classNames(
            fullscreen
              ? "flex-1 max-h-screen overflow-y-auto flex flex-col gap-2"
              : "hidden w-0"
          )}
          style={{
            scrollbarWidth: "none",
            WebkitScrollbar: "hidden",
          }}
        >
          {lyricsData?.map((lyc, index) => {
            lyricRefs.current[index] = lyricRefs.current[index];
            
            return (
              <div
                key={lyc.time}
                ref={lyricRefs.current[index]}
                className={classNames(
                  "w-full transition-all duration-300",
                  index === 0 && "mt-64",
                  index === lyricsData.length - 1 && "mb-32",
                  lyc.text !== "" && "hover:bg-neutral-300 dark:hover:bg-neutral-700 rounded-xl px-8 py-4",
                  lyc.text === "" && "my-8",
                  index === currentLyricIndex && "bg-blue-100 dark:bg-blue-900 font-bold text-blue-600 dark:text-blue-300"
                )}
              >
                <h1 className="font-semibold text-3xl">{lyc.text}</h1>
              </div>
            );
          })}
        </motion.div>
      </motion.div>
    </motion.div>
  );
}