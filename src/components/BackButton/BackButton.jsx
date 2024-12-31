"use client";
import { useRouter } from "next/navigation";
import Button from "@/components/Button";

function BackButton({ onClick, children = "← Back" }) {
  const router = useRouter();

  // Go back to the previous page or, if provided, call the onClick function
  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      router.back();
    }
  };

  return <Button onClick={handleClick}>{children}</Button>;
}

export default BackButton;
