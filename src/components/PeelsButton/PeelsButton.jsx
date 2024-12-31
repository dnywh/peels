"use client";
import { styled } from "@pigment-css/react";
// import { css } from "@pigment-css/react";

const FooButton = styled("button")({
  backgroundColor: "red",
  color: "white",
});

function PeelsButton({ children }) {
  // return <button className={test}>{children}</button>;
  return <FooButton>{children}</FooButton>;
}

export default PeelsButton;

// const test = css`
//   background-color: green;
//   color: white;
// `;
