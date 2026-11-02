import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useAppDispatch, useAppSelector } from '../store';
import { clearEquipment, toggleEquipItem } from '../store/slices/inventorySlice';
import {
  selectCatalog,
  selectEquippedIds,
  selectIsHeroDefeated,
  selectIsOverencumbered,
  selectWeightStatus,
} from '../store/selectors';
import { Item } from '../store/types';
import { colors, panelStyle, zoneTitleStyle } from './ui/theme';

const BONUS_LABELS: { key: keyof Item; label: string; color: string }[] = [
  { key: 'bonusStr', label: 'STR', color: colors.str },
  { key: 'bonusAgi', label: 'AGI', color: colors.agi },
  { key: 'bonusInt', label: 'INT', color: colors.int },
  { key: 'bonusDef', label: 'DEF', color: colors.def },
];

// ZONA C: armería. Despacha a inventorySlice; el actionLogSlice registra
// cada acción solo (addMatcher), sin un dispatch extra desde aquí.
export default function ArmoryGrid() {
  const dispatch = useAppDispatch();
  const catalog = useAppSelector(selectCatalog);
  const equippedIds = useAppSelector(selectEquippedIds);
  const isOverloaded = useAppSelector(selectIsOverencumbered);
  const weight = useAppSelector(selectWeightStatus);
  const disabled = useAppSelector(selectIsHeroDefeated);

  return (
    <View style={panelStyle}>
      <Text style={zoneTitleStyle}>ZONA C · ARMERÍA & MOCHILA</Text>

      {isOverloaded && (
        <View style={styles.alert}>
          <Text style={styles.alertTitle}>⚠️ ¡SOBRECARGADO! (-50% Velocidad)</Text>
          <Text style={styles.alertText}>
            {weight.weight} kg de {weight.capacity} kg · el poder de combate baja un 30%
          </Text>
        </View>
      )}

      <View style={styles.grid}>
        {catalog.map((item) => {
          const equipped = equippedIds.includes(item.id);
          return (
            <Pressable
              key={item.id}
              disabled={disabled}
              onPress={() => dispatch(toggleEquipItem(item.id))}
              style={[styles.card, equipped && styles.cardEquipped, disabled && styles.disabled]}
            >
              <Text style={styles.icon}>{item.icon}</Text>
              <Text style={styles.name} numberOfLines={1}>
                {item.name}
              </Text>
              <View style={styles.bonuses}>
                {BONUS_LABELS.filter(({ key }) => item[key] !== 0).map(({ key, label, color }) => {
                  const value = item[key] as number;
                  return (
                    <Text key={key} style={[styles.bonus, { color: value < 0 ? colors.danger : color }]}>
                      {value > 0 ? '+' : ''}
                      {value} {label}
                    </Text>
                  );
                })}
              </View>
              <Text style={styles.weight}>⚖️ {item.weight} kg</Text>
              {equipped && <Text style={styles.equippedTag}>EQUIPADO</Text>}
            </Pressable>
          );
        })}
      </View>

      <Pressable
        style={[styles.clearButton, (disabled || equippedIds.length === 0) && styles.disabled]}
        disabled={disabled || equippedIds.length === 0}
        onPress={() => dispatch(clearEquipment())}
      >
        <Text style={styles.clearText}>🎒 Desequipar todo</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  alert: {
    backgroundColor: '#3f1111',
    borderColor: colors.danger,
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
  },
  alertTitle: { color: '#fecaca', fontWeight: '800', fontSize: 14 },
  alertText: { color: '#fca5a5', fontSize: 12, marginTop: 2 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  card: {
    width: '48.5%',
    backgroundColor: '#1a2133',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'transparent',
    padding: 10,
    marginBottom: 8,
  },
  cardEquipped: {
    borderColor: colors.gold,
    backgroundColor: '#2a2410',
    shadowColor: colors.gold,
    shadowOpacity: 0.8,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 0 },
    elevation: 8,
  },
  icon: { fontSize: 28, marginBottom: 4 },
  name: { color: colors.text, fontWeight: '700', fontSize: 13, marginBottom: 4 },
  bonuses: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 4 },
  bonus: { fontSize: 11, fontWeight: '800', marginRight: 6 },
  weight: { color: colors.textMuted, fontSize: 11 },
  equippedTag: { color: colors.gold, fontSize: 10, fontWeight: '800', marginTop: 4, letterSpacing: 1 },
  clearButton: {
    marginTop: 4,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#24304b',
    alignItems: 'center',
  },
  clearText: { color: colors.text, fontWeight: '700' },
  disabled: { opacity: 0.35 },
});
