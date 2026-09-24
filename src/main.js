import * as THREE from 'three';
import { createFloorTexture, createWallTexture, createPotTexture, createLeafTexture, createGlassTexture } from './textures.js';
import { leafVertexShader, leafFragmentShader } from './shaders.js';

// everything is wrapped so a failure (no WebGL, missing module, etc.) shows an
// on-page message instead of a silent blank page
try {
  init();
} catch (err) {
  const box = document.getElementById('fatalError');
  box.textContent = 'Failed to start the 3D scene:\n\n' + err.stack;
  box.style.display = 'block';
  console.error(err);
}

function init() {
  // ---------- basic scene setup ----------
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x87ceeb);

  // perspective projection camera: near objects appear bigger, far objects smaller (realistic depth)
  const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100);
  camera.position.set(6, 4, 8);
  camera.lookAt(0.5, 1.8, 0);

  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  document.body.appendChild(renderer.domElement);

  // ---------- lights ----------
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
  scene.add(ambientLight);

  const dirLight = new THREE.DirectionalLight(0xfff4e0, 1.2);
  dirLight.position.set(6, 8, 4);
  dirLight.castShadow = true;
  dirLight.shadow.mapSize.set(1024, 1024);
  dirLight.shadow.camera.left = -8;
  dirLight.shadow.camera.right = 8;
  dirLight.shadow.camera.top = 8;
  dirLight.shadow.camera.bottom = -8;
  scene.add(dirLight);

  // ---------- room: floor, back wall, side wall ----------
  const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(14, 12),
    new THREE.MeshStandardMaterial({ map: createFloorTexture() })
  );
  floor.rotation.x = -Math.PI / 2;
  floor.receiveShadow = true;
  scene.add(floor);

  const wallMat = new THREE.MeshStandardMaterial({ map: createWallTexture() });

  const backWall = new THREE.Mesh(new THREE.PlaneGeometry(14, 8), wallMat);
  backWall.position.set(0, 4, -4);
  backWall.receiveShadow = true;
  scene.add(backWall);

  const sideWall = new THREE.Mesh(new THREE.PlaneGeometry(8, 8), wallMat);
  sideWall.rotation.y = Math.PI / 2;
  sideWall.position.set(-5.5, 4, 0);
  sideWall.receiveShadow = true;
  scene.add(sideWall);

  // ---------- window: box frame + textured glass ----------
  const windowGroup = new THREE.Group();
  windowGroup.position.set(2, 3.6, -3.94);

  const frameMat = new THREE.MeshStandardMaterial({ color: 0x5a3d26 });
  const frameThickness = 0.14;
  const frameW = 2.8, frameH = 2.8;
  const frameSegments = [
    [frameW, frameThickness, 0, frameH / 2 - frameThickness / 2],   // top
    [frameW, frameThickness, 0, -frameH / 2 + frameThickness / 2],  // bottom
    [frameThickness, frameH, frameW / 2 - frameThickness / 2, 0],   // right
    [frameThickness, frameH, -frameW / 2 + frameThickness / 2, 0],  // left
    [frameThickness, frameH, 0, 0],                                 // center mullion
  ];
  frameSegments.forEach(([w, h, x, y]) => {
    const bar = new THREE.Mesh(new THREE.BoxGeometry(w, h, 0.12), frameMat);
    bar.position.set(x, y, 0);
    bar.castShadow = true;
    windowGroup.add(bar);
  });

  // window texture: an outdoor scene visible through the glass, tinted per day/night
  const glassMaterial = new THREE.MeshBasicMaterial({
    map: createGlassTexture(),
    transparent: true,
    opacity: 0.5,
  });
  const glass = new THREE.Mesh(new THREE.PlaneGeometry(frameW - frameThickness, frameH - frameThickness), glassMaterial);
  glass.position.z = -0.02;
  windowGroup.add(glass);
  scene.add(windowGroup);

  // ---------- plant: pot + stem + fanned-out leaves ----------
  const plantGroup = new THREE.Group();
  plantGroup.position.set(0.6, 0, 1.4);
  scene.add(plantGroup);

  const potTexture = createPotTexture();
  const pot = new THREE.Mesh(
    new THREE.CylinderGeometry(0.55, 0.42, 0.9, 20),
    new THREE.MeshStandardMaterial({ map: potTexture })
  );
  pot.position.y = 0.45;
  pot.castShadow = true;
  pot.receiveShadow = true;
  plantGroup.add(pot);

  const stem = new THREE.Mesh(
    new THREE.CylinderGeometry(0.045, 0.06, 0.7, 8),
    new THREE.MeshStandardMaterial({ color: 0x5c8a3d })
  );
  stem.position.y = 0.9 + 0.35;
  stem.castShadow = true;
  plantGroup.add(stem);

  // custom shader material for the leaves: texture * plantColor uniform + a small animated wave (see src/shaders.js)
  const leafTexture = createLeafTexture();
  const leafColors = [new THREE.Color(0x3f8f3f), new THREE.Color(0x8a4fd6), new THREE.Color(0xd6483f)]; // green, purple, red
  let colorIndex = 0;
  const colorNames = ['GREEN', 'PURPLE', 'RED'];

  const leafGeometry = new THREE.PlaneGeometry(0.45, 1.0);
  leafGeometry.translate(0, 0.5, 0); // base of leaf sits at pivot origin

  const leaves = [];
  const leafCount = 8;
  for (let i = 0; i < leafCount; i++) {
    const pivot = new THREE.Group();
    pivot.position.set(0, 1.55, 0);
    pivot.rotation.y = (i / leafCount) * Math.PI * 2;

    const leafMaterial = new THREE.ShaderMaterial({
      uniforms: {
        map: { value: leafTexture },
        plantColor: { value: leafColors[0].clone() },
        time: { value: 0 },
      },
      vertexShader: leafVertexShader,
      fragmentShader: leafFragmentShader,
      transparent: true,
      side: THREE.DoubleSide,
    });
    const leaf = new THREE.Mesh(leafGeometry, leafMaterial);
    leaf.rotation.x = -Math.PI / 5; // tilt leaf outward/upward
    pivot.add(leaf);

    pivot.userData.baseRotZ = 0.3 + Math.random() * 0.1;
    pivot.rotation.z = pivot.userData.baseRotZ;
    pivot.userData.offset = i * 1.3;
    pivot.userData.material = leafMaterial;
    pivot.userData.leafMesh = leaf;

    plantGroup.add(pivot);
    leaves.push(pivot);
  }

  // ---------- day / night mode ----------
  let isNight = false;
  const modeLabel = document.getElementById('mode');

  function setMode(night) {
    isNight = night;
    if (isNight) {
      ambientLight.intensity = 0.25;
      ambientLight.color.set(0x334466);
      dirLight.intensity = 0.35;
      dirLight.color.set(0x6677aa);
      dirLight.position.set(-5, 3, -4); // moonlight direction, opposite side of the window
      scene.background = new THREE.Color(0x05060c);
      glassMaterial.color.set(0x223350);
      glassMaterial.opacity = 0.65;
      modeLabel.textContent = 'NIGHT';
      modeLabel.className = 'night';
    } else {
      ambientLight.intensity = 0.6;
      ambientLight.color.set(0xffffff);
      dirLight.intensity = 1.2;
      dirLight.color.set(0xfff4e0);
      dirLight.position.set(6, 8, 4); // sunlight direction, through the window/right side
      scene.background = new THREE.Color(0x87ceeb);
      glassMaterial.color.set(0xffffff);
      glassMaterial.opacity = 0.5;
      modeLabel.textContent = 'DAY';
      modeLabel.className = 'day';
    }
  }

  // ---------- keyboard interaction ----------
  window.addEventListener('keydown', (e) => {
    if (e.key === 'd' || e.key === 'D') setMode(false);
    else if (e.key === 'n' || e.key === 'N') setMode(true);
    else if (e.code === 'Space') setMode(!isNight);
  });

  // ---------- mouse interaction: click plant to cycle color ----------
  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();
  const clickableMeshes = [pot, stem, ...leaves.map((p) => p.userData.leafMesh)];
  const colorLabel = document.getElementById('colorLabel');

  window.addEventListener('click', (e) => {
    pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
    pointer.y = -(e.clientY / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(pointer, camera);
    const hits = raycaster.intersectObjects(clickableMeshes);
    if (hits.length > 0) {
      colorIndex = (colorIndex + 1) % leafColors.length;
      leaves.forEach((p) => p.userData.material.uniforms.plantColor.value.copy(leafColors[colorIndex]));
      colorLabel.textContent = colorNames[colorIndex];
      colorLabel.style.background = '#' + leafColors[colorIndex].getHexString();
    }
  });

  // ---------- resize ----------
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  // ---------- animation loop ----------
  const clock = new THREE.Clock();
  function animate() {
    requestAnimationFrame(animate);
    const t = clock.getElapsedTime();

    // slow, natural sine-wave sway for each leaf, plus feeding time into the leaf shader
    leaves.forEach((pivot) => {
      pivot.rotation.z = pivot.userData.baseRotZ + Math.sin(t * 0.6 + pivot.userData.offset) * 0.08;
      pivot.userData.material.uniforms.time.value = t;
    });

    renderer.render(scene, camera);
  }
  animate();
}
