import * as THREE from 'three';

import {
  createPotTexture,
  createContactShadowTexture
} from './textures.js';

// ============================================================
// FLOWERPOT
// ============================================================
export function createPot(plantGroup) {

  const potTexture =
    createPotTexture();

  const potMaterial =
    new THREE.MeshStandardMaterial({

      map: potTexture,

      bumpMap: potTexture,

      bumpScale: 1.2,

      roughness: 0.88,

      metalness: 0
    });

  const pot =
    new THREE.Mesh(

      new THREE.CylinderGeometry(
        0.6,
        0.5,
        0.9,
        40
      ),

      potMaterial
    );

  pot.position.y =
    0.45;

  pot.castShadow = true;

  pot.receiveShadow = true;

  plantGroup.add(
    pot
  );


  // thick rolled rim of the pot
  const potRim =
    new THREE.Mesh(

      new THREE.CylinderGeometry(
        0.67,
        0.62,
        0.16,
        40
      ),

      potMaterial
    );

  potRim.position.y =
    0.82;

  potRim.castShadow = true;

  potRim.receiveShadow = true;

  plantGroup.add(
    potRim
  );


  // soft contact shadow so the pot visibly rests on the floor
  const potContactShadow =
    new THREE.Mesh(

      new THREE.PlaneGeometry(
        2,
        2
      ),

      new THREE.MeshBasicMaterial({

        map: createContactShadowTexture(),

        transparent: true,

        depthWrite: false,

        polygonOffset: true,

        polygonOffsetFactor: -2,

        polygonOffsetUnits: -2
      })
    );

  potContactShadow.rotation.x =
    -Math.PI / 2;

  potContactShadow.position.y =
    0.004;

  potContactShadow.renderOrder =
    1;

  plantGroup.add(
    potContactShadow
  );

  return {
    pot,
    potRim,
    potContactShadow
  };
}
