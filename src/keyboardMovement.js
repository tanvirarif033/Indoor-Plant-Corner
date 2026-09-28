import * as THREE from 'three';

// ============================================================
// KEYBOARD
//
// N / Space  toggle day and night
// L          toggle the pendant lamp
// C          cycle the leaf color (same as clicking the plant)
// R          reset the camera
// W A S D / arrows   walk around the room
// Q / E      lower / raise the view
// ============================================================
export function createKeyboardMovement({
  camera,
  controls,
  clampToRoom,
  toggleNight,
  toggleLamp,
  cycleLeafColor,
  resetCamera
}) {

  const movementKeys = {

    w: 'forward',
    arrowup: 'forward',
    s: 'back',
    arrowdown: 'back',
    a: 'left',
    arrowleft: 'left',
    d: 'right',
    arrowright: 'right',
    q: 'down',
    e: 'up'
  };

  const activeMovement =
    new Set();


  window.addEventListener(
    'keydown',
    (event) => {

      const key =
        event.key.toLowerCase();


      if (
        movementKeys[key]
      ) {

        activeMovement.add(
          movementKeys[key]
        );

        event.preventDefault();

        return;
      }


      if (
        event.repeat
      ) {
        return;
      }


      if (
        key === 'n' ||
        event.code === 'Space'
      ) {

        toggleNight();

        event.preventDefault();

      } else if (
        key === 'l'
      ) {

        toggleLamp();

      } else if (
        key === 'c'
      ) {

        cycleLeafColor();

      } else if (
        key === 'r'
      ) {

        resetCamera();
      }
    }
  );


  window.addEventListener(
    'keyup',
    (event) => {

      const action =
        movementKeys[
          event.key.toLowerCase()
        ];

      if (action) {

        activeMovement.delete(
          action
        );
      }
    }
  );


  window.addEventListener(
    'blur',
    () => {

      activeMovement.clear();
    }
  );


  const moveForward =
    new THREE.Vector3();

  const moveRight =
    new THREE.Vector3();

  const moveDelta =
    new THREE.Vector3();

  const worldUp =
    new THREE.Vector3(0, 1, 0);


  function update(
    dt
  ) {

    if (
      activeMovement.size === 0
    ) {
      return;
    }


    camera.getWorldDirection(
      moveForward
    );

    moveForward.y = 0;

    moveForward.normalize();

    moveRight.crossVectors(
      moveForward,
      worldUp
    );


    moveDelta.set(0, 0, 0);

    if (activeMovement.has('forward')) moveDelta.add(moveForward);
    if (activeMovement.has('back')) moveDelta.sub(moveForward);
    if (activeMovement.has('right')) moveDelta.add(moveRight);
    if (activeMovement.has('left')) moveDelta.sub(moveRight);

    if (moveDelta.lengthSq() > 0) {

      moveDelta
        .normalize()
        .multiplyScalar(3.5 * dt);
    }

    if (activeMovement.has('up')) moveDelta.y += 2 * dt;
    if (activeMovement.has('down')) moveDelta.y -= 2 * dt;


    // move the camera and its orbit target together (walking, not orbiting)
    camera.position.add(
      moveDelta
    );

    controls.target.add(
      moveDelta
    );

    clampToRoom(
      controls.target
    );
  }

  return {
    update
  };
}
