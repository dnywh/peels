"use client";
import Link from "next/link";
import Hyperlink from "@/components/Hyperlink";

import { useState, useEffect } from "react";

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
