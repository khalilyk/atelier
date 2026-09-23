// First-party page-view analytics. Client-safe: no server imports.
//
// Every view is written as its own small record, so nothing is ever overwritten
// and concurrent visits cannot lose each other's counts. A day's records are
// rolled up into one summary once the day is over.

export type ViewEvent = {
  path: string;        // "/journal/some-post"
  ref: string;         // referring host only, "" for direct
  country: string;     // two-letter code, "" if unknown
  city: string;        // "Sydney", "" if unknown
  device: "mobile" | "tablet" | "desktop";
  visitor: string;     // per-day hash: counts people without identifying them
  at: string;          // ISO timestamp
};

export type DaySummary = {
  day: string;                        // YYYY-MM-DD
  views: number;
  visitors: number;
  paths: Record<string, number>;
  refs: Record<string, number>;
  countries: Record<string, number>;
  cities: Record<string, number>;
  devices: Record<string, number>;
};

export const dayKey = (d: Date = new Date()) => d.toISOString().slice(0, 10);

/** The last n days, oldest first. */
export function recentDays(n: number): string[] {
  const out: string[] = [];
  const d = new Date();
  for (let i = n - 1; i >= 0; i--) {
    const x = new Date(d);
    x.setUTCDate(d.getUTCDate() - i);
    out.push(dayKey(x));
  }
  return out;
}

const bump = (map: Record<string, number>, key: string, by = 1) => {
  if (!key) return;
  map[key] = (map[key] ?? 0) + by;
};

/** Roll raw views into one day's summary. */
export function summarise(day: string, events: ViewEvent[]): DaySummary {
  const s: DaySummary = { day, views: 0, visitors: 0, paths: {}, refs: {}, countries: {}, cities: {}, devices: {} };
  const people = new Set<string>();
  for (const e of events) {
    s.views++;
    if (e.visitor) people.add(e.visitor);
    bump(s.paths, e.path);
    bump(s.refs, e.ref || "Direct");
    bump(s.countries, e.country);
    // A city is only meaningful with its country: "Newcastle" exists in several.
    if (e.city) bump(s.cities, e.country ? `${e.city}, ${e.country}` : e.city);
    bump(s.devices, e.device);
  }
  s.visitors = people.size;
  return s;
}

/** Add one day's summary into a running total. */
export function mergeSummaries(days: DaySummary[]) {
  const total: Omit<DaySummary, "day"> = { views: 0, visitors: 0, paths: {}, refs: {}, countries: {}, cities: {}, devices: {} };
  for (const d of days) {
    total.views += d.views;
    total.visitors += d.visitors; // a visitor is counted once per day
    for (const [k, v] of Object.entries(d.paths)) bump(total.paths, k, v);
    for (const [k, v] of Object.entries(d.refs)) bump(total.refs, k, v);
    for (const [k, v] of Object.entries(d.countries)) bump(total.countries, k, v);
    // Summaries written before cities were recorded simply have none.
    for (const [k, v] of Object.entries(d.cities ?? {})) bump(total.cities, k, v);
    for (const [k, v] of Object.entries(d.devices)) bump(total.devices, k, v);
  }
  return total;
}

/** The biggest entries of a counter, largest first. */
export const top = (map: Record<string, number>, n = 10) =>
  Object.entries(map).sort((a, b) => b[1] - a[1]).slice(0, n);

export const COUNTRY_NAMES: Record<string, string> = {
  AU: "Australia", NZ: "New Zealand", US: "United States", GB: "United Kingdom",
  CA: "Canada", SG: "Singapore", CN: "China", IN: "India", DE: "Germany",
  FR: "France", IT: "Italy", ES: "Spain", JP: "Japan", HK: "Hong Kong",
  AE: "United Arab Emirates", ID: "Indonesia", PH: "Philippines", MY: "Malaysia",
};

export const countryName = (code: string) => COUNTRY_NAMES[code] ?? code ?? "Unknown";

/** "Sydney, AU" reads better as "Sydney, Australia". */
export function cityName(key: string) {
  const at = key.lastIndexOf(", ");
  if (at === -1) return key;
  const city = key.slice(0, at);
  const code = key.slice(at + 2);
  return `${city}, ${countryName(code)}`;
}
