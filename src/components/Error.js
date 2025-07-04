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
            <AlertTitle className="font-semibold">An Unexpected Error Has Occurred.</AlertTitle>
            <AlertDescription>
                <p>{error}</p>
                <Button onClick={router.reload} variant="destructive" className="mt-2 cursor-pointer"><RotateCcwIcon /> <span>Retry</span></Button>
            </AlertDescription>
        </Alert>
    )
}