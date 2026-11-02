import { Platform, ScrollView, StatusBar as RNStatusBar, StyleSheet, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Provider } from 'react-redux';
import { store } from './src/store';
import HeroAvatarHUD from './src/components/HeroAvatarHUD';
import StatsControlPanel from './src/components/StatsControlPanel';
import ArmoryGrid from './src/components/ArmoryGrid';
import ReduxLiveInspector from './src/components/ReduxLiveInspector';
import GameClock from './src/components/GameClock';
import { colors } from './src/components/ui/theme';

const TOP_INSET = Platform.OS === 'android' ? (RNStatusBar.currentHeight ?? 24) : 50;

// Las 4 zonas son hermanas: ninguna recibe props de otra.
// Todas leen y escriben únicamente a través del Store (Provider).
export default function App() {
  return (
    <Provider store={store}>
      <GameClock />
      <View style={styles.screen}>
        <StatusBar style="light" />
        <ScrollView
          contentContainerStyle={styles.content}
          stickyHeaderIndices={[1]}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.title}>⚒️ HeroForge RPG</Text>
          <View style={styles.stickyHud}>
            <HeroAvatarHUD />
          </View>
          <StatsControlPanel />
          <ArmoryGrid />
          <ReduxLiveInspector />
        </ScrollView>
      </View>
    </Provider>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background, paddingTop: TOP_INSET },
  content: { paddingHorizontal: 12, paddingBottom: 32 },
  title: {
    color: colors.gold,
    fontSize: 22,
    fontWeight: '900',
    textAlign: 'center',
    marginVertical: 8,
  },
  stickyHud: { backgroundColor: colors.background, paddingTop: 4 },
});
