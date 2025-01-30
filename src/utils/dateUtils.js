export function formatTimestamp(dateString) {
    return new Intl.DateTimeFormat('en-GB', {
        hour: '2-digit',
        minute: '2-digit',
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
    return new Intl.DateTimeFormat('en-GB', {
        weekday: 'long',
    }).format(new Date(dateString));
}
