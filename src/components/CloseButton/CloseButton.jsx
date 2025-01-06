import Button from "@/components/Button";

function CloseButton({ onClick, children = "Close", ...props }) {
  return (
    <Button onClick={onClick} {...props}>
      {children}
    </Button>
  );
}

export default CloseButton;
