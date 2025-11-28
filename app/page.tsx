/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import Music from "@/components/music/music";
import Clock from "@/components/clock/clock";
import { homeStyles, profile } from "./home.config";
import classNames from "classnames";
import Weather from "@/components/weather/weather";
import Guestbook from "@/components/guestbook/guestbook";
import { useHash } from "@/hooks/use-hash";
import { useTheme } from "next-themes";
import { useState, useEffect } from "react";

export default function Home() {
  const hash = useHash();
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const getInvertDataColor = () => {
    if (!mounted || !hash) return null;
    const actualTheme = resolvedTheme || "light";
    return actualTheme === "dark" ? "light" : "dark";
  };

  return (
    <>
      <div className={homeStyles.gridContainer}>
        <div className={homeStyles.gridItem}>
          <h1 className={homeStyles.title}>Basic Info</h1>
          <div className={homeStyles.listContainer}>
            <div className={homeStyles.rowContainer}>
              <div className={homeStyles.subtitle}>Name</div>
              <div className={homeStyles.rowText}>{profile.name}</div>
            </div>
            <div className={homeStyles.rowContainer}>
              <div className={homeStyles.subtitle}>Age</div>
              <div className={homeStyles.rowText}>{profile.age}</div>
            </div>
            <div className={homeStyles.rowContainer}>
              <div className={homeStyles.subtitle}>University</div>
              <div className={homeStyles.rowText}>{profile.university}</div>
            </div>
            <div className={homeStyles.rowContainer}>
              <div className={homeStyles.subtitle}>Major</div>
              <div className={homeStyles.rowText}>{profile.major}</div>
            </div>
            <div className={homeStyles.rowContainer}>
              <div className={homeStyles.subtitle}>Club</div>
              <div className={homeStyles.rowText}>{profile.club}</div>
            </div>
            <div className={homeStyles.rowContainer}>
              <div className={homeStyles.subtitle}>Group</div>
              <div className={homeStyles.rowText}>{profile.group}</div>
            </div>
          </div>
        </div>
        <div
          id="tags"
          data-color={hash === "tags" ? getInvertDataColor() : undefined}
          className={classNames(
            homeStyles.gridItem,
            mounted && hash === "tags"
              ? "bg-foreground text-background"
              : ""
          )}
        >
          <h1 className={homeStyles.title}>Tags</h1>
          <div className={homeStyles.listContainer}>
            {profile.tags.map((tag, index) => (
              <div key={index} className={homeStyles.rowContainer}>
                <div className={homeStyles.subtitle}>Tag {index + 1}.</div>
                <div className={homeStyles.rowText}>{tag}</div>
              </div>
            ))}
          </div>
        </div>
        <div
          id="tech-stacks"
          data-color={hash === "tech-stacks" ? getInvertDataColor() : undefined}
          className={classNames(
            homeStyles.gridItem,
            mounted && hash === "tech-stacks"
              ? "bg-foreground text-background"
              : ""
          )}
        >
          <h1 className={homeStyles.title}>Tech Stacks</h1>
          <div className={homeStyles.listContainer}>
            {profile.stacks.map((stack, index) => (
              <div key={index} className={homeStyles.rowContainer}>
                <div className={homeStyles.subtitle}>{index + 1}.</div>
                <div className={homeStyles.listContainer}>
                  <div className={homeStyles.rowText}>{stack.lan}</div>
                  <div className={classNames(homeStyles.rowText, "opacity-80")}>
                    {stack.description}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div
          id="projects"
          data-color={hash === "projects" ? getInvertDataColor() : undefined}
          className={classNames(
            homeStyles.gridItem,
            mounted && hash === "projects"
              ? "bg-foreground text-background"
              : ""
          )}
        >
          <h1 className={homeStyles.title}>Projects</h1>
          <div className={homeStyles.listContainer}>
            {profile.projects.map((project, index) => (
              <div key={index} className={homeStyles.rowContainer}>
                <div className={homeStyles.subtitle}>{index + 1}.</div>
                <div className={homeStyles.listContainer}>
                  <div
                    className={classNames(
                      homeStyles.rowText,
                      "hover:opacity-50 cursor-pointer"
                    )}
                    onClick={() => open(project.url)}
                  >
                    {project.name}
                  </div>
                  <div className={classNames(homeStyles.rowText, "opacity-80")}>
                    {project.description}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div
          id="games"
          data-color={hash === "games" ? getInvertDataColor() : undefined}
          className={classNames(
            homeStyles.gridItem,
            mounted && hash === "games"
              ? "bg-foreground text-background"
              : ""
          )}
        >
          <h1 className={homeStyles.title}>Games</h1>
          <div className={homeStyles.listContainer}>
            {profile.games.map((game, index) => (
              <div key={index} className={homeStyles.rowContainer}>
                <div className={homeStyles.subtitle}>{index + 1}.</div>
                <div className={homeStyles.listContainer}>
                  <div className={homeStyles.rowText}>{game}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <Music />
        <Weather />
        <Clock />
        <div className="hidden xl:block" />
        <Guestbook />
      </div>
    </>
  );
}
