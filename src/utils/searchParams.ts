export type StaticPageSearchParams = Record<
  string,
  string | string[] | undefined
>;

export function serialiseSearchParams(searchParams?: StaticPageSearchParams) {
  const query = new URLSearchParams();

  Object.entries(searchParams ?? {}).forEach(([key, value]) => {
    if (value === undefined) return;

    if (Array.isArray(value)) {
      value.forEach((item) => query.append(key, item));
      return;
    }

    query.append(key, value);
  });

  return query.toString();
}
