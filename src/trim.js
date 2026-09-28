import * as THREE from 'three';

import { createWallTexture } from './textures.js';

import {
  roomWidth,
  roomHeight,
  interiorDepth,
  interiorCenterZ,
  frameW,
  frontSideWidth,
  frontZ,
  windowCenterX,
  windowBottom,
  backZ
} from './roomDimensions.js';

// ============================================================
// TRIM + SILL (wall/floor and wall/ceiling contact, window depth)
// ============================================================
export function createTrim(scene) {

  const trimMaterial =
    new THREE.MeshStandardMaterial({
      map: createWallTexture(),
      color: 0xf1ece0,
      roughness: 0.55
    });

  const trimDepth = 0.06;
  const baseboardHeight = 0.28;
  const crownHeight = 0.2;

  // [width, height, depth, x, y, z]
  const trimPieces = [];

  [baseboardHeight, crownHeight].forEach(
    (h, i) => {

      const y =
        i === 0
          ? h / 2
          : roomHeight - h / 2;

      trimPieces.push(
        // back wall
        [roomWidth, h, trimDepth, 0, y, backZ + trimDepth / 2],
        // left / right walls
        [trimDepth, h, interiorDepth, -roomWidth / 2 + trimDepth / 2, y, interiorCenterZ],
        [trimDepth, h, interiorDepth, roomWidth / 2 - trimDepth / 2, y, interiorCenterZ],
        // front wall, either side of the window opening
        [frontSideWidth, h, trimDepth, -(roomWidth / 4 + frameW / 4), y, frontZ - trimDepth / 2],
        [frontSideWidth, h, trimDepth, roomWidth / 4 + frameW / 4, y, frontZ - trimDepth / 2]
      );
    }
  );

  // the crown molding above the window is a single run
  trimPieces.push(
    [frameW, crownHeight, trimDepth, 0, roomHeight - crownHeight / 2, frontZ - trimDepth / 2],
    [frameW, baseboardHeight, trimDepth, 0, baseboardHeight / 2, frontZ - trimDepth / 2],
    // window sill projecting into the room
    [frameW + 0.3, 0.07, 0.3, windowCenterX, windowBottom - 0.035, frontZ - 0.14]
  );

  trimPieces.forEach(
    ([w, h, d, x, y, z]) => {

      const piece =
        new THREE.Mesh(
          new THREE.BoxGeometry(w, h, d),
          trimMaterial
        );

      piece.position.set(x, y, z);

      piece.receiveShadow = true;

      scene.add(piece);
    }
  );
}
