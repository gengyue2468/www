import { Skeleton } from "./ui/skeleton";

export default function HomeSkeleton({index}) {
    return (
        <div key={index} className="w-full mb-2">
            <div className='flex flex-row justify-between items-center space-x-8'>
                <Skeleton className="w-72 h-6 rounded-sm" />
                <Skeleton className="w-28 h-6 rounded-sm" />
            </div>
        </div>
    )
}