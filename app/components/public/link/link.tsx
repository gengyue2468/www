import { Link as RouterLink } from "react-router";
import { MagneticText } from "../cursor";

export default function Link({ to, className, children, ...props } : {
  to: string;
  className?: string;
  children: React.ReactNode;
  [key: string]: any;
}) {
  return (
    <RouterLink to={to} className={className} {...props}>
      <MagneticText>
        {children}
      </MagneticText>
    </RouterLink>
  );
}

