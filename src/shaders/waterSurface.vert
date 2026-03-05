uniform float uTime;
uniform float uWaveAmplitude;
uniform float uWaveFrequency;

varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vPosition;

void main() {
  vUv = uv;
  vNormal = normalize(normalMatrix * normal);

  // Wave displacement along the normal direction
  float wave1 = sin(position.x * uWaveFrequency + uTime * 1.2) * uWaveAmplitude;
  float wave2 = cos(position.z * uWaveFrequency * 0.8 + uTime * 0.9) * uWaveAmplitude * 0.6;
  float displacement = wave1 + wave2;

  vec3 displacedPosition = position + normal * displacement;

  vPosition = displacedPosition;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(displacedPosition, 1.0);
}
