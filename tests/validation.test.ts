import { describe, it, expect } from 'vitest';
import { validateWord } from '../lib/dictionary/service';

describe('validateWord', () => {
  it('rejects uppercase and non-letters', () => {
    expect(validateWord({ word: 'Test', usedWords: new Set() })).toEqual({ ok: false, reason: 'non_lowercase' });
    expect(validateWord({ word: 'te5t', usedWords: new Set() })).toEqual({ ok: false, reason: 'non_letters' });
  });

  it('rejects too short and duplicates', () => {
    expect(validateWord({ word: 'a', usedWords: new Set() })).toEqual({ ok: false, reason: 'too_short' });
    const used = new Set(['apple']);
    expect(validateWord({ word: 'apple', usedWords: used })).toEqual({ ok: false, reason: 'duplicate' });
  });

  it('checks start letter and plural guard', () => {
    expect(validateWord({ word: 'ear', expectedStart: 'z', usedWords: new Set() })).toEqual({ ok: false, reason: 'wrong_start_letter' });
    expect(validateWord({ word: 'classes', usedWords: new Set() })).toEqual({ ok: false, reason: 'plural_guard' });
  });

  it('enforces banned letter when provided', () => {
    expect(validateWord({ word: 'apple', usedWords: new Set(), bannedLetter: 'p' })).toEqual({ ok: false, reason: 'banned_letter' });
  });
});

