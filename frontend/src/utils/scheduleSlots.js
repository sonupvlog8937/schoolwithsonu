/**
 * Period grid: local clock hour at period start (matches Assign Period times).
 * Used to map stored Date values to a row without ambiguous string parsing.
 */
export const PERIOD_SLOTS = [
  { id: 1, label: "1st Period", startHour: 10, endHour: 11 },
  { id: 2, label: "2nd Period", startHour: 11, endHour: 12 },
  { id: 3, label: "3rd Period", startHour: 12, endHour: 13 },
  { id: 4, label: "4th Period", startHour: 13, endHour: 14 },
  { id: 5, label: "5th Period", startHour: 14, endHour: 15 },
  { id: 6, label: "6th Period", startHour: 15, endHour: 16 },
];

/**
 * Map a stored period start time to a slot id (1–6), or null if it does not match the grid.
 * Handles ISO instants and legacy "YYYY-MM-DD HH:mm" strings that parsed inconsistently on the server.
 */
export function getSlotIdFromDate(dateValue) {
  const d = new Date(dateValue);
  if (!Number.isNaN(d.getTime())) {
    const hour = d.getHours();
    const match = PERIOD_SLOTS.find((slot) => slot.startHour === hour);
    if (match) return match.id;
  }

  if (typeof dateValue === "string") {
    const trimmed = dateValue.trim();
    const legacy = trimmed.match(/^(\d{4}-\d{2}-\d{2})[ T](\d{1,2}:\d{2})/);
    if (legacy) {
      const iso = buildLocalPeriodIso(legacy[1], legacy[2]);
      if (iso) {
        const d2 = new Date(iso);
        if (!Number.isNaN(d2.getTime())) {
          const h2 = d2.getHours();
          return PERIOD_SLOTS.find((slot) => slot.startHour === h2)?.id ?? null;
        }
      }
    }
  }

  return null;
}

/**
 * Build an ISO string from YYYY-MM-DD and HH:mm using the browser's local timezone.
 * Avoids "YYYY-MM-DD HH:mm" parsing differences between Node and browsers.
 */
export function buildLocalPeriodIso(dateStr, timeStr) {
  if (!dateStr || !timeStr) return null;
  const dp = String(dateStr).trim().split("-");
  if (dp.length !== 3) return null;
  const y = Number(dp[0]);
  const mo = Number(dp[1]);
  const day = Number(dp[2]);
  const tp = String(timeStr).trim().split(":");
  const hh = Number(tp[0]);
  const mm = Number(tp[1] ?? 0);
  if ([y, mo, day, hh, mm].some((n) => Number.isNaN(n))) return null;
  const d = new Date(y, mo - 1, day, hh, mm, 0, 0);
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString();
}
