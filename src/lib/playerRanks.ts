export interface PlayerRank {
  level: number;
  title: string;
  icon: string;
  minPoints: number;
}

export const PLAYER_RANKS: PlayerRank[] = [
  { level: 11, title: 'World Champion', icon: '🏆', minPoints: 15001 },
  { level: 10, title: 'Poker Master', icon: '👑', minPoints: 10001 },
  { level: 9, title: 'High Roller', icon: '💎', minPoints: 7501 },
  { level: 8, title: 'Pro', icon: '💰', minPoints: 5001 },
  { level: 7, title: 'Veteran', icon: '🥇', minPoints: 3501 },
  { level: 6, title: 'Shark', icon: '🦈', minPoints: 2001 },
  { level: 5, title: 'Regular', icon: '🥈', minPoints: 1001 },
  { level: 4, title: 'Grinder', icon: '⚙️', minPoints: 501 },
  { level: 3, title: 'Amateur', icon: '🥉', minPoints: 251 },
  { level: 2, title: 'Noob', icon: '🐣', minPoints: 101 },
  { level: 1, title: 'Fish', icon: '🐟', minPoints: 0 },
];

export function getPlayerRank(totalPoints: number | null | undefined): PlayerRank {
  const points = totalPoints || 0;
  // Since array is sorted highest to lowest, find the first rank they qualify for
  return PLAYER_RANKS.find((rank) => points >= rank.minPoints) || PLAYER_RANKS[PLAYER_RANKS.length - 1];
}
