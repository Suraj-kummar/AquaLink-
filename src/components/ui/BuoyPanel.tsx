'use client';

import { useOceanStore } from '@/store/oceanStore';
import type { OceanState, BuoyData } from '@/store/oceanStore';

export function BuoyPanel() {
    const buoys = useOceanStore((s: OceanState) => s.buoys);
    const selectedId = useOceanStore((s: OceanState) => s.selectedBuoyId);
    const selectBuoy = useOceanStore((s: OceanState) => s.selectBuoy);

    const buoy = buoys.find((b: BuoyData) => b.id === selectedId) ?? null;

    const statusStyle: Record<string, string> = {
        normal: 'text-cyan-400 bg-cyan-400/10 border-cyan-400/30',
        alert: 'text-red-400 bg-red-400/10 border-red-400/30',
        offline: 'text-slate-400 bg-slate-600/10 border-slate-500/30',
    };

    return (
        <div
            className={`
        fixed bottom-0 left-0 right-0 z-20
        sm:absolute sm:right-5 sm:top-1/2 sm:-translate-y-1/2 sm:bottom-auto sm:left-auto sm:w-72
        transform transition-all duration-500 ease-out
        ${buoy ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-full sm:translate-y-0 sm:translate-x-20 pointer-events-none'}
      `}
        >
            {buoy && (
                <div className="glass-card px-6 py-5 flex flex-col gap-4">
                    {/* Header */}
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-slate-400 text-xs uppercase tracking-widest">Smart Buoy</p>
                            <h2 className="text-white font-bold text-lg font-mono">{buoy.id}</h2>
                        </div>
                        <button
                            onClick={() => selectBuoy(null)}
                            className="text-slate-500 hover:text-white transition-colors text-lg leading-none mt-1"
                            aria-label="Close"
                        >
                            ✕
                        </button>
                    </div>

                    {/* Status badge */}
                    <span
                        className={`
              inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium
              border self-start uppercase tracking-wide
              ${statusStyle[buoy.status]}
            `}
                    >
                        <span className={`w-1.5 h-1.5 rounded-full ${buoy.status === 'normal' ? 'bg-cyan-400 animate-pulse' :
                            buoy.status === 'alert' ? 'bg-red-400 animate-ping' :
                                'bg-slate-400'
                            }`} />
                        {buoy.status}
                    </span>

                    {/* Telemetry rows */}
                    <div className="flex flex-col gap-2 border-t border-white/5 pt-4">
                        <TelemetryRow icon="🌡️" label="Temperature" value={`${buoy.temperature.toFixed(1)} °C`}
                            accent={buoy.temperature > 30 ? 'text-orange-400' : 'text-cyan-300'} />
                        <TelemetryRow icon="💧" label="Salinity" value={`${buoy.salinity.toFixed(1)} PSU`} />
                        <TelemetryRow icon="📏" label="Depth" value={`${buoy.depth.toFixed(0)} m`} />
                        <TelemetryRow icon="📍" label="Latitude" value={`${buoy.lat.toFixed(4)}°`} />
                        <TelemetryRow icon="📍" label="Longitude" value={`${buoy.lng.toFixed(4)}°`} />
                    </div>

                    {/* Last updated */}
                    <p className="text-slate-600 text-xs border-t border-white/5 pt-3">
                        Updated: {new Date(buoy.lastUpdated).toLocaleTimeString()}
                    </p>
                </div>
            )}
        </div>
    );
}

function TelemetryRow({
    icon, label, value, accent = 'text-slate-200',
}: {
    icon: string; label: string; value: string; accent?: string;
}) {
    return (
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
                <span className="text-sm">{icon}</span>
                <span className="text-slate-400 text-sm">{label}</span>
            </div>
            <span className={`font-mono text-sm font-semibold ${accent}`}>{value}</span>
        </div>
    );
}
