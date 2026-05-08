export function serializeJsonLd(data: unknown) {
  let json = "null";

  try {
    json = JSON.stringify(data ?? null) ?? "null";
  } catch {
    json = "null";
  }

  return json.replace(/</g, "\\u003c");
}
