import { Unit, TurnSnapshot, HeroArchetype } from '../types';
import { ACTION_GOAL, ARCHETYPE_STATS, NAMES_PLAYER, NAMES_ENEMY } from '../constants';

export const generateUnit = (id: string, isPlayer: boolean, archetype?: HeroArchetype): Unit => {
  const archetypes = Object.values(HeroArchetype);
  const randomType = archetype || archetypes[Math.floor(Math.random() * archetypes.length)];
  const baseStats = ARCHETYPE_STATS[randomType];
  
  // Add slight variance to stats (±10%) so not all clones are identical
  const variance = () => 0.9 + Math.random() * 0.2;
  
  const stats = {
    hp: Math.floor(baseStats.hp * variance()),
    maxHp: 0, // set below
    attack: Math.floor(baseStats.attack * variance()),
    defense: Math.floor(baseStats.defense * variance()),
    speed: Math.floor(baseStats.speed * variance()),
  };
  stats.maxHp = stats.hp;

  const nameList = isPlayer ? NAMES_PLAYER : NAMES_ENEMY;
  
  const typeNameMap: Record<HeroArchetype, string> = {
    [HeroArchetype.ATTACKER]: 'АТК',
    [HeroArchetype.TANK]: 'ТАНК',
    [HeroArchetype.DEFENDER]: 'ЗАЩ',
    [HeroArchetype.SPEEDSTER]: 'СКОР'
  };

  const name = `${nameList[Math.floor(Math.random() * nameList.length)]} (${typeNameMap[randomType]})`;

  return {
    id,
    name,
    isPlayer,
    archetype: randomType,
    stats,
    actionGauge: Math.floor(Math.random() * 3000), // Start with 0-30% turn bar
    isDead: false,
  };
};

export const generateRoster = (count: number): Unit[] => {
  const roster: Unit[] = [];
  for (let i = 0; i < count; i++) {
    roster.push(generateUnit(`roster-${i}-${Math.random()}`, true));
  }
  return roster;
};

// Damage Formula: Max(1, Attack - Defense)
export const calculateDamage = (attacker: Unit, defender: Unit): number => {
  const rawDamage = attacker.stats.attack - defender.stats.defense;
  return Math.max(1, Math.floor(rawDamage));
};

// Predict future turns based on speed
// Uses a "Tick" system. ticks_needed = (GOAL - current_gauge) / speed
export const simulateTurnOrder = (units: Unit[], lookahead: number = 10): TurnSnapshot[] => {
  const timeline: TurnSnapshot[] = [];
  
  // Deep copy units to simulate state without modifying real game
  const simUnits = units.map(u => ({ 
    ...u, 
    simGauge: u.actionGauge, 
    simId: u.id,
    isDead: u.isDead 
  })).filter(u => !u.isDead);

  if (simUnits.length === 0) return [];

  let simulationSteps = 0;

  while (timeline.length < lookahead && simulationSteps < 100) {
    // Find unit requiring least ticks to act
    let minTicks = Infinity;
    
    simUnits.forEach(u => {
      const needed = Math.max(0, ACTION_GOAL - u.simGauge);
      const ticks = needed / u.stats.speed;
      if (ticks < minTicks) minTicks = ticks;
    });

    // Advance everyone
    simUnits.forEach(u => {
      u.simGauge += minTicks * u.stats.speed;
    });

    // Find who is ready (>= 10000)
    // Sort by overflow (whoever went furthest past 10000 goes first if tie)
    const readyUnits = simUnits
      .filter(u => u.simGauge >= ACTION_GOAL - 0.01) // Epsilon for float errors
      .sort((a, b) => b.simGauge - a.simGauge);

    for (const u of readyUnits) {
        timeline.push({
            unitId: u.simId,
            isPlayer: u.isPlayer,
            ticksUntilTurn: 0 // Placeholder, purely relative order matters here
        });
        // Reset gauge for next turn in simulation
        u.simGauge -= ACTION_GOAL;
        
        if (timeline.length >= lookahead) break;
    }
    simulationSteps++;
  }

  return timeline;
};