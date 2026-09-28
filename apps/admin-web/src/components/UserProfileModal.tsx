import {
  Building2,
  ExternalLink,
  FileImage,
  FileText,
  Loader2,
  RefreshCw,
  UserCheck,
  X,
} from "lucide-react";

import type {
  ContractorDocumentType,
  UserProfileDetail,
} from "../admin-data";

import {
  AlertBanner,
  EmptyState,
} from "./CommonUI";

import {
  formatDate,
  roleLabel,
} from "../utils/helpers";

interface UserProfileModalProps {
  profile: UserProfileDetail | null;
  fallbackName: string;
  loading: boolean;
  error: string | null;
  actionError: string | null;
  saving: boolean;
  documentLoading: ContractorDocumentType | null;
  onClose: () => void;
  onRetry: () => void;
  onApprove: () => Promise<void>;
  onOpenDocument: (
    type: ContractorDocumentType
  ) => Promise<void>;
}

function visibleValue(
  value: string | number | null | undefined
): string {
  if (
    value === null ||
    value === undefined ||
    String(value).trim() === ""
  ) {
    return "No indicado";
  }

  return String(value);
}

function ProfileValue({
  label,
  value,
}: {
  label: string;
  value: string | number | null | undefined;
}) {
  return (
    <div className="review-value">
      <span>{label}</span>
      <strong>{visibleValue(value)}</strong>
    </div>
  );
}

function YesNo({
  label,
  value,
}: {
  label: string;
  value: boolean;
}) {
  return (
    <ProfileValue
      label={label}
      value={value ? "Sí" : "No"}
    />
  );
}

function safeHttpUrl(value: string | null | undefined): string | null {
  if (!value) return null;

  try {
    const url = new URL(value);

    return url.protocol === "http:" || url.protocol === "https:"
      ? url.toString()
      : null;
  } catch {
    return null;
  }
}

function formatFileSize(value: number): string {
  if (!Number.isFinite(value) || value < 0) return "Tamaño no indicado";
  if (value < 1024) return `${value} B`;

  const units = ["KB", "MB", "GB"];
  let size = value / 1024;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex += 1;
  }

  return `${size.toFixed(size >= 10 ? 0 : 1)} ${units[unitIndex]}`;
}

function statusLabel(profile: UserProfileDetail): string {
  const status = profile.status.trim().toLowerCase();

  if (status === "active") return "Activo";
  if (status === "pending") return "Pendiente";
  if (status === "suspended") return "Suspendido";
  if (profile.status.trim()) return profile.status;
  if (profile.active) return "Activo";
  if (profile.approvedAt) return "Suspendido";
  return "Pendiente";
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);

  return parts
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("") || "U";
}

export function UserProfileModal({
  profile,
  fallbackName,
  loading,
  error,
  actionError,
  saving,
  documentLoading,
  onClose,
  onRetry,
  onApprove,
  onOpenDocument,
}: UserProfileModalProps) {
  const pendingContractor = Boolean(
    profile?.role === "contractor" &&
    !profile.active &&
    !profile.approvedAt
  );

  const location = profile
    ? [
        profile.location.province,
        profile.location.district,
        profile.location.corregimiento,
      ]
        .filter(Boolean)
        .join(", ")
    : "";

  const avatarUrl = safeHttpUrl(profile?.avatarUrl);
  const logoUrl = safeHttpUrl(profile?.professional?.companyLogoUrl);
  const portfolioUrls = profile?.professional
    ? profile.professional.portfolioUrls
        .map(safeHttpUrl)
        .filter((url): url is string => url !== null)
    : [];

  return (
    <div
      className="modal-backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        className="modal-card user-profile-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="user-profile-title"
      >
        <div className="modal-header">
          <div>
            <h2 id="user-profile-title">Perfil completo</h2>
            <p>
              {profile?.fullName || fallbackName || "Usuario"}
              {profile ? ` · ${roleLabel(profile.role)}` : ""}
            </p>
          </div>

          <button
            className="icon-button"
            onClick={onClose}
            aria-label="Cerrar perfil"
          >
            <X size={19} />
          </button>
        </div>

        <div className="modal-body">
          {loading && (
            <div className="review-loading">
              <Loader2 className="spin" size={28} />
              <span>Cargando perfil y recursos...</span>
            </div>
          )}

          {!loading && error && (
            <div className="profile-error-state">
              <AlertBanner message={error} />
              <button
                className="button button-secondary"
                onClick={onRetry}
              >
                <RefreshCw size={16} />
                Reintentar
              </button>
            </div>
          )}

          {!loading && profile && (
            <div className="user-profile-content">
              {actionError && (
                <AlertBanner message={actionError} />
              )}

              <section className="review-section">
                <div className="profile-identity">
                  <div className="profile-avatar" aria-hidden="true">
                    {avatarUrl ? (
                      <img src={avatarUrl} alt="" />
                    ) : (
                      <span>{initials(profile.fullName)}</span>
                    )}
                  </div>

                  <div>
                    <h3>{profile.fullName || "Sin nombre"}</h3>
                    <p>{profile.email}</p>
                    <div className="profile-badges">
                      <span className="badge badge-active">
                        {roleLabel(profile.role)}
                      </span>
                      <span
                        className={`badge ${
                          profile.active
                            ? "badge-active"
                            : profile.approvedAt
                              ? "badge-suspended"
                              : "badge-pending"
                        }`}
                      >
                        {statusLabel(profile)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="review-grid">
                  <ProfileValue label="Nombre" value={profile.firstName} />
                  <ProfileValue label="Apellido" value={profile.lastName} />
                  <ProfileValue label="Teléfono" value={profile.phone} />
                  <ProfileValue label="Ubicación" value={location} />
                  <ProfileValue
                    label="Fecha de registro"
                    value={formatDate(profile.createdAt)}
                  />
                  <ProfileValue
                    label="Última actualización"
                    value={formatDate(profile.updatedAt)}
                  />
                  <ProfileValue
                    label="Fecha de aprobación"
                    value={formatDate(profile.approvedAt)}
                  />
                  <YesNo
                    label="Términos aceptados"
                    value={profile.preferences.termsAccepted}
                  />
                  <YesNo
                    label="Notificaciones"
                    value={profile.preferences.notificationsOptIn}
                  />
                </div>
              </section>

              {profile.professional && (
                <section className="review-section">
                  <div className="profile-section-heading">
                    <div>
                      <h3>Información profesional</h3>
                      <p>Datos comerciales y experiencia del usuario.</p>
                    </div>

                    {logoUrl && (
                      <img
                        className="profile-company-logo"
                        src={logoUrl}
                        alt={`Logo de ${profile.professional.businessName || "la empresa"}`}
                      />
                    )}
                  </div>

                  <div className="review-grid">
                    <ProfileValue
                      label="Nombre comercial"
                      value={profile.professional.businessName}
                    />
                    <ProfileValue
                      label="Cédula / Pasaporte"
                      value={profile.professional.idDocument}
                    />
                    <ProfileValue label="RUC" value={profile.professional.taxId} />
                    <ProfileValue label="DV" value={profile.professional.taxDv} />
                    <ProfileValue
                      label="Categoría principal"
                      value={profile.professional.primaryCategory}
                    />
                    <ProfileValue
                      label="Años de experiencia"
                      value={profile.professional.experienceYears}
                    />
                    <ProfileValue
                      label="Disponibilidad"
                      value={profile.professional.availability}
                    />
                    <ProfileValue
                      label="Contacto preferido"
                      value={profile.professional.preferredContactMethod}
                    />
                    <ProfileValue
                      label="Modalidad de trabajo"
                      value={profile.professional.workMode}
                    />
                    <YesNo
                      label="Emite factura"
                      value={profile.professional.emitsInvoice}
                    />
                    <YesNo
                      label="Tiene transporte"
                      value={profile.professional.hasTransport}
                    />
                  </div>

                  <div className="review-list-block">
                    <span>Especialidades</span>
                    <strong>
                      {profile.professional.specialties.length
                        ? profile.professional.specialties.join(", ")
                        : "No indicadas"}
                    </strong>
                  </div>

                  <div className="review-list-block">
                    <span>Áreas de trabajo</span>
                    <strong>
                      {profile.professional.workAreas.length
                        ? profile.professional.workAreas.join(", ")
                        : "No indicadas"}
                    </strong>
                  </div>

                  <div className="review-list-block">
                    <span>Descripción profesional</span>
                    <p>
                      {profile.professional.professionalDescription ||
                        "No indicada"}
                    </p>
                  </div>

                  <div className="profile-two-column">
                    <div className="review-list-block">
                      <span>Portafolio</span>

                      {portfolioUrls.length ? (
                        <div className="review-links">
                          {portfolioUrls.map((url, index) => (
                            <a
                              key={`${url}-${index}`}
                              href={url}
                              target="_blank"
                              rel="noreferrer noopener"
                            >
                              <ExternalLink size={14} />
                              Enlace {index + 1}
                            </a>
                          ))}
                        </div>
                      ) : (
                        <strong>No hay enlaces válidos.</strong>
                      )}
                    </div>

                    <div className="review-list-block">
                      <span>Certificaciones</span>
                      <strong>
                        {profile.professional.certifications.length
                          ? profile.professional.certifications.join(", ")
                          : "No indicadas"}
                      </strong>
                    </div>
                  </div>
                </section>
              )}

              <section className="review-section">
                <h3>Asociaciones</h3>

                <div className="profile-two-column">
                  <div className="profile-subsection">
                    <h4>Empresas</h4>

                    {profile.associations.companies.length ? (
                      <div className="profile-association-list">
                        {profile.associations.companies.map((company) => (
                          <div className="profile-association" key={company.id}>
                            <Building2 size={19} />
                            <div>
                              <strong>{company.name}</strong>
                              <small>
                                {company.role || "Rol no indicado"} · {company.active ? "Activa" : "Inactiva"}
                              </small>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <EmptyState label="No tiene empresas asociadas." />
                    )}
                  </div>

                  <div className="profile-subsection">
                    <h4>Clientes vinculados</h4>

                    {profile.associations.linkedClients.length ? (
                      <div className="profile-association-list">
                        {profile.associations.linkedClients.map((client) => (
                          <div className="profile-association" key={client.id}>
                            <Building2 size={19} />
                            <div>
                              <strong>
                                {client.displayName || client.companyName}
                              </strong>
                              <small>
                                {client.companyName || "Sin empresa"} · {client.active ? "Activo" : "Inactivo"}
                              </small>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <EmptyState label="No tiene clientes vinculados." />
                    )}
                  </div>
                </div>
              </section>

              <section className="review-section">
                <h3>Documentos del perfil</h3>

                {profile.resources.profileDocuments.length ? (
                  <div className="review-documents">
                    {profile.resources.profileDocuments.map((document) => (
                      <div className="review-document" key={document.id}>
                        <div>
                          <FileText size={20} />
                          <div>
                            <strong>{document.label}</strong>
                            <small>Documento cargado</small>
                          </div>
                        </div>

                        <button
                          className="button button-secondary"
                          disabled={
                            !document.available || documentLoading !== null
                          }
                          onClick={() => void onOpenDocument(document.type)}
                        >
                          {documentLoading === document.type ? (
                            <Loader2 className="spin" size={16} />
                          ) : (
                            <ExternalLink size={16} />
                          )}
                          Abrir
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <EmptyState label="No hay documentos cargados." />
                )}
              </section>

              <section className="review-section">
                <h3>Fotos de proyectos</h3>

                {profile.resources.projectPhotos.length ? (
                  <div className="profile-photo-grid">
                    {profile.resources.projectPhotos.map((photo) => {
                      const photoUrl = safeHttpUrl(photo.url);

                      return (
                        <article className="profile-photo-card" key={photo.id}>
                          {photoUrl ? (
                            <a
                              className="profile-photo-preview"
                              href={photoUrl}
                              target="_blank"
                              rel="noreferrer noopener"
                              aria-label={`Abrir ${photo.fileName}`}
                            >
                              <img
                                src={photoUrl}
                                alt={photo.caption || photo.fileName}
                                loading="lazy"
                              />
                            </a>
                          ) : (
                            <div className="profile-photo-preview profile-photo-unavailable">
                              <FileImage size={28} />
                              <span>URL no disponible</span>
                            </div>
                          )}

                          <div className="profile-photo-body">
                            <strong>{photo.fileName}</strong>
                            <small>
                              {formatFileSize(photo.fileSize)} · {photo.mimeType || "Tipo no indicado"}
                            </small>
                            <small>
                              {photo.projectName || "Proyecto no indicado"} · {photo.companyName || "Empresa no indicada"}
                            </small>
                            <small>{formatDate(photo.createdAt)}</small>
                            {photo.caption && <p>{photo.caption}</p>}
                          </div>
                        </article>
                      );
                    })}
                  </div>
                ) : (
                  <EmptyState label="No hay fotos de proyectos cargadas." />
                )}
              </section>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button
            className="button button-secondary"
            onClick={onClose}
          >
            Cerrar
          </button>

          {pendingContractor && (
            <button
              className="button button-primary"
              disabled={saving || loading}
              onClick={() => void onApprove()}
            >
              {saving ? (
                <Loader2 className="spin" size={17} />
              ) : (
                <UserCheck size={17} />
              )}
              Aprobar contratista
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
