"use client";
import Hyperlink from "@/components/Hyperlink";

import { useState, useEffect } from "react";

export default function EncodedEmailHyperlink({ address, children }) {
  const [decodedEmail, setDecodedEmail] = useState("");

  useEffect(() => {
    const decoded = atob(address);
    setDecodedEmail(decoded);
  }, []);

  return <Hyperlink href={`mailto:${decodedEmail}`}>{children}</Hyperlink>;
}
