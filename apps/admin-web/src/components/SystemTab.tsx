import { useState } from "react";
import {
  BookOpen,
  LogOut,
  UserCheck,
  ShieldCheck,
  Download,
  Trash2,
  FileText,
} from "lucide-react";

import type { AdminData } from "../admin-data";
import {
  deleteAccount,
  exportAccountData,
  getLegalDocument,
} from "../api";

interface SystemTabProps {
  data: AdminData;
  email: string;
  onSignOut: () => Promise<void>;
}

export function SystemTab({
  data,
  email,
  onSignOut,
}: SystemTabProps) {
  const [modalType, setModalType] = useState<
    "terms" | "privacy" | null
  >(null);

  const [legalContent, setLegalContent] =
    useState<string>("");

  const [loadingLegal, setLoadingLegal] =
    useState<boolean>(false);

  const [actionMessage, setActionMessage] =
    useState<string | null>(null);

  const fetchLegal = async (
    type: "terms" | "privacy"
  ) => {
    setLoadingLegal(true);
    setModalType(type);
    setLegalContent("");

    try {
      const legalDocument =
        await getLegalDocument(type);

      setLegalContent(
        legalDocument.content || "Sin contenido."
      );
    } catch {
      setLegalContent(
        "No se pudo cargar el documento."
      );
    } finally {
      setLoadingLegal(false);
    }
  };

  const handleExportData = async () => {
    try {
      setActionMessage(null);

      const data = await exportAccountData();

      const blob = new Blob(
        [JSON.stringify(data, null, 2)],
        {
          type: "application/json",
        }
      );

      const url =
        URL.createObjectURL(blob);

      const link =
        document.createElement("a");

      link.href = url;

      link.download =
        `contractor-data-export-${new Date()
          .toISOString()
          .slice(0, 10)
        }.json`;

      document.body.appendChild(link);

      link.click();
      link.remove();

      URL.revokeObjectURL(url);

      setActionMessage(
        "Exportación de datos completada."
      );
    } catch {
      alert(
        "No se pudo exportar la información de la cuenta."
      );
    }
  };

  const handleDeleteAccount = async () => {
    const confirmed =
      window.confirm(
        "¿Está seguro de que desea solicitar la eliminación y anonimización de su cuenta? Esta acción deshabilitará el acceso."
      );

    if (!confirmed) {
      return;
    }

    try {
      setActionMessage(null);

      await deleteAccount();

      alert(
        "Cuenta eliminada/anonimizada exitosamente."
      );

      await onSignOut();
    } catch {
      alert(
        "Error de conexión al eliminar la cuenta."
      );
    }
  };

  return (
    <div className="two-column-grid">
      <section className="data-card system-card">
        <BookOpen size={26} />

        <h2>Datos centrales</h2>

        <p>
          {data.companies.length} empresas,{" "}
          {data.globalItems.length} precios globales y{" "}
          {data.formulas.length} fórmulas.
        </p>

        <span className="badge badge-active">
          PostgreSQL conectado
        </span>
      </section>

      <section className="data-card system-card">
        <UserCheck size={26} />

        <h2>Sesión administrativa</h2>

        <p>{email}</p>

        <button
          className="button button-danger"
          onClick={() => void onSignOut()}
        >
          <LogOut size={16} />
          Cerrar sesión
        </button>
      </section>

      <section
        className="data-card system-card"
        style={{ gridColumn: "span 2" }}
      >
        <ShieldCheck size={26} />

        <h2>
          Privacidad, Términos y Derechos ARCO
        </h2>

        <p style={{ marginBottom: "1rem" }}>
          Gestione los aspectos legales,
          exportación de datos y eliminación de
          cuenta de conformidad con las políticas
          de retención.
        </p>

        {actionMessage && (
          <div
            className="success-banner"
            style={{ marginBottom: "1rem" }}
          >
            {actionMessage}
          </div>
        )}

        <div
          style={{
            display: "flex",
            gap: "0.75rem",
            flexWrap: "wrap",
          }}
        >
          <button
            className="button button-secondary"
            onClick={() =>
              void fetchLegal("terms")
            }
          >
            <FileText size={16} />
            Términos de Uso
          </button>

          <button
            className="button button-secondary"
            onClick={() =>
              void fetchLegal("privacy")
            }
          >
            <ShieldCheck size={16} />
            Política de Privacidad
          </button>

          <button
            className="button button-primary"
            onClick={() =>
              void handleExportData()
            }
          >
            <Download size={16} />
            Exportar mis datos (JSON)
          </button>

          <button
            className="button button-danger"
            onClick={() =>
              void handleDeleteAccount()
            }
          >
            <Trash2 size={16} />
            Eliminar mi cuenta
          </button>
        </div>
      </section>

      {modalType && (
        <div
          className="modal-backdrop"
          onClick={() =>
            setModalType(null)
          }
        >
          <div
            className="modal-content"
            onClick={(event) =>
              event.stopPropagation()
            }
            style={{
              maxWidth: "700px",
              maxHeight: "80vh",
              overflowY: "auto",
            }}
          >
            <h3>
              {modalType === "terms"
                ? "Términos y Condiciones de Uso"
                : "Política de Privacidad"}
            </h3>

            {loadingLegal ? (
              <p>Cargando documento...</p>
            ) : (
              <pre
                style={{
                  whiteSpace: "pre-wrap",
                  fontFamily: "inherit",
                  fontSize: "0.9rem",
                  lineHeight: "1.5",
                }}
              >
                {legalContent}
              </pre>
            )}

            <div
              style={{
                marginTop: "1rem",
                textAlign: "right",
              }}
            >
              <button
                className="button button-ghost"
                onClick={() =>
                  setModalType(null)
                }
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}