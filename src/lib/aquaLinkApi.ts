import type { BuoyData, HeatCell, ReefCoord } from '@/store/oceanStore';

const API_BASE = process.env.NEXT_PUBLIC_AQUAINK_API_URL ?? '';

// ─── Mock Data (used when API_BASE is empty / offline) ────────────────────────

function generateMockBuoys(count = 60): BuoyData[] {
    const statuses: BuoyData['status'][] = ['normal', 'normal', 'normal', 'alert', 'offline'];
    return Array.from({ length: count }, (_, i) => ({
        id: `buoy-${String(i + 1).padStart(3, '0')}`,
        lat: (Math.random() - 0.5) * 140,  // -70° to 70°
        lng: (Math.random() - 0.5) * 360,  // -180° to 180°
        temperature: 10 + Math.random() * 25,
        salinity: 30 + Math.random() * 8,
        depth: 5 + Math.random() * 200,
        status: statuses[Math.floor(Math.random() * statuses.length)],
        lastUpdated: new Date().toISOString(),
    }));
}

function generateMockHeatGrid(gridSize = 36): HeatCell[] {
    const cells: HeatCell[] = [];
    for (let lat = -90; lat <= 90; lat += 180 / gridSize) {
        for (let lng = -180; lng <= 180; lng += 360 / gridSize) {
            // Simple model: warmer near equator, cooler toward poles
            const equatorFactor = 1 - Math.abs(lat) / 90;
            const noise = (Math.random() - 0.5) * 0.3;
            cells.push({ lat, lng, temperature: Math.min(1, Math.max(0, equatorFactor * 0.85 + noise)) });
        }
    }
    return cells;
}

const MOCK_REEFS: ReefCoord[] = [
    { id: 'reef-gbr', name: 'Great Barrier Reef', lat: -18.2871, lng: 147.6992 },
    { id: 'reef-coral', name: 'Coral Triangle', lat: -2.0, lng: 121.0 },
    { id: 'reef-carib', name: 'Caribbean Reef System', lat: 17.5, lng: -66.5 },
    { id: 'reef-mald', name: 'Maldives Atoll', lat: 3.2028, lng: 73.2207 },
    { id: 'reef-red', name: 'Red Sea Reef', lat: 22.0, lng: 38.0 },
];

// ─── API Fetchers ──────────────────────────────────────────────────────────────

async function apiFetch<T>(path: string): Promise<T> {
    const res = await fetch(`${API_BASE}${path}`, { next: { revalidate: 30 } });
    if (!res.ok) throw new Error(`AquaLink API error: ${res.status} ${path}`);
    return res.json() as Promise<T>;
}

export async function fetchBuoys(): Promise<BuoyData[]> {
    if (!API_BASE) return generateMockBuoys(80);
    return apiFetch<BuoyData[]>('/api/buoys');
}

export async function fetchHeatStressGrid(): Promise<HeatCell[]> {
    if (!API_BASE) return generateMockHeatGrid(36);
    return apiFetch<HeatCell[]>('/api/heat-stress');
}

export async function fetchReefCoordinates(): Promise<ReefCoord[]> {
    if (!API_BASE) return MOCK_REEFS;
    return apiFetch<ReefCoord[]>('/api/reefs');
}
