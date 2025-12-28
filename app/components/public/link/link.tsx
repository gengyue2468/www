import { Link as RouterLink } from "react-router";
import { MagneticText } from "../cursor";

export default function Link({
  to,
  className,
  children,
  ...props
}: {
  to: string;
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <RouterLink to={to} className={className} {...props}>
      <MagneticText text={children} />
    </RouterLink>
  );
}
