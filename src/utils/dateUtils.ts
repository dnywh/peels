const DEFAULT_LOCALE = "en";
export const CHAT_RENDER_TIME_ZONE = "UTC";

type DateFormatOptions = {
  locale?: string;
  timeZone?: string;
  now?: string | Date;
};

function toDate(dateValue: string | Date) {
  return dateValue instanceof Date ? dateValue : new Date(dateValue);
}

function getResolvedOptions({
  locale = DEFAULT_LOCALE,
  timeZone = CHAT_RENDER_TIME_ZONE,
}: DateFormatOptions = {}) {
  return { locale, timeZone };
}

function getDatePart(
  dateValue: string | Date,
  part: "year" | "month" | "day",
  { timeZone = CHAT_RENDER_TIME_ZONE }: Pick<DateFormatOptions, "timeZone"> = {}
) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  })
    .formatToParts(toDate(dateValue))
    .find((datePart) => datePart.type === part)?.value;
}

export function getChatDateKey(
  dateValue: string | Date,
  options?: Pick<DateFormatOptions, "timeZone">
) {
  const year = getDatePart(dateValue, "year", options);
  const month = getDatePart(dateValue, "month", options);
  const day = getDatePart(dateValue, "day", options);

  return `${year}-${month}-${day}`;
}

export function formatPublishDate(
  dateValue: string | Date,
  options?: DateFormatOptions
) {
  const { locale, timeZone } = getResolvedOptions(options);

  return new Intl.DateTimeFormat(locale, {
    timeZone,
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(toDate(dateValue));
}

export function formatTimestamp(
  dateValue: string | Date,
  options?: DateFormatOptions
) {
  const { locale, timeZone } = getResolvedOptions(options);

  return new Intl.DateTimeFormat(locale, {
    timeZone,
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }).format(toDate(dateValue));
}

export function formatWeekday(
  dateValue: string | Date,
  options?: DateFormatOptions
) {
  const { locale, timeZone } = getResolvedOptions(options);
  const referenceDate = toDate(options?.now ?? dateValue);
  const shouldIncludeYear =
    getDatePart(dateValue, "year", { timeZone }) !==
    getDatePart(referenceDate, "year", { timeZone });

  return new Intl.DateTimeFormat(locale, {
    timeZone,
    weekday: "short",
    day: "numeric",
    month: "short",
    ...(shouldIncludeYear ? { year: "numeric" } : {}),
  }).format(toDate(dateValue));
}
