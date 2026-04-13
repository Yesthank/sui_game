import type { ItemChain } from '../types';

export const ITEM_CHAINS: ItemChain[] = [
  {
    chainId: 'tomato',
    category: 'vegetable',
    levels: [
      { level: 1, name: '토마토 씨앗', emoji: '🌱' },
      { level: 2, name: '풋토마토', emoji: '🟢' },
      { level: 3, name: '빨간 토마토', emoji: '🍅' },
      { level: 4, name: '완숙 토마토', emoji: '🍅' },
      { level: 5, name: '전설의 토마토', emoji: '✨🍅' },
    ],
  },
  {
    chainId: 'bread',
    category: 'bakery',
    levels: [
      { level: 1, name: '밀가루 반죽', emoji: '🫓' },
      { level: 2, name: '발효 반죽', emoji: '🧆' },
      { level: 3, name: '구운 빵', emoji: '🍞' },
      { level: 4, name: '크루아상', emoji: '🥐' },
      { level: 5, name: '전설의 바게트', emoji: '✨🥖' },
    ],
  },
  {
    chainId: 'meat',
    category: 'protein',
    levels: [
      { level: 1, name: '날고기 조각', emoji: '🥩' },
      { level: 2, name: '양념 고기', emoji: '🍖' },
      { level: 3, name: '구운 스테이크', emoji: '🥩' },
      { level: 4, name: '숙성 스테이크', emoji: '🥩' },
      { level: 5, name: '미쉐린 스테이크', emoji: '✨🥩' },
    ],
  },
  {
    chainId: 'egg',
    category: 'dairy',
    levels: [
      { level: 1, name: '달걀', emoji: '🥚' },
      { level: 2, name: '반숙 달걀', emoji: '🍳' },
      { level: 3, name: '오믈렛', emoji: '🍳' },
      { level: 4, name: '전설의 오믈렛', emoji: '✨🍳' },
    ],
  },
  {
    chainId: 'fruit',
    category: 'fruit',
    levels: [
      { level: 1, name: '씨앗', emoji: '🫘' },
      { level: 2, name: '새싹', emoji: '🌿' },
      { level: 3, name: '딸기', emoji: '🍓' },
      { level: 4, name: '전설의 딸기', emoji: '✨🍓' },
    ],
  },
  {
    chainId: 'drink',
    category: 'beverage',
    levels: [
      { level: 1, name: '빈 컵', emoji: '🥤' },
      { level: 2, name: '물', emoji: '💧' },
      { level: 3, name: '커피', emoji: '☕' },
      { level: 4, name: '전설의 라떼', emoji: '✨☕' },
    ],
  },
];

export function getChain(chainId: string): ItemChain | undefined {
  return ITEM_CHAINS.find((c) => c.chainId === chainId);
}

export function getMaxLevel(chainId: string): number {
  const chain = getChain(chainId);
  return chain ? chain.levels.length : 1;
}

export function getEmoji(chainId: string, level: number): string {
  const chain = getChain(chainId);
  if (!chain) return '❓';
  const entry = chain.levels.find((l) => l.level === level);
  return entry ? entry.emoji : '❓';
}
