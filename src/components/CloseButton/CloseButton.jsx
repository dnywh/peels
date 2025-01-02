import Button from "@/components/Button";

function CloseButton({ onClick, children = "X", ...props }) {
  return (
    <Button onClick={onClick} {...props}>
      {children}
    </Button>
  );
}

export default CloseButton;
