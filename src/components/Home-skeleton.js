import { Skeleton } from "./ui/skeleton";

export default function HomeSkeleton({key}) {
    return (
        <div key={key} className="w-full mb-2">
            <div className='flex flex-row justify-between items-center space-x-8'>
                <Skeleton className="w-54 h-6 rounded-sm" />
                <Skeleton className="w-16 h-6 rounded-sm" />
            </div>
        </div>
    )
}