import {
  loadLocalData,
  saveLocalData,
} from "./local-storage";

export type Client = {
  id: string;
  name: string;
  company: string;
  phone: string;
  email: string;
  identification: string;
  address: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
};

const CLIENTS_KEY = "@contractor-pro/clients";

function createId(): string {
  return `client-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 9)}`;
}

export async function getClients(): Promise<Client[]> {
  const clients =
    await loadLocalData<Client[]>(CLIENTS_KEY);

  if (!Array.isArray(clients)) return [];

  return clients.sort((a, b) =>
    a.name.localeCompare(b.name, "es"),
  );
}

export async function getClientById(
  id: string,
): Promise<Client | null> {
  const clients = await getClients();
  return clients.find((client) => client.id === id) ?? null;
}

export async function saveClient(
  data: Omit<Client, "id" | "createdAt" | "updatedAt">,
  id?: string,
): Promise<Client> {
  const clients = await getClients();
  const now = new Date().toISOString();

  if (id) {
    const index = clients.findIndex(
      (client) => client.id === id,
    );

    if (index >= 0) {
      const updated: Client = {
        ...clients[index],
        ...data,
        updatedAt: now,
      };

      clients[index] = updated;
      await saveLocalData(CLIENTS_KEY, clients);
      return updated;
    }
  }

  const created: Client = {
    ...data,
    id: createId(),
    createdAt: now,
    updatedAt: now,
  };

  await saveLocalData(CLIENTS_KEY, [...clients, created]);
  return created;
}

export async function deleteClient(
  id: string,
): Promise<Client[]> {
  const clients = await getClients();
  const updated = clients.filter(
    (client) => client.id !== id,
  );

  await saveLocalData(CLIENTS_KEY, updated);
  return updated;
}
