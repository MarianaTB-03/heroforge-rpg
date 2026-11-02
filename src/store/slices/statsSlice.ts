import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { BuildPreset, StatKey } from '../types';
import { gameReset } from '../actions';
import {
  BASE_MANA,
  BASE_STAT,
  INITIAL_POINTS,
  MANA_PER_INT,
  MAX_HP,
  MIN_STAT,
} from '../constants';

export interface StatsState {
  availablePoints: number;
  str: number;
  agi: number;
  int: number;
  currentHp: number;
  // El maná ACTUAL sí se guarda: es un recurso que se gasta y no se puede
  // calcular. El maná MÁXIMO, en cambio, es derivado (ver selectors.ts).
  currentMana: number;
}

const initialState: StatsState = {
  availablePoints: INITIAL_POINTS,
  str: BASE_STAT,
  agi: BASE_STAT,
  int: BASE_STAT,
  currentHp: MAX_HP,
  currentMana: BASE_MANA + BASE_STAT * MANA_PER_INT,
};

// Cada preset reparte los mismos 30 puntos (5+5+5 base + 15 disponibles).
const PRESETS: Record<BuildPreset, Pick<StatsState, StatKey>> = {
  WARRIOR: { str: 15, agi: 8, int: 7 },
  MAGE: { str: 7, agi: 8, int: 15 },
  ROGUE: { str: 7, agi: 15, int: 8 },
};

const statsSlice = createSlice({
  name: 'stats',
  initialState,
  reducers: {
    // Gracias a Immer escribimos código que "parece" mutar el estado,
    // pero RTK genera un objeto nuevo e inmutable por debajo.
    incrementStat(state, action: PayloadAction<StatKey>) {
      if (state.availablePoints <= 0) return;
      state.availablePoints -= 1;
      state[action.payload] += 1;
    },

    decrementStat(state, action: PayloadAction<StatKey>) {
      if (state[action.payload] <= MIN_STAT) return;
      state[action.payload] -= 1;
      state.availablePoints += 1;
    },

    applyBuildPreset(state, action: PayloadAction<BuildPreset>) {
      const preset = PRESETS[action.payload];
      state.str = preset.str;
      state.agi = preset.agi;
      state.int = preset.int;
      state.availablePoints = 0;
    },

    // "Poción de Reseteo": devuelve los atributos a su base (no cura).
    resetStats(state) {
      state.availablePoints = initialState.availablePoints;
      state.str = initialState.str;
      state.agi = initialState.agi;
      state.int = initialState.int;
    },

    takeDamage(state, action: PayloadAction<number>) {
      state.currentHp = Math.max(0, state.currentHp - action.payload);
    },

    // Cura tanto HP como maná tenga el héroe y gasta todo ese maná.
    healHero(state) {
      if (state.currentHp <= 0 || state.currentMana <= 0) return;
      state.currentHp = Math.min(MAX_HP, state.currentHp + state.currentMana);
      state.currentMana = 0;
    },

    spendMana(state, action: PayloadAction<number>) {
      state.currentMana = Math.max(0, state.currentMana - action.payload);
    },

    // El máximo es derivado, así que llega calculado dentro del payload.
    regenMana(state, action: PayloadAction<{ amount: number; max: number }>) {
      const { amount, max } = action.payload;
      state.currentMana = Math.min(max, state.currentMana + amount);
    },

    // Si el máximo bajó (p. ej. al quitar el Báculo), recorta el maná actual.
    clampMana(state, action: PayloadAction<number>) {
      state.currentMana = Math.min(state.currentMana, action.payload);
    },
  },
  extraReducers: (builder) => {
    builder.addCase(gameReset, () => initialState);
  },
});

export const {
  incrementStat,
  decrementStat,
  applyBuildPreset,
  resetStats,
  takeDamage,
  healHero,
  spendMana,
  regenMana,
  clampMana,
} = statsSlice.actions;

export default statsSlice.reducer;
