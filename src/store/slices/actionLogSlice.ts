import { createSlice, isAnyOf } from '@reduxjs/toolkit';
import { LOG_MAX_ENTRIES } from '../constants';
import { gameReset } from '../actions';
import {
  incrementStat,
  decrementStat,
  applyBuildPreset,
  resetStats,
  takeDamage,
  healHero,
  spendMana,
  clampMana,
} from './statsSlice';
import { toggleEquipItem, clearEquipment } from './inventorySlice';
import { damageBoss, nextBoss, endRun } from './bossSlice';

export interface LogEntry {
  seq: number;
  type: string;
  payload: unknown;
}

export interface ActionLogState {
  entries: LogEntry[];
  nextSeq: number;
}

const initialState: ActionLogState = {
  entries: [],
  nextSeq: 1,
};

// Acciones que el Inspector debe mostrar. regenMana queda fuera a propósito:
// llega cada segundo desde el reloj y taparía las acciones del jugador.
const isLoggableAction = isAnyOf(
  incrementStat,
  decrementStat,
  applyBuildPreset,
  resetStats,
  takeDamage,
  healHero,
  spendMana,
  clampMana,
  toggleEquipItem,
  clearEquipment,
  damageBoss,
  nextBoss,
  endRun,
  gameReset,
);

const actionLogSlice = createSlice({
  name: 'actionLog',
  initialState,
  reducers: {
    clearLog(state) {
      state.entries = [];
    },
  },
  extraReducers: (builder) => {
    // addMatcher: este slice "escucha" acciones de OTROS slices sin que
    // los componentes tengan que despachar un registro aparte.
    builder.addMatcher(isLoggableAction, (state, action) => {
      const payload = 'payload' in action ? action.payload : undefined;
      state.entries.unshift({ seq: state.nextSeq, type: action.type, payload });
      state.entries = state.entries.slice(0, LOG_MAX_ENTRIES);
      state.nextSeq += 1;
    });
  },
});

export const { clearLog } = actionLogSlice.actions;

export default actionLogSlice.reducer;
