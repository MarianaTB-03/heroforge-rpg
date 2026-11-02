import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { gameReset } from '../actions';
import { BOSS_HP_PER_LEVEL } from '../constants';

export interface BossState {
  level: number;
  currentHp: number;
  runEnded: boolean;
}

const initialState: BossState = {
  level: 1,
  currentHp: BOSS_HP_PER_LEVEL,
  runEnded: false,
};

const bossSlice = createSlice({
  name: 'boss',
  initialState,
  reducers: {
    damageBoss(state, action: PayloadAction<number>) {
      state.currentHp = Math.max(0, state.currentHp - action.payload);
    },

    // Tras vencer: aparece un jefe del siguiente nivel con la vida llena.
    nextBoss(state) {
      if (state.currentHp > 0) return;
      state.level += 1;
      state.currentHp = state.level * BOSS_HP_PER_LEVEL;
    },

    // Tras vencer: el jugador decide terminar la aventura aquí.
    endRun(state) {
      if (state.currentHp > 0) return;
      state.runEnded = true;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(gameReset, () => initialState);
  },
});

export const { damageBoss, nextBoss, endRun } = bossSlice.actions;

export default bossSlice.reducer;
