import { styled } from "@pigment-css/react";

const StyledListItemIconWrapper = styled("svg")(({ theme }) => ({
  variants: [
    {
      props: { type: "accepted" },
      style: {
        stroke: theme.colors.status.accepted,
      },
    },
    {
      props: { type: "rejected" },
      style: {
        stroke: theme.colors.status.rejected,
      },
    },
  ],
}));

function ListItemIconWrapper({
  children,
  size = "20",
  label = "",
  fill = "none",
  type = "accepted",
  ...props
}) {
  return (
    <StyledListItemIconWrapper
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 20 21"
      fill={fill}
      aria-hidden="true"
      aria-label={label}
      role="img"
      type={type}
      {...props}
    >
      {children}
    </StyledListItemIconWrapper>
  );
}

export default ListItemIconWrapper;
