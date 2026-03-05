import { create } from 'zustand';

export interface BuoyData {
    id: string;
    lat: number;
    lng: number;
    temperature: number; // °C
    salinity: number;    // PSU
    depth: number;       // m
    status: 'normal' | 'alert' | 'offline';
    lastUpdated: string;
}

export interface HeatCell {
    lat: number;
    lng: number;
    temperature: number; // normalized 0–1
}

export interface ReefCoord {
    id: string;
    name: string;
    lat: number;
    lng: number;
}

export interface OceanState {
    buoys: BuoyData[];
    heatStressGrid: HeatCell[];
    reefs: ReefCoord[];
    selectedBuoyId: string | null;
    isLoading: boolean;
    // Actions
    setBuoys: (buoys: BuoyData[]) => void;
    setHeatGrid: (grid: HeatCell[]) => void;
    setReefs: (reefs: ReefCoord[]) => void;
    selectBuoy: (id: string | null) => void;
    setLoading: (loading: boolean) => void;
}

export const useOceanStore = create<OceanState>((set) => ({
    buoys: [],
    heatStressGrid: [],
    reefs: [],
    selectedBuoyId: null,
    isLoading: true,

    setBuoys: (buoys) => set({ buoys }),
    setHeatGrid: (heatStressGrid) => set({ heatStressGrid }),
    setReefs: (reefs) => set({ reefs }),
    selectBuoy: (selectedBuoyId) => set({ selectedBuoyId }),
    setLoading: (isLoading) => set({ isLoading }),
}));
