import { Tooltip as RadixTooltip } from "radix-ui";

export default function Tooltip({ children, content, ...props }) {
  return (
    <RadixTooltip.Provider {...props}>
      <RadixTooltip.Root>
        <RadixTooltip.Trigger asChild>{children}</RadixTooltip.Trigger>
        <RadixTooltip.Portal>
          <RadixTooltip.Content
            className="z-50 select-none rounded-full bg-neutral-950 dark:bg-neutral-50 text-white dark:text-black font-semibold px-3 py-4 text-base leading-none will-change-[transform,opacity] data-[state=delayed-open]:data-[side=bottom]:animate-slideUpAndFade data-[state=delayed-open]:data-[side=left]:animate-slideRightAndFade data-[state=delayed-open]:data-[side=right]:animate-slideLeftAndFade data-[state=delayed-open]:data-[side=top]:animate-slideDownAndFade"
            sideOffset={5}
          >
            {content}
            <RadixTooltip.Arrow className="fill-neutral-950 dark:fill-neutral-50" />
          </RadixTooltip.Content>
        </RadixTooltip.Portal>
      </RadixTooltip.Root>
    </RadixTooltip.Provider>
  );
}
