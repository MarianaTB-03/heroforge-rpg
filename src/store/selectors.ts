import { createSelector } from '@reduxjs/toolkit';
import type { RootState } from './index';
import {
  ATTACK_MANA_COST,
  BASE_CARRY_CAPACITY,
  BASE_STAT,
  BASE_MANA,
  BOSS_BASE_DAMAGE,
  BOSS_DAMAGE_PER_LEVEL,
  BOSS_DAMAGE_VARIANCE,
  BOSS_HP_PER_LEVEL,
  CARRY_PER_STR,
  DEFENSE_REDUCTION_PER_POINT,
  MANA_PER_INT,
  MAX_DEFENSE_REDUCTION,
  MANA_REGEN_BASE_INTERVAL_MS,
  MANA_REGEN_MIN_INTERVAL_MS,
  MANA_REGEN_MS_PER_AGI,
  MAX_HP,
  OVERLOAD_POWER_PENALTY,
  WEAK_ATTACK_MULTIPLIER,
} from './constants';

// REGLA DE ORO: nada de lo que se calcula aquí se guarda en un slice.
// Los selectores leen el estado mínimo y derivan todo lo demás.
// createSelector memoriza el resultado: solo recalcula si cambian sus entradas.

// ---------- Selectores base (leen un slice) ----------
export const selectStats = (state: RootState) => state.stats;
export const selectCatalog = (state: RootState) => state.inventory.catalog;
export const selectEquippedIds = (state: RootState) => state.inventory.equippedIds;
export const selectBoss = (state: RootState) => state.boss;
export const selectLogEntries = (state: RootState) => state.actionLog.entries;

// ---------- Inventario ----------
export const selectEquippedItems = createSelector(
  [selectCatalog, selectEquippedIds],
  (catalog, equippedIds) => catalog.filter((item) => equippedIds.includes(item.id)),
);

export const selectEquippedWeapon = createSelector(
  [selectEquippedItems],
  (items) => items.find((item) => item.category === 'weapon') ?? null,
);

// ---------- Estadísticas totales (cruza stats + inventory) ----------
export const selectTotalStats = createSelector(
  [selectStats, selectEquippedItems],
  (stats, items) => {
    const sum = (key: 'bonusStr' | 'bonusAgi' | 'bonusInt' | 'bonusDef') =>
      items.reduce((acc, item) => acc + item[key], 0);
    return {
      str: Math.max(0, stats.str + sum('bonusStr')),
      agi: Math.max(0, stats.agi + sum('bonusAgi')),
      int: Math.max(0, stats.int + sum('bonusInt')),
      def: sum('bonusDef'),
    };
  },
);

export const selectTotalDefense = createSelector([selectTotalStats], (t) => t.def);

// ---------- Peso y sobrecarga ----------
export const selectTotalWeight = createSelector([selectEquippedItems], (items) =>
  items.reduce((acc, item) => acc + item.weight, 0),
);

export const selectMaxCarryCapacity = createSelector(
  [selectTotalStats],
  (t) => BASE_CARRY_CAPACITY + t.str * CARRY_PER_STR,
);

export const selectIsOverencumbered = createSelector(
  [selectTotalWeight, selectMaxCarryCapacity],
  (weight, capacity) => weight > capacity,
);

// Nivel de la barra de peso: verde < 70%, amarillo hasta 100%, rojo si se pasa.
export const selectWeightStatus = createSelector(
  [selectTotalWeight, selectMaxCarryCapacity],
  (weight, capacity) => {
    const ratio = capacity > 0 ? weight / capacity : 1;
    const level: 'ok' | 'warning' | 'overloaded' =
      weight > capacity ? 'overloaded' : ratio >= 0.7 ? 'warning' : 'ok';
    return { weight, capacity, ratio, level };
  },
);

// ---------- Vida y maná ----------
export const selectHeroHp = createSelector([selectStats], (s) => ({
  current: s.currentHp,
  max: MAX_HP,
  ratio: s.currentHp / MAX_HP,
}));

export const selectIsHeroDefeated = (state: RootState) => state.stats.currentHp <= 0;

export const selectMaxMana = createSelector(
  [selectTotalStats],
  (t) => BASE_MANA + t.int * MANA_PER_INT,
);

// El maná guardado puede quedar por encima del máximo si se quita un ítem
// de INT; para mostrarlo y usarlo, siempre se toma el menor de los dos.
export const selectCurrentMana = createSelector(
  [selectStats, selectMaxMana],
  (s, max) => Math.min(s.currentMana, max),
);

// Cada cuánto se recupera +1 de maná: más Agilidad total, menos espera.
export const selectManaRegenIntervalMs = createSelector([selectTotalStats], (t) => {
  const ms = MANA_REGEN_BASE_INTERVAL_MS - (t.agi - BASE_STAT) * MANA_REGEN_MS_PER_AGI;
  return Math.min(MANA_REGEN_BASE_INTERVAL_MS, Math.max(MANA_REGEN_MIN_INTERVAL_MS, ms));
});

export const selectHealAmount = createSelector(
  [selectCurrentMana, selectStats],
  (mana, s) => Math.min(mana, MAX_HP - s.currentHp),
);

// ---------- Combate ----------
export const selectCombatPower = createSelector(
  [selectTotalStats, selectIsOverencumbered],
  (t, isOverloaded) => {
    const rawPower = t.str * 3 + t.agi * 2 + t.int * 3;
    return isOverloaded ? Math.round(rawPower * (1 - OVERLOAD_POWER_PENALTY)) : rawPower;
  },
);

// Vista previa del próximo ataque para el botón: la UI no hace cálculos.
export const selectAttackPreview = createSelector(
  [selectCombatPower, selectCurrentMana],
  (power, mana) => {
    const hasMana = mana >= ATTACK_MANA_COST;
    return {
      hasMana,
      manaCost: ATTACK_MANA_COST,
      damage: hasMana ? power : Math.round(power * WEAK_ATTACK_MULTIPLIER),
    };
  },
);

export const selectDamageReduction = createSelector([selectTotalDefense], (def) =>
  Math.min(def * DEFENSE_REDUCTION_PER_POINT, MAX_DEFENSE_REDUCTION),
);

// ---------- Boss ----------
const BOSS_ROSTER = [
  { name: 'Gólem de Piedra', icon: '🗿' },
  { name: 'Lobo Espectral', icon: '🐺' },
  { name: 'Dragón Carmesí', icon: '🐉' },
  { name: 'Liche Eterno', icon: '☠️' },
  { name: 'Kraken Abisal', icon: '🦑' },
];

export const selectBossInfo = createSelector([selectBoss], (boss) => {
  const profile = BOSS_ROSTER[(boss.level - 1) % BOSS_ROSTER.length];
  const maxHp = boss.level * BOSS_HP_PER_LEVEL;
  const baseDamage = BOSS_BASE_DAMAGE + boss.level * BOSS_DAMAGE_PER_LEVEL;
  return {
    ...profile,
    level: boss.level,
    currentHp: boss.currentHp,
    maxHp,
    hpRatio: boss.currentHp / maxHp,
    baseDamage,
    minDamage: Math.round(baseDamage * (1 - BOSS_DAMAGE_VARIANCE)),
    maxDamage: Math.round(baseDamage * (1 + BOSS_DAMAGE_VARIANCE)),
    isDefeated: boss.currentHp <= 0,
    runEnded: boss.runEnded,
    // Jefes vencidos: los niveles anteriores + el actual si ya cayó.
    bossesDefeated: boss.currentHp <= 0 ? boss.level : boss.level - 1,
  };
});

export const selectCanHeal = createSelector(
  [selectIsHeroDefeated, selectBoss, selectHealAmount],
  (heroDefeated, boss, healAmount) => !heroDefeated && !boss.runEnded && healAmount > 0,
);

export const selectCanAttack = createSelector(
  [selectIsHeroDefeated, selectBossInfo],
  (heroDefeated, boss) => !heroDefeated && !boss.isDefeated && !boss.runEnded,
);

// ---------- Apariencia del héroe ----------
// Fuentes de la guía:
//  - Zona A: la etiqueta cambia entre "Aldeano", "Guerrero Berserker",
//    "Archimago" y "Tanque Pesado" según la combinación de stats e ítems.
//  - Sección 3.2: devuelve la clase y el emoji/sprite según la stat dominante.
//  - Código base (sección 4): umbral de 15, colores de aura y la clase de
//    Agilidad ("Asesino Sombrío"), que la tabla de la Zona A no define.
export type HeroClassId = 'VILLAGER' | 'BERSERKER' | 'ARCHMAGE' | 'ASSASSIN' | 'TANK';

export const CLASS_THRESHOLD = 15;

const HERO_CLASSES: Record<
  HeroClassId,
  { label: string; sprite: string; icon: string; auraColor: string }
> = {
  VILLAGER: { label: 'Aldeano', sprite: '🧑', icon: '🌾', auraColor: '#94a3b8' },
  BERSERKER: { label: 'Guerrero Berserker', sprite: '🧔', icon: '🪓', auraColor: '#ef4444' },
  ARCHMAGE: { label: 'Archimago', sprite: '🧙', icon: '🔮', auraColor: '#3b82f6' },
  ASSASSIN: { label: 'Asesino Sombrío', sprite: '🥷', icon: '🌙', auraColor: '#10b981' },
  TANK: { label: 'Tanque Pesado', sprite: '🏋️', icon: '🏰', auraColor: '#f59e0b' },
};

export const selectHeroVisualClass = createSelector([selectTotalStats], (t) => {
  const dominant = Math.max(t.str, t.agi, t.int);
  let id: HeroClassId = 'VILLAGER';

  // 1) Combinación de ítems: la defensa solo viene del equipo.
  if (t.def >= CLASS_THRESHOLD) id = 'TANK';
  // 2) Estadística dominante (stats base + bonos de ítems).
  else if (dominant >= CLASS_THRESHOLD && t.str === dominant) id = 'BERSERKER';
  else if (dominant >= CLASS_THRESHOLD && t.int === dominant) id = 'ARCHMAGE';
  else if (dominant >= CLASS_THRESHOLD && t.agi === dominant) id = 'ASSASSIN';

  return { id, ...HERO_CLASSES[id] };
});

// Expresión del avatar según el porcentaje de vida.
export const selectHeroCondition = createSelector([selectHeroHp], (hp) => {
  if (hp.current <= 0) return { id: 'defeated', face: '💀', label: 'Derrotado' } as const;
  if (hp.ratio <= 0.25) return { id: 'critical', face: '😵', label: 'Crítico' } as const;
  if (hp.ratio <= 0.6) return { id: 'wounded', face: '😣', label: 'Herido' } as const;
  return { id: 'healthy', face: '😎', label: 'Sano' } as const;
});
