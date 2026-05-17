import React, { useState } from 'react';
import { Tabs } from 'expo-router';
import { View, Pressable } from 'react-native';
import {
  Home as HomeIcon,
  MapPin,
  MessageCircle,
  User,
  Plus,
} from 'lucide-react-native';
import { useTheme } from '@/theme/useTheme';
import { colors } from '@/theme/tokens';
import { FABActionSheet } from '@/components/ui/FABActionSheet';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';

function CustomTabBar({ state, navigation }: BottomTabBarProps & { onFabPress: () => void }) {
  const { scheme, colors: c } = useTheme();
  const primary = scheme === 'dark' ? colors.brand.lime : colors.brand.greenDark;
  const fab = scheme === 'dark' ? colors.brand.lime : colors.brand.green;

  const tabs = [
    { name: 'index', icon: HomeIcon },
    { name: 'discover', icon: MapPin },
    { name: '_fab', icon: Plus, isFab: true },
    { name: 'messages', icon: MessageCircle },
    { name: 'profile', icon: User },
  ];

  // Map tab names to route indices (skipping the FAB which isn't a real tab)
  const routeIndexMap: Record<string, number> = {};
  let routeIdx = 0;
  for (const tab of tabs) {
    if (!tab.isFab) {
      routeIndexMap[tab.name] = routeIdx;
      routeIdx++;
    }
  }

  return (
    <View
      style={{
        position: 'absolute',
        bottom: 16,
        left: 16,
        right: 16,
        backgroundColor: c.surface,
        borderRadius: 28,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-around',
        paddingVertical: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: scheme === 'dark' ? 0.4 : 0.1,
        shadowRadius: 20,
        elevation: 8,
        borderWidth: scheme === 'dark' ? 0.5 : 0,
        borderColor: c.border,
      }}
    >
      {tabs.map((tab) => {
        const Icon = tab.icon;

        if (tab.isFab) {
          return (
            <Pressable
              key="fab"
              onPress={(navigation as unknown as { onFabPress: () => void }).onFabPress}
              style={({ pressed }) => ({
                width: 48,
                height: 48,
                borderRadius: 24,
                backgroundColor: fab,
                alignItems: 'center',
                justifyContent: 'center',
                marginTop: -22,
                opacity: pressed ? 0.85 : 1,
                shadowColor: fab,
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.4,
                shadowRadius: 8,
                elevation: 6,
              })}
            >
              <Icon size={22} color={colors.brand.limeDark} strokeWidth={2.5} />
            </Pressable>
          );
        }

        const routeIndex = routeIndexMap[tab.name];
        const isFocused = state.index === routeIndex;

        return (
          <Pressable
            key={tab.name}
            onPress={() => {
              const route = state.routes[routeIndex];
              const event = navigation.emit({
                type: 'tabPress',
                target: route.key,
                canPreventDefault: true,
              });
              if (!isFocused && !event.defaultPrevented) {
                navigation.navigate(route.name, route.params);
              }
            }}
          >
            <Icon
              size={22}
              color={isFocused ? primary : c.textFaint}
              strokeWidth={isFocused ? 2.5 : 2}
            />
          </Pressable>
        );
      })}
    </View>
  );
}

export default function TabsLayout() {
  const [fabOpen, setFabOpen] = useState(false);

  return (
    <>
      <Tabs
        tabBar={(props) => {
          // Inject the FAB press handler through the navigation object
          const extendedNav = Object.assign({}, props.navigation, {
            onFabPress: () => setFabOpen(true),
          });
          return <CustomTabBar {...props} navigation={extendedNav as never} />;
        }}
        screenOptions={{
          headerShown: false,
        }}
      >
        <Tabs.Screen name="index" />
        <Tabs.Screen name="discover" />
        <Tabs.Screen name="messages" />
        <Tabs.Screen name="profile" />
      </Tabs>
      <FABActionSheet visible={fabOpen} onClose={() => setFabOpen(false)} />
    </>
  );
}
