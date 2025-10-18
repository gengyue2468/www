import { Tooltip as RadixTooltip } from "radix-ui";

export default function Tooltip({ children, content }) {
  return (
    <RadixTooltip.Provider>
      <RadixTooltip.Root>
        <RadixTooltip.Trigger asChild>{children}</RadixTooltip.Trigger>
        <RadixTooltip.Portal>
          <RadixTooltip.Content
            className="select-none rounded-full bg-neutral-100 dark:bg-neutral-900 font-semibold px-3 py-3 text-[15px] leading-none will-change-[transform,opacity] data-[state=delayed-open]:data-[side=bottom]:animate-slideUpAndFade data-[state=delayed-open]:data-[side=left]:animate-slideRightAndFade data-[state=delayed-open]:data-[side=right]:animate-slideLeftAndFade data-[state=delayed-open]:data-[side=top]:animate-slideDownAndFade"
            sideOffset={5}
          >
            {content}
            <RadixTooltip.Arrow className="fill-neutral-100 dark:fill-neutral-900" />
          </RadixTooltip.Content>
        </RadixTooltip.Portal>
      </RadixTooltip.Root>
    </RadixTooltip.Provider>
  );
}
