import type { ImageSourcePropType } from 'react-native';

export const cardBack: ImageSourcePropType = require('../../assets/tarot/back.jpg');
const observatory: ImageSourcePropType = require('../../assets/tarot/observatory.jpg');
const majorArt: ImageSourcePropType[] = [
  require('../../assets/tarot/major-0.jpg'),
  require('../../assets/tarot/major-1.jpg'),
  require('../../assets/tarot/major-2.jpg'),
  require('../../assets/tarot/major-3.jpg'),
  require('../../assets/tarot/major-4.jpg'),
  require('../../assets/tarot/major-5.jpg'),
  require('../../assets/tarot/major-6.jpg'),
  require('../../assets/tarot/major-7.jpg'),
  require('../../assets/tarot/major-8.jpg'),
  require('../../assets/tarot/major-9.jpg'),
  require('../../assets/tarot/major-10.jpg'),
  require('../../assets/tarot/major-11.jpg'),
  require('../../assets/tarot/major-12.jpg'),
  require('../../assets/tarot/major-13.jpg'),
  require('../../assets/tarot/major-14.jpg'),
  require('../../assets/tarot/major-15.jpg'),
  require('../../assets/tarot/major-16.jpg'),
  require('../../assets/tarot/major-17.jpg'),
  require('../../assets/tarot/major-18.jpg'),
  require('../../assets/tarot/major-19.jpg'),
  require('../../assets/tarot/major-20.jpg'),
  require('../../assets/tarot/major-21.jpg'),
];

const suits: Record<string, ImageSourcePropType> = {
  paus: require('../../assets/tarot/wands.jpg'),
  copas: require('../../assets/tarot/cups.jpg'),
  espadas: require('../../assets/tarot/swords.jpg'),
  ouros: require('../../assets/tarot/pentacles.jpg'),
};

const dailyCards: Record<string, number> = {
  'the-magician': 1, 'the-hermit': 9, 'the-hanged-man': 12,
  temperance: 14, 'the-star': 17, 'the-sun': 19,
};

export function getCardArt(id: string) {
  const [suit, number] = id.split('-');
  const rank = Number(number);
  if (suit === 'maior') return { source: majorArt[rank] ?? observatory };
  if (Object.hasOwn(dailyCards, id)) return { source: majorArt[dailyCards[id]] ?? observatory };
  if (Object.hasOwn(suits, suit) && rank >= 1 && rank <= 14) {
    return { source: suits[suit], rank: rank <= 10 ? String(rank) : ['◆', '♞', '♕', '♔'][rank - 11] };
  }
  return { source: observatory };
}
