import { Link } from "react-router";

interface RouterBackProps {
    to?: string;
}

export default function RouterBack({ to = "/" }: RouterBackProps) {
  return (
    <div className="static md:fixed md:left-[max(2rem,calc(50%-30rem))] md:top-16 mb-6 md:mb-0">
      <Link
        to={to}
        className="text-sm no-underline! font-medium"
        prefetch="intent"
      >
        ↖ 返回
      </Link>
    </div>
  );
}
