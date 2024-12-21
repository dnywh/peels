"use client";
import { useRouter } from "next/navigation";

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

  return <button onClick={handleClick}>{children}</button>;
}

export default BackButton;
