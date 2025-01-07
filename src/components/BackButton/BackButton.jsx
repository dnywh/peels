"use client";
import { useRouter } from "next/navigation";
import Button from "@/components/Button";
import { ArrowLeft } from "lucide-react";
import { styled } from "@pigment-css/react";

const StyledButton = styled(Button)({
  width: "3rem",
  height: "3rem",
  borderRadius: "50%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",

  variants: [
    {
      props: { breakpoint: "sm" },
      style: {
        display: "flex",
        "@media (min-width: 768px)": {
          display: "none",
        },
      },
    },
  ],
});

function BackButton({ onClick, breakpoint, children = <ArrowLeft /> }) {
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
    <StyledButton breakpoint={breakpoint} onClick={handleClick}>
      {children}
    </StyledButton>
  );
}

export default BackButton;
