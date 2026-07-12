import { Stack } from "expo-router";

import { colors } from "../../constants/theme";

export default function CalculationsLayout() {
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
        headerBackTitle: "Atrás",
        contentStyle: {
          backgroundColor: colors.background,
        },
      }}
    >
      <Stack.Screen
        name="concreto"
        options={{
          title: "Cálculo de concreto",
        }}
      />
      <Stack.Screen
        name="bloques-repello"
        options={{
          title: "Bloques y repello",
        }}
      />
      <Stack.Screen
        name="gypsum"
        options={{ title: "Cálculo de gypsum" }}
      />
      <Stack.Screen
        name="cielo-raso-pvc"
        options={{ title: "Cielo raso PVC" }}
      />
    </Stack>
  );
}
