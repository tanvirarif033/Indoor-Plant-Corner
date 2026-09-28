import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

import {
  roomWidth,
  roomHeight,
  roomDepth,
  frontZ
} from './roomDimensions.js';

// ============================================================
// ORBIT CONTROLS
// ============================================================
export function createCameraControls({
  camera,
  renderer,
  initialCameraPosition,
  initialCameraTarget
}) {

  const controls =
    new OrbitControls(
      camera,
      renderer.domElement
    );


  controls.enableDamping =
    true;


  controls.enablePan =
    true;


  controls.minDistance =
    1.5;


  controls.maxDistance =
    9;


  // never look from under the floor or straight up through the ceiling
  controls.minPolarAngle =
    0.35;


  controls.maxPolarAngle =
    Math.PI * 0.58;


  controls.target.copy(
    initialCameraTarget
  );

  controls.update();


  // keep the camera inside the enclosed room so the outside is never exposed
  const cameraLimits = {
    minX: -roomWidth / 2 + 0.6,
    maxX: roomWidth / 2 - 0.6,
    minY: 0.6,
    maxY: roomHeight - 0.6,
    minZ: -roomDepth / 2 + 0.6,
    maxZ: frontZ - 0.6
  };


  function clampToRoom(
    vector
  ) {

    vector.set(
      THREE.MathUtils.clamp(vector.x, cameraLimits.minX, cameraLimits.maxX),
      THREE.MathUtils.clamp(vector.y, cameraLimits.minY, cameraLimits.maxY),
      THREE.MathUtils.clamp(vector.z, cameraLimits.minZ, cameraLimits.maxZ)
    );
  }


  function resetCamera() {

    camera.position.copy(
      initialCameraPosition
    );

    controls.target.copy(
      initialCameraTarget
    );

    controls.update();
  }

  return {
    controls,
    clampToRoom,
    resetCamera
  };
}
