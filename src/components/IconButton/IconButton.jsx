"use client";

import { useRouter } from "next/navigation";
// import { Button as UnstyledButton } from "@headlessui/react";
import Button from "@/components/Button";
import { ArrowLeft } from "lucide-react";
import { X } from "lucide-react";

import { styled } from "@pigment-css/react";

const StyledButton = styled(Button)({
  width: "2rem",
  height: "2rem",
  borderRadius: "50%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: "white",
  border: "1px solid #e0e0e0",

  padding: `0`, // This is to override the general Button component padding. TODO: make a specific TextButton component that has this padding value, not the root Button component.
  // TODO: Make clickable area at least 44px by 44px, set visible inner to what's currently set

  "&:hover": {
    backgroundColor: "#f0f0f0",
  },

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

function IconButton({ onClick, action = "back", breakpoint, ...props }) {
  const router = useRouter();

  const handleClick = (e) => {
    if (onClick) {
      onClick(e);
    }

    if (!onClick && action === "back") {
      router.back();
    }
  };

  return (
    <StyledButton breakpoint={breakpoint} onClick={handleClick} {...props}>
      {action === "close" && <X size={16} />}
      {action === "back" && <ArrowLeft size={16} />}
    </StyledButton>
  );
}

export default IconButton;
