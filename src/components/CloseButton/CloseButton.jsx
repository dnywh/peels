import Button from "@/components/Button";

function CloseButton({ onClick, children = "X" }) {
  return <Button onClick={onClick}>{children}</Button>;
}

export default CloseButton;
