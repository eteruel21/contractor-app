import type { ReactNode } from "react";
import { AlertTriangle, CheckCircle2, Loader2, X } from "lucide-react";

export function FullScreenLoader({ label }: { label: string }) {
  return <div className="fullscreen-loader"><Loader2 className="spin" size={32} /><span>{label}</span></div>;
}

export function AlertBanner({ message, onClose }: { message: string; onClose?: () => void }) {
  return <div className="alert-banner"><AlertTriangle size={18} /><span>{message}</span>{onClose && <button onClick={onClose}><X size={16} /></button>}</div>;
}

export function SuccessBanner({ message }: { message: string }) {
  return <div className="success-banner"><CheckCircle2 size={18} /><span>{message}</span></div>;
}

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return <label className="field"><span>{label}</span>{children}</label>;
}

export function TextField({ label, value, onChange, type = "text", suffix }: { label: string; value: string; onChange: (value: string) => void; type?: "text" | "number"; suffix?: string }) {
  return <Field label={label}><div className="suffix-input"><input type={type} step={type === "number" ? "any" : undefined} value={value} onChange={(event) => onChange(event.target.value)} />{suffix && <span>{suffix}</span>}</div></Field>;
}

export function SelectField({ label, value, onChange, options, disabled = false }: { label: string; value: string; onChange: (value: string) => void; options: Array<{ value: string; label: string }>; disabled?: boolean }) {
  return <Field label={label}><select value={value} disabled={disabled} onChange={(event) => onChange(event.target.value)}>{options.map((option) => <option value={option.value} key={option.value}>{option.label}</option>)}</select></Field>;
}

export function ToggleField({ label, checked, onChange, disabled = false }: { label: string; checked: boolean; onChange: (value: boolean) => void; disabled?: boolean }) {
  return <label className="toggle-field"><input type="checkbox" checked={checked} disabled={disabled} onChange={(event) => onChange(event.target.checked)} /><span className="toggle-track"><span /></span><strong>{label}</strong></label>;
}

export function SectionHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return <div className="section-header"><h2>{title}</h2><p>{subtitle}</p></div>;
}

export function Table({ children }: { children: ReactNode }) {
  return <div className="table-wrapper"><table className="data-table">{children}</table></div>;
}

export function EmptyState({ label }: { label: string }) {
  return <div className="empty-state"><CheckCircle2 size={24} /><span>{label}</span></div>;
}
