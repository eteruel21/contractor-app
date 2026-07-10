import { Stack } from "expo-router";

import { colors } from "@/constants/theme";

export default function ProjectsLayout() {
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
    />
  );
}