"use client";

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
  const searchParams = useSearchParams();

  // Handle URL-based toasts
  const error = searchParams?.get("error");
  const message = searchParams?.get("message");
  const success = searchParams?.get("success");
  const successMessage =
    message ||
    (success === "email_change"
      ? "Your email has been successfully updated"
      : success && success !== "true"
        ? success
        : null);

  const variant = propVariant || (error ? "error" : "success");
  const children = propChildren || error || successMessage;

  // Only show if we have props OR relevant URL params
  if (!children) return null;

  return (
    <StyledToast variant={variant}>
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
