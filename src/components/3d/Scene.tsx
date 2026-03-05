'use client';

import { Suspense, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars, Preload } from '@react-three/drei';
import * as THREE from 'three';
import { Globe } from './Globe';
import { WaterSurface } from './WaterSurface';
import { BuoyMarkers } from './BuoyMarkers';
import { ReefMarkers } from './ReefMarkers';
import { useOceanStore } from '@/store/oceanStore';
import { fetchBuoys, fetchHeatStressGrid, fetchReefCoordinates } from '@/lib/aquaLinkApi';

// Data bootstrap – runs once on mount, populates Zustand store
// Then polls buoy data every 30 seconds for live updates.
function DataLoader() {
    const { setBuoys, setHeatGrid, setReefs, setLoading } = useOceanStore();

    useEffect(() => {
        // Initial fetch
        Promise.all([fetchBuoys(), fetchHeatStressGrid(), fetchReefCoordinates()])
            .then(([buoys, heat, reefs]) => {
                setBuoys(buoys);
                setHeatGrid(heat);
                setReefs(reefs);
            })
            .catch(console.error)
            .finally(() => setLoading(false));

        // Live poll: refresh buoys every 30 seconds
        const pollId = setInterval(() => {
            fetchBuoys()
                .then(setBuoys)
                .catch(console.error);
        }, 30_000);

        return () => clearInterval(pollId);
    }, [setBuoys, setHeatGrid, setReefs, setLoading]);

    return null;
}

export function Scene() {
    return (
        <Canvas
            gl={{
                antialias: true,
                toneMapping: THREE.ACESFilmicToneMapping,
                outputColorSpace: THREE.SRGBColorSpace,
            }}
            camera={{ fov: 60, near: 0.1, far: 1000, position: [0, 0, 2.8] }}
            style={{ background: '#020b18' }}
            shadows
        >
            {/* ── Lighting ─────────────────────────────────────────── */}
            <ambientLight intensity={0.15} />
            {/* Sun – comes from upper-right */}
            <directionalLight
                position={[5, 3, 5]}
                intensity={2.2}
                color="#fff8e8"
                castShadow
            />
            {/* Fill light – subtle blue from opposite side */}
            <pointLight position={[-4, -2, -4]} intensity={0.4} color="#2060ff" />

            {/* ── Deep space background ────────────────────────────── */}
            <Stars
                radius={80}
                depth={60}
                count={6000}
                factor={4}
                saturation={0.3}
                fade
                speed={0.4}
            />

            {/* ── 3D Scene objects (suspended for texture loading) ─── */}
            <Suspense fallback={null}>
                <Globe />
                <WaterSurface />
                <BuoyMarkers />
                <ReefMarkers />
                <Preload all />
            </Suspense>

            {/* ── Camera controls ──────────────────────────────────── */}
            <OrbitControls
                enablePan={false}
                minDistance={1.6}
                maxDistance={6}
                rotateSpeed={0.4}
                zoomSpeed={0.6}
                autoRotate={false}
                enableDamping
                dampingFactor={0.07}
            />

            {/* Data bootstrap – invisible, runs inside Canvas context */}
            <DataLoader />
        </Canvas>
    );
}
