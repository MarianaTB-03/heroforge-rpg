// Reglas de balance del juego. Son constantes (no estado): nunca cambian
// durante la partida, por eso no viven dentro de ningún slice.

export const MAX_HP = 100;
export const INITIAL_POINTS = 15;
export const BASE_STAT = 5;
export const MIN_STAT = 1;

// Carga: capacidad = 10 + (Fuerza total * 2)
export const BASE_CARRY_CAPACITY = 10;
export const CARRY_PER_STR = 2;
export const OVERLOAD_POWER_PENALTY = 0.3; // -30% de poder

// Maná: máximo = 20 + (Inteligencia total * 5)
export const BASE_MANA = 20;
export const MANA_PER_INT = 5;
export const ATTACK_MANA_COST = 10;
export const WEAK_ATTACK_MULTIPLIER = 0.5; // sin maná: ataque al 50%
// Regeneración con el paso del tiempo: +1 de maná cada cierto intervalo.
// Con AGI 5 el intervalo es 5 s; cada punto de AGI extra resta 0,25 s,
// hasta un mínimo de 1 s (se alcanza con AGI 21).
export const MANA_REGEN_PER_TICK = 1;
export const MANA_REGEN_BASE_INTERVAL_MS = 5000;
export const MANA_REGEN_MIN_INTERVAL_MS = 1000;
export const MANA_REGEN_MS_PER_AGI = 250;

// Defensa: 2% menos de daño por punto, con tope del 60%
export const DEFENSE_REDUCTION_PER_POINT = 2;
export const MAX_DEFENSE_REDUCTION = 60;

// Boss: vida = 100 * nivel ; daño base = 8 + (nivel * 4) con variación ±25%
export const BOSS_HP_PER_LEVEL = 100;
export const BOSS_BASE_DAMAGE = 8;
export const BOSS_DAMAGE_PER_LEVEL = 4;
export const BOSS_DAMAGE_VARIANCE = 0.25;

// Pausa para que se vea el avatar derrotado antes del reset automático
export const DEFEAT_RESET_DELAY_MS = 2500;

export const LOG_MAX_ENTRIES = 5;
