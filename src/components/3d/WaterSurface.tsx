'use client';
import React from 'react';

import { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { shaderMaterial } from '@react-three/drei';
import { extend } from '@react-three/fiber';
import * as THREE from 'three';
import { useControls } from 'leva';
import { useOceanStore } from '@/store/oceanStore';
import { buildTemperatureTexture, normalizeTemperature } from '@/lib/geoUtils';

// Read GLSL as strings (webpack raw-loader style via ?raw import in Next.js)
const vertexShader = `
uniform float uTime;
uniform float uWaveAmplitude;
uniform float uWaveFrequency;

varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vPosition;

void main() {
  vUv = uv;
  vNormal = normalize(normalMatrix * normal);

  float wave1 = sin(position.x * uWaveFrequency + uTime * 1.2) * uWaveAmplitude;
  float wave2 = cos(position.z * uWaveFrequency * 0.8 + uTime * 0.9) * uWaveAmplitude * 0.6;
  float displacement = wave1 + wave2;

  vec3 displacedPosition = position + normal * displacement;
  vPosition = displacedPosition;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(displacedPosition, 1.0);
}
`;

const fragmentShader = `
uniform float uTime;
uniform sampler2D uTemperatureMap;
uniform float uOpacity;

varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vPosition;

vec3 temperatureColor(float t) {
  vec3 cold    = vec3(0.02, 0.12, 0.55);
  vec3 cool    = vec3(0.06, 0.60, 0.80);
  vec3 warm    = vec3(0.22, 0.78, 0.40);
  vec3 hot     = vec3(0.97, 0.78, 0.08);
  vec3 extreme = vec3(0.85, 0.10, 0.05);

  if (t < 0.25) return mix(cold,    cool,    t * 4.0);
  if (t < 0.50) return mix(cool,    warm,   (t - 0.25) * 4.0);
  if (t < 0.75) return mix(warm,    hot,    (t - 0.50) * 4.0);
               return mix(hot,     extreme,(t - 0.75) * 4.0);
}

float fresnel(vec3 viewDir, vec3 normal, float power) {
  return pow(1.0 - max(dot(viewDir, normal), 0.0), power);
}

void main() {
  float temp = texture2D(uTemperatureMap, vUv).r;
  float ripple = sin(vUv.x * 40.0 + uTime * 2.0) * cos(vUv.y * 35.0 + uTime * 1.5) * 0.04;
  temp = clamp(temp + ripple, 0.0, 1.0);

  vec3 baseColor = temperatureColor(temp);
  vec3 viewDir = normalize(cameraPosition - vPosition);
  float rim = pow(1.0 - max(dot(viewDir, vNormal), 0.0), 3.0);
  vec3 rimColor = mix(vec3(0.2, 0.6, 1.0), vec3(1.0), rim) * rim * 0.6;

  gl_FragColor = vec4(baseColor + rimColor, uOpacity);
}
`;

// Create the custom shader material type using Drei's shaderMaterial helper
const WaterMaterial = shaderMaterial(
    {
        uTime: 0,
        uWaveAmplitude: 0.004,
        uWaveFrequency: 8.0,
        uTemperatureMap: new THREE.DataTexture(new Uint8Array([0, 0, 0, 255]), 1, 1),
        uOpacity: 0.82,
    },
    vertexShader,
    fragmentShader
);

extend({ WaterMaterial });

// TypeScript declaration for the extended JSX element
declare module '@react-three/fiber' {
    interface ThreeElements {
        waterMaterial: React.JSX.IntrinsicElements['shaderMaterial'] & {
            uTime?: number;
            uWaveAmplitude?: number;
            uWaveFrequency?: number;
            uTemperatureMap?: THREE.Texture;
            uOpacity?: number;
        };
    }
}

const GRID_W = 36;
const GRID_H = 18;

export function WaterSurface() {
    const materialRef = useRef<THREE.ShaderMaterial>(null);
    const heatStressGrid = useOceanStore((s) => s.heatStressGrid);

    // Leva debug controls – shown in the panel at the top-right of the viewport
    const { waveAmplitude, waveFrequency, opacity } = useControls('🌊 Water Surface', {
        waveAmplitude: { value: 0.004, min: 0, max: 0.02, step: 0.001, label: 'Wave Height' },
        waveFrequency: { value: 8.0, min: 2, max: 20, step: 0.5, label: 'Wave Freq' },
        opacity: { value: 0.82, min: 0.4, max: 1.0, step: 0.01, label: 'Opacity' },
    });


    // Build temperature DataTexture whenever grid data changes
    const temperatureTexture = useMemo(() => {
        if (heatStressGrid.length === 0) {
            // Default: gradual warmth from poles (0) to equator (0.6)
            const defaults = Array.from({ length: GRID_W * GRID_H }, (_: unknown, i: number) => {
                const row = Math.floor(i / GRID_W);
                const lat = 90 - (row / GRID_H) * 180;
                return Math.max(0, 1 - Math.abs(lat) / 90) * 0.6;
            });
            return buildTemperatureTexture(defaults, GRID_W, GRID_H);
        }
        const temps = heatStressGrid.map((c: { lat: number; lng: number; temperature: number }) =>
            normalizeTemperature(c.temperature * 35) // grid stores 0-1, shader wants 0-1
        );
        return buildTemperatureTexture(temps, GRID_W, GRID_H);
    }, [heatStressGrid]);

    // Inject texture into material when it changes
    useEffect(() => {
        if (materialRef.current) {
            (materialRef.current as THREE.ShaderMaterial).uniforms.uTemperatureMap.value =
                temperatureTexture;
        }
    }, [temperatureTexture]);

    // Animate uTime every frame, also push leva values into uniforms
    useFrame(({ clock }) => {
        if (materialRef.current) {
            const u = (materialRef.current as THREE.ShaderMaterial).uniforms;
            u.uTime.value = clock.elapsedTime;
            u.uWaveAmplitude.value = waveAmplitude;
            u.uWaveFrequency.value = waveFrequency;
            u.uOpacity.value = opacity;
        }
    });

    return (
        // raycast={noop} prevents this transparent sphere from swallowing
        // pointer events that should reach the BuoyMarkers InstancedMesh below it.
        <mesh raycast={() => null}>
            <sphereGeometry args={[1.008, 64, 64]} />
            <waterMaterial
                ref={materialRef as React.Ref<THREE.ShaderMaterial>}
                transparent
                depthWrite={true}
                side={THREE.DoubleSide}
            />
        </mesh>
    );
}
