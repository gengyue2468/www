import { AlertCircleIcon, RotateCcwIcon } from "lucide-react"
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert"
import { Button } from '@/components/ui/button';
import { useRouter } from "next/router";

export default function Error({ error }) {
    const router = useRouter()
    return (
        <Alert variant="destructive">
            <AlertCircleIcon />
            <AlertTitle className="font-semibold">发生意外错误.</AlertTitle>
            <AlertDescription>
                <p>{error}</p>
                <Button onClick={router.reload} variant="destructive" className="mt-2 cursor-pointer"><RotateCcwIcon /> <span>重试加载</span></Button>
            </AlertDescription>
        </Alert>
    )
}