import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { useAppDispatch, useAppSelector } from '../store';
import { gameReset } from '../store/actions';
import { endRun, nextBoss } from '../store/slices/bossSlice';
import { attackBoss, castHeal } from '../store/thunks/combatThunks';
import {
  selectBossInfo,
  selectCanAttack,
  selectCatalog,
  selectAttackPreview,
  selectCanHeal,
  selectCurrentMana,
  selectDamageReduction,
  selectHealAmount,
  selectIsHeroDefeated,
  selectLogEntries,
} from '../store/selectors';
import { LogEntry } from '../store/slices/actionLogSlice';
import { Item } from '../store/types';
import ProgressBar from './ui/ProgressBar';
import { colors, panelStyle, zoneTitleStyle } from './ui/theme';

const MONO = Platform.select({ ios: 'Menlo', default: 'monospace' });

function formatPayload(entry: LogEntry, catalog: Item[]): string {
  const { type, payload } = entry;
  if (payload === undefined) return '—';
  if (type === 'inventory/toggleEquipItem') {
    const item = catalog.find((i) => i.id === payload);
    return item ? `"${item.name}"` : JSON.stringify(payload);
  }
  return JSON.stringify(payload);
}

// ZONA D: arena de combate + consola de Redux en vivo.
export default function ReduxLiveInspector() {
  const dispatch = useAppDispatch();
  const boss = useAppSelector(selectBossInfo);
  const canAttack = useAppSelector(selectCanAttack);
  const heroDefeated = useAppSelector(selectIsHeroDefeated);
  const attack = useAppSelector(selectAttackPreview);
  const mana = useAppSelector(selectCurrentMana);
  const reduction = useAppSelector(selectDamageReduction);
  const healAmount = useAppSelector(selectHealAmount);
  const canHeal = useAppSelector(selectCanHeal);
  const entries = useAppSelector(selectLogEntries);
  const catalog = useAppSelector(selectCatalog);

  return (
    <View style={panelStyle}>
      <Text style={zoneTitleStyle}>ZONA D · ARENA & INSPECTOR REDUX</Text>

      {boss.runEnded ? (
        <View style={styles.banner}>
          <Text style={styles.bannerTitle}>🏆 Aventura terminada</Text>
          <Text style={styles.bannerText}>Jefes derrotados: {boss.bossesDefeated}</Text>
          <Pressable style={[styles.button, styles.primary]} onPress={() => dispatch(gameReset())}>
            <Text style={styles.buttonText}>🔁 Nueva partida</Text>
          </Pressable>
        </View>
      ) : (
        <>
          <View style={styles.bossRow}>
            <Text style={[styles.bossIcon, boss.isDefeated && styles.faded]}>{boss.icon}</Text>
            <View style={styles.bossInfo}>
              <Text style={styles.bossName}>
                {boss.name} · Nv. {boss.level}
              </Text>
              <Text style={styles.bossMeta}>
                Golpea {boss.minDamage}–{boss.maxDamage} · tu defensa lo reduce {reduction}%
              </Text>
            </View>
          </View>
          <ProgressBar
            label="Vida del jefe"
            ratio={boss.hpRatio}
            color="#a855f7"
            valueText={`${boss.currentHp} / ${boss.maxHp}`}
          />

          {heroDefeated && (
            <View style={[styles.banner, styles.bannerDanger]}>
              <Text style={styles.bannerTitle}>💀 Has sido derrotado</Text>
              <Text style={styles.bannerText}>Reiniciando la partida…</Text>
            </View>
          )}

          {boss.isDefeated && !heroDefeated && (
            <View style={styles.banner}>
              <Text style={styles.bannerTitle}>🎉 ¡{boss.name} derrotado!</Text>
              <View style={styles.row}>
                <Pressable style={[styles.button, styles.primary]} onPress={() => dispatch(nextBoss())}>
                  <Text style={styles.buttonText}>➡️ Siguiente jefe (Nv. {boss.level + 1})</Text>
                </Pressable>
                <Pressable style={[styles.button, styles.secondary]} onPress={() => dispatch(endRun())}>
                  <Text style={styles.buttonText}>🏁 Terminar aquí</Text>
                </Pressable>
              </View>
            </View>
          )}

          <View style={styles.row}>
            <Pressable
              style={[styles.button, styles.attack, !canAttack && styles.disabled]}
              disabled={!canAttack}
              onPress={() => dispatch(attackBoss())}
            >
              <Text style={styles.buttonText}>⚔️ Atacar ({attack.damage})</Text>
              <Text style={styles.buttonHint}>
                {attack.hasMana ? `-${attack.manaCost} maná` : 'sin maná: ataque débil'}
              </Text>
            </Pressable>
            <Pressable
              style={[styles.button, styles.heal, !canHeal && styles.disabled]}
              disabled={!canHeal}
              onPress={() => dispatch(castHeal())}
            >
              <Text style={styles.buttonText}>✨ Curar (+{healAmount})</Text>
              <Text style={styles.buttonHint}>gasta {mana} maná</Text>
            </Pressable>
          </View>
        </>
      )}

      <View style={styles.console}>
        <Text style={styles.consoleTitle}>{'>'} redux · últimas 5 acciones</Text>
        {entries.length === 0 ? (
          <Text style={styles.consoleEmpty}>Esperando el primer dispatch…</Text>
        ) : (
          entries.map((entry, index) => (
            <Text key={entry.seq} style={[styles.consoleLine, index === 0 && styles.consoleLatest]}>
              #{entry.seq} [{entry.type}] -{'>'} {formatPayload(entry, catalog)}
            </Text>
          ))
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bossRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  bossIcon: { fontSize: 44, marginRight: 12 },
  faded: { opacity: 0.3 },
  bossInfo: { flex: 1 },
  bossName: { color: colors.text, fontWeight: '800', fontSize: 15 },
  bossMeta: { color: colors.textMuted, fontSize: 12, marginTop: 2 },
  banner: {
    backgroundColor: '#1d2a1d',
    borderColor: colors.ok,
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
  },
  bannerDanger: { backgroundColor: '#3f1111', borderColor: colors.danger },
  bannerTitle: { color: colors.text, fontWeight: '800', fontSize: 14, marginBottom: 4 },
  bannerText: { color: colors.textMuted, fontSize: 12, marginBottom: 6 },
  row: { flexDirection: 'row', marginHorizontal: -3 },
  button: {
    flex: 1,
    marginHorizontal: 3,
    paddingVertical: 10,
    paddingHorizontal: 6,
    borderRadius: 10,
    alignItems: 'center',
  },
  attack: { backgroundColor: '#7f1d1d' },
  heal: { backgroundColor: '#1e3a8a' },
  primary: { backgroundColor: '#166534' },
  secondary: { backgroundColor: '#374151' },
  buttonText: { color: '#fff', fontWeight: '800', fontSize: 13, textAlign: 'center' },
  buttonHint: { color: '#e5e7ebaa', fontSize: 11, marginTop: 2 },
  disabled: { opacity: 0.35 },
  console: {
    marginTop: 12,
    backgroundColor: colors.console,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#1f2937',
    padding: 10,
    minHeight: 120,
  },
  consoleTitle: { color: colors.textMuted, fontFamily: MONO, fontSize: 11, marginBottom: 6 },
  consoleEmpty: { color: '#4b5563', fontFamily: MONO, fontSize: 11 },
  consoleLine: { color: '#65a30d', fontFamily: MONO, fontSize: 11, marginBottom: 3 },
  consoleLatest: { color: colors.consoleText, fontWeight: '700' },
});
