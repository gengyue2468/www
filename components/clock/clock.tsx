/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import classNames from "classnames";
import { useState, useEffect } from "react";
import { homeStyles } from "@/app/home.config";
import { useHash } from "@/hooks/use-hash";
import { useTheme } from "next-themes";

export default function Clock() {
  const hash = useHash();
  const { resolvedTheme } = useTheme();
  
  // 当 hash 匹配时，根据当前主题设置 data-color
  const getInvertDataColor = () => {
    if (hash !== "clock") return undefined;
    const actualTheme = resolvedTheme || "light";
    return actualTheme === "dark" ? "light" : "dark";
  };
  const [time, setTime] = useState(new Date());
  const [greeting, setGreeting] = useState("");

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const hour = time.getHours();
    if (hour < 12) {
      setGreeting("Good Morning");
    } else if (hour < 18) {
      setGreeting("Good Afternoon");
    } else {
      setGreeting("Good Evening");
    }
  }, [time]);

  return (
    <div 
      id="clock"
      data-color={getInvertDataColor()}
      className={classNames(
        homeStyles.gridItem,
        hash === "clock" ? "bg-[var(--foreground)] text-[var(--background)]" : ""
      )}
    >
      <h1 className={homeStyles.title}>Clock</h1>
      <div className={homeStyles.listContainer}>
          <div className={homeStyles.rowContainer}>
          <div className={homeStyles.subtitle}>Current Year</div>
          <div className={homeStyles.rowText}>{time.getFullYear()}</div>
        </div>
        <div className={homeStyles.rowContainer}>
          <div className={homeStyles.subtitle}>Current Time</div>
          <div className={homeStyles.rowText}>{time.toLocaleTimeString()}</div>
        </div>
        <div className={homeStyles.rowContainer}>
          <div className={homeStyles.subtitle}>Greeting</div>
          <div className={homeStyles.rowText}>{greeting}</div>
        </div>
        <div
          className={classNames(homeStyles.rowContainer, "*:text-center! mt-4")}
        >
          <div className={homeStyles.subtitle}></div>
          <div className={homeStyles.rowText}>
            In case I don&apos;t see you, good afternoon, good evening, and good
            night!
          </div>
        </div>
      </div>
    </div>
  );
}
