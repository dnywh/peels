import type { ReactNode, SVGProps } from "react";

type IconWrapperProps = SVGProps<SVGSVGElement> & {
  children?: ReactNode;
  size?: number | string;
  label?: string;
};

function IconWrapper({
  children,
  size = 24,
  label = "",
  fill = "none",
  ...props
}: IconWrapperProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={fill}
      aria-hidden="true"
      aria-label={label}
      role="img"
      {...props}
    >
      {children}
    </svg>
  );
}

export default IconWrapper;
