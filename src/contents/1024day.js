import Wrapper from "@/components/layouts/Wrapper";

export default function OOTFDAY() {
  return (
    <>
      <div className="flex flex-col justify-center items-center h-[75vh]">
        <pre className="scale-40 md:scale-100">
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
      </div>
    </>
  );
}
