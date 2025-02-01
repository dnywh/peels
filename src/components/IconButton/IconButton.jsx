"use client";

import { useRouter } from "next/navigation";
// import { Button as UnstyledButton } from "@headlessui/react";
import Button from "@/components/Button";
import {
  X,
  ArrowLeft,
  ArrowUp,
  ArrowDown,
  EllipsisVertical,
} from "lucide-react";

import { styled } from "@pigment-css/react";

const StyledButton = styled(Button)(({ theme }) => ({
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
}));

function IconButton({
  onClick,
  variant = "subtle",
  icon = "back",
  breakpoint,
  ...props
}) {
  const router = useRouter();

  const handleClick = (e) => {
    if (onClick) {
      onClick(e);
    }

    if (!onClick && icon === "back") {
      router.back();
    }
  };

  return (
    <StyledButton
      size="icon"
      variant={variant}
      breakpoint={breakpoint}
      onClick={handleClick}
      {...props}
    >
      {icon === "close" && <X size={16} />}
      {icon === "back" && <ArrowLeft size={16} />}
      {icon === "maximize" || icon === "send" ? <ArrowUp size={16} /> : null}
      {icon === "minimize" && <ArrowDown size={16} />}
      {icon === "overflow" && <EllipsisVertical size={16} />}
    </StyledButton>
  );
}

export default IconButton;
