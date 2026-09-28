import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

import {
  createFloorTexture,
  createWallTexture,
  createSoilTexture,
  createGrassTexture,
  createConcreteTexture,
  createContactShadowTexture,
  createEdgeShadowTexture,
  createFrameTexture,
  createGlassSurfaceTexture,
  createPotTexture,
  createCeilingTexture,
  createGlassTexture
} from './textures.js';

import { createSunflower } from './sunflower.js';
import { glassVertexShader, glassFragmentShader } from './shaders.js';


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
      60,
      window.innerWidth /
        window.innerHeight,
      0.1,
      60
    );

  // human-eye view from inside the room: floor below, ceiling above, window and plant ahead
  const initialCameraPosition =
    new THREE.Vector3(
      -1.6,
      2.3,
      -3.8
    );

  const initialCameraTarget =
    new THREE.Vector3(
      0.8,
      3.0,
      2.2
    );

  camera.position.copy(
    initialCameraPosition
  );

  camera.lookAt(
    initialCameraTarget
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
  //
  // - HemisphereLight: sky/ground bounce fill (soft ambient)
  // - DirectionalLight: sun / moon, aimed THROUGH the window so
  //   the walls and frame cast a real window-shaped light patch
  // - PointLight (window): diffuse skylight spilling in
  // - PointLight (lamp): warm pendant lamp, toggled with L
  // ============================================================

  const ambientLight =
    new THREE.HemisphereLight(
      0xffffff,
      0xd0bfa6,
      0.9
    );

  scene.add(
    ambientLight
  );


  const dirLight =
    new THREE.DirectionalLight(
      0xfff1d4,
      3.0
    );

  dirLight.position.set(
    1.6,
    6,
    14
  );

  dirLight.target.position.set(
    0.8,
    1.5,
    2.2
  );

  dirLight.castShadow = true;

  dirLight.shadow.mapSize.set(
    2048,
    2048
  );

  dirLight.shadow.camera.left = -9;
  dirLight.shadow.camera.right = 9;
  dirLight.shadow.camera.top = 9;
  dirLight.shadow.camera.bottom = -9;
  dirLight.shadow.camera.near = 1;
  dirLight.shadow.camera.far = 40;
  dirLight.shadow.bias = -0.0004;
  dirLight.shadow.normalBias = 0.03;
  dirLight.shadow.radius = 3;

  scene.add(
    dirLight,
    dirLight.target
  );


  const windowLight =
    new THREE.PointLight(
      0xfff0d8,
      10,
      0,
      2
    );

  windowLight.position.set(
    0,
    3.4,
    4.4
  );

  scene.add(
    windowLight
  );


  const lampLight =
    new THREE.PointLight(
      0xffc98a,
      0,
      0,
      2
    );

  lampLight.position.set(
    0,
    5.3,
    0.5
  );

  scene.add(
    lampLight
  );


  // ============================================================
  // ROOM
  // ============================================================

  const roomWidth = 14;
  const roomDepth = 12;
  const roomHeight = 6.5;

  // The front wall (with the window) sits 0.12 inside the nominal depth, so the
  // floor, ceiling and side walls must stop there instead of poking through it.
  const frontWallInset = 0.12;
  const interiorDepth =
    roomDepth - frontWallInset;
  const interiorCenterZ =
    -frontWallInset / 2;


  // ============================================================
  // FLOOR
  // ============================================================

  const floor =
    new THREE.Mesh(

      new THREE.PlaneGeometry(
        roomWidth,
        interiorDepth
      ),

      new THREE.MeshStandardMaterial({
        map: createFloorTexture(),
        color: 0xd8c7a6,
        roughness: 0.6,
        metalness: 0,
        side: THREE.FrontSide
      })
    );

  floor.rotation.x =
    -Math.PI / 2;

  floor.position.z =
    interiorCenterZ;

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
        interiorDepth
      ),

      new THREE.MeshStandardMaterial({

        map: createCeilingTexture(),

        color: 0xf0ece4,

        roughness: 0.95,

        side: THREE.FrontSide
      })
    );

  ceiling.position.set(
    0,
    roomHeight,
    interiorCenterZ
  );

  ceiling.rotation.x =
    Math.PI / 2;

  ceiling.receiveShadow = true;

  ceiling.castShadow = true;

  scene.add(
    ceiling
  );


  // ============================================================
  // LEFT WALL
  // ============================================================

  const leftWall =
    new THREE.Mesh(

      new THREE.PlaneGeometry(
        interiorDepth,
        roomHeight
      ),

      wallMaterial
    );

  leftWall.position.set(
    -roomWidth / 2,
    roomHeight / 2,
    interiorCenterZ
  );

  leftWall.rotation.y =
    Math.PI / 2;

  leftWall.receiveShadow = true;

  leftWall.castShadow = true;

  scene.add(
    leftWall
  );


  // ============================================================
  // RIGHT WALL
  // ============================================================

  const rightWall =
    new THREE.Mesh(

      new THREE.PlaneGeometry(
        interiorDepth,
        roomHeight
      ),

      wallMaterial
    );

  rightWall.position.set(
    roomWidth / 2,
    roomHeight / 2,
    interiorCenterZ
  );

  rightWall.rotation.y =
    -Math.PI / 2;

  rightWall.receiveShadow = true;

  rightWall.castShadow = true;

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

  backWall.castShadow = true;

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

  frontLeftWall.castShadow = true;

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

  frontRightWall.castShadow = true;

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

  frontBottomWall.castShadow = true;

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

  frontTopWall.castShadow = true;

  scene.add(
    frontTopWall
  );


  // ============================================================
  // TRIM + SILL (wall/floor and wall/ceiling contact, window depth)
  // ============================================================

  const trimMaterial =
    new THREE.MeshStandardMaterial({
      map: createWallTexture(),
      color: 0xf1ece0,
      roughness: 0.55
    });

  const trimDepth = 0.06;
  const baseboardHeight = 0.28;
  const crownHeight = 0.2;
  const backZ = -roomDepth / 2;

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


  // ============================================================
  // FOUNDATION + OUTDOOR GROUND
  //
  // Layers, top to bottom:
  //   indoor wooden floor   y = 0
  //   concrete slab         y = -0.455 .. -0.005 (under floor and walls)
  //   grass                 y = -0.3   (slab stands 0.28 above it)
  //
  // The grass is a different material and sits below the floor,
  // so it can never read as an extension of the wooden floor.
  // ============================================================

  const foundationThickness = 0.45;
  const foundationOverhang = 0.25;

  const foundationBackZ =
    -roomDepth / 2 - foundationOverhang;

  const foundationFrontZ =
    frontZ + foundationOverhang;

  const foundation =
    new THREE.Mesh(

      new THREE.BoxGeometry(
        roomWidth + foundationOverhang * 2,
        foundationThickness,
        foundationFrontZ - foundationBackZ
      ),

      new THREE.MeshStandardMaterial({
        map: createConcreteTexture(),
        roughness: 0.95,
        metalness: 0
      })
    );

  foundation.position.set(
    0,
    -0.005 - foundationThickness / 2,
    (foundationBackZ + foundationFrontZ) / 2
  );

  foundation.receiveShadow = true;

  foundation.castShadow = true;

  scene.add(
    foundation
  );


  const outdoorGround =
    new THREE.Mesh(

      new THREE.PlaneGeometry(
        80,
        80
      ),

      new THREE.MeshStandardMaterial({
        map: createGrassTexture(),
        roughness: 1,
        metalness: 0,
        side: THREE.FrontSide
      })
    );

  outdoorGround.rotation.x =
    -Math.PI / 2;

  outdoorGround.position.y =
    -0.3;

  outdoorGround.receiveShadow = true;

  scene.add(
    outdoorGround
  );


  // ============================================================
  // CONTACT / CORNER SHADOWS
  //
  // Soft ambient-occlusion strips where the walls meet the floor
  // and the ceiling. They are simple textured decals a hair off
  // the surface (polygonOffset prevents z-fighting).
  // ============================================================

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


  // ============================================================
  // SOIL
  //
  // A lumpy mound (displaced hemisphere) rising above the rim,
  // so the stem visibly grows out of the earth.
  // ============================================================

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
  // PENDANT LAMP (visual fixture for the lamp PointLight)
  // ============================================================

  const lampBulbMaterial =
    new THREE.MeshStandardMaterial({

      color: 0xfff1d0,

      emissive: 0xffc98a,

      emissiveIntensity: 0,

      roughness: 0.4
    });

  const lampGroup =
    new THREE.Group();

  lampGroup.position.set(
    lampLight.position.x,
    lampLight.position.y,
    lampLight.position.z
  );

  const lampCord =
    new THREE.Mesh(

      new THREE.CylinderGeometry(
        0.015,
        0.015,
        roomHeight - lampLight.position.y,
        6
      ),

      new THREE.MeshStandardMaterial({
        color: 0x222222,
        roughness: 0.6
      })
    );

  lampCord.position.y =
    (roomHeight - lampLight.position.y) / 2 + 0.05;

  lampGroup.add(
    lampCord
  );

  const lampShade =
    new THREE.Mesh(

      new THREE.ConeGeometry(
        0.32,
        0.28,
        24,
        1,
        true
      ),

      new THREE.MeshStandardMaterial({
        map: createWallTexture(),
        color: 0xd9c9a8,
        roughness: 0.8,
        side: THREE.DoubleSide
      })
    );

  lampShade.position.y =
    0.16;

  lampGroup.add(
    lampShade
  );

  const lampBulb =
    new THREE.Mesh(

      new THREE.SphereGeometry(
        0.1,
        16,
        12
      ),

      lampBulbMaterial
    );

  lampGroup.add(
    lampBulb
  );

  scene.add(
    lampGroup
  );


  // ============================================================
  // DAY / NIGHT
  //
  // setMode() only chooses the target. Every frame nightMix eases
  // toward it (delta-time based) and applyEnvironment() blends
  // lights, sky, glass and scenery, so the change is a smooth
  // transition rather than a hard cut.
  // ============================================================

  let isNight = false;

  let nightMix = 0;

  let lampOn = false;

  let lampLevel = 0;


  const modeLabel =
    document.getElementById(
      'mode'
    );

  const colorLabel =
    document.getElementById(
      'colorLabel'
    );

  const lampLabel =
    document.getElementById(
      'lampLabel'
    );


  const dayLook = {

    ambient: 0.9,
    ambientColor: new THREE.Color(0xffffff),
    groundColor: new THREE.Color(0xd0bfa6),
    sun: 3.0,
    sunColor: new THREE.Color(0xfff2d6),
    sunPosition: new THREE.Vector3(1.6, 6, 14),
    skyLight: 10,
    background: new THREE.Color(0xbfd3d9),
    glassTint: new THREE.Color(0xbdd9f4),
    glassOpacity: 0.1,
    outdoorGround: new THREE.Color(0xffffff)
  };

  const nightLook = {

    ambient: 0.2,
    ambientColor: new THREE.Color(0x334466),
    groundColor: new THREE.Color(0x120e0a),
    sun: 0.8,
    sunColor: new THREE.Color(0x8aa4d6),
    sunPosition: new THREE.Vector3(-2.5, 7, 14),
    skyLight: 0,
    background: new THREE.Color(0x09121b),
    glassTint: new THREE.Color(0x203553),
    glassOpacity: 0.22,
    outdoorGround: new THREE.Color(0x27303a)
  };


  function applyEnvironment() {

    // smoothstep so the transition eases in and out
    const m =
      nightMix * nightMix *
      (3 - 2 * nightMix);

    const mixNumber =
      THREE.MathUtils.lerp;


    ambientLight.intensity =
      mixNumber(dayLook.ambient, nightLook.ambient, m);

    ambientLight.color
      .copy(dayLook.ambientColor)
      .lerp(nightLook.ambientColor, m);

    ambientLight.groundColor
      .copy(dayLook.groundColor)
      .lerp(nightLook.groundColor, m);


    dirLight.intensity =
      mixNumber(dayLook.sun, nightLook.sun, m);

    dirLight.color
      .copy(dayLook.sunColor)
      .lerp(nightLook.sunColor, m);

    dirLight.position
      .lerpVectors(
        dayLook.sunPosition,
        nightLook.sunPosition,
        m
      );


    windowLight.intensity =
      mixNumber(dayLook.skyLight, nightLook.skyLight, m);


    scene.background
      .copy(dayLook.background)
      .lerp(nightLook.background, m);

    outdoorGround.material.color
      .copy(dayLook.outdoorGround)
      .lerp(nightLook.outdoorGround, m);


    glassUniforms.uTint.value
      .copy(dayLook.glassTint)
      .lerp(nightLook.glassTint, m);

    glassUniforms.uOpacity.value =
      mixNumber(dayLook.glassOpacity, nightLook.glassOpacity, m);

    glassUniforms.uNight.value =
      m;


    lampLight.intensity =
      lampLevel * 32;

    lampBulbMaterial.emissiveIntensity =
      lampLevel * 2;


    sunflower.setDaylight(
      1 - m
    );
  }


  function updateLabels() {

    if (modeLabel) {

      modeLabel.textContent =
        isNight
          ? 'NIGHT'
          : 'DAY';

      modeLabel.className =
        isNight
          ? 'night'
          : 'day';
    }

    if (lampLabel) {

      lampLabel.textContent =
        lampOn
          ? 'LAMP ON'
          : 'LAMP OFF';

      lampLabel.className =
        lampOn
          ? 'on'
          : 'off';
    }
  }


  function setMode(
    night
  ) {

    isNight =
      night;

    // the pendant lamp follows the mode by default (L overrides it)
    lampOn =
      night;

    updateLabels();
  }


  function toggleLamp() {

    lampOn =
      !lampOn;

    updateLabels();
  }


  // ============================================================
  // CLICKABLE PLANT
  // ============================================================

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
    1.5;


  controls.maxDistance =
    9;


  // never look from under the floor or straight up through the ceiling
  controls.minPolarAngle =
    0.35;


  controls.maxPolarAngle =
    Math.PI * 0.58;


  controls.target.copy(
    initialCameraTarget
  );

  controls.update();


  // keep the camera inside the enclosed room so the outside is never exposed
  const cameraLimits = {
    minX: -roomWidth / 2 + 0.6,
    maxX: roomWidth / 2 - 0.6,
    minY: 0.6,
    maxY: roomHeight - 0.6,
    minZ: -roomDepth / 2 + 0.6,
    maxZ: frontZ - 0.6
  };


  function clampToRoom(
    vector
  ) {

    vector.set(
      THREE.MathUtils.clamp(vector.x, cameraLimits.minX, cameraLimits.maxX),
      THREE.MathUtils.clamp(vector.y, cameraLimits.minY, cameraLimits.maxY),
      THREE.MathUtils.clamp(vector.z, cameraLimits.minZ, cameraLimits.maxZ)
    );
  }


  function resetCamera() {

    camera.position.copy(
      initialCameraPosition
    );

    controls.target.copy(
      initialCameraTarget
    );

    controls.update();
  }


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

        setMode(
          !isNight
        );

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


  function updateMovement(
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


  function approach(
    value,
    target,
    step
  ) {

    if (
      Math.abs(target - value) <= step
    ) {
      return target;
    }

    return value + Math.sign(target - value) * step;
  }


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

    const nextNight =
      approach(nightMix, isNight ? 1 : 0, dt / 1.8);

    const nextLamp =
      approach(lampLevel, lampOn ? 1 : 0, dt / 0.5);

    if (
      nextNight !== nightMix ||
      nextLamp !== lampLevel
    ) {

      nightMix = nextNight;

      lampLevel = nextLamp;

      applyEnvironment();
    }


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

    updateMovement(
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

  setMode(
    false
  );

  applyEnvironment();

  animate();
}
