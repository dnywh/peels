const DEFAULT_LOCALE = "en-AU";

function getLocale() {
  if (typeof navigator !== "undefined" && navigator.language) {
    return navigator.language;
  }

  return DEFAULT_LOCALE;
}

function toDate(dateValue: string | Date) {
  return dateValue instanceof Date ? dateValue : new Date(dateValue);
}

export function formatPublishDate(dateValue: string | Date) {
  return toDate(dateValue).toLocaleDateString(getLocale(), {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function formatTimestamp(dateValue: string | Date) {
  return new Intl.DateTimeFormat(getLocale(), {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }).format(toDate(dateValue));
}

export function formatWeekday(dateValue: string | Date) {
  const date = toDate(dateValue);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  const compareDate = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate()
  );
  const compareToday = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate()
  );
  const compareYesterday = new Date(
    yesterday.getFullYear(),
    yesterday.getMonth(),
    yesterday.getDate()
  );

  const diffTime = compareToday.getTime() - compareDate.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  const locale = getLocale();

  if (diffDays > 365) {
    return new Intl.DateTimeFormat(locale, {
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(date);
  }

  if (compareDate.getTime() === compareToday.getTime()) {
    return "Today";
  }

  if (compareDate.getTime() === compareYesterday.getTime()) {
    return "Yesterday";
  }

  if (diffDays < 7) {
    return new Intl.DateTimeFormat(locale, {
      weekday: "long",
    }).format(date);
  }

  return new Intl.DateTimeFormat(locale, {
    weekday: "short",
    day: "numeric",
    month: "short",
  }).format(date);
}
