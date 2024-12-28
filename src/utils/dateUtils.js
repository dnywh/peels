export function formatDate(dateString) {
    // Use Intl.DateTimeFormat to ensure consistent formatting
    return new Intl.DateTimeFormat('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
    }).format(new Date(dateString));
} 
