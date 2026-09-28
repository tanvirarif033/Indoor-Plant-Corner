import * as THREE from 'three';

import { createCamera } from './camera.js';
import { createRenderer } from './renderer.js';
import { createLighting } from './lighting.js';
import { createRoomStructure } from './roomStructure.js';
import { createTrim } from './trim.js';
import { createFoundation } from './foundation.js';
import { createCornerShadows } from './cornerShadows.js';
import { createRoomWindow } from './roomWindow.js';
import { createPlant, leafColors, colorNames } from './plant.js';
import { createLamp } from './lamp.js';
import { createDayNight } from './dayNight.js';
import { createClickToColor } from './clickToColor.js';
import { createCameraControls } from './cameraControls.js';
import { createKeyboardMovement } from './keyboardMovement.js';


try {
  init();
} catch (err) {

  const box =
    document.getElementById('fatalError');

  box.textContent =
    'Failed to start the 3D scene:\n\n' +
    err.stack;

  box.style.display = 'block';

  console.error(err);
}


function init() {

  // ============================================================
  // SCENE
  // ============================================================

  const scene =
    new THREE.Scene();

  scene.background =
    new THREE.Color(0xbfd3d9);


  // ============================================================
  // CAMERA + RENDERER
  // ============================================================

  const {
    camera,
    initialCameraPosition,
    initialCameraTarget
  } = createCamera();

  const renderer =
    createRenderer();


  // ============================================================
  // LIGHTING
  // ============================================================

  const {
    ambientLight,
    dirLight,
    windowLight,
    lampLight
  } = createLighting(scene);


  // ============================================================
  // ROOM (floor, walls, ceiling, front wall opening, trim,
  // foundation, outdoor ground, corner shadows)
  // ============================================================

  createRoomStructure(scene);

  createTrim(scene);

  const foundation =
    createFoundation(scene);

  const { outdoorGround } =
    foundation;

  createCornerShadows(
    scene,
    foundation
  );


  // ============================================================
  // WINDOW
  // ============================================================

  const {
    glassUniforms,
    updateWindowVisibility,
    updateWindowTexture
  } = createRoomWindow(scene, camera);


  // ============================================================
  // PLANT
  // ============================================================

  const {
    pot,
    potRim,
    soil,
    sunflower
  } = createPlant(scene);


  // ============================================================
  // PENDANT LAMP
  // ============================================================

  const { lampBulbMaterial } =
    createLamp(scene, lampLight);


  // ============================================================
  // DAY / NIGHT
  // ============================================================

  const dayNight =
    createDayNight({
      scene,
      ambientLight,
      dirLight,
      windowLight,
      lampLight,
      lampBulbMaterial,
      outdoorGround,
      glassUniforms,
      sunflower
    });


  // ============================================================
  // CLICKABLE PLANT
  // ============================================================

  const { cycleLeafColor } =
    createClickToColor({
      camera,
      pot,
      potRim,
      soil,
      sunflower,
      leafColors,
      colorNames
    });


  // ============================================================
  // ORBIT CONTROLS
  // ============================================================

  const {
    controls,
    clampToRoom,
    resetCamera
  } = createCameraControls({
    camera,
    renderer,
    initialCameraPosition,
    initialCameraTarget
  });


  // ============================================================
  // KEYBOARD
  // ============================================================

  const keyboardMovement =
    createKeyboardMovement({
      camera,
      controls,
      clampToRoom,
      toggleNight: dayNight.toggleNight,
      toggleLamp: dayNight.toggleLamp,
      cycleLeafColor,
      resetCamera
    });


  // ============================================================
  // RESIZE
  // ============================================================

  window.addEventListener(
    'resize',
    () => {

      camera.aspect =
        window.innerWidth /
        window.innerHeight;


      camera.updateProjectionMatrix();


      renderer.setSize(
        window.innerWidth,
        window.innerHeight
      );
    }
  );


  // ============================================================
  // ANIMATION
  // ============================================================

  const clock =
    new THREE.Clock();

  let elapsed = 0;

  let sceneryTimer = 0;


  function animate() {

    requestAnimationFrame(
      animate
    );


    // clamp delta so a background tab does not cause a huge jump
    const dt =
      Math.min(
        clock.getDelta(),
        0.1
      );

    elapsed += dt;


    // ----------------------------------------------------------
    // DAY / NIGHT TRANSITION + LAMP
    // ----------------------------------------------------------

    const nightMix =
      dayNight.update(dt);


    // ----------------------------------------------------------
    // SUNFLOWER SWAY (+ leaf shader time)
    // ----------------------------------------------------------

    sunflower.update(
      elapsed
    );


    // ----------------------------------------------------------
    // GLASS SHADER
    // ----------------------------------------------------------

    glassUniforms.uTime.value =
      elapsed;


    // ----------------------------------------------------------
    // WINDOW SIDE DETECTION
    // ----------------------------------------------------------

    updateWindowVisibility();


    // ----------------------------------------------------------
    // WINDOW SCENERY (clouds, trees, stars drift)
    //
    // Redrawn in place ~16 times per second, not every frame.
    // ----------------------------------------------------------

    sceneryTimer += dt;

    if (
      sceneryTimer > 0.06
    ) {

      sceneryTimer = 0;

      updateWindowTexture(
        nightMix,
        elapsed
      );
    }


    // ----------------------------------------------------------
    // KEYBOARD MOVEMENT + CONTROLS
    // ----------------------------------------------------------

    keyboardMovement.update(
      dt
    );

    controls.update();

    clampToRoom(
      camera.position
    );


    // ----------------------------------------------------------
    // RENDER
    // ----------------------------------------------------------

    renderer.render(
      scene,
      camera
    );
  }


  // ============================================================
  // START
  // ============================================================

  dayNight.setMode(
    false
  );

  dayNight.applyEnvironment();

  animate();
}
