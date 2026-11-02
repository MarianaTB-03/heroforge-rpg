import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { colors } from './theme';

interface Props {
  label: string;
  ratio: number;
  color: string;
  valueText: string;
}

// Componente de presentación reutilizable. Recibe props solo de su padre
// directo (no es prop drilling entre zonas): no conoce el Store.
export default function ProgressBar({ label, ratio, color, valueText }: Props) {
  const clamped = Math.max(0, Math.min(1, ratio));
  const width = useRef(new Animated.Value(clamped)).current;

  useEffect(() => {
    Animated.timing(width, {
      toValue: clamped,
      duration: 350,
      useNativeDriver: false,
    }).start();
  }, [clamped, width]);

  return (
    <View style={styles.wrapper}>
      <View style={styles.header}>
        <Text style={styles.label}>{label}</Text>
        <Text style={[styles.value, { color }]}>{valueText}</Text>
      </View>
      <View style={styles.track}>
        <Animated.View
          style={[
            styles.fill,
            {
              backgroundColor: color,
              width: width.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }),
            },
          ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { marginBottom: 8 },
  header: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 3 },
  label: { color: colors.textMuted, fontSize: 12, fontWeight: '600' },
  value: { fontSize: 12, fontWeight: '700' },
  track: {
    height: 10,
    borderRadius: 5,
    backgroundColor: '#0f1422',
    overflow: 'hidden',
  },
  fill: { height: '100%', borderRadius: 5 },
});
