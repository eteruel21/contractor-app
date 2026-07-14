import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import {
  type ColorValue,
  StyleSheet,
  View,
} from "react-native";

import { colors } from "@/constants/theme";

type IconName = React.ComponentProps<typeof Ionicons>["name"];

function TabIcon({
  focused,
  active,
  inactive,
  color,
}: {
  focused: boolean;
  active: IconName;
  inactive: IconName;
  color: ColorValue;
}) {
  return (
    <View style={[styles.iconWrap, focused && styles.iconWrapActive]}>
      <Ionicons
        name={focused ? active : inactive}
        size={21}
        color={color}
      />
    </View>
  );
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarHideOnKeyboard: true,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: {
          height: 76,
          paddingTop: 7,
          paddingBottom: 9,
          backgroundColor: colors.surface,
          borderTopWidth: 0,
          shadowColor: colors.surfaceDark,
          shadowOffset: { width: 0, height: -5 },
          shadowOpacity: 0.06,
          shadowRadius: 15,
          elevation: 12,
        },
        tabBarLabelStyle: {
          marginTop: 2,
          fontSize: 10,
          fontWeight: "800",
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Inicio",
          tabBarIcon: ({ color, focused }) => (
            <TabIcon focused={focused} active="home" inactive="home-outline" color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="calculos"
        options={{
          title: "Cálculos",
          tabBarIcon: ({ color, focused }) => (
            <TabIcon focused={focused} active="calculator" inactive="calculator-outline" color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="clientes"
        options={{
          title: "Clientes",
          tabBarIcon: ({ color, focused }) => (
            <TabIcon focused={focused} active="people" inactive="people-outline" color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="agenda"
        options={{
          title: "Agenda",
          tabBarIcon: ({ color, focused }) => (
            <TabIcon focused={focused} active="calendar" inactive="calendar-outline" color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="mas"
        options={{
          title: "Más",
          tabBarIcon: ({ color, focused }) => (
            <TabIcon
              focused={focused}
              active="grid"
              inactive="grid-outline"
              color={color}
            />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  iconWrap: {
    width: 40,
    height: 29,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
  },
  iconWrapActive: {
    backgroundColor: colors.primarySoft,
  },
});
