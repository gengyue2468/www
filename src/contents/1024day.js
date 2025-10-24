import Wrapper from "@/components/layouts/Wrapper";
import { useRouter } from "next/router";

export default function OOTFDAY() {
  const router = useRouter();
  return (
    <>
      <div className="flex flex-col justify-center items-center h-[75vh]">
        <pre className="scale-50 md:scale-100">
          {`
        ——————————           —————————————          ————————————          ————      ————
       /        /           /            /         /   ————    /         /   /     /   /   
      /   /    /           /  /      /  /         /   /   /   /         /   /     /   /   
      ————    /           /  /      /  /          ————   /   /         /   /     /   /  
         /   /           /  /      /  /                 /   /         /   ———————   /    
        /   /           /  /      /  /                 /   /         ———————————   /  
       /   /           /  /      /  /                 /   /                    /  /
      /   /           /  /      /  /                 /   /                    /  /
     /   /           /            /                 /    ——————              /  /
    1———1           0————————————0                 2——————————2             4——4

      `}
        </pre>

        <h1 className="font-extrabold text-3xl my-8">10.24 程序员节快乐！</h1>

        <button
          aria-label="跳转到关于"
          onClick={() => router.push("/about")}
          className="bg-black dark:bg-white text-white dark:text-black rounded-full px-8 py-4 text-xl font-bold"
        >
          跳转到关于
        </button>
      </div>
    </>
  );
}
