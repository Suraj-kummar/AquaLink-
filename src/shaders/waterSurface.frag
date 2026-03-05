uniform float uTime;
uniform sampler2D uTemperatureMap;
uniform float uOpacity;

varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vPosition;

// ── Temperature colour ramp ───────────────────────────────────────────────────
// Maps normalised temperature [0,1] → colour gradient:
//   0.0  deep blue  (cold polar)
//   0.25 cyan       (cool)
//   0.5  green      (temperate)
//   0.75 yellow     (warm)
//   1.0  red        (heat stress)
vec3 temperatureColor(float t) {
  vec3 cold    = vec3(0.02, 0.12, 0.55);  // deep blue
  vec3 cool    = vec3(0.06, 0.60, 0.80);  // cyan
  vec3 warm    = vec3(0.22, 0.78, 0.40);  // green
  vec3 hot     = vec3(0.97, 0.78, 0.08);  // yellow
  vec3 extreme = vec3(0.85, 0.10, 0.05);  // red

  if (t < 0.25) return mix(cold,    cool,    t * 4.0);
  if (t < 0.50) return mix(cool,    warm,   (t - 0.25) * 4.0);
  if (t < 0.75) return mix(warm,    hot,    (t - 0.50) * 4.0);
               return mix(hot,     extreme,(t - 0.75) * 4.0);
}

// ── Fresnel rim glow ─────────────────────────────────────────────────────────
float fresnel(vec3 viewDir, vec3 normal, float power) {
  return pow(1.0 - max(dot(viewDir, normal), 0.0), power);
}

void main() {
  // Sample temperature from the DataTexture
  float temp = texture2D(uTemperatureMap, vUv).r;

  // Subtle animated ripple modulation on the color
  float ripple = sin(vUv.x * 40.0 + uTime * 2.0) * cos(vUv.y * 35.0 + uTime * 1.5) * 0.04;
  temp = clamp(temp + ripple, 0.0, 1.0);

  vec3 baseColor = temperatureColor(temp);

  // Fresnel: bright rim at grazing angles (ocean horizon glow)
  vec3 viewDir = normalize(cameraPosition - vPosition);
  float rim = fresnel(viewDir, vNormal, 3.0);
  vec3 rimColor = mix(vec3(0.2, 0.6, 1.0), vec3(1.0), rim) * rim * 0.6;

  vec3 finalColor = baseColor + rimColor;

  gl_FragColor = vec4(finalColor, uOpacity);
}
