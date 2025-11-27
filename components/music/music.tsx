/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { getPlaylist } from "@/actions/getPlaylist";
import { useState, useEffect } from "react";
import { homeStyles } from "@/app/home.config";
import classNames from "classnames";
import { useTranslation } from "react-i18next";
import { useHash } from "@/hooks/use-hash";
import { useTheme } from "next-themes";

export default function Music() {
  const { t } = useTranslation();
  const hash = useHash();
  const { resolvedTheme } = useTheme();
  
  // 当 hash 匹配时，根据当前主题设置 data-color
  const getInvertDataColor = () => {
    if (hash !== "music") return undefined;
    const actualTheme = resolvedTheme || "light";
    return actualTheme === "dark" ? "light" : "dark";
  };
  const [playlist, setPlaylist] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    
    getPlaylist("3048186533")
      .then((data) => {
        if (data && data.tracks) {
          setPlaylist(data.tracks);
        } else if (data && data.playlist && data.playlist.tracks) {
          setPlaylist(data.playlist.tracks);
        } else {
          setError(t("music.noTracks"));
        }
        setLoading(false);
      })
      .catch((err: any) => {
        console.error("Error fetching playlist:", err);
        setError(t("music.error") + ": " + (err?.message || String(err)));
        setLoading(false);
      });
  }, []);

  return (
    <div 
      id="music"
      data-color={getInvertDataColor()}
      className={classNames(
        homeStyles.gridItem,
        hash === "music" ? "bg-[var(--foreground)] text-[var(--background)]" : ""
      )}
    >
      <h1 className={homeStyles.title}>{t("music.title")}</h1>
      <div className={homeStyles.listContainer}>
        {loading && <div>{t("music.loading")}</div>}
        {error && <div className="text-red-500">{error}</div>}
        {playlist &&
          playlist.slice(0, 10).map((song, index) => (
            <div key={index} className={homeStyles.rowContainer}>
              <div className={homeStyles.subtitle}>{index + 1}.</div>
              <div className="flex flex-row items-center gap-4 flex-wrap">
                <div
                  className={classNames(
                    homeStyles.rowText,
                    "hover:opacity-50 cursor-pointer"
                  )}
                  onClick={() =>
                    open(`https://music.163.com/#/song?id=${song.id}`)
                  }
                >
                  {song.name}
                </div>
                <div className={classNames(homeStyles.rowText, "opacity-50")}>
                  {song.ar.map((artist: any) => artist.name).join("/")}
                </div>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}
