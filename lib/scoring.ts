const RARE_PLUS_FIVE = new Set(['q', 'z', 'x', 'j']);
const RARE_PLUS_THREE = new Set(['k', 'v', 'y']);

export function scoreWordBase(word: string): number {
  return word.length * 2;
}

export function scoreRareLetters(word: string): number {
  let extra = 0;
  for (const ch of word) {
    if (RARE_PLUS_FIVE.has(ch)) extra += 5;
    else if (RARE_PLUS_THREE.has(ch)) extra += 3;
  }
  return extra;
}

export function scoreStreakBonus(validWordsCount: number): number {
  if (validWordsCount > 0 && validWordsCount % 5 === 0) return 10;
  return 0;
}

export function scoreSuddenMechanicExtras(word: string, suddenActive: boolean): number {
  if (!suddenActive) return 0;
  let extra = 0;
  for (const ch of word) {
    if (RARE_PLUS_FIVE.has(ch)) extra += 5; // doubled handled by caller via multiplier
    else if (RARE_PLUS_THREE.has(ch)) extra += 3; // doubled handled by caller via multiplier
  }
  const longBonus = Math.max(0, word.length - 8);
  return extra + longBonus;
}

export function totalScoreForWord(opts: {
  word: string;
  validWordsCountBefore: number;
  suddenActive?: boolean;
}): number {
  const { word, validWordsCountBefore, suddenActive = false } = opts;
  const base = scoreWordBase(word);
  const rare = scoreRareLetters(word);
  const streak = scoreStreakBonus(validWordsCountBefore + 1);
  const sudden = scoreSuddenMechanicExtras(word, suddenActive);
  const suddenMultiplier = suddenActive ? 2 : 1; // doubles rare letters only; model by doubling rare part
  return base + rare * suddenMultiplier + sudden - (suddenActive ? rare : 0);
}

