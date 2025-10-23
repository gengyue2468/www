import { useState } from "react";
import { Drawer as Vaul } from "vaul";

export default function Drawer({ children, content }) {
  const [open, setOpen] = useState(false);

  return (
    <Vaul.Root open={open} onOpenChange={setOpen}>
      <Vaul.Trigger asChild>{children}</Vaul.Trigger>
      <Vaul.Portal>
        <Vaul.Overlay className="fixed inset-0 bg-black/40" />
        <Vaul.Content className="z-10 px-4 bg-white dark:bg-black flex flex-col rounded-t-[10px] h-[90%] md:h-[80%] mt-24 fixed bottom-0 left-0 right-0">
          <div className="flex justify-center">
            <div className="w-16 bg-neutral-200 dark:bg-neutral-800 rounded-full h-2 mt-8 mb-4" />
          </div>

          {content}
        </Vaul.Content>
      </Vaul.Portal>
    </Vaul.Root>
  );
}
