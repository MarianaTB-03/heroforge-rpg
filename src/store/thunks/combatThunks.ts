import type { AppThunk } from '../index';
import { gameReset } from '../actions';
import { BOSS_DAMAGE_VARIANCE, DEFEAT_RESET_DELAY_MS, MANA_REGEN_PER_TICK } from '../constants';
import {
  selectAttackPreview,
  selectBossInfo,
  selectCanAttack,
  selectDamageReduction,
  selectIsHeroDefeated,
  selectMaxMana,
} from '../selectors';
import { clampMana, healHero, regenMana, spendMana, takeDamage } from '../slices/statsSlice';
import { damageBoss } from '../slices/bossSlice';

// Los reducers deben ser PUROS: mismo estado + misma acción = mismo resultado.
// Por eso el azar (Math.random) y los temporizadores viven aquí, en thunks,
// y los reducers solo reciben números ya calculados en el action.payload.

const syncManaToMax = (): AppThunk => (dispatch, getState) => {
  const state = getState();
  const max = selectMaxMana(state);
  if (state.stats.currentMana > max) dispatch(clampMana(max));
};

export const attackBoss =
  (random: () => number = Math.random): AppThunk =>
  (dispatch, getState) => {
    if (!selectCanAttack(getState())) return;

    dispatch(syncManaToMax());

    // 1) Turno del héroe: con maná ataca a plena potencia, sin maná al 50%.
    const attack = selectAttackPreview(getState());
    if (attack.hasMana) dispatch(spendMana(attack.manaCost));
    dispatch(damageBoss(attack.damage));

    // 2) Si el jefe cayó, no hay contraataque.
    if (selectBossInfo(getState()).isDefeated) return;

    // 3) Contraataque del jefe: daño base ±25%, reducido por la defensa.
    const boss = selectBossInfo(getState());
    const variance = 1 + (random() * 2 - 1) * BOSS_DAMAGE_VARIANCE;
    const reduction = selectDamageReduction(getState());
    const bossDamage = Math.max(1, Math.round(boss.baseDamage * variance * (1 - reduction / 100)));
    dispatch(takeDamage(bossDamage));

    // 4) Si el héroe cae: se ve el avatar derrotado y luego se reinicia todo.
    if (selectIsHeroDefeated(getState())) {
      setTimeout(() => dispatch(gameReset()), DEFEAT_RESET_DELAY_MS);
    }
  };

// Un "tic" del reloj del juego: lo despacha <GameClock /> cada segundo.
// No hace nada si el héroe está derrotado o si el maná ya está lleno.
export const regenManaTick = (): AppThunk => (dispatch, getState) => {
  const state = getState();
  if (selectIsHeroDefeated(state)) return;
  const max = selectMaxMana(state);
  if (state.stats.currentMana >= max) return;
  dispatch(regenMana({ amount: MANA_REGEN_PER_TICK, max }));
};

export const castHeal = (): AppThunk => (dispatch, getState) => {
  if (selectIsHeroDefeated(getState())) return;
  dispatch(syncManaToMax());
  if (getState().stats.currentMana <= 0) return;
  dispatch(healHero());
};
