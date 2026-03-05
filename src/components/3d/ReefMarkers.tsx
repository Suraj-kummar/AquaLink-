'use client';

import { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { useOceanStore } from '@/store/oceanStore';
import { latLngToVector3 } from '@/lib/geoUtils';
import type { ReefCoord } from '@/store/oceanStore';

const REEF_RADIUS = 1.018; // just above water surface & buoys

function ReefPin({ reef }: { reef: ReefCoord }) {
    const groupRef = useRef<THREE.Group>(null);
    const [hovered, setHovered] = useState(false);

    const pos = latLngToVector3(reef.lat, reef.lng, REEF_RADIUS);

    // Orient group radially outward from globe centre
    const up = pos.clone().normalize();
    const quaternion = new THREE.Quaternion().setFromUnitVectors(
        new THREE.Vector3(0, 1, 0),
        up
    );

    // Gentle pulse animation on the glow sphere
    useFrame(({ clock }) => {
        if (groupRef.current) {
            const s = 1 + Math.sin(clock.elapsedTime * 2.5) * 0.15;
            // only scale the first child (glow sphere)
            const glow = groupRef.current.children[0];
            if (glow) glow.scale.setScalar(s);
        }
    });

    return (
        <group
            ref={groupRef}
            position={pos}
            quaternion={quaternion}
            onPointerOver={() => setHovered(true)}
            onPointerOut={() => setHovered(false)}
        >
            {/* Pulsing glow sphere */}
            <mesh>
                <sphereGeometry args={[0.008, 8, 8]} />
                <meshStandardMaterial
                    color="#00ffd5"
                    emissive="#00ffd5"
                    emissiveIntensity={hovered ? 4 : 2}
                    toneMapped={false}
                    transparent
                    opacity={0.9}
                />
            </mesh>

            {/* Stem cylinder */}
            <mesh position={[0, 0.012, 0]}>
                <cylinderGeometry args={[0.0015, 0.003, 0.024, 6]} />
                <meshStandardMaterial
                    color="#00ffd5"
                    emissive="#00ffd5"
                    emissiveIntensity={1}
                    toneMapped={false}
                />
            </mesh>

            {/* Hover label */}
            {hovered && (
                <Html
                    position={[0, 0.04, 0]}
                    center
                    style={{ pointerEvents: 'none' }}
                >
                    <div
                        style={{
                            background: 'rgba(0,15,30,0.85)',
                            border: '1px solid rgba(0,255,213,0.4)',
                            borderRadius: 6,
                            padding: '4px 10px',
                            color: '#00ffd5',
                            fontSize: 11,
                            fontFamily: 'monospace',
                            whiteSpace: 'nowrap',
                            boxShadow: '0 0 12px rgba(0,255,213,0.3)',
                        }}
                    >
                        🪸 {reef.name}
                    </div>
                </Html>
            )}
        </group>
    );
}

export function ReefMarkers() {
    const reefs = useOceanStore((s) => s.reefs);
    if (reefs.length === 0) return null;
    return (
        <>
            {reefs.map((reef) => (
                <ReefPin key={reef.id} reef={reef} />
            ))}
        </>
    );
}
