import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../store';
import { selectManaRegenIntervalMs } from '../store/selectors';
import { regenManaTick } from '../store/thunks/combatThunks';

// Reloj del juego: no dibuja nada. El paso del tiempo es un efecto
// secundario, así que vive aquí (useEffect) y no dentro de un reducer.
// El intervalo sale de un selector derivado de la Agilidad total: si cambia
// (subir AGI, equipar las Botas), el efecto se reinicia con el nuevo ritmo.
export default function GameClock() {
  const dispatch = useAppDispatch();
  const intervalMs = useAppSelector(selectManaRegenIntervalMs);

  useEffect(() => {
    const id = setInterval(() => dispatch(regenManaTick()), intervalMs);
    return () => clearInterval(id);
  }, [dispatch, intervalMs]);

  return null;
}
