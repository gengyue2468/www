export default function LayoutTemplate({
  left,
  right,
}: {
  left: React.ReactNode;
  right: React.ReactNode;
}) {
  return (
    <div className="flex flex-col lg:flex-row items-center justify-between gap-0">
      <div className="text-2xl xl:text-3xl w-full lg:w-2/5 min-h-auto lg:min-h-screen px-8 md:px-16 py-8 lg:py-16 flex flex-col justify-center">
        {left}
      </div>
      <div className="w-full lg:w-3/5 px-8 py-16 z-0 -mt-16 lg:mt-0">
        {right}
      </div>
    </div>
  );
}
