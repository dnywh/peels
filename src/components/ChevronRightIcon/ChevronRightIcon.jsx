import IconWrapper from "../IconWrapper";

function ChevronRightIcon({ size = 20 }) {
  return (
    <IconWrapper
      size={size}
      strokeWidth={2}
      aria-hidden="true"
      role="presentation"
    >
      <path d="m9 6 6 6-6 6" />
    </IconWrapper>
  );
}

export default ChevronRightIcon;
