/** Stable server/client datetime strings for admin UI (fixed locale + options). */
export function formatAdminDateTime(iso: string, options?: { withSeconds?: boolean }) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return iso;
  }

  return new Intl.DateTimeFormat("en-CA", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    ...(options?.withSeconds ? { second: "2-digit" } : {}),
  }).format(date);
}
