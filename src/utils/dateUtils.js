// Utils to help format dates in chat threads/messages and static pages (legal pages, newsletters)

// const locale = "en-AU"
const locale = navigator.language // vary formatting according to local customs (TODO: does Next do this as it (pre)renders on the server, thus locking it in to en-US? Perhaps make client-side)

// Static page date utils
export function formatPublishDate(dateString) {
  // Formal dates, with no awarness of proximity
  // I.e. no 'yesterday' or 'today' like in chat messages
  // E.g. June 3, 2025
  return new Date(
    dateString,
  ).toLocaleDateString(
    locale,
    {
      year: "numeric",
      month: "long",
      day: "numeric",
    },
  );
}

// Chat message utils
// Return just the time
export function formatTimestamp(dateString) {
  return new Intl.DateTimeFormat(
    locale,
    {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    }).format(new Date(dateString));
}

// Return a conditional string based on the date:
// - "Today" if the date is today
// - "Yesterday" if the date is yesterday
// - "Monday" if the date is within the current week
// - "Thu, 2 Dec" if the date is more than 6 days ago
// - "Mon, 21 Feb 2024" if the date is more than 1 year ago
export function formatWeekday(dateString) {
  const date = new Date(dateString);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  // Reset hours to compare dates properly
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

  // Calculate days difference
  const diffTime = compareToday - compareDate;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  // Check if date is more than a year ago (365 days)
  if (diffDays > 365) {
    return new Intl.DateTimeFormat(locale, {
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(date);
  }

  // Today
  if (compareDate.getTime() === compareToday.getTime()) {
    return "Today";
  }

  // Yesterday
  if (compareDate.getTime() === compareYesterday.getTime()) {
    return "Yesterday";
  }

  // Within current week (less than 7 days ago)
  if (diffDays < 7) {
    return new Intl.DateTimeFormat(locale, {
      weekday: "long",
    }).format(date);
  }

  // More than 6 days ago but less than a year
  return new Intl.DateTimeFormat(locale, {
    weekday: "short",
    day: "numeric",
    month: "short",
  }).format(date);
}
