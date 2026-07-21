import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { colors, radius } from "../../constants/theme";
import { useAuth } from "../../contexts/AuthContext";
import { listProjectsForClient } from "../../services/project-service";

export default function ClientProjectsScreen() {
  const { profile } = useAuth();
  const profileId = profile?.id;
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadProjects = useCallback(
    async (showRefresh = false) => {
      if (!profileId) return;

      if (showRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const { projects: loadedProjects, error } = await listProjectsForClient(
        profileId,
      );

      if (error) {
        Alert.alert("No fue posible cargar tus proyectos", error);
      } else {
        setProjects(loadedProjects);
      }

      setLoading(false);
      setRefreshing(false);
    },
    [profileId],
  );

  useFocusEffect(
    useCallback(() => {
      void loadProjects();
    }, [loadProjects]),
  );

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <FlatList
        data={projects}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => void loadProjects(true)}
          />
        }
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={styles.title}>Mis Proyectos</Text>
            <Text style={styles.subtitle}>
              {projects.length} proyecto{projects.length === 1 ? "" : "s"} activos
            </Text>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="business-outline" size={46} color="#94A3B8" />
            <Text style={styles.emptyTitle}>No tienes proyectos activos</Text>
            <Text style={styles.emptyText}>
              Los proyectos compartidos por tus contratistas se listarán aquí.
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.projectCard}>
            <View style={styles.cardHeader}>
              <View style={styles.cardInfo}>
                <Text style={styles.projectCode}>
                  {item.project_code || "PROYECTO"}
                </Text>
                <Text style={styles.projectName} numberOfLines={1}>
                  {item.name}
                </Text>
                {item.company?.name && (
                  <Text style={styles.contractorName} numberOfLines={1}>
                    Contratista: {item.company.name}
                  </Text>
                )}
              </View>

              <View style={styles.statusBadge}>
                <Text style={styles.statusText}>
                  {item.status === "in_progress"
                    ? "En progreso"
                    : item.status === "completed"
                      ? "Completado"
                      : "Verificando"}
                </Text>
              </View>
            </View>

            <View style={styles.progressSection}>
              <View style={styles.progressHeader}>
                <Text style={styles.progressLabel}>Progreso</Text>
                <Text style={styles.progressValue}>
                  {item.progress_percentage}%
                </Text>
              </View>

              <View style={styles.progressBarBg}>
                <View
                  style={[
                    styles.progressBarFill,
                    { width: `${item.progress_percentage}%` },
                  ]}
                />
              </View>
            </View>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loading: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 20,
  },
  title: {
    color: colors.text,
    fontSize: 28,
    fontWeight: "900",
  },
  subtitle: {
    marginTop: 4,
    color: colors.textSecondary,
    fontSize: 14,
    fontWeight: "700",
  },
  empty: {
    marginTop: 40,
    padding: 30,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.border,
  },
  emptyTitle: {
    marginTop: 14,
    color: colors.text,
    fontSize: 16,
    fontWeight: "800",
  },
  emptyText: {
    marginTop: 8,
    color: colors.textSecondary,
    fontSize: 13,
    lineHeight: 18,
    textAlign: "center",
  },
  projectCard: {
    padding: 16,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  cardInfo: {
    flex: 1,
    marginRight: 10,
  },
  projectCode: {
    color: colors.textSecondary,
    fontSize: 11,
    fontWeight: "800",
    textTransform: "uppercase",
  },
  projectName: {
    marginTop: 4,
    color: colors.text,
    fontSize: 16,
    fontWeight: "800",
  },
  contractorName: {
    marginTop: 4,
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: "600",
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    backgroundColor: colors.primarySoft,
  },
  statusText: {
    fontSize: 11,
    fontWeight: "800",
    color: colors.primary,
  },
  progressSection: {
    marginTop: 16,
  },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  progressLabel: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: "700",
  },
  progressValue: {
    color: colors.text,
    fontSize: 12,
    fontWeight: "800",
  },
  progressBarBg: {
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.background,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    borderRadius: 3,
    backgroundColor: colors.primary,
  },
});
