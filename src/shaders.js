// custom shader applied to the plant leaves
// vertex shader: standard position transform, passes UV through
// fragment shader: samples the leaf texture, tints it with the clicked plant color,
// and adds a small animated brightness wave so the shader is visibly "alive"

export const leafVertexShader = `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

export const leafFragmentShader = `
uniform sampler2D map;
uniform vec3 plantColor;
uniform float time;
varying vec2 vUv;

void main() {
  vec4 texColor = texture2D(map, vUv);
  float wave = sin(time * 2.0 + vUv.y * 5.0) * 0.05;
  vec3 finalColor = texColor.rgb * plantColor + wave;
  gl_FragColor = vec4(finalColor, texColor.a);
}
`;
