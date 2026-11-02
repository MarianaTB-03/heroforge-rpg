import { createAction } from '@reduxjs/toolkit';

// Acción global: no pertenece a ningún slice. Varios slices la escuchan
// en sus extraReducers, así UNA sola acción reinicia todo el juego.
export const gameReset = createAction('game/reset');
