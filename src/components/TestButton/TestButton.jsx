import { styled } from "@pigment-css/react";

const TestButton = styled("button")({
  border: "none",
  padding: "0.75rem",
  // ...other base styles
  variants: [
    {
      props: { variant: "contained", color: "primary" },
      style: { backgroundColor: "tomato", color: "white" },
    },
  ],
});

// `backgroundColor: 'tomato', color: 'white'`
export default TestButton;
