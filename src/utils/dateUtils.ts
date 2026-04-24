const DEFAULT_LOCALE = "en";
export const CHAT_RENDER_TIME_ZONE = "UTC";

type DateFormatOptions = {
  locale?: string;
  timeZone?: string;
  now?: string | Date;
  useRelativeDayLabels?: boolean;
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

const chatDateKeyFormatterCache = new Map<string, Intl.DateTimeFormat>();

function getChatDateKeyFormatter(timeZone = CHAT_RENDER_TIME_ZONE) {
  const cachedFormatter = chatDateKeyFormatterCache.get(timeZone);

  if (cachedFormatter) {
    return cachedFormatter;
  }

  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });

  chatDateKeyFormatterCache.set(timeZone, formatter);

  return formatter;
}

function getChatDateParts(
  dateValue: string | Date,
  { timeZone = CHAT_RENDER_TIME_ZONE }: Pick<DateFormatOptions, "timeZone"> = {}
) {
  const parts = getChatDateKeyFormatter(timeZone).formatToParts(
    toDate(dateValue)
  );

  return {
    year: parts.find((datePart) => datePart.type === "year")?.value,
    month: parts.find((datePart) => datePart.type === "month")?.value,
    day: parts.find((datePart) => datePart.type === "day")?.value,
  };
}

function subtractDaysFromDateKey(dateKey: string, days: number) {
  const [year, month, day] = dateKey.split("-").map(Number);
  const shiftedDate = new Date(Date.UTC(year, month - 1, day));
  shiftedDate.setUTCDate(shiftedDate.getUTCDate() - days);

  return getChatDateKey(shiftedDate, { timeZone: "UTC" });
}

function formatRelativeDayLabel(locale: string, value: number) {
  const relativeDayLabel = new Intl.RelativeTimeFormat(locale, {
    numeric: "auto",
  }).format(value, "day");
  const [firstCharacter = "", ...remainingCharacters] =
    Array.from(relativeDayLabel);

  return `${firstCharacter.toLocaleUpperCase(locale)}${remainingCharacters.join("")}`;
}

function getDatePart(
  dateValue: string | Date,
  part: "year" | "month" | "day",
  options: Pick<DateFormatOptions, "timeZone"> = {}
) {
  return getChatDateParts(dateValue, options)[part];
}

export function getChatDateKey(
  dateValue: string | Date,
  options?: Pick<DateFormatOptions, "timeZone">
) {
  const { year, month, day } = getChatDateParts(dateValue, options);

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
  const referenceDate = toDate(options?.now ?? new Date());
  const dateKey = getChatDateKey(dateValue, { timeZone });
  const referenceDateKey = getChatDateKey(referenceDate, { timeZone });

  if (options?.useRelativeDayLabels) {
    if (dateKey === referenceDateKey) {
      return formatRelativeDayLabel(locale, 0);
    }

    if (dateKey === subtractDaysFromDateKey(referenceDateKey, 1)) {
      return formatRelativeDayLabel(locale, -1);
    }
  }

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
