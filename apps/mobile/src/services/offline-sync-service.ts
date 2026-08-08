import AsyncStorage from "@react-native-async-storage/async-storage";
import { authenticatedRequest } from "./api";

const OFFLINE_QUEUE_KEY = "contractor_pro_offline_queue_v1";
const OFFLINE_CACHE_PREFIX = "contractor_pro_cache_v1_";

export type QueuedActionType =
  | "RECORD_PROGRESS"
  | "CREATE_TASK"
  | "UPDATE_TASK"
  | "DELETE_TASK"
  | "RECORD_PAYMENT";

export type QueuedOfflineAction = {
  id: string;
  type: QueuedActionType;
  endpoint: string;
  method: "POST" | "PUT" | "PATCH" | "DELETE";
  body: Record<string, unknown>;
  createdAt: string;
  retryCount: number;
};

export type SyncResultSummary = {
  processed: number;
  succeeded: number;
  failed: number;
  remaining: number;
};

/**
 * Obtiene la lista actual de acciones pendientes en la cola offline.
 */
export async function getOfflineQueue(): Promise<QueuedOfflineAction[]> {
  try {
    const raw = await AsyncStorage.getItem(OFFLINE_QUEUE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as QueuedOfflineAction[];
  } catch {
    return [];
  }
}

/**
 * Guarda la cola actualizada de acciones en almacenamiento local.
 */
async function saveOfflineQueue(queue: QueuedOfflineAction[]): Promise<void> {
  try {
    await AsyncStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(queue));
  } catch (error) {
    console.error("Error al guardar cola offline:", error);
  }
}

/**
 * Encola una nueva acción para ejecución posterior cuando vuelva la señal.
 */
export async function enqueueOfflineAction(
  action: Omit<QueuedOfflineAction, "id" | "createdAt" | "retryCount">
): Promise<QueuedOfflineAction> {
  const newAction: QueuedOfflineAction = {
    ...action,
    id: `off_${Date.now()}_${Math.floor(Math.random() * 10000)}`,
    createdAt: new Date().toISOString(),
    retryCount: 0
  };

  const queue = await getOfflineQueue();
  queue.push(newAction);
  await saveOfflineQueue(queue);

  return newAction;
}

/**
 * Elimina una acción específica de la cola.
 */
export async function removeOfflineAction(actionId: string): Promise<void> {
  const queue = await getOfflineQueue();
  const updated = queue.filter((a) => a.id !== actionId);
  await saveOfflineQueue(updated);
}

/**
 * Limpia totalmente la cola de acciones offline.
 */
export async function clearOfflineQueue(): Promise<void> {
  try {
    await AsyncStorage.removeItem(OFFLINE_QUEUE_KEY);
  } catch (error) {
    console.error("Error al limpiar cola offline:", error);
  }
}

/**
 * Procesa en lote todas las acciones acumuladas en la cola offline.
 */
export async function processOfflineSyncQueue(): Promise<SyncResultSummary> {
  const queue = await getOfflineQueue();
  if (queue.length === 0) {
    return { processed: 0, succeeded: 0, failed: 0, remaining: 0 };
  }

  let succeeded = 0;
  let failed = 0;
  const remainingQueue: QueuedOfflineAction[] = [];

  for (const action of queue) {
    try {
      await authenticatedRequest(action.endpoint, {
        method: action.method,
        body: JSON.stringify(action.body)
      });
      succeeded++;
    } catch {
      failed++;
      if (action.retryCount < 5) {
        remainingQueue.push({
          ...action,
          retryCount: action.retryCount + 1
        });
      }
    }
  }

  await saveOfflineQueue(remainingQueue);

  return {
    processed: queue.length,
    succeeded,
    failed,
    remaining: remainingQueue.length
  };
}

/**
 * Guarda en caché local los datos consultados para uso sin conexión.
 */
export async function cacheOfflineData<T>(cacheKey: string, data: T): Promise<void> {
  try {
    await AsyncStorage.setItem(
      `${OFFLINE_CACHE_PREFIX}${cacheKey}`,
      JSON.stringify({
        timestamp: Date.now(),
        data
      })
    );
  } catch (error) {
    console.error("Error al guardar caché offline:", error);
  }
}

/**
 * Obtiene los datos guardados en caché local cuando no hay conexión.
 */
export async function getCachedOfflineData<T>(cacheKey: string): Promise<T | null> {
  try {
    const raw = await AsyncStorage.getItem(`${OFFLINE_CACHE_PREFIX}${cacheKey}`);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { data: T };
    return parsed.data;
  } catch {
    return null;
  }
}
