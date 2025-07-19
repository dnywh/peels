"use client";

function DecodedSpan({ children }) {
  const decodedEmail = atob(children);
  return <span>{decodedEmail}</span>;
}

export default DecodedSpan;
