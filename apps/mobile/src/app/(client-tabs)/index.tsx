import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { colors, radius } from "../../constants/theme";
import { useAuth } from "../../contexts/AuthContext";
import { getClientContractorCompanies } from "../../services/client-service";

export default function ClientHomeScreen() {
  const { profile, signOut } = useAuth();
  const [contractors, setContractors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profile?.id) return;

    setLoading(true);
    getClientContractorCompanies(profile.id)
      .then((res) => {
        if (res.error) {
          Alert.alert("Error al cargar proveedores", res.error);
        } else {
          setContractors(res.companies);
        }
      })
      .catch((err) => {
        console.error(err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [profile?.id]);

  const handleSignOut = () => {
    Alert.alert("Cerrar sesión", "¿Estás seguro de que deseas salir?", [
      { text: "Cancelar", style: "cancel" },
      { text: "Salir", style: "destructive", onPress: () => void signOut() },
    ]);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <View style={styles.header}>
        <View>
          <Text style={styles.welcome}>Hola,</Text>
          <Text style={styles.name}>{profile?.full_name || "Cliente"}</Text>
        </View>

        <Pressable onPress={handleSignOut} style={styles.logoutButton}>
          <Ionicons name="log-out-outline" size={22} color={colors.danger} />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.noticeCard}>
          <Ionicons
            name="checkmark-circle-outline"
            size={26}
            color={colors.primary}
          />
          <View style={styles.noticeTextContainer}>
            <Text style={styles.noticeTitle}>Acceso de Cliente Activo</Text>
            <Text style={styles.noticeBody}>
              Desde aquí puedes visualizar los proyectos, presupuestos e
              información compartida por tus contratistas asociados.
            </Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Mis Contratistas / Proveedores</Text>

        {loading ? (
          <ActivityIndicator
            size="large"
            color={colors.primary}
            style={styles.loader}
          />
        ) : contractors.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="business-outline" size={42} color="#94A3B8" />
            <Text style={styles.emptyTitle}>Sin proveedores vinculados</Text>
            <Text style={styles.emptyText}>
              Pídele a tu contratista que registre tu correo electrónico (
              {profile?.phone || "el que usaste al registrarte"}) para poder
              vincularte de forma automática.
            </Text>
          </View>
        ) : (
          contractors.map((company) => (
            <View key={company.id} style={styles.companyCard}>
              <View style={styles.companyHeader}>
                <Ionicons name="briefcase-outline" size={24} color={colors.primary} />
                <Text style={styles.companyName}>{company.name}</Text>
              </View>

              <View style={styles.divider} />

              {company.phone ? (
                <View style={styles.infoRow}>
                  <Ionicons name="call-outline" size={16} color={colors.textSecondary} />
                  <Text style={styles.infoText}>{company.phone}</Text>
                </View>
              ) : null}

              {company.email ? (
                <View style={styles.infoRow}>
                  <Ionicons name="mail-outline" size={16} color={colors.textSecondary} />
                  <Text style={styles.infoText}>{company.email}</Text>
                </View>
              ) : null}

              {company.address ? (
                <View style={styles.infoRow}>
                  <Ionicons name="location-outline" size={16} color={colors.textSecondary} />
                  <Text style={styles.infoText}>{company.address}</Text>
                </View>
              ) : null}
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.surfaceDark,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 24,
    backgroundColor: colors.surfaceDark,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  welcome: {
    color: "#94A3B8",
    fontSize: 14,
  },
  name: {
    marginTop: 3,
    color: colors.textLight,
    fontSize: 24,
    fontWeight: "900",
  },
  logoutButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "#FEE2E2",
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    flexGrow: 1,
    padding: 20,
    paddingBottom: 40,
    backgroundColor: colors.background,
  },
  noticeCard: {
    flexDirection: "row",
    padding: 16,
    borderRadius: radius.md,
    backgroundColor: "#DCFCE7",
    marginBottom: 24,
    gap: 12,
  },
  noticeTextContainer: {
    flex: 1,
  },
  noticeTitle: {
    color: colors.primaryDark,
    fontWeight: "800",
    fontSize: 14,
  },
  noticeBody: {
    color: colors.primaryDark,
    fontSize: 12,
    marginTop: 4,
    lineHeight: 17,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "900",
    color: colors.text,
    marginBottom: 14,
  },
  loader: {
    marginTop: 20,
  },
  emptyState: {
    padding: 24,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
  },
  emptyTitle: {
    marginTop: 12,
    fontSize: 15,
    fontWeight: "800",
    color: colors.text,
  },
  emptyText: {
    marginTop: 6,
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: "center",
    lineHeight: 18,
  },
  companyCard: {
    padding: 16,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 12,
  },
  companyHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  companyName: {
    fontSize: 16,
    fontWeight: "800",
    color: colors.text,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 12,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 6,
  },
  infoText: {
    fontSize: 13,
    color: colors.textSecondary,
  },
});
