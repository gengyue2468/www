import { AlertCircleIcon, RotateCcwIcon } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/router";
import { LazyLoadImage } from "react-lazy-load-image-component";

export default function Error({ error, type }) {
  const router = useRouter();
  return (
    <div className="my-4">
      <h1 className="font-extrabold text-3xl mb-2">Oops!</h1>
      <div className="flex flex-row space-x-4 items-center text-balance mb-2">
        <div className="w-2/3">
          <p className="font-medium text-lg sm:text-xl">我们遇到了一个小问题</p>
          <p className="font-medium text-lg sm:text-xl mt-2">
            不必担心，可参考错误信息解决问题
          </p>
        </div>
        <div className="w-1/3">
          <LazyLoadImage
            effect="blur"
            src="/static/brian-griffin.webp"
            className="rounded-full size-24 sm:size-36"
          />
        </div>
      </div>

      <Card>
        <CardHeader className="flex flex-col space-y-1 items-center text-center">
          <CardTitle>
            <WarningIcon />
          </CardTitle>
          <CardDescription className="font-extrabold text-3xl">
            发生意外错误
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center">
          <Button
            onClick={router.reload}
            variant="secondary"
            className="mt-2 cursor-pointer"
          >
            <RotateCcwIcon /> <span>试试重载</span>
          </Button>
        </CardContent>
        <CardFooter className="flex flex-col items-center">
          <p className="text-center text-xs opacity-75 mt-2 text-foreground">
            如果联系技术人员，请向它们提供错误信息:{error}.
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}

const WarningIcon = () => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      className="size-20 text-orange-400"
    >
      <path
        fillRule="evenodd"
        d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495ZM10 5a.75.75 0 0 1 .75.75v3.5a.75.75 0 0 1-1.5 0v-3.5A.75.75 0 0 1 10 5Zm0 9a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z"
        clipRule="evenodd"
      />
    </svg>
  );
};
