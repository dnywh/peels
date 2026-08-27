export const defaultAppOrigin = "https://www.peels.org";

export const supportedAppOrigins = [defaultAppOrigin] as const;

export function isSupportedAppOrigin(origin: string) {
  return supportedAppOrigins.includes(
    origin as (typeof supportedAppOrigins)[number]
  );
}
