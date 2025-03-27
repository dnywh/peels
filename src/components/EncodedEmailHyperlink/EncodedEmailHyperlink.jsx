"use client";
import { useState, useEffect } from "react";
import Hyperlink from "@/components/Hyperlink";

export default function EncodedEmailHyperlink({ address, children }) {
  const [decodedEmail, setDecodedEmail] = useState("");

  useEffect(() => {
    const decoded = atob(address);
    setDecodedEmail(decoded);
  }, []);

  return (
    <Hyperlink as="anchor" href={`mailto:${decodedEmail}`}>
      {children}
    </Hyperlink>
  );
}
