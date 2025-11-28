/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import classNames from "classnames";
import { useState, useEffect } from "react";
import { homeStyles } from "@/app/home.config";
import { useHash } from "@/hooks/use-hash";
import { useTheme } from "next-themes";
import dayjs from "dayjs";
import weekday from "dayjs/plugin/weekday";
import localizedFormat from "dayjs/plugin/localizedFormat";

dayjs.extend(weekday);
dayjs.extend(localizedFormat);

export default function Clock() {
  const hash = useHash();
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  const getInvertDataColor = () => {
    if (hash !== "clock") return undefined;
    const actualTheme = resolvedTheme || "light";
    return actualTheme === "dark" ? "light" : "dark";
  };

  const [time, setTime] = useState(dayjs());
  const [greeting, setGreeting] = useState("");

  useEffect(() => {
    setMounted(true);
    const timer = setInterval(() => {
      setTime(dayjs());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const hour = time.hour();
    if (hour < 12) setGreeting("Good Morning");
    else if (hour < 18) setGreeting("Good Afternoon");
    else setGreeting("Good Evening");
  }, [time, mounted]);

  const dayNames = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
  const monthNames = [
    "January","February","March","April","May","June",
    "July","August","September","October","November","December"
  ];

  // 只在客户端计算时间相关的内容，避免水合错误
  const isWeekend = mounted ? (time.day() === 0 || time.day() === 6) : false;
  const endOfDay = mounted ? time.endOf("day") : dayjs().endOf("day");
  const remainingMs = mounted ? endOfDay.diff(time, "millisecond") : 0;
  const remainingHours = mounted ? String(Math.floor(remainingMs / 1000 / 3600)).padStart(2, "0") : "00";
  const remainingMinutes = mounted ? String(Math.floor((remainingMs / 1000 % 3600) / 60)).padStart(2, "0") : "00";
  const remainingSeconds = mounted ? String(Math.floor(remainingMs / 1000 % 60)).padStart(2, "0") : "00";

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
          <div className={homeStyles.rowText}>{mounted ? time.year() : new Date().getFullYear()}</div>
        </div>

        <div className={homeStyles.rowContainer}>
          <div className={homeStyles.subtitle}>Current Time</div>
          <div className={homeStyles.rowText}>{mounted ? time.format("HH:mm:ss") : "00:00:00"}</div>
        </div>

        <div className={homeStyles.rowContainer}>
          <div className={homeStyles.subtitle}>Greeting</div>
          <div className={homeStyles.rowText}>{mounted ? greeting : ""}</div>
        </div>

        <div className={homeStyles.rowContainer}>
          <div className={homeStyles.subtitle}>Date</div>
          <div className={homeStyles.rowText}>
            {mounted ? `${monthNames[time.month()]} ${time.date()}, ${dayNames[time.day()]}` : "Loading..."}
          </div>
        </div>

        <div className={homeStyles.rowContainer}>
          <div className={homeStyles.subtitle}>Is Weekend?</div>
          <div className={homeStyles.rowText}>{isWeekend ? "Yes 🎉" : "No 💼"}</div>
        </div>

        <div className={homeStyles.rowContainer}>
          <div className={homeStyles.subtitle}>Time Left Today</div>
          <div className={homeStyles.rowText}>
            {remainingHours}:{remainingMinutes}:{remainingSeconds}
          </div>
        </div>

        <div className={classNames(homeStyles.rowContainer, "*:text-center! mt-4")}>
          <div className={homeStyles.subtitle}></div>
          <div className={homeStyles.rowText}>
            In case I don&apos;t see you, good afternoon, good evening, and good night!
          </div>
        </div>

      </div>
    </div>
  );
}
