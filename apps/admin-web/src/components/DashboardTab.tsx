import {
  Edit3,
  Eye,
  UserCheck,
} from "lucide-react";

import type {
  AdminData,
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
} from "../utils/helpers";

interface StatCardProps {
  label: string;
  value: number;
  detail: string;
}

function StatCard({
  label,
  value,
  detail,
}: StatCardProps) {
  return (
    <div className="stat-card">
      <span>{label}</span>
      <strong>{value}</strong>
      <small>{detail}</small>
    </div>
  );
}

interface DashboardTabProps {
  data: AdminData;
  pendingUsers: PlatformUser[];
  onEdit: (user: PlatformUser) => void;
  onReview: (user: PlatformUser) => void;
  onToggle: (
    user: PlatformUser
  ) => Promise<void>;
}

export function DashboardTab({
  data,
  pendingUsers,
  onEdit,
  onReview,
  onToggle,
}: DashboardTabProps) {
  return (
    <>
      <div className="stats-grid">
        <StatCard
          label="Usuarios"
          value={data.users.length}
          detail={`${pendingUsers.length} pendientes`}
        />

        <StatCard
          label="Empresas"
          value={data.companies.length}
          detail="Organizaciones registradas"
        />

        <StatCard
          label="Proyectos"
          value={data.projectCount}
          detail="Proyectos totales"
        />

        <StatCard
          label="Precios globales"
          value={data.globalItems.length}
          detail="Conceptos predeterminados"
        />
      </div>

      <section className="data-card">
        <SectionHeader
          title="Solicitudes pendientes"
          subtitle="Revisa los datos antes de aprobar el acceso."
        />

        {pendingUsers.length ? (
          <Table>
            <thead>
              <tr>
                <th>Usuario</th>
                <th>Rol</th>
                <th>Registro</th>
                <th>Acciones</th>
              </tr>
            </thead>

            <tbody>
              {pendingUsers.map((user) => (
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
                    {formatDate(user.createdAt)}
                  </td>

                  <td>
                    <div className="actions">
                      <button
                        className="button button-secondary"
                        onClick={() =>
                          onEdit(user)
                        }
                      >
                        <Edit3 size={15} />
                        Editar
                      </button>

                      {user.role ===
                      "contractor" ? (
                        <button
                          className="button button-primary"
                          onClick={() =>
                            onReview(user)
                          }
                        >
                          <Eye size={15} />
                          Revisar
                        </button>
                      ) : (
                        <button
                          className="button button-primary"
                          onClick={() =>
                            void onToggle(user)
                          }
                        >
                          <UserCheck size={15} />
                          Aprobar
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        ) : (
          <EmptyState label="No hay registros pendientes." />
        )}
      </section>
    </>
  );
}