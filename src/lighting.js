import * as THREE from 'three';

// ============================================================
// LIGHTING
//
// - HemisphereLight: sky/ground bounce fill (soft ambient)
// - DirectionalLight: sun / moon, aimed THROUGH the window so
//   the walls and frame cast a real window-shaped light patch
// - PointLight (window): diffuse skylight spilling in
// - PointLight (lamp): warm pendant lamp, toggled with L
// ============================================================
export function createLighting(scene) {

  const ambientLight =
    new THREE.HemisphereLight(
      0xffffff,
      0xd0bfa6,
      0.9
    );

  scene.add(
    ambientLight
  );


  const dirLight =
    new THREE.DirectionalLight(
      0xfff1d4,
      3.0
    );

  dirLight.position.set(
    1.6,
    6,
    14
  );

  dirLight.target.position.set(
    0.8,
    1.5,
    2.2
  );

  dirLight.castShadow = true;

  dirLight.shadow.mapSize.set(
    2048,
    2048
  );

  dirLight.shadow.camera.left = -9;
  dirLight.shadow.camera.right = 9;
  dirLight.shadow.camera.top = 9;
  dirLight.shadow.camera.bottom = -9;
  dirLight.shadow.camera.near = 1;
  dirLight.shadow.camera.far = 40;
  dirLight.shadow.bias = -0.0004;
  dirLight.shadow.normalBias = 0.03;
  dirLight.shadow.radius = 3;

  scene.add(
    dirLight,
    dirLight.target
  );


  const windowLight =
    new THREE.PointLight(
      0xfff0d8,
      10,
      0,
      2
    );

  windowLight.position.set(
    0,
    3.4,
    4.4
  );

  scene.add(
    windowLight
  );


  const lampLight =
    new THREE.PointLight(
      0xffc98a,
      0,
      0,
      2
    );

  lampLight.position.set(
    0,
    5.3,
    0.5
  );

  scene.add(
    lampLight
  );

  return {
    ambientLight,
    dirLight,
    windowLight,
    lampLight
  };
}
