"use client";

import { useRouter } from "next/navigation";
import Button from "@/components/Button";
import { ArrowLeft } from "lucide-react";
import { X } from "lucide-react";

import { styled } from "@pigment-css/react";

const StyledButton = styled(Button)({
  width: "2.75rem",
  height: "2.75rem",
  borderRadius: "50%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: "white",
  border: "1px solid #e0e0e0",

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
      {action === "close" && <X />}
      {action === "back" && <ArrowLeft />}
    </StyledButton>
  );
}

export default IconButton;
