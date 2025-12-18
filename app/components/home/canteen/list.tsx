import type { Canteen } from "../../../../types/canteen";
import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";

dayjs.extend(duration);

export default function CanteenList({
  canteens,
  showMore,
  onToggle,
}: {
  canteens: Canteen[];
  showMore: boolean;
  onToggle: () => void;
}) {
  const displayedCanteens = showMore ? canteens : canteens.slice(0, 3);

  return (
    <ul className="">
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
      {canteens.length > 3 && (
        <button
          className="mt-2 font-medium underline cursor-pointer"
          onClick={onToggle}
        >
          {showMore ? "收起" : `+ ${canteens.length - 3} 个食堂`}
        </button>
      )}
    </ul>
  );
}
