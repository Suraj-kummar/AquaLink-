import * as THREE from 'three';

/**
 * Convert geographic latitude/longitude to a 3D Cartesian position on a sphere.
 * Uses the standard spherical → Cartesian conversion.
 *
 * @param lat  Latitude in degrees  (-90 to 90)
 * @param lng  Longitude in degrees (-180 to 180)
 * @param radius Sphere radius (default 1.0 = unit sphere)
 * @returns THREE.Vector3 position on the sphere surface
 */
export function latLngToVector3(lat: number, lng: number, radius = 1.0): THREE.Vector3 {
    const phi = (90 - lat) * (Math.PI / 180); // polar angle from north pole
    const theta = (lng + 180) * (Math.PI / 180); // azimuthal angle

    const x = -radius * Math.sin(phi) * Math.cos(theta);
    const y = radius * Math.cos(phi);
    const z = radius * Math.sin(phi) * Math.sin(theta);

    return new THREE.Vector3(x, y, z);
}

/**
 * Normalize a temperature value to [0, 1] for shader uniforms.
 * @param temp   Raw temperature in °C
 * @param minT   Cold reference (e.g. 0°C)
 * @param maxT   Hot reference (e.g. 35°C)
 */
export function normalizeTemperature(temp: number, minT = 0, maxT = 35): number {
    return Math.min(1, Math.max(0, (temp - minT) / (maxT - minT)));
}

/**
 * Build a Uint8-backed DataTexture (width × height) from a flat array
 * of normalized temperature values [0,1]. Used as uTemperatureMap in shaders.
 *
 * Uses Uint8Array (universally supported) instead of Float32Array (requires
 * OES_texture_float WebGL extension, unavailable on many GPUs → black tears).
 */
export function buildTemperatureTexture(
    data: number[],
    width: number,
    height: number
): THREE.DataTexture {
    const size = width * height;
    const buffer = new Uint8Array(size * 4);

    for (let i = 0; i < size; i++) {
        const t = data[i] ?? 0;
        buffer[i * 4 + 0] = Math.round(t * 255); // R = temperature encoded 0-255
        buffer[i * 4 + 1] = 0;
        buffer[i * 4 + 2] = 0;
        buffer[i * 4 + 3] = 255;
    }

    const texture = new THREE.DataTexture(buffer, width, height, THREE.RGBAFormat);
    texture.needsUpdate = true;
    return texture;
}
