import { type Href, router } from "expo-router";
import { useEffect } from "react";
import {
    ActivityIndicator,
    StyleSheet,
    Text,
    View,
} from "react-native";

import { colors } from "@/constants/theme";
import { useCompany } from "@/contexts/CompanyContext";

export default function CompanyIndexScreen() {
  const {
    companies,
    activeCompany,
    loading,
  } = useCompany();

  useEffect(() => {
    if (loading) return;

    if (activeCompany) {
      router.replace("/(tabs)" as Href);
      return;
    }

    if (companies.length === 0) {
      router.replace("/empresa/crear" as Href);
      return;
    }

    router.replace("/empresa/seleccionar" as Href);
  }, [activeCompany, companies.length, loading]);

  return (
    <View style={styles.container}>
      <ActivityIndicator
        size="large"
        color={colors.primary}
      />

      <Text style={styles.text}>
        Preparando empresa...
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surfaceDark,
    alignItems: "center",
    justifyContent: "center",
  },

  text: {
    marginTop: 12,
    color: colors.textLight,
    fontSize: 13,
    fontWeight: "700",
  },
});
