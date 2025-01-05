"use client";
import { useRouter } from "next/navigation";
import Button from "@/components/Button";
import classNames from "classnames"; // Required for combining Tailwind classes with styled components

function BackButton({ onClick, children = "← Back", className }) {
  const router = useRouter();

  // Go back to the previous page or, if provided, call the onClick function
  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      router.back();
    }
  };

  return (
    <Button onClick={handleClick} className={className}>
      {children}
    </Button>
  );
}

export default BackButton;
