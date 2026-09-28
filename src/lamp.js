import * as THREE from 'three';

import { createWallTexture } from './textures.js';
import { roomHeight } from './roomDimensions.js';

// ============================================================
// PENDANT LAMP (visual fixture for the lamp PointLight)
// ============================================================
export function createLamp(scene, lampLight) {

  const lampBulbMaterial =
    new THREE.MeshStandardMaterial({

      color: 0xfff1d0,

      emissive: 0xffc98a,

      emissiveIntensity: 0,

      roughness: 0.4
    });

  const lampGroup =
    new THREE.Group();

  lampGroup.position.set(
    lampLight.position.x,
    lampLight.position.y,
    lampLight.position.z
  );

  const lampCord =
    new THREE.Mesh(

      new THREE.CylinderGeometry(
        0.015,
        0.015,
        roomHeight - lampLight.position.y,
        6
      ),

      new THREE.MeshStandardMaterial({
        color: 0x222222,
        roughness: 0.6
      })
    );

  lampCord.position.y =
    (roomHeight - lampLight.position.y) / 2 + 0.05;

  lampGroup.add(
    lampCord
  );

  const lampShade =
    new THREE.Mesh(

      new THREE.ConeGeometry(
        0.32,
        0.28,
        24,
        1,
        true
      ),

      new THREE.MeshStandardMaterial({
        map: createWallTexture(),
        color: 0xd9c9a8,
        roughness: 0.8,
        side: THREE.DoubleSide
      })
    );

  lampShade.position.y =
    0.16;

  lampGroup.add(
    lampShade
  );

  const lampBulb =
    new THREE.Mesh(

      new THREE.SphereGeometry(
        0.1,
        16,
        12
      ),

      lampBulbMaterial
    );

  lampGroup.add(
    lampBulb
  );

  scene.add(
    lampGroup
  );

  return {
    lampGroup,
    lampCord,
    lampShade,
    lampBulb,
    lampBulbMaterial
  };
}
