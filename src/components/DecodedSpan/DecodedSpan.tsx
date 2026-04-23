"use client";

import type { PropsWithChildren } from "react";

function DecodedSpan({ children }: PropsWithChildren<{ children: string }>) {
  return <span>{atob(children)}</span>;
}

export default DecodedSpan;
