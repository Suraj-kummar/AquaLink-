'use client';

import dynamic from 'next/dynamic';
import { HUD } from '@/components/ui/HUD';
import { BuoyPanel } from '@/components/ui/BuoyPanel';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';

// Dynamically import the 3D Scene (WebGL) — SSR must be disabled for Three.js
const Scene = dynamic(
    () => import('@/components/3d/Scene').then((m) => ({ default: m.Scene })),
    { ssr: false, loading: () => <LoadingScreen /> }
);

function LoadingScreen() {
    return (
        <div className="fixed inset-0 bg-[#020b18] flex flex-col items-center justify-center gap-4 z-50">
            <div className="relative w-16 h-16">
                <div className="absolute inset-0 rounded-full border-2 border-cyan-500/30 animate-ping" />
                <div className="absolute inset-2 rounded-full border-2 border-cyan-400 animate-spin" />
                <span className="absolute inset-0 flex items-center justify-center text-2xl">🌊</span>
            </div>
            <p className="text-cyan-400 font-semibold tracking-widest text-sm uppercase animate-pulse">
                Initialising Digital Twin…
            </p>
        </div>
    );
}

export default function DashboardPage() {
    return (
        <main className="fixed inset-0 overflow-hidden">
            {/* 3D Canvas fills the whole viewport */}
            <div className="absolute inset-0">
                <ErrorBoundary>
                    <Scene />
                </ErrorBoundary>
            </div>

            {/* UI overlays on top */}
            <HUD />
            <BuoyPanel />
        </main>
    );
}
