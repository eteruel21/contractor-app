import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { colors, radius } from "../../constants/theme";
import {
  getBudgetDraft,
  saveBudgetDraft,
} from "../../utils/budget-storage";
import {
  getClients,
  type Client,
} from "../../utils/client-storage";

export default function SelectBudgetClientScreen() {
  const [clients, setClients] = useState<Client[]>([]);
  const [search, setSearch] = useState("");

  useFocusEffect(
    useCallback(() => {
      let active = true;

      void getClients().then((data) => {
        if (active) setClients(data);
      });

      return () => {
        active = false;
      };
    }, []),
  );

  const filteredClients = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return clients;

    return clients.filter((client) =>
      [
        client.name,
        client.company,
        client.phone,
        client.email,
        client.identification,
      ]
        .join(" ")
        .toLowerCase()
        .includes(query),
    );
  }, [clients, search]);

  async function selectClient(client: Client) {
    const draft = await getBudgetDraft();

    await saveBudgetDraft({
      ...draft,
      clientId: client.id,
      clientName: client.name,
      clientCompany: client.company,
      clientPhone: client.phone,
      clientEmail: client.email,
      clientIdentification: client.identification,
      clientAddress: client.address,
    });

    router.back();
  }

  function createClient() {
    router.push({
      pathname: "/clientes/[id]",
      params: { id: "nuevo" },
    });
  }

  return (
    <SafeAreaView
      style={styles.safeArea}
      edges={["left", "right", "bottom"]}
    >
      <View style={styles.searchBox}>
        <Ionicons
          name="search-outline"
          size={20}
          color="#94A3B8"
        />

        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="Buscar cliente"
          placeholderTextColor="#94A3B8"
          style={styles.searchInput}
        />
      </View>

      <Pressable
        onPress={createClient}
        style={({ pressed }) => [
          styles.newClientButton,
          pressed && styles.pressed,
        ]}
      >
        <Ionicons
          name="person-add-outline"
          size={20}
          color={colors.primary}
        />

        <Text style={styles.newClientButtonText}>
          Registrar nuevo cliente
        </Text>
      </Pressable>

      <ScrollView contentContainerStyle={styles.list}>
        {filteredClients.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons
              name="people-outline"
              size={44}
              color="#94A3B8"
            />

            <Text style={styles.emptyTitle}>
              No hay clientes disponibles
            </Text>

            <Text style={styles.emptyText}>
              Registra un cliente y luego selecciónalo para el
              presupuesto.
            </Text>
          </View>
        ) : (
          filteredClients.map((client) => (
            <Pressable
              key={client.id}
              onPress={() => void selectClient(client)}
              style={({ pressed }) => [
                styles.clientCard,
                pressed && styles.pressed,
              ]}
            >
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {client.name
                    .trim()
                    .slice(0, 1)
                    .toUpperCase() || "C"}
                </Text>
              </View>

              <View style={styles.clientText}>
                <Text style={styles.clientName}>
                  {client.name}
                </Text>

                <Text style={styles.clientDetails}>
                  {[
                    client.company,
                    client.phone,
                    client.email,
                  ]
                    .filter(Boolean)
                    .join(" · ") ||
                    "Sin datos de contacto"}
                </Text>
              </View>

              <Ionicons
                name="checkmark-circle-outline"
                size={23}
                color={colors.primary}
              />
            </Pressable>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    padding: 18,
    backgroundColor: colors.background,
  },

  searchBox: {
    height: 52,
    paddingHorizontal: 14,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
  },

  searchInput: {
    flex: 1,
    color: colors.text,
    fontSize: 14,
  },

  newClientButton: {
    minHeight: 50,
    marginTop: 12,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: "#BBF7D0",
    backgroundColor: "#F0FDF4",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },

  newClientButtonText: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: "900",
  },

  list: {
    paddingTop: 16,
    paddingBottom: 30,
    gap: 11,
  },

  clientCard: {
    minHeight: 78,
    padding: 13,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    flexDirection: "row",
    alignItems: "center",
  },

  avatar: {
    width: 48,
    height: 48,
    borderRadius: 15,
    backgroundColor: colors.primarySoft,
    alignItems: "center",
    justifyContent: "center",
  },

  avatarText: {
    color: colors.primary,
    fontSize: 17,
    fontWeight: "900",
  },

  clientText: {
    flex: 1,
    marginHorizontal: 12,
  },

  clientName: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "900",
  },

  clientDetails: {
    marginTop: 4,
    color: colors.textSecondary,
    fontSize: 11,
    lineHeight: 16,
  },

  emptyState: {
    paddingVertical: 70,
    alignItems: "center",
  },

  emptyTitle: {
    marginTop: 13,
    color: colors.text,
    fontSize: 16,
    fontWeight: "900",
  },

  emptyText: {
    marginTop: 7,
    maxWidth: 300,
    color: colors.textSecondary,
    fontSize: 13,
    lineHeight: 18,
    textAlign: "center",
  },

  pressed: {
    opacity: 0.75,
    transform: [{ scale: 0.99 }],
  },
});
