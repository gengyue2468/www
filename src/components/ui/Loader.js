import { Loader2Icon } from "lucide-react";

export default function Loader(){
    return(
        <div className="w-full h-screen flex items-center justify-center">
            <Loader2Icon className="size-7 animate-spin" />
        </div>
    )
}