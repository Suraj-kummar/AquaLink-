'use client';

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import * as THREE from 'three';

export function Globe() {
    const meshRef = useRef<THREE.Mesh>(null);

    // Earth textures – use free NASA/public domain textures via URL
    const [earthMap, normalMap, specularMap] = useTexture([
        'https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/planets/earth_atmos_2048.jpg',
        'https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/planets/earth_normal_2048.jpg',
        'https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/planets/earth_specular_2048.jpg',
    ]);

    // Atmosphere shader (additive glow ring)
    const atmosphereMaterial = useMemo(
        () =>
            new THREE.ShaderMaterial({
                vertexShader: `
          varying vec3 vNormal;
          void main() {
            vNormal = normalize(normalMatrix * normal);
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,
                fragmentShader: `
          varying vec3 vNormal;
          void main() {
            float intensity = pow(0.65 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 4.0);
            gl_FragColor = vec4(0.3, 0.6, 1.0, 1.0) * intensity;
          }
        `,
                blending: THREE.AdditiveBlending,
                side: THREE.BackSide,
                transparent: true,
            }),
        []
    );

    useFrame((_state, delta) => {
        if (meshRef.current) {
            meshRef.current.rotation.y += delta * 0.04; // slow auto-rotation
        }
    });

    return (
        <group>
            {/* Earth sphere */}
            <mesh ref={meshRef} castShadow receiveShadow>
                <sphereGeometry args={[1, 64, 64]} />
                <meshPhongMaterial
                    map={earthMap}
                    normalMap={normalMap}
                    specularMap={specularMap}
                    specular={new THREE.Color(0x333333)}
                    shininess={15}
                />
            </mesh>

            {/* Atmosphere glow */}
            <mesh scale={[1.08, 1.08, 1.08]}>
                <sphereGeometry args={[1, 32, 32]} />
                <primitive object={atmosphereMaterial} />
            </mesh>
        </group>
    );
}
