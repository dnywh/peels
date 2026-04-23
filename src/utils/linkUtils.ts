const URL_REGEX =
  /(?:https?:\/\/)?(?:www\.)?(?![^@]*@[^@]*\.[a-z]{2,})[^\s<>]+\.[a-z]{2,}(?:\/[^\s<>]*)?/gi;
const EMAIL_REGEX = /[a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+/gi;

type MatchType = "email" | "url";

type LinkMatch = {
  type: MatchType;
  text: string;
  index: number;
  length: number;
};

export type ParsedTextPart =
  | string
  | {
      type: "link";
      href: string;
      text: string;
    };

export function prettifyLink(link: string) {
  let pretty = link.replace(/^(https?:\/\/)?(www\.)?/, "");
  pretty = pretty.split("?")[0];
  pretty = pretty.replace(/\/$/, "");
  pretty = pretty.replace(/^mailto:/, "");
  return pretty;
}

export function parseTextWithLinks(text: string): ParsedTextPart[] {
  const matches: LinkMatch[] = [];

  let match: RegExpExecArray | null;

  EMAIL_REGEX.lastIndex = 0;

  while ((match = EMAIL_REGEX.exec(text)) !== null) {
    matches.push({
      type: "email",
      text: match[0],
      index: match.index,
      length: match[0].length,
    });
  }

  URL_REGEX.lastIndex = 0;

  while ((match = URL_REGEX.exec(text)) !== null) {
    const overlapsWithEmail = matches.some(
      (existingMatch) =>
        (match!.index >= existingMatch.index &&
          match!.index < existingMatch.index + existingMatch.length) ||
        (existingMatch.index >= match!.index &&
          existingMatch.index < match![0].length + match!.index)
    );

    if (!overlapsWithEmail) {
      matches.push({
        type: "url",
        text: match[0],
        index: match.index,
        length: match[0].length,
      });
    }
  }

  matches.sort((left, right) => left.index - right.index);

  const parts: ParsedTextPart[] = [];
  let lastIndex = 0;

  matches.forEach((currentMatch) => {
    if (currentMatch.index > lastIndex) {
      parts.push(text.slice(lastIndex, currentMatch.index));
    }

    if (currentMatch.type === "url") {
      const href = currentMatch.text.startsWith("http")
        ? currentMatch.text
        : `https://${currentMatch.text}`;

      parts.push({
        type: "link",
        href,
        text: prettifyLink(currentMatch.text),
      });
    } else {
      parts.push({
        type: "link",
        href: `mailto:${currentMatch.text}`,
        text: currentMatch.text,
      });
    }

    lastIndex = currentMatch.index + currentMatch.length;
  });

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return parts;
}
