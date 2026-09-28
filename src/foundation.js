import * as THREE from 'three';

import {
  createConcreteTexture,
  createGrassTexture
} from './textures.js';

import {
  roomWidth,
  roomDepth,
  frontZ
} from './roomDimensions.js';

// ============================================================
// FOUNDATION + OUTDOOR GROUND
//
// Layers, top to bottom:
//   indoor wooden floor   y = 0
//   concrete slab         y = -0.455 .. -0.005 (under floor and walls)
//   grass                 y = -0.3   (slab stands 0.28 above it)
//
// The grass is a different material and sits below the floor,
// so it can never read as an extension of the wooden floor.
// ============================================================
export function createFoundation(scene) {

  const foundationThickness = 0.45;
  const foundationOverhang = 0.25;

  const foundationBackZ =
    -roomDepth / 2 - foundationOverhang;

  const foundationFrontZ =
    frontZ + foundationOverhang;

  const foundation =
    new THREE.Mesh(

      new THREE.BoxGeometry(
        roomWidth + foundationOverhang * 2,
        foundationThickness,
        foundationFrontZ - foundationBackZ
      ),

      new THREE.MeshStandardMaterial({
        map: createConcreteTexture(),
        roughness: 0.95,
        metalness: 0
      })
    );

  foundation.position.set(
    0,
    -0.005 - foundationThickness / 2,
    (foundationBackZ + foundationFrontZ) / 2
  );

  foundation.receiveShadow = true;

  foundation.castShadow = true;

  scene.add(
    foundation
  );


  const outdoorGround =
    new THREE.Mesh(

      new THREE.PlaneGeometry(
        80,
        80
      ),

      new THREE.MeshStandardMaterial({
        map: createGrassTexture(),
        roughness: 1,
        metalness: 0,
        side: THREE.FrontSide
      })
    );

  outdoorGround.rotation.x =
    -Math.PI / 2;

  outdoorGround.position.y =
    -0.3;

  outdoorGround.receiveShadow = true;

  scene.add(
    outdoorGround
  );

  return {
    outdoorGround,
    foundationBackZ,
    foundationFrontZ,
    foundationOverhang
  };
}
