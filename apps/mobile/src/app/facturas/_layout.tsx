import { Stack } from "expo-router";

import { colors } from "@/constants/theme";

export default function InvoicesLayout() {
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
          title: "Facturas",
        }}
      />

      <Stack.Screen
        name="[id]"
        options={{
          title: "Detalle de factura",
        }}
      />

      <Stack.Screen
        name="settings"
        options={{
          title: "Diseño de Factura",
          presentation: "card",
        }}
      />
    </Stack>
  );
}
