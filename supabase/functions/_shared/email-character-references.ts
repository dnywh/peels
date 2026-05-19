export const encodeEmailHtmlCharacterReferences = (html: string) =>
  html.replace(/[^\x00-\x7F]/gu, (character) => {
    const codePoint = character.codePointAt(0);

    return codePoint ? `&#${codePoint};` : character;
  });
