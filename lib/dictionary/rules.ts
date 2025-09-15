export function isLowercaseLettersOnly(word: string): boolean {
  return /^[a-z]+$/.test(word);
}

export function isMinLength(word: string, min = 2): boolean {
  return word.length >= min;
}

export function lastLetter(word: string): string {
  return word[word.length - 1] ?? '';
}

export function pluralGuard(word: string, hasSingular: (s: string) => boolean): boolean {
  if (word.endsWith('es')) {
    const singular = word.slice(0, -2);
    if (hasSingular(singular)) return false;
  }
  if (word.endsWith('s')) {
    const singular = word.slice(0, -1);
    if (hasSingular(singular)) return false;
  }
  return true;
}

