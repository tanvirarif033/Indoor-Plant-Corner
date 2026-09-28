import * as THREE from 'three';

import {
  createFrameTexture,
  createGlassSurfaceTexture,
  createGlassTexture
} from './textures.js';

import { glassVertexShader, glassFragmentShader } from './shaders.js';

import {
  frameW,
  frameH,
  windowCenterX,
  windowCenterY,
  frontZ
} from './roomDimensions.js';

// ============================================================
// WINDOW GROUP, FRAME, GLASS AND OUTSIDE SCENERY
//
// The window is built from three independent pieces:
//
// - the wooden frame (a fixed set of boxes)
// - the actual glass (a hand-written GLSL shader: fresnel
//   reflection, sweeping sheen and a smudge texture)
// - the outside scenery, a SEPARATE physical surface that sits
//   BEHIND the window from the room's perspective, so the plant
//   is physically closer to the camera when viewed from outside
//
// `camera` is needed to tell which side of the glass the viewer
// is currently on, so the scenery can be hidden once the camera
// walks outside (INSIDE -> scenery, OUTSIDE -> plant).
// ============================================================
export function createRoomWindow(scene, camera) {

  // ============================================================
  // WINDOW GROUP
  // ============================================================

  const windowGroup =
    new THREE.Group();

  windowGroup.position.set(
    windowCenterX,
    windowCenterY,
    frontZ
  );

  scene.add(
    windowGroup
  );


  // ============================================================
  // WINDOW FRAME
  // ============================================================

  const frameMat =
    new THREE.MeshStandardMaterial({

      map: createFrameTexture(),

      color: 0xffffff,

      roughness: 0.6,

      metalness: 0.05
    });

  const frameThickness =
    0.14;

  const frameDepth =
    0.16;


  const frameSegments = [

    // TOP
    [
      frameW,
      frameThickness,
      0,
      frameH / 2 -
      frameThickness / 2
    ],

    // BOTTOM
    [
      frameW,
      frameThickness,
      0,
      -frameH / 2 +
      frameThickness / 2
    ],

    // RIGHT
    [
      frameThickness,
      frameH,
      frameW / 2 -
      frameThickness / 2,
      0
    ],

    // LEFT
    [
      frameThickness,
      frameH,
      -frameW / 2 +
      frameThickness / 2,
      0
    ],

    // CENTER
    [
      frameThickness,
      frameH,
      0,
      0
    ]
  ];


  frameSegments.forEach(
    ([w, h, x, y]) => {

      const bar =
        new THREE.Mesh(

          new THREE.BoxGeometry(
            w,
            h,
            frameDepth
          ),

          frameMat
        );

      bar.position.set(
        x,
        y,
        0
      );

      bar.castShadow = true;

      bar.receiveShadow = true;

      windowGroup.add(
        bar
      );
    }
  );


  // ============================================================
  // ACTUAL GLASS
  //
  // IMPORTANT:
  //
  // This is now ONLY glass.
  //
  // It does NOT contain the outside scenery.
  //
  // Therefore it cannot become an inverted scenery plane.
  // ============================================================

  // Hand-written GLSL glass (see shaders.js): fresnel reflection,
  // sweeping sheen and a smudge texture. Uniforms are driven by
  // the day/night system and the animation clock.
  const glassUniforms = {

    uSmudge: {
      value:
        createGlassSurfaceTexture()
    },

    uTint: {
      value:
        new THREE.Color(
          0xbdd9f4
        )
    },

    uOpacity: { value: 0.1 },

    uTime: { value: 0 },

    uNight: { value: 0 }
  };


  const glassMaterial =
    new THREE.ShaderMaterial({

      uniforms:
        glassUniforms,

      vertexShader:
        glassVertexShader,

      fragmentShader:
        glassFragmentShader,

      transparent: true,

      side: THREE.DoubleSide,

      depthWrite: false
    });


  const glass =
    new THREE.Mesh(

      new THREE.PlaneGeometry(
        frameW -
        frameThickness * 2,
        frameH -
        frameThickness * 2
      ),

      glassMaterial
    );

  glass.position.z = 0;

  glass.renderOrder = 2;

  windowGroup.add(
    glass
  );


  // ============================================================
  // OUTSIDE SCENERY
  //
  // This is a separate physical surface.
  //
  // It sits BEHIND the window from the room's perspective.
  //
  // The plant is physically closer to the camera when viewed
  // from outside.
  // ============================================================

  const sceneryGroup =
    new THREE.Group();

  sceneryGroup.position.set(
    windowCenterX,
    windowCenterY,
    frontZ + 0.15
  );

  scene.add(
    sceneryGroup
  );


  const sceneryTexture =
    createGlassTexture(
      false,
      0
    );


  const sceneryMaterial =
    new THREE.MeshBasicMaterial({

      map: sceneryTexture,

      transparent: false,

      side: THREE.DoubleSide,

      depthWrite: true
    });


  const scenery =
    new THREE.Mesh(

      new THREE.PlaneGeometry(
        5.2,
        5.2
      ),

      sceneryMaterial
    );

  sceneryGroup.add(
    scenery
  );


  // ============================================================
  // WINDOW SCENERY VISIBILITY
  //
  // INSIDE:
  //
  // camera.z < window plane
  //
  // Show scenery.
  //
  //
  // OUTSIDE:
  //
  // camera.z > window plane
  //
  // Hide scenery.
  //
  // This guarantees:
  //
  // INSIDE  -> scenery
  // OUTSIDE -> plant
  // ============================================================

  function updateWindowVisibility() {

    const cameraWorldPosition =
      new THREE.Vector3();

    camera.getWorldPosition(
      cameraWorldPosition
    );

    const windowWorldPosition =
      new THREE.Vector3();

    windowGroup.getWorldPosition(
      windowWorldPosition
    );

    const isOutside =
      cameraWorldPosition.z >
      windowWorldPosition.z;

    scenery.visible =
      !isOutside;
  }


  // ============================================================
  // WINDOW TEXTURE UPDATE
  //
  // Redraws the existing scenery canvas in place (no new textures).
  // `night` is a 0..1 blend so the sky cross-fades.
  // ============================================================

  function updateWindowTexture(
    night,
    time = 0
  ) {

    createGlassTexture(
      night,
      time,
      sceneryTexture
    );
  }

  return {
    windowGroup,
    glass,
    glassUniforms,
    scenery,
    updateWindowVisibility,
    updateWindowTexture
  };
}
