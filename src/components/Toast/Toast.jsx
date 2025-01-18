"use client";

import { useState } from "react";
import Button from "@/components/Button";
import { styled } from "@pigment-css/react";

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

function Toast({ variant = "success", children }) {
  const [isOpen, setIsOpen] = useState(true);
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
