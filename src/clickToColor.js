import * as THREE from 'three';

// ============================================================
// CLICKABLE PLANT
//
// Click (not drag) on the pot, soil or any sunflower part to
// cycle its leaf tint.
// ============================================================
export function createClickToColor({
  camera,
  pot,
  potRim,
  soil,
  sunflower,
  leafColors,
  colorNames
}) {

  const raycaster =
    new THREE.Raycaster();


  const pointer =
    new THREE.Vector2();


  const clickableMeshes = [

    pot,
    potRim,
    soil,

    ...sunflower.clickTargets
  ];


  const colorLabel =
    document.getElementById(
      'colorLabel'
    );


  let colorIndex = 0;


  function cycleLeafColor() {

    colorIndex =
      (
        colorIndex + 1
      ) %
      leafColors.length;


    sunflower.setLeafTint(
      leafColors[
        colorIndex
      ]
    );


    if (colorLabel) {

      colorLabel.textContent =
        colorNames[
          colorIndex
        ];


      colorLabel.style.background =
        '#' +
        leafColors[
          colorIndex
        ].getHexString();
    }
  }


  let pointerDownAt = null;


  window.addEventListener(
    'pointerdown',
    (event) => {

      pointerDownAt = {
        x: event.clientX,
        y: event.clientY
      };
    }
  );


  window.addEventListener(
    'click',
    (event) => {

      // a drag (orbiting the view) is not a click on the plant
      if (
        pointerDownAt &&
        Math.hypot(
          event.clientX - pointerDownAt.x,
          event.clientY - pointerDownAt.y
        ) > 5
      ) {
        return;
      }


      pointer.x =
        (
          event.clientX /
          window.innerWidth
        ) *
        2 -
        1;


      pointer.y =
        -(
          event.clientY /
          window.innerHeight
        ) *
        2 +
        1;


      raycaster.setFromCamera(
        pointer,
        camera
      );


      const hits =
        raycaster.intersectObjects(
          clickableMeshes
        );


      if (
        hits.length > 0
      ) {

        cycleLeafColor();
      }
    }
  );

  return {
    cycleLeafColor
  };
}
