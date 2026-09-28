import * as THREE from 'three';

// CAMERA
export function createCamera() {

  const camera =
    new THREE.PerspectiveCamera(
      60,
      window.innerWidth /
        window.innerHeight,
      0.1,
      60
    );

  // human-eye view from inside the room: floor below, ceiling above, window and plant ahead
  const initialCameraPosition =
    new THREE.Vector3(
      -1.6,
      2.3,
      -3.8
    );

  const initialCameraTarget =
    new THREE.Vector3(
      0.8,
      3.0,
      2.2
    );

  camera.position.copy(
    initialCameraPosition
  );

  camera.lookAt(
    initialCameraTarget
  );

  return {
    camera,
    initialCameraPosition,
    initialCameraTarget
  };
}
