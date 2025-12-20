import type { Canteen } from "@/types/canteen";
import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";
import { Link } from "react-router";

dayjs.extend(duration);

export default function CanteenList({ canteens }: { canteens: Canteen[] }) {
  const displayedCanteens = canteens.slice(0, 3);

  return (
    <ul className="space-y-4">
      <div>
        {displayedCanteens.map((canteen: Canteen) => {
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
                {hours > 0 ? `${hours} 小时 ${minutes} 分` : `${minutes} 分`}
              </span>
            </div>
          );
        })}
      </div>

      <Link
        to={canteens.length > 3 ? `/chifan` : "/chifan?tab=1"}
        prefetch="intent"
        className="mt-4 font-medium"
      >
        {canteens.length > 3
          ? `+ ${canteens.length - 3} 个食堂`
          : "查看开饭信息"}
      </Link>
    </ul>
  );
}
