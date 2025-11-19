import { HeroArchetype, Stats } from './types';

// Base stats for different classes
export const ARCHETYPE_STATS: Record<HeroArchetype, Omit<Stats, 'maxHp'>> = {
  [HeroArchetype.ATTACKER]: {
    hp: 800,
    attack: 180,
    defense: 30,
    speed: 130,
  },
  [HeroArchetype.TANK]: {
    hp: 1500,
    attack: 80,
    defense: 50,
    speed: 100,
  },
  [HeroArchetype.DEFENDER]: {
    hp: 1000,
    attack: 90,
    defense: 120,
    speed: 110,
  },
  [HeroArchetype.SPEEDSTER]: {
    hp: 700,
    attack: 110,
    defense: 20,
    speed: 220,
  },
};

export const NAMES_PLAYER = ["Арес", "Афина", "Гермес", "Геракл", "Аполлон", "Артемида"];
export const NAMES_ENEMY = ["Орк", "Гоблин", "Лич", "Голем", "Призрак", "Тролль"];

export const ACTION_GOAL = 10000; // The gauge value needed to take a turn