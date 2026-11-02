import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useAppDispatch, useAppSelector } from '../store';
import {
  applyBuildPreset,
  decrementStat,
  incrementStat,
  resetStats,
} from '../store/slices/statsSlice';
import {
  selectIsHeroDefeated,
  selectStats,
  selectTotalStats,
} from '../store/selectors';
import { BuildPreset, StatKey } from '../store/types';
import { MIN_STAT } from '../store/constants';
import { colors, panelStyle, zoneTitleStyle } from './ui/theme';

const STAT_ROWS: { key: StatKey; label: string; color: string }[] = [
  { key: 'str', label: 'Fuerza (STR)', color: colors.str },
  { key: 'agi', label: 'Agilidad (AGI)', color: colors.agi },
  { key: 'int', label: 'Inteligencia (INT)', color: colors.int },
];

const PRESET_BUTTONS: { preset: BuildPreset; label: string }[] = [
  { preset: 'WARRIOR', label: '🪓 Build Guerrero' },
  { preset: 'MAGE', label: '🔮 Build Mago' },
  { preset: 'ROGUE', label: '🥷 Build Pícaro' },
];

const BAR_SCALE = 25;

// ZONA B: panel de entrenamiento. Solo DESPACHA acciones a statsSlice.
export default function StatsControlPanel() {
  const dispatch = useAppDispatch();
  const stats = useAppSelector(selectStats);
  const totals = useAppSelector(selectTotalStats);
  const disabled = useAppSelector(selectIsHeroDefeated);

  return (
    <View style={panelStyle}>
      <Text style={zoneTitleStyle}>ZONA B · ENTRENAMIENTO</Text>

      <View style={styles.pointsBox}>
        <Text style={styles.pointsLabel}>Puntos de habilidad disponibles</Text>
        <Text style={styles.pointsValue}>{stats.availablePoints}</Text>
      </View>

      {STAT_ROWS.map(({ key, label, color }) => {
        const bonus = totals[key] - stats[key];
        return (
          <View key={key} style={styles.statRow}>
            <View style={styles.statHeader}>
              <Text style={[styles.statLabel, { color }]}>{label}</Text>
              <Text style={styles.statValue}>
                {stats[key]}
                {bonus !== 0 && (
                  <Text style={{ color: bonus > 0 ? colors.ok : colors.danger }}>
                    {'  '}({bonus > 0 ? '+' : ''}
                    {bonus} ítems)
                  </Text>
                )}
              </Text>
            </View>
            <View style={styles.controls}>
              <Pressable
                style={[styles.stepButton, (disabled || stats[key] <= MIN_STAT) && styles.disabled]}
                disabled={disabled || stats[key] <= MIN_STAT}
                onPress={() => dispatch(decrementStat(key))}
              >
                <Text style={styles.stepText}>−</Text>
              </Pressable>
              <View style={styles.levelTrack}>
                <View
                  style={[
                    styles.levelFill,
                    { backgroundColor: color, width: `${Math.min(100, (stats[key] / BAR_SCALE) * 100)}%` as const },
                  ]}
                />
              </View>
              <Pressable
                style={[styles.stepButton, (disabled || stats.availablePoints <= 0) && styles.disabled]}
                disabled={disabled || stats.availablePoints <= 0}
                onPress={() => dispatch(incrementStat(key))}
              >
                <Text style={styles.stepText}>+</Text>
              </Pressable>
            </View>
          </View>
        );
      })}

      <Text style={styles.subTitle}>Presets rápidos (1 solo dispatch)</Text>
      <View style={styles.presetRow}>
        {PRESET_BUTTONS.map(({ preset, label }) => (
          <Pressable
            key={preset}
            style={[styles.presetButton, disabled && styles.disabled]}
            disabled={disabled}
            onPress={() => dispatch(applyBuildPreset(preset))}
          >
            <Text style={styles.presetText}>{label}</Text>
          </Pressable>
        ))}
      </View>

      <Pressable
        style={[styles.resetButton, disabled && styles.disabled]}
        disabled={disabled}
        onPress={() => dispatch(resetStats())}
      >
        <Text style={styles.resetText}>🧪 Poción de Reseteo</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  pointsBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#1d2538',
    borderRadius: 10,
    padding: 10,
    marginBottom: 12,
  },
  pointsLabel: { color: colors.text, fontSize: 13 },
  pointsValue: { color: colors.gold, fontSize: 22, fontWeight: '800' },
  statRow: { marginBottom: 10 },
  statHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  statLabel: { fontSize: 13, fontWeight: '700' },
  statValue: { color: colors.text, fontSize: 13, fontWeight: '700' },
  controls: { flexDirection: 'row', alignItems: 'center' },
  stepButton: {
    width: 36,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#24304b',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepText: { color: colors.text, fontSize: 18, fontWeight: '800' },
  levelTrack: {
    flex: 1,
    height: 10,
    marginHorizontal: 10,
    borderRadius: 5,
    backgroundColor: '#0f1422',
    overflow: 'hidden',
  },
  levelFill: { height: '100%', borderRadius: 5 },
  subTitle: { color: colors.textMuted, fontSize: 12, marginTop: 6, marginBottom: 6 },
  presetRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  presetButton: {
    flex: 1,
    marginHorizontal: 3,
    paddingVertical: 9,
    borderRadius: 10,
    backgroundColor: '#24304b',
    alignItems: 'center',
  },
  presetText: { color: colors.text, fontSize: 12, fontWeight: '700' },
  resetButton: {
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#3b1d4a',
    borderWidth: 1,
    borderColor: colors.int,
    alignItems: 'center',
  },
  resetText: { color: colors.text, fontWeight: '700' },
  disabled: { opacity: 0.35 },
});
