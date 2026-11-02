import { StyleSheet, Text, View } from 'react-native';
import { useAppSelector } from '../store';
import {
  selectCombatPower,
  selectCurrentMana,
  selectEquippedWeapon,
  selectHeroCondition,
  selectHeroHp,
  selectHeroVisualClass,
  selectManaRegenIntervalMs,
  selectMaxMana,
  selectTotalStats,
  selectWeightStatus,
} from '../store/selectors';
import ProgressBar from './ui/ProgressBar';
import { colors } from './ui/theme';

const WEIGHT_COLORS = { ok: colors.ok, warning: colors.warning, overloaded: colors.danger };

// ZONA A: solo lee el Store mediante selectores derivados. No tiene botones.
export default function HeroAvatarHUD() {
  const heroClass = useAppSelector(selectHeroVisualClass);
  const condition = useAppSelector(selectHeroCondition);
  const weapon = useAppSelector(selectEquippedWeapon);
  const hp = useAppSelector(selectHeroHp);
  const mana = useAppSelector(selectCurrentMana);
  const maxMana = useAppSelector(selectMaxMana);
  const regenMs = useAppSelector(selectManaRegenIntervalMs);
  const weight = useAppSelector(selectWeightStatus);
  const totals = useAppSelector(selectTotalStats);
  const power = useAppSelector(selectCombatPower);

  const isDefeated = condition.id === 'defeated';

  return (
    <View style={[styles.container, { borderColor: heroClass.auraColor }]}>
      <View style={styles.topRow}>
        <View
          style={[
            styles.aura,
            {
              borderColor: heroClass.auraColor,
              shadowColor: heroClass.auraColor,
              backgroundColor: `${heroClass.auraColor}22`,
              opacity: isDefeated ? 0.5 : 1,
            },
          ]}
        >
          <Text style={styles.sprite}>{heroClass.sprite}</Text>
          <View style={styles.faceBadge}>
            <Text style={styles.faceIcon}>{condition.face}</Text>
          </View>
          {weapon && (
            <View style={styles.weaponBadge}>
              <Text style={styles.weaponIcon}>{weapon.icon}</Text>
            </View>
          )}
        </View>

        <View style={styles.info}>
          <View style={[styles.classBadge, { backgroundColor: heroClass.auraColor }]}>
            <Text style={styles.classText}>
              {heroClass.icon} {heroClass.label}
            </Text>
          </View>
          <Text style={styles.condition}>Estado: {condition.label}</Text>
          <Text style={styles.power}>⚔️ Poder de combate: {power}</Text>
          <View style={styles.chips}>
            <Text style={[styles.chip, { color: colors.str }]}>STR {totals.str}</Text>
            <Text style={[styles.chip, { color: colors.agi }]}>AGI {totals.agi}</Text>
            <Text style={[styles.chip, { color: colors.int }]}>INT {totals.int}</Text>
            <Text style={[styles.chip, { color: colors.def }]}>DEF {totals.def}</Text>
          </View>
        </View>
      </View>

      <ProgressBar label="❤️ Vida" ratio={hp.ratio} color={colors.hp} valueText={`${hp.current} / ${hp.max}`} />
      <ProgressBar
        label={`🔷 Maná · +1 cada ${regenMs / 1000} s`}
        ratio={maxMana > 0 ? mana / maxMana : 0}
        color={colors.mana}
        valueText={`${mana} / ${maxMana}`}
      />
      <ProgressBar
        label={weight.level === 'overloaded' ? '🏋️ Carga · ¡SOBRECARGA!' : '🏋️ Carga'}
        ratio={weight.ratio}
        color={WEIGHT_COLORS[weight.level]}
        valueText={`${weight.weight} / ${weight.capacity} kg`}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.panel,
    borderWidth: 2,
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
  },
  topRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  aura: {
    width: 88,
    height: 88,
    borderRadius: 44,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOpacity: 0.9,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 0 },
    elevation: 10,
  },
  sprite: { fontSize: 46 },
  faceBadge: {
    position: 'absolute',
    top: -4,
    left: -4,
    backgroundColor: colors.background,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.panelBorder,
    padding: 3,
  },
  faceIcon: { fontSize: 18 },
  weaponBadge: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    backgroundColor: colors.background,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.gold,
    padding: 3,
  },
  weaponIcon: { fontSize: 18 },
  info: { flex: 1, marginLeft: 14 },
  classBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 6,
  },
  classText: { color: '#0b0f1a', fontWeight: '800', fontSize: 13 },
  condition: { color: colors.text, fontSize: 13, marginBottom: 2 },
  power: { color: colors.gold, fontSize: 13, fontWeight: '700', marginBottom: 6 },
  chips: { flexDirection: 'row', flexWrap: 'wrap' },
  chip: { fontSize: 11, fontWeight: '800', marginRight: 10 },
});
