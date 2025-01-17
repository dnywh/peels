import { styled } from "@pigment-css/react";

const FieldHeader = styled("div")({
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",

  "h1, p": {
    textWrap: "balance",
  },
});

export default FieldHeader;
