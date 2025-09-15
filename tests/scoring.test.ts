import { describe, it, expect } from 'vitest';
import { scoreWordBase, scoreRareLetters, scoreStreakBonus, totalScoreForWord } from '../lib/scoring';

describe('scoring', () => {
  it('base score is 2 per letter', () => {
    expect(scoreWordBase('test')).toBe(8);
  });

  it('rare letters add extra', () => {
    expect(scoreRareLetters('quiz')).toBe(5 + 5); // q and z each +5
    expect(scoreRareLetters('yak')).toBe(3 + 3); // y + k = +6
  });

  it('streak bonus every 5 words', () => {
    expect(scoreStreakBonus(4)).toBe(0);
    expect(scoreStreakBonus(5)).toBe(10);
    expect(scoreStreakBonus(10)).toBe(10);
  });

  it('total scoring combines base, rare, streak', () => {
    const total = totalScoreForWord({ word: 'test', validWordsCountBefore: 4 });
    // base 8, rare 0, streak +10 because it's the 5th word
    expect(total).toBe(18);
  });

  it('sudden mechanic doubles rare letters and adds long-word bonus', () => {
    const total = totalScoreForWord({ word: 'xylophone', validWordsCountBefore: 0, suddenActive: true });
    // base 10*2=20; rare letters x(+3), y(+3) doubled => (6+6)=12; long-word bonus (10-8)=2
    // our function models doubling by multiplier and adjustment
    expect(total).toBe(20 + 12 + 2);
  });
});

