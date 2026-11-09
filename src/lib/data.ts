import fs from 'node:fs';
import path from 'node:path';

export type Facility = {
  id: string; name: string; city: string; area: string; facility_type: string;
  lat: number; lon: number; amenities: string[]; access: 'free' | 'paid' | 'unknown';
  hours: string; notes: string; source: string; source_url: string; verified_at: string;
};

const CITY_META = [
  { slug: 'ahmedabad', name: 'Ahmedabad', state: 'Gujarat' },
  { slug: 'bengaluru', name: 'Bengaluru', state: 'Karnataka' },
  { slug: 'chennai', name: 'Chennai', state: 'Tamil Nadu' },
  { slug: 'delhi', name: 'Delhi', state: 'Delhi' },
  { slug: 'hyderabad', name: 'Hyderabad', state: 'Telangana' },
  { slug: 'jaipur', name: 'Jaipur', state: 'Rajasthan' },
  { slug: 'kolkata', name: 'Kolkata', state: 'West Bengal' },
  { slug: 'lucknow', name: 'Lucknow', state: 'Uttar Pradesh' },
  { slug: 'mumbai', name: 'Mumbai', state: 'Maharashtra' },
  { slug: 'pune', name: 'Pune', state: 'Maharashtra' },
];

const DATA = path.resolve('./data/cities');

function read(slug: string): Facility[] {
  const p = path.join(DATA, `${slug}.json`);
  if (!fs.existsSync(p)) return [];
  try { return JSON.parse(fs.readFileSync(p, 'utf8')) as Facility[]; } catch { return []; }
}

export const cities = CITY_META.map((c) => {
  const f = read(c.slug);
  return { ...c, count: f.length };
});

export function cityBySlug(slug: string) {
  const c = cities.find((x) => x.slug === slug);
  if (!c) return undefined;
  return { ...c, facilities: read(slug) };
}

export const FACILITY_TYPES = ['mall', 'metro', 'airport', 'hospital', 'office', 'fuel-station', 'public'];
export const AMENITIES = ['baby_changing', 'women_only', 'family_room', 'wheelchair', 'attendant', 'unisex'];

export function label(key: string): string {
  const m: Record<string, string> = {
    mall: 'Malls', metro: 'Metro stations', airport: 'Airports', hospital: 'Hospitals',
    office: 'Offices', 'fuel-station': 'Fuel stations', public: 'Public washrooms',
    baby_changing: 'Baby changing', women_only: 'Women-only', family_room: 'Family room',
    wheelchair: 'Wheelchair accessible', attendant: 'Attended', unisex: 'Unisex',
  };
  return m[key] ?? key;
}

/** Anti-doorway guard: a facet page exists only when the city has >= 3 such facilities. */
export const FACET_MIN = 3;

export function facetCount(facilities: Facility[], facet: string): number {
  return facilities.filter((f) => f.facility_type === facet || f.amenities.includes(facet)).length;
}

export function facetsFor(facilities: Facility[]) {
  const out: { key: string; kind: 'type' | 'amenity'; count: number }[] = [];
  for (const t of FACILITY_TYPES) {
    const n = facilities.filter((f) => f.facility_type === t).length;
    if (n >= FACET_MIN) out.push({ key: t, kind: 'type', count: n });
  }
  for (const a of AMENITIES) {
    const n = facilities.filter((f) => f.amenities.includes(a)).length;
    if (n >= FACET_MIN) out.push({ key: a, kind: 'amenity', count: n });
  }
  return out;
}

export function byFacet(facilities: Facility[], facet: string): Facility[] {
  return facilities.filter((f) => f.facility_type === facet || f.amenities.includes(facet));
}
