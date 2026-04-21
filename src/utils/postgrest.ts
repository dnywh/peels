type PostgrestLikeError = {
  code?: string | null;
  message?: string | null;
};

export function isMissingPostgrestColumn(
  error: PostgrestLikeError,
  columnName: string
) {
  return (
    error.code === "PGRST204" &&
    new RegExp(columnName, "i").test(error.message ?? "")
  );
}

export function isMissingPreferredLocaleColumn(error: PostgrestLikeError) {
  return isMissingPostgrestColumn(error, "preferred_locale");
}
