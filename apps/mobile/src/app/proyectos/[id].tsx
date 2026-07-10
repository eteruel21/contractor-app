import {
  createBudgetFromProject,
  listBudgetsByProject,
} from "@/services/budget-service";
import type { Budget } from "@/types/budget";
import {
  formatMoney,
  getBudgetStatusLabel,
} from "@/types/budget";
import { Ionicons } from "@expo/vector-icons";
import {
  type Href,
  router,
  Stack,
  useLocalSearchParams,
} from "expo-router";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  RefreshControl,
  ScrollView,
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
import {
  getProjectById,
  updateProjectProgress,
  updateProjectStatus,
} from "@/services/project-service";
import { getClientDisplayName } from "@/types/client";
import type {
  ProjectStatus,
  ProjectWithDetails,
} from "@/types/project";
import {
  getProjectStatusLabel,
  PROJECT_STATUS_OPTIONS,
} from "@/types/project";

export default function ProjectDetailScreen() {
  const params = useLocalSearchParams<{
    id?: string | string[];
  }>();

  const projectId = Array.isArray(params.id)
    ? params.id[0]
    : params.id;

  const { activeCompany } = useCompany();

  const [project, setProject] =
    useState<ProjectWithDetails | null>(null);
    const [budgets, setBudgets] = useState<
      Budget[]
    >([]);
    const [creatingBudget, setCreatingBudget] =
      useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] =
    useState(false);
  const [savingStatus, setSavingStatus] =
    useState(false);
  const [savingProgress, setSavingProgress] =
    useState(false);
  const [progressInput, setProgressInput] =
    useState("");

  const projectTitle = useMemo(() => {
    if (!project) return "Proyecto";

    return project.project_code
      ? `${project.project_code} · ${project.name}`
      : project.name;
  }, [project]);

  const loadProject = useCallback(
    async (showRefresh = false) => {
      if (!activeCompany || !projectId) return;

      if (showRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const [projectResult, budgetsResult] =
        await Promise.all([
          getProjectById(
            activeCompany.id,
            projectId,
          ),
          listBudgetsByProject(
            activeCompany.id,
            projectId,
          ),
        ]);

      if (projectResult.error) {
        Alert.alert(
          "No fue posible cargar el proyecto",
          projectResult.error,
        );
      } else {
        setProject(projectResult.project);
        setProgressInput(
          String(
            projectResult.project
              ?.progress_percentage ?? 0,
          ),
        );
      }

      if (budgetsResult.error) {
        Alert.alert(
          "No fue posible cargar los presupuestos",
          budgetsResult.error,
        );
      } else {
        setBudgets(budgetsResult.budgets);
      }

      setLoading(false);
      setRefreshing(false);
    },
    [activeCompany, projectId],
  );

  useEffect(() => {
    void loadProject();
  }, [loadProject]);

  async function handleChangeStatus(
    status: ProjectStatus,
  ) {
    if (!activeCompany || !project) return;

    try {
      setSavingStatus(true);

      const { error } = await updateProjectStatus({
        companyId: activeCompany.id,
        projectId: project.id,
        status,
      });

      if (error) {
        Alert.alert(
          "No fue posible cambiar el estado",
          error,
        );
        return;
      }

      setProject({
        ...project,
        status,
      });
    } finally {
      setSavingStatus(false);
    }
  }

  async function handleSaveProgress() {
    if (!activeCompany || !project) return;

    const progressNumber =
      Number(
        progressInput
          .replace(",", ".")
          .trim(),
      ) || 0;

    if (
      progressNumber < 0 ||
      progressNumber > 100
    ) {
      Alert.alert(
        "Avance inválido",
        "El avance debe estar entre 0 y 100.",
      );
      return;
    }

    try {
      setSavingProgress(true);

      const { error } =
        await updateProjectProgress({
          companyId: activeCompany.id,
          projectId: project.id,
          progressPercentage: progressNumber,
        });

      if (error) {
        Alert.alert(
          "No fue posible guardar el avance",
          error,
        );
        return;
      }

      setProject({
        ...project,
        progress_percentage: progressNumber,
      });
    } finally {
      setSavingProgress(false);
    }
  }

  if (!activeCompany || !projectId) {
    return (
      <View style={styles.loading}>
        <Text style={styles.emptyTitle}>
          Proyecto no disponible
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

  if (!project) {
    return (
      <View style={styles.loading}>
        <Text style={styles.emptyTitle}>
          Proyecto no encontrado
        </Text>
      </View>
    );
  }

  async function handleCreateBudget() {
    if (!activeCompany || !project) return;

    try {
      setCreatingBudget(true);

      const { budgetId, error } =
        await createBudgetFromProject({
          companyId: activeCompany.id,
          projectId: project.id,
          title: project.name,
        });

      if (error || !budgetId) {
        Alert.alert(
          "No fue posible crear el presupuesto",
          error ||
            "No se recibió el ID del presupuesto.",
        );
        return;
      }

      router.push({
        pathname: "/presupuestos/[id]",
        params: {
          id: budgetId,
        },
      } as Href);
    } finally {
      setCreatingBudget(false);
    }
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <Stack.Screen
        options={{
          title: "Detalle de proyecto",
        }}
      />

      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() =>
              void loadProject(true)
            }
          />
        }
      >
        <View style={styles.heroCard}>
          <View style={styles.heroIcon}>
            <Ionicons
              name="construct-outline"
              size={30}
              color={colors.textLight}
            />
          </View>

          <View style={styles.heroInfo}>
            <Text style={styles.projectCode}>
              {project.project_code ||
                "Sin código"}
            </Text>

            <Text style={styles.projectName}>
              {project.name}
            </Text>

            <Text style={styles.projectStatus}>
              {getProjectStatusLabel(
                project.status,
              )}
            </Text>
          </View>
        </View>

        <View style={styles.progressCard}>
          <View style={styles.progressHeader}>
            <Text style={styles.sectionTitle}>
              Avance del proyecto
            </Text>

            <Text style={styles.progressValue}>
              {project.progress_percentage}%
            </Text>
          </View>

          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${project.progress_percentage}%`,
                },
              ]}
            />
          </View>

          <View style={styles.progressInputRow}>
            <TextInput
              value={progressInput}
              onChangeText={setProgressInput}
              placeholder="0"
              keyboardType="decimal-pad"
              placeholderTextColor="#94A3B8"
              style={styles.progressInput}
            />

            <Pressable
              onPress={() =>
                void handleSaveProgress()
              }
              disabled={savingProgress}
              style={({ pressed }) => [
                styles.saveProgressButton,
                pressed && styles.pressed,
                savingProgress &&
                  styles.disabledButton,
              ]}
            >
              {savingProgress ? (
                <ActivityIndicator
                  color={colors.textLight}
                />
              ) : (
                <Text
                  style={styles.saveProgressText}
                >
                  Guardar
                </Text>
              )}
            </Pressable>
          </View>
        </View>

        <InfoSection title="Estado">
          <View style={styles.statusGrid}>
            {PROJECT_STATUS_OPTIONS.map(
              (option) => {
                const active =
                  project.status === option.value;

                return (
                  <Pressable
                    key={option.value}
                    onPress={() =>
                      void handleChangeStatus(
                        option.value,
                      )
                    }
                    disabled={savingStatus}
                    style={({ pressed }) => [
                      styles.statusChip,
                      active &&
                        styles.statusChipActive,
                      pressed && styles.pressed,
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusChipText,
                        active &&
                          styles.statusChipTextActive,
                      ]}
                    >
                      {option.label}
                    </Text>
                  </Pressable>
                );
              },
            )}
          </View>
        </InfoSection>

        <InfoSection title="Información del proyecto">
          <InfoRow
            icon="person-outline"
            label="Cliente"
            value={
              project.client
                ? getClientDisplayName(
                    project.client,
                  )
                : "Sin cliente"
            }
          />

          <InfoRow
            icon="location-outline"
            label="Dirección"
            value={
              project.address?.address ||
              "Sin dirección asignada"
            }
          />

          <InfoRow
            icon="cash-outline"
            label="Estimado inicial"
            value={formatMoney(
              project.budget_estimate,
            )}
          />

          <InfoRow
            icon="briefcase-outline"
            label="Valor contratado"
            value={formatMoney(
              project.contract_value,
            )}
          />

          <InfoRow
            icon="document-text-outline"
            label="Descripción"
            value={
              project.description ||
              "Sin descripción"
            }
          />
        </InfoSection>

        <InfoSection title="Presupuestos">
          <Pressable
            onPress={() => void handleCreateBudget()}
            disabled={creatingBudget}
            style={({ pressed }) => [
              styles.createBudgetButton,
              creatingBudget && styles.disabledButton,
              pressed && styles.pressed,
            ]}
          >
            {creatingBudget ? (
              <ActivityIndicator
                color={colors.textLight}
              />
            ) : (
              <>
                <Ionicons
                  name="receipt-outline"
                  size={21}
                  color={colors.textLight}
                />

                <Text style={styles.createBudgetText}>
                  Crear presupuesto
                </Text>
              </>
            )}
          </Pressable>

          {budgets.length === 0 ? (
            <View style={styles.emptyBudgetBox}>
              <Text style={styles.emptyBudgetText}>
                Este proyecto todavía no tiene presupuestos.
              </Text>
            </View>
          ) : (
            budgets.map((budget) => (
              <BudgetCard
                key={budget.id}
                budget={budget}
                onPress={() =>
                  router.push({
                    pathname: "/presupuestos/[id]",
                    params: {
                      id: budget.id,
                    },
                  } as Href)
                }
              />
            ))
          )}
        </InfoSection>

        <InfoSection title="Próximos módulos">
          <ActionPlaceholder
            icon="calendar-outline"
            title="Agenda"
            text="Aquí conectaremos visitas, tareas y recordatorios."
          />

          <ActionPlaceholder
            icon="images-outline"
            title="Avances con fotos"
            text="Más adelante registraremos evidencias del antes, durante y después."
          />
        </InfoSection>
      </ScrollView>
    </SafeAreaView>
  );
}

function BudgetCard({
  budget,
  onPress,
}: {
  budget: Budget;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.budgetCard,
        pressed && styles.pressed,
      ]}
    >
      <View style={styles.budgetCardTop}>
        <View>
          <Text style={styles.budgetNumber}>
            {budget.budget_number}
          </Text>

          <Text style={styles.budgetTitle}>
            {budget.title}
          </Text>
        </View>

        <Ionicons
          name="chevron-forward"
          size={20}
          color={colors.primary}
        />
      </View>

      <View style={styles.budgetCardBottom}>
        <Text style={styles.budgetStatus}>
          {getBudgetStatusLabel(budget.status)}
        </Text>

        <Text style={styles.budgetTotal}>
          {formatMoney(budget.total)}
        </Text>
      </View>
    </Pressable>
  );
}

function InfoSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>
        {title}
      </Text>

      <View style={styles.sectionBody}>
        {children}
      </View>
    </View>
  );
}

function InfoRow({
  icon,
  label,
  value,
}: {
  icon:
    | "person-outline"
    | "location-outline"
    | "cash-outline"
    | "briefcase-outline"
    | "document-text-outline";
  label: string;
  value: string;
}) {
  return (
    <View style={styles.infoRow}>
      <Ionicons
        name={icon}
        size={20}
        color={colors.textSecondary}
      />

      <View style={styles.infoTextBox}>
        <Text style={styles.infoLabel}>
          {label}
        </Text>

        <Text style={styles.infoValue}>
          {value}
        </Text>
      </View>
    </View>
  );
}

function ActionPlaceholder({
  icon,
  title,
  text,
}: {
  icon:
    | "calculator-outline"
    | "calendar-outline"
    | "images-outline";
  title: string;
  text: string;
}) {
  return (
    <View style={styles.placeholderCard}>
      <Ionicons
        name={icon}
        size={23}
        color={colors.primary}
      />

      <View style={styles.placeholderTextBox}>
        <Text style={styles.placeholderTitle}>
          {title}
        </Text>

        <Text style={styles.placeholderText}>
          {text}
        </Text>
      </View>
    </View>
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
    paddingBottom: 50,
  },

  heroCard: {
    padding: 18,
    borderRadius: radius.lg,
    backgroundColor: colors.surfaceDark,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },

  heroIcon: {
    width: 60,
    height: 60,
    borderRadius: 18,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },

  heroInfo: {
    flex: 1,
  },

  projectCode: {
    color: "#94A3B8",
    fontSize: 12,
    fontWeight: "900",
  },

  projectName: {
    marginTop: 3,
    color: colors.textLight,
    fontSize: 21,
    fontWeight: "900",
  },

  projectStatus: {
    marginTop: 5,
    color: "#CBD5E1",
    fontSize: 13,
    fontWeight: "700",
  },

  progressCard: {
    marginTop: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
  },

  progressHeader: {
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  progressValue: {
    color: colors.primary,
    fontSize: 18,
    fontWeight: "900",
  },

  progressBar: {
    height: 12,
    borderRadius: 999,
    backgroundColor: "#E2E8F0",
    overflow: "hidden",
  },

  progressFill: {
    height: "100%",
    borderRadius: 999,
    backgroundColor: colors.primary,
  },

  progressInputRow: {
    marginTop: 14,
    flexDirection: "row",
    gap: 10,
  },

  progressInput: {
    flex: 1,
    minHeight: 48,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: "#F8FAFC",
    color: colors.text,
    fontSize: 14,
  },

  saveProgressButton: {
    minWidth: 100,
    minHeight: 48,
    borderRadius: radius.md,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },

  saveProgressText: {
    color: colors.textLight,
    fontSize: 13,
    fontWeight: "900",
  },

  section: {
    marginTop: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
  },

  sectionTitle: {
    color: colors.text,
    fontSize: 17,
    fontWeight: "900",
  },

  sectionBody: {
    marginTop: 12,
  },

  statusGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 9,
  },

  statusChip: {
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 999,
    backgroundColor: "#F8FAFC",
  },

  statusChipActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primarySoft,
  },

  statusChipText: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: "900",
  },

  statusChipTextActive: {
    color: colors.primary,
  },

  infoRow: {
    paddingVertical: 11,
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
    flexDirection: "row",
    gap: 12,
  },

  infoTextBox: {
    flex: 1,
  },

  infoLabel: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: "800",
  },

  infoValue: {
    marginTop: 2,
    color: colors.text,
    fontSize: 14,
    fontWeight: "700",
    lineHeight: 20,
  },

  placeholderCard: {
    marginBottom: 10,
    padding: 13,
    borderRadius: radius.md,
    backgroundColor: "#F8FAFC",
    flexDirection: "row",
    gap: 12,
  },

  placeholderTextBox: {
    flex: 1,
  },

  placeholderTitle: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "900",
  },

  placeholderText: {
    marginTop: 3,
    color: colors.textSecondary,
    fontSize: 12,
    lineHeight: 18,
  },

  emptyTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "900",
  },

  disabledButton: {
    opacity: 0.65,
  },

  pressed: {
    opacity: 0.78,
    transform: [{ scale: 0.99 }],
  },

  createBudgetButton: {
    minHeight: 52,
    marginBottom: 12,
    borderRadius: radius.md,
    backgroundColor: colors.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },

  createBudgetText: {
    color: colors.textLight,
    fontSize: 14,
    fontWeight: "900",
  },

  emptyBudgetBox: {
    padding: 14,
    borderRadius: radius.md,
    backgroundColor: "#F8FAFC",
  },

  emptyBudgetText: {
    color: colors.textSecondary,
    fontSize: 13,
    textAlign: "center",
  },

  budgetCard: {
    marginTop: 10,
    padding: 13,
    borderRadius: radius.md,
    backgroundColor: "#F8FAFC",
  },

  budgetCardTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },

  budgetNumber: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: "900",
  },

  budgetTitle: {
    marginTop: 3,
    color: colors.text,
    fontSize: 14,
    fontWeight: "900",
  },

  budgetCardBottom: {
    marginTop: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  budgetStatus: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: "800",
  },

  budgetTotal: {
    color: colors.text,
    fontSize: 15,
    fontWeight: "900",
  },
});