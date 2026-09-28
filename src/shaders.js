// Custom GLSL used by the scene.
//
// 1) Sunflower leaves: MeshStandardMaterial keeps the full Three.js lighting/shadow pipeline and
//    these chunks are injected into its shader with onBeforeCompile (see sunflower.js):
//      - vertex: wind flutter that grows toward the leaf tip
//      - fragment: procedural mottling + translucent fresnel rim (fades out at night)
// 2) Window glass: a complete hand-written ShaderMaterial (vertex + fragment) with a fresnel
//    reflection, a sweeping sheen and a smudge texture.

// ------------------------------------------------------------------ leaf chunks

export const leafVertexParsChunk = `
uniform float uTime;
uniform float uPhase;
uniform float uWind;
`;

// leaf geometry runs along -Z, so -position.z is the distance from the petiole
export const leafVertexTransformChunk = `
float leafReach = clamp(-position.z, 0.0, 1.6);
float leafWave = sin(uTime * 1.4 + uPhase + position.z * 2.2);
float leafFlutter = sin(uTime * 3.1 + uPhase * 1.7 + position.x * 9.0) * 0.35;
transformed.y += (leafWave + leafFlutter * 0.4) * 0.035 * uWind * leafReach;
transformed.x += sin(uTime * 1.1 + uPhase) * 0.012 * uWind * leafReach;
`;

export const leafFragmentParsChunk = `
uniform vec3 uRimColor;
uniform float uDay;
`;

export const leafFragmentColorChunk = `
{
  vec3 leafViewDir = normalize(vViewPosition);
  float leafFresnel = pow(1.0 - clamp(abs(dot(normalize(vNormal), leafViewDir)), 0.0, 1.0), 2.5);
  float leafMottle = 0.5 + 0.5 * sin(vMapUv.x * 23.0 + sin(vMapUv.y * 17.0) * 2.0) * sin(vMapUv.y * 29.0);
  gl_FragColor.rgb *= 0.93 + 0.14 * leafMottle;
  gl_FragColor.rgb += uRimColor * leafFresnel * 0.35 * uDay;
}
`;

// ------------------------------------------------------------------ window glass

export const glassVertexShader = `
varying vec2 vUv;
varying vec3 vNormalW;
varying vec3 vViewDir;

void main() {
  vUv = uv;
  vec4 worldPosition = modelMatrix * vec4(position, 1.0);
  vNormalW = normalize(mat3(modelMatrix) * normal);
  vViewDir = normalize(cameraPosition - worldPosition.xyz);
  gl_Position = projectionMatrix * viewMatrix * worldPosition;
}
`;

export const glassFragmentShader = `
uniform sampler2D uSmudge;
uniform vec3 uTint;
uniform float uOpacity;
uniform float uTime;
uniform float uNight;

varying vec2 vUv;
varying vec3 vNormalW;
varying vec3 vViewDir;

void main() {
  float fresnel = pow(1.0 - abs(dot(normalize(vNormalW), normalize(vViewDir))), 3.0);
  vec3 skyReflection = mix(vec3(0.75, 0.88, 1.0), vec3(0.08, 0.12, 0.22), uNight);
  float smudge = texture2D(uSmudge, vUv).r;

  // a soft diagonal highlight that slowly sweeps across the pane
  float band = fract((vUv.x + vUv.y * 0.6) * 0.7 - uTime * 0.03);
  float sheen = smoothstep(0.0, 0.06, band) * smoothstep(0.14, 0.06, band) * 0.5;

  vec3 color = mix(uTint, skyReflection, fresnel * 0.8);
  color += sheen * (1.0 - uNight * 0.8) + smudge * 0.25;

  float alpha = clamp(uOpacity + fresnel * 0.4 + smudge * 0.12 + sheen * 0.25, 0.0, 1.0);
  gl_FragColor = vec4(color, alpha);
  #include <colorspace_fragment>
}
`;
