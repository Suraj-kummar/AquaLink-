'use client';

import { useOceanStore } from '@/store/oceanStore';
import type { OceanState, BuoyData } from '@/store/oceanStore';

// Temperature gradient stops matching the GLSL shader ramp
const LEGEND_STOPS = [
    { label: '< 10°C', color: '#031e8c' },
    { label: '15°C', color: '#0f99cc' },
    { label: '20°C', color: '#38c766' },
    { label: '28°C', color: '#f7c715' },
    { label: '> 35°C', color: '#d91a0d' },
];

export function HUD() {
    const buoys = useOceanStore((s: OceanState) => s.buoys);
    const isLoading = useOceanStore((s: OceanState) => s.isLoading);

    const activeCount = buoys.filter((b: BuoyData) => b.status === 'normal').length;
    const alertCount = buoys.filter((b: BuoyData) => b.status === 'alert').length;
    const offlineCount = buoys.filter((b: BuoyData) => b.status === 'offline').length;

    return (
        <>
            {/* ── Top-left: brand + buoy stats ─────────────────────── */}
            <div className="absolute top-3 left-3 sm:top-5 sm:left-5 z-20 flex flex-col gap-2 sm:gap-3">
                <div className="glass-card px-3 py-2 sm:px-5 sm:py-4">
                    <div className="flex items-center gap-2 mb-1">
                        <span className="text-cyan-400 text-lg sm:text-xl">🌊</span>
                        <h1 className="text-white font-bold text-base sm:text-lg tracking-wide">AquaLink</h1>
                        <span className="text-slate-400 text-xs ml-1 hidden sm:inline">Digital Twin</span>
                    </div>
                    <p className="text-slate-400 text-xs hidden sm:block">Ocean Monitoring Platform</p>
                </div>

                {!isLoading && (
                    <div className="glass-card px-3 py-2 sm:px-5 sm:py-3 flex flex-col gap-1.5">
                        <p className="text-slate-400 text-xs uppercase tracking-widest mb-1">Smart Buoys</p>
                        <Stat color="text-cyan-400" label="Active" value={activeCount} />
                        <Stat color="text-red-400" label="Alert" value={alertCount} />
                        <Stat color="text-slate-400" label="Offline" value={offlineCount} />
                    </div>
                )}

                {isLoading && (
                    <div className="glass-card px-5 py-3">
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-cyan-400 animate-pulse" />
                            <span className="text-slate-300 text-sm">Loading telemetry…</span>
                        </div>
                    </div>
                )}
            </div>

            {/* ── Bottom-right: heat stress legend ─────────────────── */}
            <div className="absolute bottom-4 right-3 sm:bottom-6 sm:right-5 z-20">
                <div className="glass-card px-5 py-4 min-w-[160px]">
                    <p className="text-slate-400 text-xs uppercase tracking-widest mb-3">Heat Stress Index</p>
                    <div className="flex flex-col gap-1.5">
                        {LEGEND_STOPS.map((stop) => (
                            <div key={stop.label} className="flex items-center gap-2">
                                <div
                                    className="w-3.5 h-3.5 rounded-sm flex-shrink-0"
                                    style={{ background: stop.color }}
                                />
                                <span className="text-slate-300 text-xs">{stop.label}</span>
                            </div>
                        ))}
                    </div>
                    <div
                        className="mt-3 h-2 rounded-full w-full"
                        style={{
                            background: 'linear-gradient(to right, #031e8c, #0f99cc, #38c766, #f7c715, #d91a0d)',
                        }}
                    />
                </div>
            </div>

            {/* ── Top-right: controls hint (hidden on mobile) ────────── */}
            <div className="absolute top-3 right-3 sm:top-5 sm:right-5 z-20 hidden sm:block">
                <div className="glass-card px-4 py-2">
                    <p className="text-slate-500 text-xs">Drag to rotate • Scroll to zoom • Click buoy</p>
                </div>
            </div>
        </>
    );
}

function Stat({ color, label, value }: { color: string; label: string; value: number }) {
    return (
        <div className="flex items-center justify-between gap-6">
            <span className="text-slate-400 text-xs">{label}</span>
            <span className={`${color} font-mono font-semibold text-sm`}>{value}</span>
        </div>
    );
}
