import * as THREE from 'three';

import { createEdgeShadowTexture } from './textures.js';

import {
  roomWidth,
  roomHeight,
  roomDepth,
  interiorDepth,
  interiorCenterZ,
  frontZ
} from './roomDimensions.js';

// ============================================================
// CONTACT / CORNER SHADOWS
//
// Soft ambient-occlusion strips where the walls meet the floor
// and the ceiling. They are simple textured decals a hair off
// the surface (polygonOffset prevents z-fighting).
// ============================================================
export function createCornerShadows(scene, foundation) {

  const {
    foundationBackZ,
    foundationFrontZ,
    foundationOverhang
  } = foundation;

  const edgeShadowMaterial =
    new THREE.MeshBasicMaterial({

      map: createEdgeShadowTexture(),

      transparent: true,

      depthWrite: false,

      polygonOffset: true,

      polygonOffsetFactor: -2,

      polygonOffsetUnits: -2
    });

  // dark ring on the grass where the slab meets the ground:
  // [edge x, edge z, yaw (local -Z points at the slab), strip length]
  const foundationDepth =
    foundationFrontZ - foundationBackZ;

  const foundationEdges = [
    [0, foundationBackZ, Math.PI, roomWidth + foundationOverhang * 2],
    [0, foundationFrontZ, 0, roomWidth + foundationOverhang * 2],
    [-roomWidth / 2 - foundationOverhang, (foundationBackZ + foundationFrontZ) / 2, -Math.PI / 2, foundationDepth],
    [roomWidth / 2 + foundationOverhang, (foundationBackZ + foundationFrontZ) / 2, Math.PI / 2, foundationDepth]
  ];

  foundationEdges.forEach(
    ([x, z, yaw, length]) => {

      const strip =
        new THREE.Mesh(
          new THREE.PlaneGeometry(
            length,
            0.8
          ),
          edgeShadowMaterial
        );

      strip.rotation.x =
        -Math.PI / 2;

      strip.position.z =
        0.4;

      strip.renderOrder = 1;

      const holder =
        new THREE.Group();

      holder.position.set(
        x,
        -0.296,
        z
      );

      holder.rotation.y =
        yaw;

      holder.add(
        strip
      );

      scene.add(
        holder
      );
    }
  );


  // [wall foot x, wall foot z, group yaw, strip length]
  const wallFeet = [
    [0, -roomDepth / 2, 0, roomWidth],
    [0, frontZ, Math.PI, roomWidth],
    [-roomWidth / 2, interiorCenterZ, Math.PI / 2, interiorDepth],
    [roomWidth / 2, interiorCenterZ, -Math.PI / 2, interiorDepth]
  ];

  wallFeet.forEach(
    ([x, z, yaw, length]) => {

      [false, true].forEach(
        (isCeiling) => {

          const strip =
            new THREE.Mesh(
              new THREE.PlaneGeometry(
                length,
                0.8
              ),
              edgeShadowMaterial
            );

          strip.rotation.x =
            isCeiling
              ? Math.PI / 2
              : -Math.PI / 2;

          strip.position.z =
            isCeiling
              ? -0.4
              : 0.4;

          strip.renderOrder = 1;

          const holder =
            new THREE.Group();

          holder.position.set(
            x,
            isCeiling
              ? roomHeight - 0.004
              : 0.004,
            z
          );

          holder.rotation.y =
            isCeiling
              ? yaw + Math.PI
              : yaw;

          holder.add(
            strip
          );

          scene.add(
            holder
          );
        }
      );
    }
  );
}
