import { LockKeyholeIcon, LockKeyholeOpenIcon } from "lucide-react";
import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogOverlay,
  DialogTitle,
} from "@radix-ui/react-dialog";

export default function Locker({ password, information }) {
  const [isLocked, setIsLocked] = useState(true);
  const [passwordContent, setPasswordContent] = useState("");
  const [enteredPassword, setEnteredPassword] = useState(null);
  const [showError, setShowError] = useState(false);

  const handleAuthorize = (e) => {
    e.preventDefault();
    setEnteredPassword(passwordContent);
    setShowError(passwordContent !== password);
  };

  useEffect(() => {
    if (enteredPassword === password) {
      setIsLocked(false);
      setPasswordContent("");
      setShowError(false);
    }
  }, [enteredPassword, password]);

  const handleLock = () => {
    setIsLocked(true);
    setEnteredPassword(null);
  };

  return (
    <>
      {isLocked ? (
        <Dialog>
          <div className="inline-flex items-center space-x-2">
            <span className="uppercase">xxxx-xxxx-xxxx-xxxx</span>
            <DialogTrigger asChild>
              <button
                className="bg-neutral-200 dark:bg-neutral-800 rounded-sm p-1"
                aria-label="解锁"
              >
                <LockKeyholeIcon size={12} />
              </button>
            </DialogTrigger>
            <DialogOverlay className="fixed inset-0 bg-white/90 dark:bg-black/90 backdrop-blur-sm z-30" />
            <DialogContent className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 border border-neutral-200 dark:border-neutral-800 max-w-xs mx-auto w-full p-3 rounded-sm bg-white dark:bg-black">
              <DialogTitle as="h1" className="text-lg font-medium">
                请输入密码以继续
              </DialogTitle>

              <form onSubmit={handleAuthorize} className="mt-4">
                <input
                  type="password"
                  placeholder="输入密码..."
                  value={passwordContent}
                  onChange={(e) => {
                    setPasswordContent(e.target.value);
                    setShowError(false);
                  }}
                  className="border border-neutral-200 dark:border-neutral-800 w-full px-2 py-2 rounded-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-neutral-500 mt-1"
                  autoFocus
                />

                {showError && (
                  <span className="text-red-600 mt-1 text-xs block">
                    密码不正确，请重新输入!
                  </span>
                )}

                <button
                  type="submit"
                  className="bg-black text-white dark:bg-white dark:text-black transition-all duration-200 rounded-sm w-full px-2 py-2 mt-3 focus:outline-none focus:ring-2 focus:ring-neutral-500"
                >
                  确认
                </button>
              </form>
            </DialogContent>
          </div>
        </Dialog>
      ) : (
        <div className="inline-flex items-center space-x-2">
          <span>{information}</span>
          <button
            className="bg-neutral-200 dark:bg-neutral-800 rounded-sm p-1"
            onClick={handleLock}
            aria-label="锁定"
          >
            <LockKeyholeOpenIcon size={12} />
          </button>
        </div>
      )}
    </>
  );
}
