export interface PageHeaderProps {
  title: string;
  subtitle?: string;
  transitionName?: string;
}

export function PageHeader({
  title,
  subtitle,
  transitionName,
}: PageHeaderProps) {
  return (
    <header className="page-header">
      <h1 className="page-title" style={transitionName ? { viewTransitionName: transitionName } : undefined}>{title}</h1>
      {subtitle && <p className="page-description">{subtitle}</p>}
    </header>
  );
}

export interface PageLayoutProps {
  children: React.ReactNode;
  className?: string;
}

export function PageLayout({ children, className = "" }: PageLayoutProps) {
  const classes = ["page-layout", className].filter(Boolean).join(" ");

  return (
    <div className={classes}>
      {children}
    </div>
  );
}


