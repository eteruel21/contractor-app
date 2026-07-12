export function getLocaleByCurrency(currencyCode?: string): string {
  if (!currencyCode) return "es-PA";
  
  const map: Record<string, string> = {
    USD: "es-PA", // For USD in Panama context, we can keep Spanish formatting
    EUR: "fr-FR",
    MXN: "es-MX",
    COP: "es-CO",
    CRC: "es-CR",
    PEN: "es-PE",
    CLP: "es-CL",
    ARS: "es-AR",
    GTQ: "es-GT",
    HNL: "es-HN",
    NIO: "es-NI",
    PAB: "es-PA",
    DOP: "es-DO",
  };
  
  return map[currencyCode.toUpperCase()] ?? "es-PA";
}

export function formatMoney(value: number, currencyCode?: string): string {
  const currency = currencyCode || "USD";
  const locale = getLocaleByCurrency(currency);
  
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value || 0);
}

export function formatDecimal(
  value: number,
  maximumFractionDigits = 2,
  currencyCode?: string
): string {
  const currency = currencyCode || "USD";
  const locale = getLocaleByCurrency(currency);
  
  return new Intl.NumberFormat(locale, {
    minimumFractionDigits: 0,
    maximumFractionDigits,
  }).format(value || 0);
}

export function formatDate(date: string | Date, timezone?: string): string {
  // If it's a date-only string like YYYY-MM-DD, parse as local time to avoid timezone shift
  const d = typeof date === "string" 
    ? (date.includes("T") ? new Date(date) : new Date(`${date}T12:00:00`))
    : date;
  
  const options: Intl.DateTimeFormatOptions = {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
  };
  
  if (timezone) {
    options.timeZone = timezone;
  }
  
  return new Intl.DateTimeFormat("es-PA", options).format(d);
}

export function formatShortDate(date: string | Date, timezone?: string): string {
  const d = typeof date === "string" 
    ? (date.includes("T") ? new Date(date) : new Date(`${date}T12:00:00`))
    : date;
  
  const options: Intl.DateTimeFormatOptions = {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  };
  
  if (timezone) {
    options.timeZone = timezone;
  }
  
  return new Intl.DateTimeFormat("es-PA", options).format(d);
}
