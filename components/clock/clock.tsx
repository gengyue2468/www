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

  const getInvertDataColor = () => {
    if (hash !== "clock") return undefined;
    const actualTheme = resolvedTheme || "light";
    return actualTheme === "dark" ? "light" : "dark";
  };

  const [time, setTime] = useState(dayjs());
  const [greeting, setGreeting] = useState("");

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(dayjs());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const hour = time.hour();
    if (hour < 12) setGreeting("Good Morning");
    else if (hour < 18) setGreeting("Good Afternoon");
    else setGreeting("Good Evening");
  }, [time]);

  const dayNames = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
  const monthNames = [
    "January","February","March","April","May","June",
    "July","August","September","October","November","December"
  ];

  const isWeekend = time.day() === 0 || time.day() === 6;

  const endOfDay = time.endOf("day");
  const remainingMs = endOfDay.diff(time, "millisecond");
  const remainingHours = String(Math.floor(remainingMs / 1000 / 3600)).padStart(2, "0");
  const remainingMinutes = String(Math.floor((remainingMs / 1000 % 3600) / 60)).padStart(2, "0");
  const remainingSeconds = String(Math.floor(remainingMs / 1000 % 60)).padStart(2, "0");

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
          <div className={homeStyles.rowText}>{time.year()}</div>
        </div>

        <div className={homeStyles.rowContainer}>
          <div className={homeStyles.subtitle}>Current Time</div>
          <div className={homeStyles.rowText}>{time.format("HH:mm:ss")}</div>
        </div>

        <div className={homeStyles.rowContainer}>
          <div className={homeStyles.subtitle}>Greeting</div>
          <div className={homeStyles.rowText}>{greeting}</div>
        </div>

        <div className={homeStyles.rowContainer}>
          <div className={homeStyles.subtitle}>Date</div>
          <div className={homeStyles.rowText}>
            {monthNames[time.month()]} {time.date()}, {dayNames[time.day()]}
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
