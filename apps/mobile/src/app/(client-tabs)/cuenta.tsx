import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View, Pressable, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { colors, radius } from "../../constants/theme";
import { useAuth } from "../../contexts/AuthContext";
import { formatDate } from "../../utils/format";

export default function ClientProfileScreen() {
  const { profile, user, signOut } = useAuth();

  const handleSignOut = () => {
    Alert.alert("Cerrar sesión", "¿Estás seguro de que deseas salir?", [
      { text: "Cancelar", style: "cancel" },
      { text: "Salir", style: "destructive", onPress: () => void signOut() },
    ]);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.title}>Mi Cuenta</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Ionicons name="person" size={48} color={colors.primary} />
          </View>
          <Text style={styles.name}>{profile?.full_name || "Usuario Cliente"}</Text>
          <Text style={styles.roleBadge}>Cliente Final</Text>
        </View>

        <View style={styles.infoSection}>
          <Text style={styles.sectionTitle}>Detalles Personales</Text>

          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <View style={styles.iconBox}>
                <Ionicons name="mail-outline" size={20} color={colors.textSecondary} />
              </View>
              <View>
                <Text style={styles.infoLabel}>Correo Electrónico</Text>
                <Text style={styles.infoValue}>{user?.email || "Sin correo"}</Text>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.infoRow}>
              <View style={styles.iconBox}>
                <Ionicons name="call-outline" size={20} color={colors.textSecondary} />
              </View>
              <View>
                <Text style={styles.infoLabel}>Teléfono</Text>
                <Text style={styles.infoValue}>{profile?.phone || "Sin teléfono registrado"}</Text>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.infoRow}>
              <View style={styles.iconBox}>
                <Ionicons name="calendar-outline" size={20} color={colors.textSecondary} />
              </View>
              <View>
                <Text style={styles.infoLabel}>Fecha de Registro</Text>
                <Text style={styles.infoValue}>
                  {profile?.created_at ? formatDate(profile.created_at) : "N/A"}
                </Text>
              </View>
            </View>
          </View>
        </View>

        <Pressable onPress={handleSignOut} style={styles.logoutButton}>
          <Ionicons name="log-out-outline" size={20} color={colors.textLight} />
          <Text style={styles.logoutText}>Cerrar Sesión</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
    backgroundColor: colors.background,
  },
  title: {
    fontSize: 28,
    fontWeight: "900",
    color: colors.text,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  profileCard: {
    alignItems: "center",
    padding: 24,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 24,
  },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: colors.primarySoft,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  name: {
    fontSize: 20,
    fontWeight: "900",
    color: colors.text,
  },
  roleBadge: {
    marginTop: 8,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    backgroundColor: "#F1F5F9",
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: "800",
  },
  infoSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "900",
    color: colors.text,
    marginBottom: 10,
  },
  infoCard: {
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center",
  },
  infoLabel: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: "700",
  },
  infoValue: {
    fontSize: 14,
    color: colors.text,
    fontWeight: "800",
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 12,
  },
  logoutButton: {
    height: 54,
    borderRadius: radius.md,
    backgroundColor: colors.danger,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: "auto",
    marginBottom: 30,
  },
  logoutText: {
    color: colors.textLight,
    fontSize: 16,
    fontWeight: "900",
  },
});
