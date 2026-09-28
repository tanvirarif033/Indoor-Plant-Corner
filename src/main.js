import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

import {
  createFloorTexture,
  createWallTexture,
  createPotTexture,
  createGlassTexture
} from './textures.js';

import { createSunflower } from './sunflower.js';


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
  // CAMERA
  // ============================================================

  const camera =
    new THREE.PerspectiveCamera(
      45,
      window.innerWidth /
        window.innerHeight,
      0.1,
      100
    );

  camera.position.set(
    6,
    4,
    8
  );

  camera.lookAt(
    0.5,
    1.8,
    0
  );


  // ============================================================
  // RENDERER
  // ============================================================

  const renderer =
    new THREE.WebGLRenderer({
      antialias: true,
      alpha: false
    });

  renderer.setSize(
    window.innerWidth,
    window.innerHeight
  );

  renderer.setPixelRatio(
    Math.min(
      window.devicePixelRatio,
      2
    )
  );

  renderer.shadowMap.enabled = true;

  renderer.shadowMap.type =
    THREE.PCFSoftShadowMap;

  renderer.outputColorSpace =
    THREE.SRGBColorSpace;

  document.body.appendChild(
    renderer.domElement
  );


  // ============================================================
  // LIGHTING
  // ============================================================

  const ambientLight =
    new THREE.AmbientLight(
      0xffffff,
      0.7
    );

  scene.add(
    ambientLight
  );


  const dirLight =
    new THREE.DirectionalLight(
      0xfff1d4,
      1.4
    );

  dirLight.position.set(
    6,
    8,
    4
  );

  dirLight.castShadow = true;

  dirLight.shadow.mapSize.set(
    1024,
    1024
  );

  dirLight.shadow.camera.left = -8;
  dirLight.shadow.camera.right = 8;
  dirLight.shadow.camera.top = 8;
  dirLight.shadow.camera.bottom = -8;

  scene.add(
    dirLight
  );


  // ============================================================
  // ROOM
  // ============================================================

  const roomWidth = 14;
  const roomDepth = 12;
  const roomHeight = 8;


  // ============================================================
  // FLOOR
  // ============================================================

  const floor =
    new THREE.Mesh(

      new THREE.PlaneGeometry(
        roomWidth,
        roomDepth
      ),

      new THREE.MeshStandardMaterial({
        map: createFloorTexture(),
        color: 0xd8c7a6,
        side: THREE.DoubleSide
      })
    );

  floor.rotation.x =
    -Math.PI / 2;

  floor.receiveShadow = true;

  scene.add(
    floor
  );


  // ============================================================
  // WALL MATERIAL
  // ============================================================

  const wallMaterial =
    new THREE.MeshStandardMaterial({

      map: createWallTexture(),

      color: 0xe6dfd0,

      roughness: 0.9,

      side: THREE.DoubleSide
    });


  // ============================================================
  // CEILING
  // ============================================================

  const ceiling =
    new THREE.Mesh(

      new THREE.PlaneGeometry(
        roomWidth,
        roomDepth
      ),

      new THREE.MeshStandardMaterial({

        color: 0xe5e0d6,

        roughness: 0.95,

        side: THREE.DoubleSide
      })
    );

  ceiling.position.set(
    0,
    roomHeight,
    0
  );

  ceiling.rotation.x =
    Math.PI / 2;

  ceiling.receiveShadow = true;

  scene.add(
    ceiling
  );


  // ============================================================
  // LEFT WALL
  // ============================================================

  const leftWall =
    new THREE.Mesh(

      new THREE.PlaneGeometry(
        roomDepth,
        roomHeight
      ),

      wallMaterial
    );

  leftWall.position.set(
    -roomWidth / 2,
    roomHeight / 2,
    0
  );

  leftWall.rotation.y =
    Math.PI / 2;

  leftWall.receiveShadow = true;

  scene.add(
    leftWall
  );


  // ============================================================
  // RIGHT WALL
  // ============================================================

  const rightWall =
    new THREE.Mesh(

      new THREE.PlaneGeometry(
        roomDepth,
        roomHeight
      ),

      wallMaterial
    );

  rightWall.position.set(
    roomWidth / 2,
    roomHeight / 2,
    0
  );

  rightWall.rotation.y =
    -Math.PI / 2;

  rightWall.receiveShadow = true;

  scene.add(
    rightWall
  );


  // ============================================================
  // BACK WALL
  // ============================================================

  const backWall =
    new THREE.Mesh(

      new THREE.PlaneGeometry(
        roomWidth,
        roomHeight
      ),

      wallMaterial
    );

  backWall.position.set(
    0,
    roomHeight / 2,
    -roomDepth / 2
  );

  backWall.receiveShadow = true;

  scene.add(
    backWall
  );


  // ============================================================
  // WINDOW DIMENSIONS
  // ============================================================

  const frameW = 2.8;
  const frameH = 2.8;

  const windowCenterX = 0;
  const windowCenterY = 3.2;

  const frontZ =
    roomDepth / 2 - 0.12;

  const windowLeft =
    windowCenterX -
    frameW / 2;

  const windowRight =
    windowCenterX +
    frameW / 2;

  const windowBottom =
    windowCenterY -
    frameH / 2;

  const windowTop =
    windowCenterY +
    frameH / 2;


  // ============================================================
  // REAL FRONT WALL OPENING
  //
  // There is NO wall behind the window.
  //
  // The front wall is constructed from four pieces:
  //
  //       TOP WALL
  //
  // LEFT   WINDOW   RIGHT
  //
  //      BOTTOM WALL
  //
  // ============================================================


  // ------------------------------------------------------------
  // FRONT LEFT WALL
  // ------------------------------------------------------------

  const frontSideWidth =
    roomWidth / 2 -
    frameW / 2;

  const frontLeftWall =
    new THREE.Mesh(

      new THREE.PlaneGeometry(
        frontSideWidth,
        roomHeight
      ),

      wallMaterial
    );

  frontLeftWall.position.set(
    -(
      roomWidth / 4 +
      frameW / 4
    ),
    roomHeight / 2,
    frontZ
  );

  frontLeftWall.receiveShadow = true;

  scene.add(
    frontLeftWall
  );


  // ------------------------------------------------------------
  // FRONT RIGHT WALL
  // ------------------------------------------------------------

  const frontRightWall =
    new THREE.Mesh(

      new THREE.PlaneGeometry(
        frontSideWidth,
        roomHeight
      ),

      wallMaterial
    );

  frontRightWall.position.set(
    roomWidth / 4 +
    frameW / 4,
    roomHeight / 2,
    frontZ
  );

  frontRightWall.receiveShadow = true;

  scene.add(
    frontRightWall
  );


  // ------------------------------------------------------------
  // FRONT BOTTOM WALL
  // ------------------------------------------------------------

  const frontBottomHeight =
    windowBottom;

  const frontBottomWall =
    new THREE.Mesh(

      new THREE.PlaneGeometry(
        frameW,
        frontBottomHeight
      ),

      wallMaterial
    );

  frontBottomWall.position.set(
    windowCenterX,
    frontBottomHeight / 2,
    frontZ
  );

  frontBottomWall.receiveShadow = true;

  scene.add(
    frontBottomWall
  );


  // ------------------------------------------------------------
  // FRONT TOP WALL
  // ------------------------------------------------------------

  const frontTopHeight =
    roomHeight -
    windowTop;

  const frontTopWall =
    new THREE.Mesh(

      new THREE.PlaneGeometry(
        frameW,
        frontTopHeight
      ),

      wallMaterial
    );

  frontTopWall.position.set(
    windowCenterX,
    windowTop +
    frontTopHeight / 2,
    frontZ
  );

  frontTopWall.receiveShadow = true;

  scene.add(
    frontTopWall
  );


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

      color: 0x5c3b2a,

      roughness: 0.7,

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

  const glassTexture =
    createGlassTexture(
      false,
      0
    );


  const glassMaterial =
    new THREE.MeshPhysicalMaterial({

      map: glassTexture,

      transparent: true,

      opacity: 0.12,

      roughness: 0.05,

      metalness: 0,

      transmission: 0.15,

      thickness: 0.02,

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
    frontZ + 0.35
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
        frameW -
        frameThickness * 2,
        frameH -
        frameThickness * 2
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
  // ============================================================

  function updateWindowTexture(
    night,
    time = 0
  ) {

    const nextTexture =
      createGlassTexture(
        night,
        time
      );


    // Glass reflection/tint
    if (glassMaterial.map) {

      glassMaterial.map.dispose();
    }

    glassMaterial.map =
      nextTexture;

    glassMaterial.needsUpdate =
      true;


    // Scenery
    const sceneryTexture =
      createGlassTexture(
        night,
        time
      );

    if (sceneryMaterial.map) {

      sceneryMaterial.map.dispose();
    }

    sceneryMaterial.map =
      sceneryTexture;

    sceneryMaterial.needsUpdate =
      true;
  }


  // ============================================================
  // PLANT
  // ============================================================

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


  // ============================================================
  // FLOWERPOT
  // ============================================================

  const pot =
    new THREE.Mesh(

      new THREE.CylinderGeometry(
        0.6,
        0.5,
        0.9,
        24
      ),

      new THREE.MeshStandardMaterial({

        map:
          createPotTexture(),

        roughness: 0.9,

        metalness: 0.1
      })
    );

  pot.position.y =
    0.45;

  pot.castShadow = true;

  pot.receiveShadow = true;

  plantGroup.add(
    pot
  );


  // ============================================================
  // SOIL
  // ============================================================

  const soil =
    new THREE.Mesh(

      new THREE.CylinderGeometry(
        0.52,
        0.46,
        0.14,
        20
      ),

      new THREE.MeshStandardMaterial({

        color: 0x3f2d1f,

        roughness: 1
      })
    );

  soil.position.y =
    0.92;

  soil.castShadow = true;

  plantGroup.add(
    soil
  );


  // ============================================================
  // SUNFLOWER
  // ============================================================

  const leafColors = [

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


  const colorNames = [

    'GREEN',
    'PURPLE',
    'RED'
  ];


  let colorIndex = 0;


  const sunflower =
    createSunflower({
      leafTint:
        leafColors[0]
    });


  plantGroup.add(
    sunflower.group
  );


  // ============================================================
  // DAY / NIGHT
  // ============================================================

  let isNight = false;


  const modeLabel =
    document.getElementById(
      'mode'
    );


  const colorLabel =
    document.getElementById(
      'colorLabel'
    );


  function setMode(
    night
  ) {

    isNight =
      night;


    if (isNight) {

      ambientLight.intensity =
        0.25;

      ambientLight.color.set(
        0x334466
      );


      dirLight.intensity =
        0.4;

      dirLight.color.set(
        0x8aa4d6
      );


      dirLight.position.set(
        -5,
        4,
        -3
      );


      scene.background =
        new THREE.Color(
          0x09121b
        );


      glassMaterial.color.set(
        0x203553
      );


      glassMaterial.opacity =
        0.25;


      updateWindowTexture(
        true
      );


      if (modeLabel) {

        modeLabel.textContent =
          'NIGHT';

        modeLabel.className =
          'night';
      }

    } else {

      ambientLight.intensity =
        0.7;

      ambientLight.color.set(
        0xffffff
      );


      dirLight.intensity =
        1.4;

      dirLight.color.set(
        0xfff2d6
      );


      dirLight.position.set(
        6,
        8,
        4
      );


      scene.background =
        new THREE.Color(
          0xbfd3d9
        );


      glassMaterial.color.set(
        0xbdd9f4
      );


      glassMaterial.opacity =
        0.12;


      updateWindowTexture(
        false
      );


      if (modeLabel) {

        modeLabel.textContent =
          'DAY';

        modeLabel.className =
          'day';
      }
    }
  }


  // ============================================================
  // KEYBOARD
  // ============================================================

  window.addEventListener(
    'keydown',
    (event) => {

      if (
        event.key === 'd' ||
        event.key === 'D'
      ) {

        setMode(false);

      } else if (
        event.key === 'n' ||
        event.key === 'N'
      ) {

        setMode(true);

      } else if (
        event.code === 'Space'
      ) {

        setMode(
          !isNight
        );
      }
    }
  );


  // ============================================================
  // CLICKABLE PLANT
  // ============================================================

  const raycaster =
    new THREE.Raycaster();


  const pointer =
    new THREE.Vector2();


  const clickableMeshes = [

    pot,
    soil,

    ...sunflower.clickTargets
  ];


  window.addEventListener(
    'click',
    (event) => {

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
    }
  );


  // ============================================================
  // ORBIT CONTROLS
  // ============================================================

  const controls =
    new OrbitControls(
      camera,
      renderer.domElement
    );


  controls.enableDamping =
    true;


  controls.enablePan =
    true;


  controls.minDistance =
    3;


  controls.maxDistance =
    12;


  controls.target.set(
    0.8,
    1.2,
    2.2
  );


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


  function animate() {

    requestAnimationFrame(
      animate
    );


    const t =
      clock.getElapsedTime();


    // ----------------------------------------------------------
    // SUNFLOWER SWAY
    // ----------------------------------------------------------

    sunflower.update(
      t
    );


    // ----------------------------------------------------------
    // WINDOW SIDE DETECTION
    // ----------------------------------------------------------

    updateWindowVisibility();


    // ----------------------------------------------------------
    // WINDOW SCENERY
    // ----------------------------------------------------------

    /*
      Update the scenery texture periodically.

      The actual scenery is now a separate physical object,
      not the glass itself.
    */

    updateWindowTexture(
      isNight,
      t
    );


    // ----------------------------------------------------------
    // CONTROLS
    // ----------------------------------------------------------

    controls.update();


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

  animate();
}