interface HeaderTemplateProps {
  title: string;
  description: string;
  subtitle?: string;
}

export default function HeaderTemplate({
  title,
  description,
  subtitle,
}: HeaderTemplateProps) {
  return (
    <header className="flex flex-row justify-between items-center">
      <div className="flex flex-col">
        <h1 className="font-semibold">{title}</h1>
        <p className="font-medium text-neutral-600 dark:text-neutral-400">
          {description}
        </p>
      </div>
      <h2 className="font-medium ">{subtitle}</h2>
    </header>
  );
}
