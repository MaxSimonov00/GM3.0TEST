export enum HeroArchetype {
  ATTACKER = 'ATTACKER',
  TANK = 'TANK',
  DEFENDER = 'DEFENDER',
  SPEEDSTER = 'SPEEDSTER'
}

export type GameView = 'MENU' | 'TEAM_SELECT' | 'BATTLE' | 'SETTINGS';

export interface Stats {
  hp: number;
  maxHp: number;
  attack: number;
  defense: number;
  speed: number;
}

export interface Unit {
  id: string;
  name: string;
  isPlayer: boolean; // true = Player, false = Enemy
  archetype: HeroArchetype;
  stats: Stats;
  actionGauge: number; // 0 to 10000. When >= 10000, it's turn.
  isDead: boolean;
}

export interface BattleLog {
  id: string;
  message: string;
  type: 'info' | 'damage' | 'turn' | 'death';
}

export interface TurnSnapshot {
  unitId: string;
  isPlayer: boolean;
  ticksUntilTurn: number;
}