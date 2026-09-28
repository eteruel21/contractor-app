import {
  Edit3,
  Eye,
} from "lucide-react";

import type {
  PlatformUser,
} from "../admin-data";

import {
  EmptyState,
  SectionHeader,
  Table,
} from "./CommonUI";

import {
  formatDate,
  roleLabel,
  statusFor,
} from "../utils/helpers";

interface UsersTabProps {
  users: PlatformUser[];
  search: string;
  setSearch: (value: string) => void;
  currentUserId: string;
  saving: boolean;
  onEdit: (user: PlatformUser) => void;
  onViewProfile: (user: PlatformUser) => void;
  onToggle: (
    user: PlatformUser
  ) => Promise<void>;
}

export function UsersTab({
  users,
  search,
  setSearch,
  currentUserId,
  saving,
  onEdit,
  onViewProfile,
  onToggle,
}: UsersTabProps) {
  return (
    <section className="data-card">
      <div className="card-toolbar">
        <SectionHeader
          title="Todos los usuarios"
          subtitle={`${users.length} resultados`}
        />

        <input
          className="search-input"
          value={search}
          onChange={(event) =>
            setSearch(event.target.value)
          }
          placeholder="Buscar usuario..."
        />
      </div>

      {users.length ? (
        <Table>
          <thead>
            <tr>
              <th>Usuario</th>
              <th>Rol</th>
              <th>Empresa</th>
              <th>Estado</th>
              <th>Registro</th>
              <th>Acciones</th>
            </tr>
          </thead>

          <tbody>
            {users.map((user) => {
              const status =
                statusFor(user);

              const self =
                user.id === currentUserId;

              const pendingContractor =
                user.role === "contractor" &&
                !user.active &&
                !user.approvedAt;

              return (
                <tr key={user.id}>
                <td>
                  <strong>
                    {user.fullName ||
                      "Sin nombre"}
                  </strong>

                  <small>
                    {user.phone ||
                      "Sin teléfono"}
                  </small>
                </td>

                <td>
                  {roleLabel(user.role)}
                </td>

                <td>
                  {user.companyName}
                </td>

                <td>
                  <span
                    className={`badge ${status.className}`}
                  >
                    {status.label}
                  </span>
                </td>

                <td>
                  {formatDate(user.createdAt)}
                </td>

                <td>
                  <div className="actions">
                    <button
                      className="icon-button"
                      onClick={() =>
                        onEdit(user)
                      }
                      aria-label="Editar"
                    >
                      <Edit3 size={17} />
                    </button>

                    <button
                      className="button button-secondary"
                      onClick={() =>
                        onViewProfile(user)
                      }
                    >
                      <Eye size={15} />
                      Ver perfil
                    </button>

                    {!self &&
                      !pendingContractor && (
                        <button
                          className={`button ${
                            user.active
                              ? "button-danger"
                              : "button-primary"
                          }`}
                          disabled={saving}
                          onClick={() =>
                            void onToggle(user)
                          }
                        >
                          {user.active
                            ? "Suspender"
                            : user.approvedAt
                              ? "Reactivar"
                              : "Aprobar"}
                        </button>
                      )}
                  </div>
                </td>
                </tr>
              );
            })}
          </tbody>
        </Table>
      ) : (
        <EmptyState
          label={
            search.trim()
              ? "No hay usuarios que coincidan con la búsqueda."
              : "No hay usuarios registrados."
          }
        />
      )}
    </section>
  );
}
