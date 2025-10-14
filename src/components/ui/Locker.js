import { LockKeyholeIcon, LockKeyholeOpenIcon } from "lucide-react";
import { useEffect, useState } from "react";

export default function Locker({ password, information }) {
  const [isLocked, setIsLocked] = useState(true);
  const [openAuthorize, setOpenAuthorize] = useState(false);
  const [passwordContent, setPasswordContent] = useState("");
  const [enteredPassword, setEnteredPassword] = useState(null);

  useEffect(() => {
    if (enteredPassword == password) {
      setIsLocked(false);
      setOpenAuthorize(false);
    }
  }, [enteredPassword]);
  return (
    <>
      {isLocked ? (
        <>
          <span className="inline-flex items-center space-x-2">
            <span className="uppercase">xxxx-xxxx-xxxx-xxxx</span>
            <button className="ml-0 bg-neutral-200 dark:bg-neutral-800 rounded-sm p-1">
              <LockKeyholeIcon size={12} onClick={() => setOpenAuthorize(true)} />
            </button>
          </span>
          {openAuthorize && (
            <>
              <div
                className="fixed top-0 w-full h-full bg-white/90 dark:bg-black/90 backdrop-blur-sm left-0 right-0 bottom-0 z-30"
                onClick={(e) => {
                  e.stopPropagation();
                  setOpenAuthorize(false);
                }}
              />
              <div className="border border-neutral-200 dark:border-neutral-800 fixed top-1/2 left-1/2 max-w-xs mx-auto w-full -translate-x-1/2 -translate-y-1/2 p-3 rounded-sm bg-white dark:bg-black z-40">
                <h1>准备好你的密码，然后输入密码以继续</h1>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    setEnteredPassword(passwordContent);
                  }}
                >
                  <input
                    type="password"
                    placeholder="在这里输入密码..."
                    value={passwordContent}
                    onChange={(e) => setPasswordContent(e.target.value)}
                    className="border border-neutral-200 dark:border-neutral-800 w-full px-2 py-2 rounded-sm transition-all duration-500 focus:outline-none focus:ring-2 focus:ring-neutral-500 mt-1"
                  />
                  <button
                    onClick={() => setEnteredPassword(passwordContent)}
                    className="bg-black text-white dark:bg-white dark:text-black transition-all duration-500 rounded-sm w-full px-2 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-neutral-500"
                  >
                    确认
                  </button>
                </form>
                {enteredPassword && enteredPassword !== password && (
                  <span className="text-red-600 mt-1 text-xs">密码不正确!</span>
                )}
              </div>
            </>
          )}
        </>
      ) : (
         <span className="inline-flex items-center space-x-2">
            <span>{information}</span>
            <button className="ml-0 bg-neutral-200 dark:bg-neutral-800 rounded-sm p-1">
              <LockKeyholeOpenIcon size={12} onClick={() => setIsLocked(true)} />
            </button>
          </span>
        
      )}
    </>
  );
}
