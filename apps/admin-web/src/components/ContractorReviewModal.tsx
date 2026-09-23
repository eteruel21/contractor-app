import {
  ExternalLink,
  FileText,
  Loader2,
  UserCheck,
  X,
} from "lucide-react";

import type {
  ContractorDocumentType,
  ContractorReview,
} from "../admin-data";

interface ContractorReviewModalProps {
  review: ContractorReview | null;
  loading: boolean;
  error: string | null;
  saving: boolean;
  documentLoading: ContractorDocumentType | null;
  onClose: () => void;
  onApprove: () => Promise<void>;
  onOpenDocument: (
    type: ContractorDocumentType
  ) => Promise<void>;
}

function ReviewValue({
  label,
  value,
}: {
  label: string;
  value: string | number | null | undefined;
}) {
  const visible =
    value === null ||
    value === undefined ||
    String(value).trim() === ""
      ? "No indicado"
      : String(value);

  return (
    <div className="review-value">
      <span>{label}</span>
      <strong>{visible}</strong>
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
    <ReviewValue
      label={label}
      value={value ? "Sí" : "No"}
    />
  );
}

export function ContractorReviewModal({
  review,
  loading,
  error,
  saving,
  documentLoading,
  onClose,
  onApprove,
  onOpenDocument,
}: ContractorReviewModalProps) {
  const pending =
    review &&
    !review.active &&
    !review.approvedAt;

  const location = review
    ? [
        review.province,
        review.district,
        review.corregimiento,
      ]
        .filter(Boolean)
        .join(", ")
    : "";

  const documents = review
    ? [
        {
          type: "identification" as const,
          label: "Cédula / Pasaporte",
          available:
            review.documents.identification,
        },
        {
          type: "operation_notice" as const,
          label: "Aviso de Operación",
          available:
            review.documents.operationNotice,
        },
        {
          type: "references" as const,
          label: "Referencias comerciales o de obras",
          available:
            review.documents.references,
        },
        {
          type: "address_proof" as const,
          label: "Comprobante de domicilio",
          available:
            review.documents.addressProof,
        },
      ]
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
        className="modal-card contractor-review-modal"
        role="dialog"
        aria-modal="true"
      >
        <div className="modal-header">
          <div>
            <h2>Revisar solicitud de contratista</h2>
            <p>
              Verifica la información profesional y los
              documentos antes de aprobar la cuenta.
            </p>
          </div>

          <button
            className="icon-button"
            onClick={onClose}
            aria-label="Cerrar"
          >
            <X size={19} />
          </button>
        </div>

        <div className="modal-body">
          {loading && (
            <div className="review-loading">
              <Loader2
                className="spin"
                size={28}
              />
              <span>
                Cargando información del contratista...
              </span>
            </div>
          )}

          {error && (
            <div className="alert-banner">
              {error}
            </div>
          )}

          {!loading && review && (
            <div className="contractor-review-content">
              <section className="review-section">
                <h3>Datos personales</h3>

                <div className="review-grid">
                  <ReviewValue
                    label="Nombre completo"
                    value={review.fullName}
                  />

                  <ReviewValue
                    label="Correo electrónico"
                    value={review.email}
                  />

                  <ReviewValue
                    label="Teléfono"
                    value={review.phone}
                  />

                  <ReviewValue
                    label="Ubicación"
                    value={location}
                  />

                  <ReviewValue
                    label="Cédula / Pasaporte"
                    value={review.idDocument}
                  />
                </div>
              </section>

              <section className="review-section">
                <h3>Información profesional</h3>

                <div className="review-grid">
                  <ReviewValue
                    label="Nombre comercial"
                    value={review.businessName}
                  />

                  <ReviewValue
                    label="RUC"
                    value={review.taxId}
                  />

                  <ReviewValue
                    label="DV"
                    value={review.taxDv}
                  />

                  <ReviewValue
                    label="Categoría principal"
                    value={review.primaryCategory}
                  />

                  <ReviewValue
                    label="Años de experiencia"
                    value={review.experienceYears}
                  />

                  <ReviewValue
                    label="Disponibilidad"
                    value={review.availability}
                  />

                  <ReviewValue
                    label="Contacto preferido"
                    value={
                      review.preferredContactMethod
                    }
                  />

                  <ReviewValue
                    label="Modalidad de trabajo"
                    value={review.workMode}
                  />

                  <YesNo
                    label="Emite factura"
                    value={review.emitsInvoice}
                  />

                  <YesNo
                    label="Tiene transporte"
                    value={review.hasTransport}
                  />
                </div>

                <div className="review-list-block">
                  <span>Especialidades</span>
                  <strong>
                    {review.specialties.length
                      ? review.specialties.join(", ")
                      : "No indicadas"}
                  </strong>
                </div>

                <div className="review-list-block">
                  <span>Áreas de trabajo</span>
                  <strong>
                    {review.workAreas.length
                      ? review.workAreas.join(", ")
                      : "No indicadas"}
                  </strong>
                </div>

                <div className="review-list-block">
                  <span>
                    Descripción profesional
                  </span>
                  <p>
                    {review.professionalDescription ||
                      "No indicada"}
                  </p>
                </div>
              </section>

              <section className="review-section">
                <h3>Portafolio y certificaciones</h3>

                <div className="review-list-block">
                  <span>Portafolio</span>

                  {review.portfolioUrls.length ? (
                    <div className="review-links">
                      {review.portfolioUrls.map(
                        (url, index) => (
                          <a
                            key={`${url}-${index}`}
                            href={url}
                            target="_blank"
                            rel="noreferrer"
                          >
                            <ExternalLink size={14} />
                            Enlace {index + 1}
                          </a>
                        )
                      )}
                    </div>
                  ) : (
                    <strong>No indicado</strong>
                  )}
                </div>

                <div className="review-list-block">
                  <span>Certificaciones</span>
                  <strong>
                    {review.certifications.length
                      ? review.certifications.join(", ")
                      : "No indicadas"}
                  </strong>
                </div>
              </section>

              <section className="review-section">
                <h3>Documentos enviados</h3>

                <div className="review-documents">
                  {documents.map((document) => (
                    <div
                      className="review-document"
                      key={document.type}
                    >
                      <div>
                        <FileText size={20} />

                        <div>
                          <strong>
                            {document.label}
                          </strong>

                          <small>
                            {document.available
                              ? "Documento cargado"
                              : "No cargado"}
                          </small>
                        </div>
                      </div>

                      <button
                        className="button button-secondary"
                        disabled={
                          !document.available ||
                          documentLoading !== null
                        }
                        onClick={() =>
                          void onOpenDocument(
                            document.type
                          )
                        }
                      >
                        {documentLoading ===
                        document.type ? (
                          <Loader2
                            className="spin"
                            size={16}
                          />
                        ) : (
                          <ExternalLink size={16} />
                        )}

                        Abrir
                      </button>
                    </div>
                  ))}
                </div>
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

          {pending && (
            <button
              className="button button-primary"
              disabled={saving || loading}
              onClick={() => void onApprove()}
            >
              {saving ? (
                <Loader2
                  className="spin"
                  size={17}
                />
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