"use client";

import { useState, useEffect } from "react";
import Button from "@/components/Button";
import { styled } from "@pigment-css/react";
import { useSearchParams } from "next/navigation";

const StyledToast = styled("div")(({ theme }) => ({
  // position: "absolute",
  // top: "1rem",
  // left: "50%",
  // transform: "translateX(-50%)",
  display: "flex",
  flexDirection: "column",
  alignItems: "flex-start",
  gap: "0.5rem",
  flexWrap: "wrap",
  maxWidth: "400px",
  backgroundColor: theme.colors.background.pit,
  borderRadius: theme.corners.base,
  padding: `0.75rem 1rem`,
  textAlign: "center",
  textWrap: "balance",
  color: theme.colors.text.ui.secondary,
  border: `1px solid ${theme.colors.border.base}`,
  // opacity: 0,

  // variants: [
  //   {
  //     prop: { isOpen: true },
  //     style: {
  //       opacity: 1,
  //     },
  //   },
  // ],

  // TODO: Passing a variant from a callback causes an error:
  // [ Server ] Error: Cannot convert undefined or null to object
  // That's probably because the variant isn't known by the time the toast renders
  // So need to figure out a way to pass the variant from the callback and handle it on the fly
  // variants: [
  //   {
  //     prop: { variant: "success" },
  //     style: {
  //       backgroundColor: theme.colors.background.success,
  //     },
  //   },
  //   {
  //     prop: { variant: "error" },
  //     style: {
  //       backgroundColor: theme.colors.background.error,
  //     },
  //   },
  // ],
}));

function Toast({ variant: propVariant, children: propChildren }) {
  const [isOpen, setIsOpen] = useState(true);
  const searchParams = useSearchParams();

  // Handle URL-based toasts
  const code = searchParams?.get("code");
  const error = searchParams?.get("error");

  const variant = propVariant || (error ? "error" : "success");
  const children =
    propChildren ||
    (error
      ? "Something's not right. Mind trying again?"
      : "Your email has been successfully updated");

  // Only show if we have props OR relevant URL params
  if (!propChildren && !code && !error) return null;

  return (
    <StyledToast variant={variant} isOpen={isOpen}>
      <p>{children}</p>
      {/* <Button
        variant="secondary"
        size="small"
        onClick={() => {
          // TODO: Close the toast
          setIsOpen(false);
        }}
      >
        Close
      </Button> */}
    </StyledToast>
  );
}

export default Toast;
