import { Skeleton } from "./ui/skeleton";

export default function PostSkeleton() {
    return (
        <div className="">
            <div className='flex flex-col space-y-2 mb-8'>
                <Skeleton className="w-72 h-6 rounded-sm" />
                <Skeleton className="w-28 h-6 rounded-sm" />
            </div>

            <div className="flex flex-col space-y-2">
                <Skeleton className="w-full h-6 rounded-sm" />
                <Skeleton className="w-54 h-6 rounded-sm mb-6" />
                <Skeleton className="w-full h-6 rounded-sm" />
                <Skeleton className="w-full h-6 rounded-sm" />
                <Skeleton className="w-36 h-6 rounded-sm mb-6" />
                <Skeleton className="w-full h-6 rounded-sm" />
                <Skeleton className="w-full h-6 rounded-sm" />
                <Skeleton className="w-full h-6 rounded-sm" />
                <Skeleton className="w-full h-6 rounded-sm" />
                <Skeleton className="w-72 h-6 rounded-sm mb-6" />
                <Skeleton className="w-full h-6 rounded-sm" />
                <Skeleton className="w-24 h-6 rounded-sm mb-6" />
                 <Skeleton className="w-80 h-6 rounded-sm" />
                
            </div>
        </div>
    )
}