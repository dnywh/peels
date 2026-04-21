export function isMissingPreferredLocaleColumn(error: {
  code?: string | null;
  message?: string | null;
}) {
  return (
    error.code === "PGRST204" &&
    (error.message ?? "").toLowerCase().includes("preferred_locale")
  );
}
