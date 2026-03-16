import { describe, it, expect } from 'vitest';
import { detectAgentMention, highlightMentions } from '../src/lib/agent-mention.js';

describe('detectAgentMention', () => {
  it('detects @agent', () => {
    expect(detectAgentMention('hello @agent')).toBe(true);
  });

  it('is case-insensitive', () => {
    expect(detectAgentMention('@Agent said hello')).toBe(true);
    expect(detectAgentMention('@AGENT')).toBe(true);
  });

  it('rejects word-boundary violations', () => {
    expect(detectAgentMention('@agentbase')).toBe(false);
    expect(detectAgentMention('@agents')).toBe(false);
  });

  it('returns false when no mention', () => {
    expect(detectAgentMention('no mention here')).toBe(false);
    expect(detectAgentMention('agent without @')).toBe(false);
  });

  it('matches with trailing punctuation', () => {
    expect(detectAgentMention('hey @agent!')).toBe(true);
    expect(detectAgentMention('@agent, please')).toBe(true);
    expect(detectAgentMention('(@agent)')).toBe(true);
  });
});

describe('highlightMentions', () => {
  it('returns single segment for plain text', () => {
    const result = highlightMentions('no mentions');
    expect(result).toEqual([{ text: 'no mentions', isMention: false }]);
  });

  it('returns 3 segments for one mention in middle', () => {
    const result = highlightMentions('hello @agent world');
    expect(result).toEqual([
      { text: 'hello ', isMention: false },
      { text: '@agent', isMention: true },
      { text: ' world', isMention: false },
    ]);
  });

  it('handles mention at start', () => {
    const result = highlightMentions('@agent says hi');
    expect(result).toEqual([
      { text: '@agent', isMention: true },
      { text: ' says hi', isMention: false },
    ]);
  });

  it('handles mention at end', () => {
    const result = highlightMentions('hello @agent');
    expect(result).toEqual([
      { text: 'hello ', isMention: false },
      { text: '@agent', isMention: true },
    ]);
  });

  it('handles multiple mentions', () => {
    const result = highlightMentions('@agent and @Agent');
    expect(result).toEqual([
      { text: '@agent', isMention: true },
      { text: ' and ', isMention: false },
      { text: '@Agent', isMention: true },
    ]);
  });

  it('preserves original casing', () => {
    const result = highlightMentions('hi @Agent');
    expect(result[1].text).toBe('@Agent');
  });
});
