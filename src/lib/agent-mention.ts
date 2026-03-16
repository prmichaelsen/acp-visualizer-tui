const MENTION_REGEX = /@agent\b/gi;

export function detectAgentMention(text: string): boolean {
  return /@agent\b/i.test(text);
}

export interface MentionSegment {
  text: string;
  isMention: boolean;
}

export function highlightMentions(text: string): MentionSegment[] {
  const segments: MentionSegment[] = [];
  let lastIndex = 0;

  for (const match of text.matchAll(MENTION_REGEX)) {
    const start = match.index!;
    if (start > lastIndex) {
      segments.push({ text: text.slice(lastIndex, start), isMention: false });
    }
    segments.push({ text: match[0], isMention: true });
    lastIndex = start + match[0].length;
  }

  if (lastIndex < text.length) {
    segments.push({ text: text.slice(lastIndex), isMention: false });
  }

  if (segments.length === 0) {
    segments.push({ text, isMention: false });
  }

  return segments;
}
