import * as THREE from 'three';

import { createSunflower } from './sunflower.js';
import { createPot } from './pot.js';
import { createSoil } from './soil.js';

// leaf tints cycled through by clicking the plant (see clickToColor.js)
export const leafColors = [

  new THREE.Color(
    0x3e9f4f
  ),

  new THREE.Color(
    0x7a57c6
  ),

  new THREE.Color(
    0xd9544d
  )
];

export const colorNames = [

  'GREEN',
  'PURPLE',
  'RED'
];

// ============================================================
// PLANT
//
// Assembles the pot, soil and sunflower into one group positioned
// in the corner of the room.
// ============================================================
export function createPlant(scene) {

  const plantGroup =
    new THREE.Group();

  plantGroup.position.set(
    0.8,
    0,
    2.2
  );

  scene.add(
    plantGroup
  );

  const { pot, potRim, potContactShadow } =
    createPot(plantGroup);

  const soil =
    createSoil(plantGroup);

  const sunflower =
    createSunflower({
      leafTint:
        leafColors[0]
    });

  plantGroup.add(
    sunflower.group
  );

  return {
    plantGroup,
    pot,
    potRim,
    potContactShadow,
    soil,
    sunflower
  };
}
