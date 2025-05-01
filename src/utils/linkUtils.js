// More specific URL regex that excludes email addresses
const URL_REGEX = /(?:https?:\/\/)?(?:www\.)?(?![^@]*@[^@]*\.[a-z]{2,})[^\s<>]+\.[a-z]{2,}(?:\/[^\s<>]*)?/gi;
const EMAIL_REGEX = /[a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+/gi;

export function prettifyLink(link) {
    // Remove protocol and www
    let pretty = link.replace(/^(https?:\/\/)?(www\.)?/, '');
    // Remove trailing slashes
    pretty = pretty.replace(/\/$/, '');
    // Remove mailto:
    pretty = pretty.replace(/^mailto:/, '');
    return pretty;
}

export function parseTextWithLinks(text) {
    const matches = [];

    // Find emails FIRST
    let match;
    while ((match = EMAIL_REGEX.exec(text)) !== null) {
        matches.push({
            type: 'email',
            text: match[0],
            index: match.index,
            length: match[0].length
        });
    }

    // Then find URLs (that don't overlap with emails)
    URL_REGEX.lastIndex = 0;
    while ((match = URL_REGEX.exec(text)) !== null) {
        // Check if this URL overlaps with any email match
        const overlapsWithEmail = matches.some(m =>
            (match.index >= m.index && match.index < m.index + m.length) ||
            (m.index >= match.index && m.index < match.index + match[0].length)
        );

        if (!overlapsWithEmail) {
            matches.push({
                type: 'url',
                text: match[0],
                index: match.index,
                length: match[0].length
            });
        }
    }

    // Sort matches by position
    matches.sort((a, b) => a.index - b.index);

    // Build result array
    const parts = [];
    let lastIndex = 0;

    matches.forEach(match => {
        // Add text before match
        if (match.index > lastIndex) {
            parts.push(text.slice(lastIndex, match.index));
        }

        // Add the link
        if (match.type === 'url') {
            const href = match.text.startsWith('http') ? match.text : `https://${match.text}`;
            parts.push({
                type: 'link',
                href,
                text: prettifyLink(match.text)
            });
        } else { // email
            parts.push({
                type: 'link',
                href: `mailto:${match.text}`,
                text: match.text
            });
        }

        lastIndex = match.index + match.length;
    });

    // Add remaining text
    if (lastIndex < text.length) {
        parts.push(text.slice(lastIndex));
    }

    return parts;
}
