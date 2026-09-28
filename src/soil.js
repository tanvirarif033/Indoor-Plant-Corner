import * as THREE from 'three';

import { createSoilTexture } from './textures.js';

// ============================================================
// SOIL
//
// A lumpy mound (displaced hemisphere) rising above the rim,
// so the stem visibly grows out of the earth.
// ============================================================
export function createSoil(plantGroup) {

  const soilGeometry =
    new THREE.SphereGeometry(
      1,
      40,
      14,
      0,
      Math.PI * 2,
      0,
      Math.PI / 2
    );

  {
    const position =
      soilGeometry.attributes.position;

    for (
      let i = 0;
      i < position.count;
      i++
    ) {

      const x = position.getX(i);
      const y = position.getY(i);
      const z = position.getZ(i);

      const lump =
        (
          Math.sin(x * 9 + z * 5) +
          Math.cos(z * 11 - x * 4)
        ) * 0.025 * y;

      position.setY(
        i,
        y + lump
      );
    }

    soilGeometry.computeVertexNormals();
  }

  const soilTexture =
    createSoilTexture();

  soilTexture.repeat.set(
    2,
    2
  );

  const soil =
    new THREE.Mesh(

      soilGeometry,

      new THREE.MeshStandardMaterial({

        map: soilTexture,

        bumpMap: soilTexture,

        bumpScale: 2,

        roughness: 1,

        metalness: 0
      })
    );

  soil.scale.set(
    0.6,
    0.11,
    0.6
  );

  soil.position.y =
    0.88;

  soil.castShadow = true;

  soil.receiveShadow = true;

  plantGroup.add(
    soil
  );

  return soil;
}
