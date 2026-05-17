import { View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { PyklrSplashBrand } from '@/components/brand/PyklrLogo';
import { Button } from '@/components/ui/Button';
import { useTheme } from '@/theme/useTheme';

export default function SplashScreen() {
  const router = useRouter();
  const { colors: c } = useTheme();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.bg }}>
      <View
        style={{
          flex: 1,
          paddingHorizontal: 28,
          paddingVertical: 40,
          alignItems: 'center',
          justifyContent: 'center',
          gap: 32,
        }}
      >
        <PyklrSplashBrand />
        <Text
          style={{
            fontSize: 15,
            color: c.textMuted,
            textAlign: 'center',
            maxWidth: 280,
            lineHeight: 22,
          }}
        >
          Find players. Find courts. Find your game.
        </Text>
        <View style={{ width: '100%', gap: 10 }}>
          <Button label="Get started" onPress={() => router.push('/(auth)/sign-up')} />
          <Button
            label="I already have an account"
            variant="ghost"
            onPress={() => router.push('/(auth)/sign-in')}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}
