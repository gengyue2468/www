import { useSession, signOut } from 'next-auth/react';
import { Github, LogOut } from 'lucide-react';

export default function AuthButton() {
  const { data: session } = useSession();

  if (session) {
    return (
      <div className="flex items-center gap-2">
        <img
          src={session.user.image}
          alt={session.user.name}
          className="w-8 h-8 rounded-full object-cover"
        />
        <button
          onClick={() => signOut()}
          className="p-1.5 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"
          aria-label="退出登录"
        >
          <LogOut className="h-4 w-4" />
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => window.location.href = '/api/auth/signin'}
      className="flex items-center gap-2 px-3 py-1.5 bg-neutral-800 text-white dark:bg-neutral-600 rounded-md hover:bg-neutral-700 dark:hover:bg-neutral-500 transition-colors text-sm"
    >
   
      登录
    </button>
  );
}
    