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
  useState,
} from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
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

import {
  createProjectTask,
  deleteProjectTask,
  listProjectTasks,
  updateProjectTask,
  type ProjectTask,
  type ProjectTaskPriority,
  type ProjectTaskStatus
} from "@/services/task-service";

import {
  listProjectProgressHistory,
  recordProjectProgressHistory,
  type ProjectProgressHistoryRecord
} from "@/services/progress-service";

import {
  deleteProjectPhoto,
  listProjectPhotos,
  uploadProjectPhoto,
  type ProjectPhoto
} from "@/services/photo-service";

import {
  fetchCompanyActivities
} from "@/services/activity-service";
import type { Appointment } from "@/utils/appointment-storage";

export default function ProjectDetailScreen() {
  const params = useLocalSearchParams<{
    id?: string | string[];
  }>();

  const projectId = Array.isArray(params.id)
    ? params.id[0]
    : params.id;

  const { activeCompany } = useCompany();

  const [project, setProject] = useState<ProjectWithDetails | null>(null);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [tasks, setTasks] = useState<ProjectTask[]>([]);
  const [progressHistory, setProgressHistory] = useState<ProjectProgressHistoryRecord[]>([]);
  const [photos, setPhotos] = useState<ProjectPhoto[]>([]);
  const [activities, setActivities] = useState<Appointment[]>([]);

  const [creatingBudget, setCreatingBudget] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [savingStatus, setSavingStatus] = useState(false);
  const [savingProgress, setSavingProgress] = useState(false);

  const [progressInput, setProgressInput] = useState("");
  const [progressNote, setProgressNote] = useState("");

  // Form states for adding tasks and photos
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskPriority, setNewTaskPriority] = useState<ProjectTaskPriority>("medium");

  const [showPhotoForm, setShowPhotoForm] = useState(false);
  const [newPhotoCaption, setNewPhotoCaption] = useState("");
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  const loadProject = useCallback(
    async (showRefresh = false) => {
      if (!activeCompany || !projectId) return;

      if (showRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const [
        projectResult,
        budgetsResult,
        tasksResult,
        historyResult,
        photosResult,
        activitiesResult
      ] = await Promise.all([
        getProjectById(activeCompany.id, projectId),
        listBudgetsByProject(activeCompany.id, projectId),
        listProjectTasks(activeCompany.id, projectId),
        listProjectProgressHistory(activeCompany.id, projectId),
        listProjectPhotos(activeCompany.id, projectId),
        fetchCompanyActivities(activeCompany.id, { projectId })
      ]);

      if (projectResult.error) {
        Alert.alert("No fue posible cargar el proyecto", projectResult.error);
      } else {
        setProject(projectResult.project);
        setProgressInput(String(projectResult.project?.progress_percentage ?? 0));
      }

      if (budgetsResult.error) {
        Alert.alert("No fue posible cargar los presupuestos", budgetsResult.error);
      } else {
        setBudgets(budgetsResult.budgets);
      }

      setTasks(tasksResult);
      setProgressHistory(historyResult);
      setPhotos(photosResult);
      setActivities(activitiesResult);

      setLoading(false);
      setRefreshing(false);
    },
    [activeCompany, projectId]
  );

  useEffect(() => {
    let active = true;

    void Promise.resolve().then(() => {
      if (active) void loadProject();
    });

    return () => {
      active = false;
    };
  }, [loadProject]);

  async function handleChangeStatus(status: ProjectStatus) {
    if (!activeCompany || !project) return;

    try {
      setSavingStatus(true);
      const { error } = await updateProjectStatus({
        companyId: activeCompany.id,
        projectId: project.id,
        status,
      });

      if (error) {
        Alert.alert("No fue posible cambiar el estado", error);
        return;
      }

      setProject({ ...project, status });
    } finally {
      setSavingStatus(false);
    }
  }

  async function handleSaveProgress() {
    if (!activeCompany || !project) return;

    const progressNumber = Number(progressInput.replace(",", ".").trim()) || 0;

    if (progressNumber < 0 || progressNumber > 100) {
      Alert.alert("Avance inválido", "El avance debe estar entre 0 y 100.");
      return;
    }

    try {
      setSavingProgress(true);

      const record = await recordProjectProgressHistory(
        activeCompany.id,
        project.id,
        progressNumber,
        progressNote.trim() || undefined
      );

      if (!record) {
        Alert.alert("No fue posible guardar el avance", "Error en el servidor.");
        return;
      }

      setProject({ ...project, progress_percentage: progressNumber });
      setProgressHistory([record, ...progressHistory]);
      setProgressNote("");
      Alert.alert("Avance guardado", `Progreso actualizado al ${progressNumber}%.`);
    } finally {
      setSavingProgress(false);
    }
  }

  async function handleCreateTask() {
    if (!activeCompany || !project || !newTaskTitle.trim()) return;

    const created = await createProjectTask(activeCompany.id, project.id, {
      title: newTaskTitle.trim(),
      priority: newTaskPriority,
      status: "todo"
    });

    if (created) {
      setTasks([created, ...tasks]);
      setNewTaskTitle("");
      setShowTaskForm(false);
    } else {
      Alert.alert("Error", "No se pudo agregar la tarea.");
    }
  }

  async function handleToggleTaskStatus(task: ProjectTask) {
    if (!activeCompany || !project) return;

    const nextStatus: ProjectTaskStatus =
      task.status === "completed" ? "todo" : "completed";

    const updated = await updateProjectTask(activeCompany.id, project.id, task.id, {
      status: nextStatus
    });

    if (updated) {
      setTasks(tasks.map((t) => (t.id === task.id ? updated : t)));
    }
  }

  async function handleDeleteTask(taskId: string) {
    if (!activeCompany || !project) return;

    const ok = await deleteProjectTask(activeCompany.id, project.id, taskId);
    if (ok) {
      setTasks(tasks.filter((t) => t.id !== taskId));
    }
  }

  async function handleUploadDemoPhoto() {
    if (!activeCompany || !project) return;

    try {
      setUploadingPhoto(true);

      // SVG/PNG placeholder data for project photo upload
      const sampleBase64 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";

      const photo = await uploadProjectPhoto(activeCompany.id, project.id, {
        fileName: `foto-${Date.now()}.png`,
        fileData: sampleBase64,
        mimeType: "image/png",
        caption: newPhotoCaption.trim() || "Foto de avance de obra",
        isPrivate: true
      });

      if (photo) {
        setPhotos([photo, ...photos]);
        setNewPhotoCaption("");
        setShowPhotoForm(false);
        Alert.alert("Foto agregada", "La imagen se guardó de forma privada con URL firmada temporal.");
      } else {
        Alert.alert("Error", "No se pudo subir la foto.");
      }
    } finally {
      setUploadingPhoto(false);
    }
  }

  async function handleDeletePhoto(photoId: string) {
    if (!activeCompany || !project) return;

    const ok = await deleteProjectPhoto(activeCompany.id, project.id, photoId);
    if (ok) {
      setPhotos(photos.filter((p) => p.id !== photoId));
    }
  }

  async function handleCreateBudget() {
    if (!activeCompany || !project) return;

    try {
      setCreatingBudget(true);

      const { budgetId, error } = await createBudgetFromProject({
        companyId: activeCompany.id,
        projectId: project.id,
        title: project.name,
      });

      if (error || !budgetId) {
        Alert.alert("No fue posible crear el presupuesto", error || "No se recibió el ID.");
        return;
      }

      router.push({
        pathname: "/presupuestos/[id]",
        params: { id: budgetId },
      } as Href);
    } finally {
      setCreatingBudget(false);
    }
  }

  if (!activeCompany || !projectId) {
    return (
      <View style={styles.loading}>
        <Text style={styles.emptyTitle}>Proyecto no disponible</Text>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!project) {
    return (
      <View style={styles.loading}>
        <Text style={styles.emptyTitle}>Proyecto no encontrado</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <Stack.Screen options={{ title: "Detalle de proyecto" }} />

      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => void loadProject(true)}
            tintColor={colors.primary}
          />
        }
      >
        {/* Encabezado */}
        <View style={styles.headerCard}>
          <Text style={styles.codeText}>{project.project_code || "SIN CÓDIGO"}</Text>
          <Text style={styles.titleText}>{project.name}</Text>
          <Text style={styles.clientText}>
            {project.client ? getClientDisplayName(project.client) : "Sin cliente asignado"}
          </Text>

          <View style={styles.progressHeaderRow}>
            <View style={styles.progressBarBackground}>
              <View
                style={[
                  styles.progressBarFill,
                  { width: `${Math.min(Math.max(project.progress_percentage, 0), 100)}%` },
                ]}
              />
            </View>
            <Text style={styles.progressPercentText}>
              {Math.round(project.progress_percentage)}%
            </Text>
          </View>
        </View>

        {/* Estado del Proyecto */}
        <InfoSection title="Estado del proyecto">
          <View style={styles.statusChipsContainer}>
            {PROJECT_STATUS_OPTIONS.map((option) => {
              const selected = project.status === option.value;
              return (
                <Pressable
                  key={option.value}
                  disabled={savingStatus}
                  onPress={() => void handleChangeStatus(option.value)}
                  style={[
                    styles.statusChip,
                    selected && styles.selectedStatusChip,
                    savingStatus && styles.disabledChip,
                  ]}
                >
                  <Text
                    style={[
                      styles.statusChipText,
                      selected && styles.selectedStatusChipText,
                    ]}
                  >
                    {option.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </InfoSection>

        {/* Registro de Avance */}
        <InfoSection title="Registro de avance (% y notas)">
          <View style={styles.progressForm}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Porcentaje (%)</Text>
              <TextInput
                style={styles.textInput}
                keyboardType="numeric"
                value={progressInput}
                onChangeText={setProgressInput}
                placeholder="Ej. 45"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Nota / Comentario del avance</Text>
              <TextInput
                style={[styles.textInput, { height: 60 }]}
                multiline
                value={progressNote}
                onChangeText={setProgressNote}
                placeholder="Ej. Vaciado de losas terminado en piso 2"
              />
            </View>

            <Pressable
              onPress={() => void handleSaveProgress()}
              disabled={savingProgress}
              style={({ pressed }) => [
                styles.saveProgressButton,
                savingProgress && styles.disabledButton,
                pressed && styles.pressed,
              ]}
            >
              {savingProgress ? (
                <ActivityIndicator color={colors.textLight} />
              ) : (
                <Text style={styles.saveProgressText}>Actualizar Avance</Text>
              )}
            </Pressable>
          </View>

          {/* Historial de Avances */}
          {progressHistory.length > 0 && (
            <View style={styles.historyList}>
              <Text style={styles.subSectionTitle}>Historial de Avance</Text>
              {progressHistory.map((item) => (
                <View key={item.id} style={styles.historyCard}>
                  <View style={styles.historyHeader}>
                    <Text style={styles.historyPercent}>
                      {item.previous_percentage}% → {item.progress_percentage}%
                    </Text>
                    <Text style={styles.historyDate}>
                      {new Date(item.created_at).toLocaleDateString("es-PA", {
                        day: "2-digit",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit"
                      })}
                    </Text>
                  </View>
                  {item.notes ? <Text style={styles.historyNotes}>{item.notes}</Text> : null}
                </View>
              ))}
            </View>
          )}
        </InfoSection>

        {/* Tareas del Proyecto */}
        <InfoSection title="Tareas del proyecto">
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionBadge}>{tasks.length} tareas</Text>
            <Pressable
              onPress={() => setShowTaskForm(!showTaskForm)}
              style={styles.addSmallButton}
            >
              <Ionicons name={showTaskForm ? "close-outline" : "add-outline"} size={20} color={colors.primary} />
              <Text style={styles.addSmallButtonText}>{showTaskForm ? "Cancelar" : "Nueva tarea"}</Text>
            </Pressable>
          </View>

          {showTaskForm && (
            <View style={styles.inlineForm}>
              <TextInput
                style={styles.textInput}
                value={newTaskTitle}
                onChangeText={setNewTaskTitle}
                placeholder="Título de la tarea..."
              />
              <Pressable
                onPress={() => void handleCreateTask()}
                style={styles.saveSmallButton}
              >
                <Text style={styles.saveSmallButtonText}>Guardar Tarea</Text>
              </Pressable>
            </View>
          )}

          {tasks.length === 0 ? (
            <View style={styles.emptyBox}>
              <Text style={styles.emptyText}>No hay tareas registradas en este proyecto.</Text>
            </View>
          ) : (
            tasks.map((task) => {
              const isDone = task.status === "completed";
              return (
                <View key={task.id} style={styles.taskCard}>
                  <Pressable
                    onPress={() => void handleToggleTaskStatus(task)}
                    style={styles.checkboxArea}
                  >
                    <Ionicons
                      name={isDone ? "checkbox" : "square-outline"}
                      size={24}
                      color={isDone ? "#10B981" : colors.textMuted}
                    />
                  </Pressable>

                  <View style={styles.taskContent}>
                    <Text style={[styles.taskTitle, isDone && styles.taskTitleDone]}>
                      {task.title}
                    </Text>
                    {task.assigned_user?.email ? (
                      <Text style={styles.taskSubtext}>Responsable: {task.assigned_user.email}</Text>
                    ) : null}
                  </View>

                  <Pressable
                    onPress={() => void handleDeleteTask(task.id)}
                    style={styles.deleteIconButton}
                  >
                    <Ionicons name="trash-outline" size={18} color="#EF4444" />
                  </Pressable>
                </View>
              );
            })
          )}
        </InfoSection>

        {/* Fotos de Proyecto y Almacenamiento Privado */}
        <InfoSection title="Fotos de proyecto (URLs Firmadas)">
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionBadge}>{photos.length} fotos</Text>
            <Pressable
              onPress={() => setShowPhotoForm(!showPhotoForm)}
              style={styles.addSmallButton}
            >
              <Ionicons name={showPhotoForm ? "close-outline" : "camera-outline"} size={20} color={colors.primary} />
              <Text style={styles.addSmallButtonText}>{showPhotoForm ? "Cancelar" : "Adjuntar foto"}</Text>
            </Pressable>
          </View>

          {showPhotoForm && (
            <View style={styles.inlineForm}>
              <TextInput
                style={styles.textInput}
                value={newPhotoCaption}
                onChangeText={setNewPhotoCaption}
                placeholder="Descripción de la foto..."
              />
              <Pressable
                onPress={() => void handleUploadDemoPhoto()}
                disabled={uploadingPhoto}
                style={styles.saveSmallButton}
              >
                {uploadingPhoto ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={styles.saveSmallButtonText}>Subir Foto Privada</Text>
                )}
              </Pressable>
            </View>
          )}

          {photos.length === 0 ? (
            <View style={styles.emptyBox}>
              <Text style={styles.emptyText}>No hay fotos registradas para este proyecto.</Text>
            </View>
          ) : (
            <View style={styles.photosGrid}>
              {photos.map((photo) => {
                const fullImageUrl = photo.signedUrl.startsWith("http")
                  ? photo.signedUrl
                  : `${(process.env.EXPO_PUBLIC_API_URL || "").replace(/\/+$/, "")}${photo.signedUrl}`;
                return (
                  <View key={photo.id} style={styles.photoCard}>
                    <Image
                      source={{ uri: fullImageUrl }}
                      style={styles.photoImage}
                      resizeMode="cover"
                    />
                    <View style={styles.photoInfo}>
                      <Text style={styles.photoCaption} numberOfLines={1}>
                        {photo.caption || photo.file_name}
                      </Text>
                      <Pressable
                        onPress={() => void handleDeletePhoto(photo.id)}
                        style={styles.photoDeleteBtn}
                      >
                        <Ionicons name="trash-outline" size={16} color="#EF4444" />
                      </Pressable>
                    </View>
                  </View>
                );
              })}
            </View>
          )}
        </InfoSection>

        {/* Actividades de Agenda del Proyecto */}
        <InfoSection title="Actividades del proyecto">
          {activities.length === 0 ? (
            <View style={styles.emptyBox}>
              <Text style={styles.emptyText}>No hay actividades de agenda vinculadas a este proyecto.</Text>
            </View>
          ) : (
            activities.map((act) => (
              <View key={act.id} style={styles.activityCard}>
                <Ionicons name="calendar-outline" size={20} color={colors.primary} />
                <View style={styles.activityInfo}>
                  <Text style={styles.activityTitle}>{act.title}</Text>
                  <Text style={styles.activitySubtext}>
                    {act.date} · {act.time} - {act.endTime}
                  </Text>
                </View>
              </View>
            ))
          )}
        </InfoSection>

        {/* Información del Proyecto */}
        <InfoSection title="Información del proyecto">
          <InfoRow
            icon="location-outline"
            label="Dirección"
            value={project.address?.address || "Sin dirección asignada"}
          />

          <InfoRow
            icon="cash-outline"
            label="Estimado inicial"
            value={formatMoney(project.budget_estimate)}
          />

          <InfoRow
            icon="briefcase-outline"
            label="Valor contratado"
            value={formatMoney(project.contract_value)}
          />

          <InfoRow
            icon="document-text-outline"
            label="Descripción"
            value={project.description || "Sin descripción"}
          />
        </InfoSection>

        {/* Presupuestos del Proyecto */}
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
              <ActivityIndicator color={colors.textLight} />
            ) : (
              <>
                <Ionicons name="receipt-outline" size={21} color={colors.textLight} />
                <Text style={styles.createBudgetText}>Crear presupuesto</Text>
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
                    params: { id: budget.id },
                  } as Href)
                }
              />
            ))
          )}
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
      style={({ pressed }) => [styles.budgetCard, pressed && styles.pressed]}
    >
      <View style={styles.budgetCardTop}>
        <View>
          <Text style={styles.budgetNumber}>{budget.budget_number}</Text>
          <Text style={styles.budgetTitle}>{budget.title}</Text>
        </View>

        <Ionicons name="chevron-forward" size={20} color={colors.primary} />
      </View>

      <View style={styles.budgetCardBottom}>
        <Text style={styles.budgetStatus}>
          {getBudgetStatusLabel(budget.status)}
        </Text>
        <Text style={styles.budgetTotal}>{formatMoney(budget.total)}</Text>
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
    <View style={styles.sectionCard}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
}) {
  return (
    <View style={styles.infoRow}>
      <Ionicons name={icon} size={20} color={colors.primary} />
      <View style={styles.infoTextContainer}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoValue}>{value}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: 16,
    gap: 16,
  },
  loading: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.background,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.textSecondary,
  },
  headerCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: 16,
    gap: 6,
    borderWidth: 1,
    borderColor: colors.border,
  },
  codeText: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.primary,
    letterSpacing: 0.5,
  },
  titleText: {
    fontSize: 22,
    fontWeight: "700",
    color: colors.text,
  },
  clientText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  progressHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginTop: 8,
  },
  progressBarBackground: {
    flex: 1,
    height: 8,
    backgroundColor: colors.border,
    borderRadius: radius.full,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: colors.primary,
    borderRadius: radius.full,
  },
  progressPercentText: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.primary,
  },
  sectionCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.text,
  },
  subSectionTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.textSecondary,
    marginTop: 8,
  },
  sectionHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sectionBadge: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: "600",
  },
  addSmallButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  addSmallButtonText: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.primary,
  },
  statusChipsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  statusChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
  },
  selectedStatusChip: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  disabledChip: {
    opacity: 0.5,
  },
  statusChipText: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: "600",
  },
  selectedStatusChipText: {
    color: colors.textLight,
  },
  progressForm: {
    gap: 10,
  },
  inputGroup: {
    gap: 4,
  },
  inputLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: "600",
  },
  textInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    color: colors.text,
    backgroundColor: colors.background,
  },
  saveProgressButton: {
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingVertical: 10,
    alignItems: "center",
  },
  saveProgressText: {
    color: colors.textLight,
    fontWeight: "700",
    fontSize: 14,
  },
  historyList: {
    gap: 8,
    marginTop: 6,
  },
  historyCard: {
    backgroundColor: colors.background,
    borderRadius: radius.md,
    padding: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  historyHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  historyPercent: {
    fontWeight: "700",
    fontSize: 13,
    color: colors.primary,
  },
  historyDate: {
    fontSize: 11,
    color: colors.textMuted,
  },
  historyNotes: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4,
  },
  inlineForm: {
    gap: 8,
    backgroundColor: colors.background,
    padding: 10,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  saveSmallButton: {
    backgroundColor: colors.primary,
    borderRadius: radius.sm,
    paddingVertical: 8,
    alignItems: "center",
  },
  saveSmallButtonText: {
    color: colors.textLight,
    fontWeight: "600",
    fontSize: 13,
  },
  emptyBox: {
    paddingVertical: 12,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 13,
    color: colors.textMuted,
  },
  taskCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.background,
    borderRadius: radius.md,
    padding: 10,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 10,
  },
  checkboxArea: {
    padding: 2,
  },
  taskContent: {
    flex: 1,
  },
  taskTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.text,
  },
  taskTitleDone: {
    textDecorationLine: "line-through",
    color: colors.textMuted,
  },
  taskSubtext: {
    fontSize: 11,
    color: colors.textSecondary,
  },
  deleteIconButton: {
    padding: 4,
  },
  photosGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  photoCard: {
    width: "48%",
    backgroundColor: colors.background,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: "hidden",
  },
  photoImage: {
    width: "100%",
    height: 110,
    backgroundColor: colors.border,
  },
  photoInfo: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 8,
  },
  photoCaption: {
    fontSize: 11,
    color: colors.text,
    flex: 1,
  },
  photoDeleteBtn: {
    paddingLeft: 4,
  },
  activityCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.background,
    borderRadius: radius.md,
    padding: 10,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 10,
  },
  activityInfo: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.text,
  },
  activitySubtext: {
    fontSize: 11,
    color: colors.textSecondary,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  infoTextContainer: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.text,
  },
  createBudgetButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: colors.primary,
    paddingVertical: 12,
    borderRadius: radius.md,
  },
  createBudgetText: {
    color: colors.textLight,
    fontWeight: "700",
    fontSize: 15,
  },
  disabledButton: {
    opacity: 0.6,
  },
  pressed: {
    opacity: 0.8,
  },
  emptyBudgetBox: {
    paddingVertical: 12,
    alignItems: "center",
  },
  emptyBudgetText: {
    fontSize: 13,
    color: colors.textMuted,
  },
  budgetCard: {
    backgroundColor: colors.background,
    borderRadius: radius.md,
    padding: 12,
    gap: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  budgetCardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  budgetNumber: {
    fontSize: 11,
    fontWeight: "700",
    color: colors.primary,
  },
  budgetTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.text,
  },
  budgetCardBottom: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  budgetStatus: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  budgetTotal: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.text,
  },
});
