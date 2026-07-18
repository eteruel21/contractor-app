import { BookOpen, LogOut, UserCheck } from "lucide-react";
import type { AdminData } from "../admin-data";

interface SystemTabProps {
  data: AdminData;
  email: string;
  onSignOut: () => Promise<void>;
}

export function SystemTab({ data, email, onSignOut }: SystemTabProps) {
  return (
    <div className="two-column-grid">
      <section className="data-card system-card">
        <BookOpen size={26} />
        <h2>Datos centrales</h2>
        <p>
          {data.companies.length} empresas, {data.globalItems.length} precios globales y{" "}
          {data.formulas.length} fórmulas.
        </p>
        <span className="badge badge-active">PostgreSQL conectado</span>
      </section>
      <section className="data-card system-card">
        <UserCheck size={26} />
        <h2>Sesión administrativa</h2>
        <p>{email}</p>
        <button className="button button-danger" onClick={() => void onSignOut()}>
          <LogOut size={16} /> Cerrar sesión
        </button>
      </section>
    </div>
  );
}
