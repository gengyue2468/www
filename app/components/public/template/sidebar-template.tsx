interface SidebarTemplateProps {
  children: React.ReactNode;
}

export default function SidebarTemplate({ children }: SidebarTemplateProps) {
  return (
    <div className="text-sm hidden md:block md:fixed md:right-[max(2rem,calc(50%-40rem))] md:top-16 w-48">
      {children}
    </div>
  );
}
