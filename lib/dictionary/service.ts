import { WORD_SET, WORDS } from './wordlist';
import { isLowercaseLettersOnly, isMinLength, lastLetter, pluralGuard } from './rules';

export type ValidateOk = { ok: true };
export type ValidateErr = { ok: false; reason: 'non_lowercase' | 'non_letters' | 'too_short' | 'duplicate' | 'not_in_dictionary' | 'wrong_start_letter' | 'plural_guard' | 'banned_letter' };
export type ValidateResult = ValidateOk | ValidateErr;

export function hasWord(word: string): boolean {
  return WORD_SET.has(word);
}

export function pickSeedWord(): string {
  // simple deterministic-ish pick from list; later use better seed logic
  return WORDS[0];
}

export function validateWord(params: {
  word: string;
  expectedStart?: string; // required for chaining checks
  usedWords: Set<string>;
  bannedLetter?: string;
}): ValidateResult {
  const { word, expectedStart, usedWords, bannedLetter } = params;

  if (word !== word.toLowerCase()) return { ok: false, reason: 'non_lowercase' };
  if (!isLowercaseLettersOnly(word)) return { ok: false, reason: 'non_letters' };
  if (!isMinLength(word)) return { ok: false, reason: 'too_short' };
  if (bannedLetter && word.includes(bannedLetter)) return { ok: false, reason: 'banned_letter' };
  if (expectedStart && word[0] !== expectedStart) return { ok: false, reason: 'wrong_start_letter' };
  if (usedWords.has(word)) return { ok: false, reason: 'duplicate' };
  if (!hasWord(word)) return { ok: false, reason: 'not_in_dictionary' };
  if (!pluralGuard(word, (s) => hasWord(s))) return { ok: false, reason: 'plural_guard' };
  return { ok: true };
}

export { lastLetter };

