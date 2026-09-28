import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { createLeafTexture } from './textures.js';

// Procedural sunflower: curved stem, veined leaves, sepals, layered petals and an
// instanced phyllotaxis seed disk. Coordinates are local to the plant group (pot origin
// at y = 0, soil surface at about y = 0.99).

// deterministic PRNG so the flower looks identical on every load
function createRandom(seed) {
  let s = seed >>> 0;
  return function random() {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const lerp = THREE.MathUtils.lerp;

// builds a (segsU + 1) x (segsV + 1) grid surface. shape(u, v) -> [x, y, z] with u in
// [-1, 1] across the blade and v in [0, 1] along it. Front face looks toward +Z.
function buildBladeGeometry(segsU, segsV, shape, colorAt) {
  const positions = [];
  const uvs = [];
  const colors = colorAt ? [] : null;
  const indices = [];

  for (let j = 0; j <= segsV; j++) {
    const v = j / segsV;
    for (let i = 0; i <= segsU; i++) {
      const u = -1 + (2 * i) / segsU;
      const p = shape(u, v);
      positions.push(p[0], p[1], p[2]);
      uvs.push(i / segsU, v);
      if (colors) {
        const c = colorAt(u, v);
        colors.push(c.r, c.g, c.b);
      }
    }
  }

  const row = segsU + 1;
  for (let j = 0; j < segsV; j++) {
    for (let i = 0; i < segsU; i++) {
      const a = j * row + i;
      const b = a + 1;
      const c = a + row + 1;
      const d = a + row;
      indices.push(a, b, c, a, c, d);
    }
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  if (colors) geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  return geometry;
}

// ---------------------------------------------------------------- stem

function createStemTexture() {
  const c = document.createElement('canvas');
  c.width = 128;
  c.height = 256;
  const ctx = c.getContext('2d');
  ctx.fillStyle = '#6f9a45';
  ctx.fillRect(0, 0, c.width, c.height);
  const random = createRandom(11);
  // streaks run along the u axis of the tube (canvas x)
  for (let i = 0; i < 160; i++) {
    const y = random() * c.height;
    const shade = random();
    ctx.fillStyle = shade < 0.5
      ? `rgba(60,85,30,${0.05 + random() * 0.12})`
      : `rgba(150,170,90,${0.04 + random() * 0.1})`;
    ctx.fillRect(random() * c.width * 0.5, y, c.width * (0.3 + random() * 0.7), 1 + random() * 3);
  }
  const texture = new THREE.CanvasTexture(c);
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function createSunflowerStem(curve) {
  const tubularSegments = 80;
  const radialSegments = 12;
  const geometry = new THREE.TubeGeometry(curve, tubularSegments, 0.06, radialSegments, false);

  const position = geometry.attributes.position;
  const center = new THREE.Vector3();
  const vertex = new THREE.Vector3();
  const ringSize = radialSegments + 1;

  for (let i = 0; i <= tubularSegments; i++) {
    const t = i / tubularSegments;
    curve.getPointAt(t, center);

    // thicker at the base, slimmer mid-stem, flaring into the flower head
    let scale = lerp(1.2, 0.8, Math.pow(t, 0.7));
    const neck = Math.max(0, (t - 0.9) / 0.1);
    scale += 0.45 * neck * neck;
    scale *= 1 + 0.04 * Math.sin(t * 38 + 1.3);

    for (let j = 0; j < ringSize; j++) {
      const index = i * ringSize + j;
      vertex.fromBufferAttribute(position, index).sub(center).multiplyScalar(scale).add(center);
      position.setXYZ(index, vertex.x, vertex.y, vertex.z);
    }
  }
  geometry.computeVertexNormals();

  const map = createStemTexture();
  map.repeat.set(6, 2);

  const material = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    map,
    bumpMap: map,
    bumpScale: 0.6,
    roughness: 0.85,
    metalness: 0
  });

  const stem = new THREE.Mesh(geometry, material);
  stem.castShadow = true;
  stem.receiveShadow = true;
  return stem;
}

// ---------------------------------------------------------------- leaves

function createSunflowerLeafGeometry(length, halfWidth, droop, asymmetry, random) {
  const petioleEnd = 0.2;
  const serrationPhase = random() * 6;

  return buildBladeGeometry(14, 32, (u, v) => {
    const s = Math.max(0, (v - petioleEnd) / (1 - petioleEnd));

    // heart-shaped blade: wide near the base, drawn out to a pointed tip
    const bladeWidth = halfWidth * Math.pow(Math.sin(Math.PI * Math.pow(s, 0.7)), 0.85);
    const serration = 1 + 0.045 * Math.pow(Math.abs(u), 4) * (((s * 16 + serrationPhase) % 1) - 0.5) * 2;
    const side = u < 0 ? 1 - asymmetry : 1 + asymmetry;
    const width = Math.max(0.025, bladeWidth * serration * side);

    const x = u * width;
    const y = v * length;
    const vein = 0.012 * Math.exp(-Math.pow(u / 0.09, 2)) * Math.sin(Math.PI * Math.min(1, v * 1.1));
    const fold = 0.22 * Math.abs(x) * Math.min(1, s * 3);
    const z = -droop * length * v * v - fold + vein;
    return [x, y, z];
  });
}

function createSunflowerLeaf(length, halfWidth, droop, random, leafTexture) {
  const geometry = createSunflowerLeafGeometry(length, halfWidth, droop, (random() - 0.5) * 0.2, random);
  // length along -Z, upper surface facing +Y
  geometry.rotateX(-Math.PI / 2);

  const commonSettings = {
    map: leafTexture,
    bumpMap: leafTexture,
    bumpScale: 0.8,
    roughness: 0.7,
    metalness: 0
  };
  const upperMaterial = new THREE.MeshStandardMaterial({ ...commonSettings, side: THREE.FrontSide });
  const underMaterial = new THREE.MeshStandardMaterial({ ...commonSettings, side: THREE.BackSide });

  const upper = new THREE.Mesh(geometry, upperMaterial);
  const under = new THREE.Mesh(geometry, underMaterial);
  upper.castShadow = true;
  upper.receiveShadow = true;
  under.receiveShadow = true;

  const leaf = new THREE.Group();
  leaf.add(upper, under);
  leaf.userData = {
    upperMaterial,
    underMaterial,
    upperMesh: upper,
    underMesh: under,
    shade: 0.92 + random() * 0.16
  };
  return leaf;
}

function tintSunflowerLeaf(leaf, color) {
  const { upperMaterial, underMaterial, shade } = leaf.userData;
  upperMaterial.color.copy(color).multiplyScalar(shade);
  underMaterial.color.copy(color).multiplyScalar(shade * 0.6);
}

function createSunflowerLeaves(curve, random, initialTint) {
  const leafTexture = createLeafTexture();
  const attachments = [0.2, 0.3, 0.42, 0.54, 0.66, 0.78];
  const leaves = [];

  attachments.forEach((t, i) => {
    const sizeFactor = lerp(1.15, 0.7, i / (attachments.length - 1)) * (0.92 + random() * 0.16);
    const leaf = createSunflowerLeaf(
      1.0 * sizeFactor,
      0.4 * sizeFactor,
      lerp(0.32, 0.16, i / (attachments.length - 1)) + random() * 0.06,
      random,
      leafTexture
    );
    tintSunflowerLeaf(leaf, initialTint);

    const pivot = new THREE.Group();
    pivot.position.copy(curve.getPointAt(t));
    pivot.rotation.y = i * 2.399963 + (random() - 0.5) * 0.5; // golden angle phyllotaxis
    pivot.rotation.order = 'YXZ';

    const pitch = lerp(0.12, 0.55, i / (attachments.length - 1)) + (random() - 0.5) * 0.15;
    pivot.rotation.x = pitch;
    pivot.rotation.z = (random() - 0.5) * 0.2;
    pivot.userData = {
      basePitch: pitch,
      baseRoll: pivot.rotation.z,
      phase: random() * Math.PI * 2,
      leaf
    };
    pivot.add(leaf);
    leaves.push(pivot);
  });

  return { leaves, leafTexture };
}

// ---------------------------------------------------------------- petals

const PETAL_PALETTE = [0xf2b705, 0xf6c10a, 0xe9a800, 0xfbcb1c, 0xf0a30a].map((hex) => new THREE.Color(hex));
const PETAL_BASE_TINT = new THREE.Color(0xd98a00);
const PETAL_TIP_TINT = new THREE.Color(0xffd83a);

function petalProfile(t) {
  if (t < 0.3) return 0.35 + 0.65 * Math.sin((t / 0.3) * Math.PI * 0.5);
  return Math.pow(Math.cos(((t - 0.3) / 0.7) * Math.PI * 0.5), 0.7);
}

function createSunflowerPetal(length, width, bend, cup, sideCurve, baseColor) {
  const color = new THREE.Color();
  return buildBladeGeometry(
    6,
    12,
    (u, v) => {
      const halfWidth = width * petalProfile(v);
      const x = u * halfWidth + sideCurve * v * v * length * 0.12;
      const y = v * length;
      const ridge = 0.18 * halfWidth * (1 - Math.abs(u));
      const z = bend * length * v * v - cup * halfWidth * u * u + ridge;
      return [x, y, z];
    },
    (u, v) => {
      color.copy(baseColor).lerp(PETAL_BASE_TINT, Math.max(0, 1 - v * 4) * 0.7);
      color.lerp(PETAL_TIP_TINT, v * v * 0.5);
      return color.multiplyScalar(1 - 0.1 * (1 - Math.abs(u)) * 0.5);
    }
  );
}

// one ring of petals around the disk; returns a single merged geometry
function createPetalLayer(random, options) {
  const { count, radius, length, width, pitch, zOffset, angleOffset, bend } = options;
  const geometries = [];
  const matrix = new THREE.Matrix4();
  const quaternion = new THREE.Quaternion();
  const euler = new THREE.Euler(0, 0, 0, 'ZXY');
  const position = new THREE.Vector3();
  const scale = new THREE.Vector3();

  for (let i = 0; i < count; i++) {
    const angle = angleOffset + (i / count) * Math.PI * 2 + (random() - 0.5) * 0.12;
    const petalLength = length * (0.85 + random() * 0.3);
    const petalWidth = width * (0.8 + random() * 0.4);
    const baseColor = PETAL_PALETTE[Math.floor(random() * PETAL_PALETTE.length)];

    const geometry = createSunflowerPetal(
      petalLength,
      petalWidth,
      bend + (random() - 0.5) * 0.14,
      0.25 + random() * 0.35,
      (random() - 0.5) * 1.2,
      baseColor
    );

    const r = radius * (0.97 + random() * 0.06);
    position.set(Math.cos(angle) * r, Math.sin(angle) * r, zOffset + (random() - 0.5) * 0.015);
    euler.set(
      pitch + (random() - 0.5) * 0.18,
      (random() - 0.5) * 0.25,
      angle - Math.PI / 2 + (random() - 0.5) * 0.08
    );
    quaternion.setFromEuler(euler);
    scale.setScalar(1);
    matrix.compose(position, quaternion, scale);
    geometry.applyMatrix4(matrix);
    geometries.push(geometry);
  }

  const merged = mergeGeometries(geometries);
  geometries.forEach((g) => g.dispose());
  return merged;
}

function createSunflowerPetals(random) {
  const layers = [
    { count: 36, radius: 0.27, length: 0.58, width: 0.135, pitch: -0.05, zOffset: -0.03, angleOffset: 0, bend: -0.08 },
    { count: 30, radius: 0.27, length: 0.44, width: 0.125, pitch: 0.15, zOffset: 0.0, angleOffset: 0.09, bend: 0.02 },
    { count: 22, radius: 0.26, length: 0.31, width: 0.11, pitch: 0.35, zOffset: 0.02, angleOffset: 0.17, bend: 0.06 }
  ];

  const geometry = mergeGeometries(layers.map((layer) => createPetalLayer(random, layer)));
  const material = new THREE.MeshStandardMaterial({
    vertexColors: true,
    roughness: 0.55,
    metalness: 0,
    side: THREE.DoubleSide
  });
  const petals = new THREE.Mesh(geometry, material);
  petals.castShadow = true;
  petals.receiveShadow = true;
  return petals;
}

// ---------------------------------------------------------------- seed disk

const DISK_RADIUS = 0.34;
const DISK_HEIGHT = 0.08;

function createSunflowerSeeds(random) {
  const count = 480;
  const seedGeometry = new THREE.SphereGeometry(1, 6, 4);
  const material = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.85, metalness: 0 });
  const seeds = new THREE.InstancedMesh(seedGeometry, material, count);
  seeds.castShadow = true;
  seeds.receiveShadow = true;

  const goldenAngle = Math.PI * (3 - Math.sqrt(5));
  const dummy = new THREE.Object3D();
  const normal = new THREE.Vector3();
  const zAxis = new THREE.Vector3(0, 0, 1);
  const spin = new THREE.Quaternion();
  const innerColor = new THREE.Color(0x1c1209);
  const midColor = new THREE.Color(0x3b2412);
  const outerColor = new THREE.Color(0x5e3b18);
  const fleckColor = new THREE.Color(0x9a6216);
  const color = new THREE.Color();

  for (let i = 0; i < count; i++) {
    const radial = Math.sqrt((i + 0.5) / count);
    const r = radial * DISK_RADIUS * 0.97;
    const angle = i * goldenAngle;
    const dome = Math.sqrt(Math.max(0, 1 - radial * radial * 0.85));
    const z = DISK_HEIGHT * dome * 0.95;

    // surface normal of the dome, so seeds lean outward as they get further from the center
    normal.set(Math.cos(angle) * radial * 0.6, Math.sin(angle) * radial * 0.6, 1).normalize();
    dummy.position.set(Math.cos(angle) * r, Math.sin(angle) * r, z);
    dummy.quaternion.setFromUnitVectors(zAxis, normal);
    spin.setFromAxisAngle(zAxis, angle + Math.PI / 2 + (random() - 0.5) * 0.7);
    dummy.quaternion.multiply(spin);

    // seeds grow slightly toward the rim; slightly randomised, flattened ellipsoids
    const size = (0.011 + radial * 0.008) * (0.85 + random() * 0.4);
    dummy.scale.set(size * 0.8, size * 1.35, size * 0.7);
    dummy.updateMatrix();
    seeds.setMatrixAt(i, dummy.matrix);

    if (radial < 0.5) color.copy(innerColor).lerp(midColor, radial * 2);
    else color.copy(midColor).lerp(outerColor, (radial - 0.5) * 2);
    if (radial > 0.8 && random() < 0.3) color.lerp(fleckColor, 0.5 + random() * 0.4);
    color.multiplyScalar(0.75 + random() * 0.5);
    seeds.setColorAt(i, color);
  }
  seeds.instanceMatrix.needsUpdate = true;
  seeds.instanceColor.needsUpdate = true;
  return seeds;
}

function createSunflowerDiskBase() {
  const geometry = new THREE.SphereGeometry(1, 28, 14);
  const disk = new THREE.Mesh(
    geometry,
    new THREE.MeshStandardMaterial({ color: 0x2a190c, roughness: 0.95 })
  );
  disk.scale.set(DISK_RADIUS, DISK_RADIUS, DISK_HEIGHT * 1.1);
  disk.position.z = -0.005;
  disk.castShadow = true;
  disk.receiveShadow = true;
  return disk;
}

// ---------------------------------------------------------------- sepals

function createSunflowerSepals(random) {
  const material = new THREE.MeshStandardMaterial({
    color: 0x4e7a2e,
    roughness: 0.75,
    side: THREE.DoubleSide
  });

  const rings = [
    { count: 14, radius: 0.25, length: 0.3, width: 0.085, pitch: -0.55, zOffset: -0.05, angleOffset: 0.1 },
    { count: 12, radius: 0.2, length: 0.26, width: 0.08, pitch: -0.95, zOffset: -0.09, angleOffset: 0.35 }
  ];

  const geometries = [];
  const matrix = new THREE.Matrix4();
  const quaternion = new THREE.Quaternion();
  const euler = new THREE.Euler(0, 0, 0, 'ZXY');
  const position = new THREE.Vector3();
  const unit = new THREE.Vector3(1, 1, 1);

  rings.forEach((ring) => {
    for (let i = 0; i < ring.count; i++) {
      const angle = ring.angleOffset + (i / ring.count) * Math.PI * 2 + (random() - 0.5) * 0.15;
      const length = ring.length * (0.85 + random() * 0.3);
      const width = ring.width * (0.85 + random() * 0.3);

      // wide base, long pointed tip, curling backward
      const geometry = buildBladeGeometry(4, 8, (u, v) => {
        const halfWidth = width * Math.pow(1 - v, 0.9) * (0.55 + 0.45 * Math.sin(Math.min(1, v * 3) * Math.PI * 0.5));
        return [u * halfWidth, v * length, -0.35 * length * v * v - 0.25 * halfWidth * u * u];
      });

      position.set(Math.cos(angle) * ring.radius, Math.sin(angle) * ring.radius, ring.zOffset);
      euler.set(ring.pitch + (random() - 0.5) * 0.2, (random() - 0.5) * 0.2, angle - Math.PI / 2);
      quaternion.setFromEuler(euler);
      matrix.compose(position, quaternion, unit);
      geometry.applyMatrix4(matrix);
      geometries.push(geometry);
    }
  });

  const merged = mergeGeometries(geometries);
  geometries.forEach((g) => g.dispose());

  // green receptacle cup behind the head
  const cupGeometry = new THREE.SphereGeometry(1, 24, 12);
  cupGeometry.scale(0.3, 0.3, 0.13);
  cupGeometry.translate(0, 0, -0.07);

  const group = new THREE.Group();
  const bracts = new THREE.Mesh(merged, material);
  bracts.castShadow = true;
  bracts.receiveShadow = true;
  const cup = new THREE.Mesh(cupGeometry, material);
  cup.castShadow = true;
  group.add(bracts, cup);
  return group;
}

// ---------------------------------------------------------------- head

function createSunflowerHead(random) {
  const head = new THREE.Group();
  const petals = createSunflowerPetals(random);
  const diskBase = createSunflowerDiskBase();
  const seeds = createSunflowerSeeds(random);
  const sepals = createSunflowerSepals(random);
  head.add(sepals, petals, diskBase, seeds);
  head.userData.meshes = [petals, diskBase, seeds];
  return head;
}

// ---------------------------------------------------------------- whole flower

export function createSunflower({ leafTint = new THREE.Color(0x3e9f4f) } = {}) {
  const random = createRandom(20240611);
  const root = new THREE.Group();

  const stemCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0.0, 0.8, 0.0),
    new THREE.Vector3(0.02, 1.3, 0.02),
    new THREE.Vector3(-0.03, 1.9, 0.06),
    new THREE.Vector3(0.02, 2.5, 0.05),
    new THREE.Vector3(0.08, 2.95, 0.1),
    new THREE.Vector3(0.07, 3.2, 0.24)
  ]);
  const stem = createSunflowerStem(stemCurve);
  root.add(stem);

  const { leaves, leafTexture } = createSunflowerLeaves(stemCurve, random, leafTint);
  leaves.forEach((pivot) => root.add(pivot));

  // head faces toward the window / camera side (+Z) with an irregular tilt
  const head = createSunflowerHead(random);
  const headBaseRotation = new THREE.Euler(-0.22, 0.12, 0.09, 'YXZ');
  head.rotation.copy(headBaseRotation);
  const stemEnd = stemCurve.getPointAt(1);
  head.position.copy(stemEnd).add(new THREE.Vector3(0, 0, 0.1).applyEuler(head.rotation));
  root.add(head);

  const clickTargets = [
    stem,
    ...head.userData.meshes,
    ...leaves.flatMap((pivot) => [pivot.userData.leaf.userData.upperMesh, pivot.userData.leaf.userData.underMesh])
  ];

  function setLeafTint(color) {
    leaves.forEach((pivot) => tintSunflowerLeaf(pivot.userData.leaf, color));
  }

  // very small sinusoidal motion, nothing that reads as spinning
  function update(t) {
    root.rotation.z = Math.sin(t * 0.6) * 0.012;
    root.rotation.x = Math.sin(t * 0.45 + 1.0) * 0.008;

    leaves.forEach((pivot) => {
      const { basePitch, baseRoll, phase } = pivot.userData;
      pivot.rotation.x = basePitch + Math.sin(t * 1.1 + phase) * 0.03;
      pivot.rotation.z = baseRoll + Math.sin(t * 0.8 + phase * 1.7) * 0.015;
    });

    head.rotation.x = headBaseRotation.x + Math.sin(t * 0.7) * 0.008;
    head.rotation.y = headBaseRotation.y + Math.sin(t * 0.5 + 2.0) * 0.01;
  }

  function dispose() {
    leafTexture.dispose();
    root.traverse((object) => {
      if (object.isMesh || object.isInstancedMesh) {
        object.geometry.dispose();
        const materials = Array.isArray(object.material) ? object.material : [object.material];
        materials.forEach((m) => {
          if (m.map && m.map !== leafTexture) m.map.dispose();
          m.dispose();
        });
      }
    });
  }

  return { group: root, clickTargets, setLeafTint, update, dispose };
}
