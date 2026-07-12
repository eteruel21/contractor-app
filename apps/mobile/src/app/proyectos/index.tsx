import { Ionicons } from "@expo/vector-icons";
import {
  type Href,
  router,
  useFocusEffect,
} from "expo-router";
import {
  useCallback,
  useMemo,
  useState,
} from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import {
  colors,
  radius,
} from "@/constants/theme";
import { useCompany } from "@/contexts/CompanyContext";
import { listProjectsByCompany } from "@/services/project-service";
import { getClientDisplayName } from "@/types/client";
import type { Project, ProjectStatus } from "@/types/project";
import { getProjectStatusLabel } from "@/types/project";

export default function ProjectsScreen() {
  const { activeCompany } = useCompany();

  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");

  const filteredProjects = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return projects;

    return projects.filter((project) => {
      const code = (project.project_code ?? "").toLowerCase();
      const name = project.name.toLowerCase();
      const clientName = project.client
        ? getClientDisplayName(project.client).toLowerCase()
        : "";
      const status = getProjectStatusLabel(project.status).toLowerCase();

      return (
        code.includes(query) ||
        name.includes(query) ||
        clientName.includes(query) ||
        status.includes(query)
      );
    });
  }, [projects, search]);

  const loadProjects = useCallback(
    async (showRefresh = false) => {
      if (!activeCompany) return;

      if (showRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const { projects: loadedProjects, error } =
        await listProjectsByCompany(activeCompany.id);

      if (error) {
        Alert.alert(
          "No fue posible cargar los proyectos",
          error
        );
      } else {
        setProjects(loadedProjects);
      }

      setLoading(false);
      setRefreshing(false);
    },
    [activeCompany]
  );

  useFocusEffect(
    useCallback(() => {
      void loadProjects();
    }, [loadProjects])
  );

  const getStatusColor = (status: ProjectStatus) => {
    switch (status) {
      case "in_progress":
      case "completed":
        return {
          bg: colors.primarySoft,
          text: colors.primary,
        };
      case "approved":
        return {
          bg: "#DBEAFE",
          text: colors.info,
        };
      case "quoted":
        return {
          bg: "#FEF3C7",
          text: colors.warning,
        };
      case "paused":
        return {
          bg: "#F3F4F6",
          text: colors.textSecondary,
        };
      case "cancelled":
        return {
          bg: "#FEE2E2",
          text: colors.danger,
        };
      default: // lead, inspection
        return {
          bg: "#F1F5F9",
          text: "#475569",
        };
    }
  };

  if (!activeCompany) {
    return (
      <View style={styles.loading}>
        <Text style={styles.emptyTitle}>
          No hay empresa activa
        </Text>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator
          size="large"
          color={colors.primary}
        />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <FlatList
        data={filteredProjects}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => void loadProjects(true)}
          />
        }
        ListHeaderComponent={
          <View>
            <View style={styles.header}>
              <View>
                <Text style={styles.title}>
                  Proyectos
                </Text>

                <Text style={styles.subtitle}>
                  {activeCompany.name}
                </Text>
              </View>

              <View style={styles.iconBox}>
                <Ionicons
                  name="business-outline"
                  size={24}
                  color={colors.textLight}
                />
              </View>
            </View>

            <View style={styles.searchBox}>
              <Ionicons
                name="search-outline"
                size={19}
                color={colors.textSecondary}
              />

              <TextInput
                value={search}
                onChangeText={setSearch}
                placeholder="Buscar por código, nombre o cliente"
                placeholderTextColor="#94A3B8"
                style={styles.searchInput}
              />
            </View>

            <Text style={styles.counter}>
              {filteredProjects.length} proyecto
              {filteredProjects.length === 1 ? "" : "s"}
            </Text>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons
              name="business-outline"
              size={46}
              color={colors.textSecondary}
            />

            <Text style={styles.emptyTitle}>
              No hay proyectos
            </Text>

            <Text style={styles.emptyText}>
              Para crear uno, entra a la pestaña de Clientes, selecciona un cliente y presiona Crear proyecto.
            </Text>
          </View>
        }
        renderItem={({ item }) => {
          const statusStyle = getStatusColor(item.status);
          return (
            <Pressable
              onPress={() =>
                router.push({
                  pathname: "/proyectos/[id]",
                  params: {
                    id: item.id,
                  },
                } as Href)
              }
              style={({ pressed }) => [
                styles.projectCard,
                pressed && styles.pressed,
              ]}
            >
              <View style={styles.cardHeader}>
                <View style={styles.cardInfo}>
                  <Text style={styles.projectCode}>
                    {item.project_code || "Sin código"}
                  </Text>
                  
                  <Text style={styles.projectName} numberOfLines={1}>
                    {item.name}
                  </Text>

                  {item.client && (
                    <Text style={styles.clientName} numberOfLines={1}>
                      Cliente: {getClientDisplayName(item.client)}
                    </Text>
                  )}
                </View>

                <View
                  style={[
                    styles.statusBadge,
                    { backgroundColor: statusStyle.bg },
                  ]}
                >
                  <Text
                    style={[
                      styles.statusText,
                      { color: statusStyle.text },
                    ]}
                  >
                    {getProjectStatusLabel(item.status)}
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
            </Pressable>
          );
        }}
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
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
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

  iconBox: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: colors.surfaceDark,
    alignItems: "center",
    justifyContent: "center",
  },

  searchBox: {
    height: 52,
    paddingHorizontal: 16,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: "row",
    alignItems: "center",
  },

  searchInput: {
    flex: 1,
    height: "100%",
    marginLeft: 10,
    color: colors.text,
    fontSize: 14,
    fontWeight: "600",
  },

  counter: {
    marginTop: 18,
    marginBottom: 10,
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: "800",
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

  pressed: {
    opacity: 0.85,
    transform: [{ scale: 0.99 }],
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

  clientName: {
    marginTop: 4,
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: "600",
  },

  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },

  statusText: {
    fontSize: 11,
    fontWeight: "800",
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
