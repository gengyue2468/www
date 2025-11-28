"use client";

import { homeStyles } from "./home.config";

interface GlobalErrorProps {
  error: Error;
}

export default function GlobalError({ error }: GlobalErrorProps) {
  return (
    <>
      <div className={homeStyles.container}>
        <div className={homeStyles.listContainer}>
          <h1 className={homeStyles.title}>An unexpected error has occurred</h1>
          <p className={homeStyles.subtitle}>{error.message}</p>
        </div>
      </div>
    </>
  );
}
