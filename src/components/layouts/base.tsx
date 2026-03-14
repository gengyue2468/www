import * as React from "react";

export default function BaseLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-[56ch] lg:max-w-prose px-6 py-8 lg:-translate-x-16 outline-none">
        {children}
      </div>
    </div>
  );
}
