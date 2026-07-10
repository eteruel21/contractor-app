import { Stack } from "expo-router";

import { colors } from "@/constants/theme";

export default function CompanyLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.surfaceDark,
        },
        headerTintColor: colors.textLight,
        headerTitleStyle: {
          fontWeight: "800",
        },
        contentStyle: {
          backgroundColor: colors.background,
        },
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          headerShown: false,
        }}
      />

      <Stack.Screen
        name="crear"
        options={{
          title: "Crear empresa",
        }}
      />

      <Stack.Screen
        name="seleccionar"
        options={{
          title: "Seleccionar empresa",
        }}
      />
    </Stack>
  );
}