'use client';

import { useRef, useMemo, useCallback, useEffect } from 'react';
import { useFrame, ThreeEvent } from '@react-three/fiber';
import * as THREE from 'three';
import { useOceanStore, BuoyData } from '@/store/oceanStore';
import { latLngToVector3 } from '@/lib/geoUtils';

// Colours keyed by buoy status
const STATUS_COLORS: Record<BuoyData['status'], THREE.Color> = {
    normal: new THREE.Color(0x00e5ff),  // cyan
    alert: new THREE.Color(0xff4d4d),  // red
    offline: new THREE.Color(0x888888),  // grey
};

const BUOY_RADIUS = 1.012; // sits just above water surface

/**
 * BuoyMarkers renders all Smart Buoy data points as a single InstancedMesh –
 * one WebGL draw call regardless of how many buoys there are.
 *
 * Optimization notes:
 *  - InstancedMesh: O(1) draw calls for N instances. Use for < ~100k points.
 *  - THREE.Points (particle system): use for > 100k points where geometry
 *    detail is less important.
 *  - setColorAt() + instanceColor.needsUpdate = true to update per-instance color.
 */
export function BuoyMarkers() {
    const instancedRef = useRef<THREE.InstancedMesh>(null);
    const buoys = useOceanStore((s: import('@/store/oceanStore').OceanState) => s.buoys);
    const selectBuoy = useOceanStore((s: import('@/store/oceanStore').OceanState) => s.selectBuoy);

    const dummy = useMemo(() => new THREE.Object3D(), []);

    // Set all instance transforms and colours when buoy data changes
    useEffect(() => {
        const mesh = instancedRef.current;
        if (!mesh || buoys.length === 0) return;

        buoys.forEach((buoy: BuoyData, i: number) => {
            if (i >= mesh.count) return;

            const pos = latLngToVector3(buoy.lat, buoy.lng, BUOY_RADIUS);

            // Orient the cone to point radially outward (away from globe center)
            dummy.position.copy(pos);
            dummy.lookAt(0, 0, 0);           // point toward origin
            dummy.rotateX(Math.PI);          // flip so cone tip points outward
            dummy.scale.setScalar(0.012);
            dummy.updateMatrix();

            mesh.setMatrixAt(i, dummy.matrix);
            mesh.setColorAt(i, STATUS_COLORS[buoy.status]);
        });

        mesh.instanceMatrix.needsUpdate = true;
        if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
    }, [buoys, dummy]);

    // Hover: pulse selected buoy slightly each frame
    useFrame(({ clock }) => {
        const mesh = instancedRef.current;
        if (!mesh) return;
        const selectedId = useOceanStore.getState().selectedBuoyId;
        const selectedIdx = buoys.findIndex((b: BuoyData) => b.id === selectedId);
        if (selectedIdx === -1) return;

        const buoy = buoys[selectedIdx];
        const pos = latLngToVector3(buoy.lat, buoy.lng, BUOY_RADIUS);
        const scale = 0.012 + Math.sin(clock.elapsedTime * 4) * 0.004;

        dummy.position.copy(pos);
        dummy.lookAt(0, 0, 0);
        dummy.rotateX(Math.PI);
        dummy.scale.setScalar(scale);
        dummy.updateMatrix();

        mesh.setMatrixAt(selectedIdx, dummy.matrix);
        mesh.instanceMatrix.needsUpdate = true;
    });

    const handleClick = useCallback(
        (e: ThreeEvent<MouseEvent>) => {
            e.stopPropagation();
            if (e.instanceId !== undefined) {
                const buoy = buoys[e.instanceId];
                if (buoy) selectBuoy(buoy.id);
            }
        },
        [buoys, selectBuoy]
    );

    if (buoys.length === 0) return null;

    return (
        <instancedMesh
            ref={instancedRef}
            args={[undefined, undefined, buoys.length]}
            onClick={handleClick}
            frustumCulled={false}
        >
            {/* Cone: pointy top, 4 radial segments for performance */}
            <coneGeometry args={[1, 2, 6]} />
            <meshStandardMaterial
                metalness={0.3}
                roughness={0.4}
                toneMapped={false}
            />
        </instancedMesh>
    );
}
