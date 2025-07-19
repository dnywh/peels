"use client";
import { useState, useEffect } from "react";

function DecodedSpan({ children }) {
  const [decodedEmail, setDecodedEmail] = useState("");

  useEffect(() => {
    const decoded = atob(children);
    setDecodedEmail(decoded);
  }, []);

  return <span>{decodedEmail}</span>;
}

export default DecodedSpan;
