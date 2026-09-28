import * as THREE from 'three';

import {
  createFloorMaps,
  createWallMaps,
  createCeilingMaps
} from './textures.js';

import {
  roomWidth,
  roomDepth,
  roomHeight,
  interiorDepth,
  interiorCenterZ,
  frameW,
  frontZ,
  windowCenterX,
  windowBottom,
  windowTop,
  frontSideWidth
} from './roomDimensions.js';

// ============================================================
// ROOM
//
// Builds the floor, the shared wall material, the ceiling, the
// left/right/back walls, and the front wall - which is split into
// four pieces around the window opening:
//
//       TOP WALL
//
// LEFT   WINDOW   RIGHT
//
//      BOTTOM WALL
//
// There is NO wall behind the window itself.
// ============================================================
export function createRoomStructure(scene) {

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
        ...createFloorMaps(),
        color: 0xffffff,
        roughness: 1,
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

      ...createWallMaps(),

      color: 0xffffff,

      roughness: 1,

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

        ...createCeilingMaps(),

        color: 0xffffff,

        roughness: 1,

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


  // ------------------------------------------------------------
  // FRONT LEFT WALL
  // ------------------------------------------------------------

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

  return {
    floor,
    wallMaterial,
    ceiling,
    leftWall,
    rightWall,
    backWall,
    frontLeftWall,
    frontRightWall,
    frontBottomWall,
    frontTopWall
  };
}
