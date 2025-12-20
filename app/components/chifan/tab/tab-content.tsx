import type { Canteen, kaifanStatus } from "@/types/canteen";
import { Suspense } from "react";
import { Await } from "react-router";
import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";

dayjs.extend(duration);

interface TabContentProps {
  type: "opened" | "status";
  data: Canteen[] | kaifanStatus[];
}

export default function TabContent({ type, data }: TabContentProps) {
  return (
    <>
      <Suspense
        fallback={
          <div>
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className="h-7.5 w-full flex items-center justify-between *:animate-pulse"
              >
                <div className="h-6 w-25 bg-neutral-200 dark:bg-neutral-800" />
                <div className="h-6 w-30 bg-neutral-200 dark:bg-neutral-800" />
              </div>
            ))}
          </div>
        }
      >
        <Await resolve={data}>
          {(canteens) => {
            return canteens.length > 0 ? (
              <>
                {type === "opened" ? (
                  <ul className="">
                    {(canteens as Canteen[]).map((canteen: Canteen) => {
                      const d = dayjs.duration(canteen.remaining);
                      const hours = Math.floor(d.asHours());
                      const minutes = d.minutes();
                      return (
                        <div
                          key={canteen.name}
                          className="flex flex-row items-center justify-between py-0.5"
                        >
                          <span className="font-medium">{canteen.name}</span>
                          <span className="text-neutral-600 dark:text-neutral-400">
                            还能吃{" "}
                            {hours > 0
                              ? `${hours} 小时 ${minutes} 分`
                              : `${minutes} 分`}
                          </span>
                        </div>
                      );
                    })}
                  </ul>
                ) : (
                  <ul className="">
                    {(canteens as kaifanStatus[]).map(
                      (status: kaifanStatus) => (
                        <div
                          key={status.name}
                          className="flex flex-row items-center justify-between py-0.5"
                        >
                          <span className="font-medium">{status.name}</span>
                          <span className="text-neutral-600 dark:text-neutral-400">
                            {status.status}
                          </span>
                        </div>
                      )
                    )}
                  </ul>
                )}
              </>
            ) : (
              <p className="font-medium text-neutral-600 dark:text-neutral-400">
                {type === "opened"
                  ? "坏了，现在没有吃的了."
                  : "呃啊，API 好像不小心挂掉了."}
              </p>
            );
          }}
        </Await>
      </Suspense>
    </>
  );
}
