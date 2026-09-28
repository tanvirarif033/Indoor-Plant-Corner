import * as THREE from 'three';

// Most textures are drawn on canvas at runtime so no external image files are needed.
// The walls, ceiling and floor use real photographed surfaces instead (CC0, Poly Haven:
// https://polyhaven.com/a/white_stucco and https://polyhaven.com/a/wooden_floor_02) so
// they catch light like actual painted plaster and hardwood.
import wallDiffuseUrl from './assets/textures/wall/wall_diffuse.jpg';
import wallNormalUrl from './assets/textures/wall/wall_normal.jpg';
import wallRoughnessUrl from './assets/textures/wall/wall_roughness.jpg';
import floorDiffuseUrl from './assets/textures/floor/floor_diffuse.jpg';
import floorNormalUrl from './assets/textures/floor/floor_normal.jpg';
import floorRoughnessUrl from './assets/textures/floor/floor_roughness.jpg';

function canvas(size = 256) {
  const c = document.createElement('canvas');
  c.width = c.height = size;
  return c;
}

const textureLoader = new THREE.TextureLoader();

// loads a photographed diffuse/normal/roughness map set and tiles it to taste
function loadPbrMaps(diffuseUrl, normalUrl, roughnessUrl, repeatX, repeatY, anisotropy = 8) {
  const diffuse = textureLoader.load(diffuseUrl);
  diffuse.colorSpace = THREE.SRGBColorSpace;

  const normal = textureLoader.load(normalUrl);
  const roughness = textureLoader.load(roughnessUrl);

  [diffuse, normal, roughness].forEach((tex) => {
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(repeatX, repeatY);
    tex.anisotropy = anisotropy;
  });

  return { map: diffuse, normalMap: normal, roughnessMap: roughness };
}

// real photographed plaster wall (walls tile more tightly than the broad ceiling plane)
export function createWallMaps() {
  return loadPbrMaps(wallDiffuseUrl, wallNormalUrl, wallRoughnessUrl, 3, 1.4);
}

// same physical surface, tiled to suit the wide ceiling plane
export function createCeilingMaps() {
  return loadPbrMaps(wallDiffuseUrl, wallNormalUrl, wallRoughnessUrl, 3, 2.4);
}

// real photographed hardwood plank floor
export function createFloorMaps() {
  return loadPbrMaps(floorDiffuseUrl, floorNormalUrl, floorRoughnessUrl, 4, 3.4);
}

// subtle painted wall texture
export function createWallTexture() {
  const c = canvas(256);
  const ctx = c.getContext('2d');
  ctx.fillStyle = '#e8e2d6';
  ctx.fillRect(0, 0, c.width, c.height);
  for (let i = 0; i < 1800; i++) {
    ctx.fillStyle = `rgba(${i % 3 === 0 ? '255,255,255' : '0,0,0'},${Math.random() * 0.035})`;
    ctx.fillRect(Math.random() * c.width, Math.random() * c.height, 2, 2);
  }
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(2, 2);
  return tex;
}

// small deterministic PRNG so procedural textures look identical on every load
function seeded(seed) {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return s / 2147483647;
  };
}

// terracotta pot: mottled clay, throwing ridges and a darker fired band
export function createPotTexture() {
  const c = canvas(256);
  const ctx = c.getContext('2d');
  const rand = seeded(31);
  const base = ctx.createLinearGradient(0, 0, 0, c.height);
  base.addColorStop(0, '#c9713f');
  base.addColorStop(0.5, '#bb623a');
  base.addColorStop(1, '#a95633');
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, c.width, c.height);
  for (let i = 0; i < 900; i++) {
    const light = rand() < 0.5;
    ctx.fillStyle = light ? `rgba(230,150,100,${rand() * 0.12})` : `rgba(90,40,20,${rand() * 0.14})`;
    const r = 2 + rand() * 9;
    ctx.beginPath();
    ctx.arc(rand() * c.width, rand() * c.height, r, 0, Math.PI * 2);
    ctx.fill();
  }
  for (let y = 0; y < c.height; y += 24) {
    ctx.fillStyle = 'rgba(0,0,0,0.13)';
    ctx.fillRect(0, y, c.width, 3);
    ctx.fillStyle = 'rgba(255,200,150,0.10)';
    ctx.fillRect(0, y + 4, c.width, 2);
  }
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(2, 1);
  tex.anisotropy = 4;
  return tex;
}

// dark granular potting soil with pebbles and bark flecks
export function createSoilTexture() {
  const c = canvas(256);
  const ctx = c.getContext('2d');
  const rand = seeded(5);
  ctx.fillStyle = '#3d2a1c';
  ctx.fillRect(0, 0, c.width, c.height);
  const tones = ['#2b1c12', '#4b3423', '#5a4030', '#33241a', '#6b5a4a'];
  for (let i = 0; i < 4200; i++) {
    ctx.fillStyle = tones[Math.floor(rand() * tones.length)];
    ctx.globalAlpha = 0.35 + rand() * 0.5;
    const r = 0.8 + rand() * 2.6;
    ctx.beginPath();
    ctx.ellipse(rand() * c.width, rand() * c.height, r, r * (0.6 + rand() * 0.5), rand() * 3, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  return tex;
}

// short lawn grass for the ground outside the building (tiles seamlessly)
export function createGrassTexture() {
  const c = canvas(256);
  const ctx = c.getContext('2d');
  const rand = seeded(41);
  ctx.fillStyle = '#5f8a44';
  ctx.fillRect(0, 0, c.width, c.height);
  const blades = ['#4c7a38', '#6d9a4c', '#7aa856', '#3f6b30', '#86a95a'];
  for (let i = 0; i < 5000; i++) {
    ctx.strokeStyle = blades[Math.floor(rand() * blades.length)];
    ctx.globalAlpha = 0.35 + rand() * 0.5;
    ctx.lineWidth = 1;
    const x0 = rand() * c.width;
    const y0 = rand() * c.height;
    ctx.beginPath();
    ctx.moveTo(x0, y0);
    ctx.lineTo(x0 + (rand() - 0.5) * 4, y0 - 3 - rand() * 5);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(30, 30);
  tex.anisotropy = 4;
  return tex;
}

// rough poured concrete for the foundation slab
export function createConcreteTexture() {
  const c = canvas(256);
  const ctx = c.getContext('2d');
  const rand = seeded(53);
  ctx.fillStyle = '#9a9a96';
  ctx.fillRect(0, 0, c.width, c.height);
  for (let i = 0; i < 3500; i++) {
    const g = 110 + Math.floor(rand() * 90);
    ctx.fillStyle = `rgba(${g},${g},${g - 4},${0.15 + rand() * 0.3})`;
    ctx.fillRect(rand() * c.width, rand() * c.height, 1 + rand() * 3, 1 + rand() * 3);
  }
  ctx.strokeStyle = 'rgba(60,60,58,0.25)';
  for (let i = 0; i < 6; i++) {
    ctx.beginPath();
    ctx.moveTo(rand() * c.width, rand() * c.height);
    ctx.lineTo(rand() * c.width, rand() * c.height);
    ctx.stroke();
  }
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(6, 1);
  return tex;
}

// round soft shadow that grounds an object on the floor
export function createContactShadowTexture() {
  const c = canvas(128);
  const ctx = c.getContext('2d');
  const g = ctx.createRadialGradient(64, 64, 8, 64, 64, 62);
  g.addColorStop(0, 'rgba(0,0,0,0.55)');
  g.addColorStop(0.55, 'rgba(0,0,0,0.3)');
  g.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, c.width, c.height);
  return new THREE.CanvasTexture(c);
}

// dark-to-clear gradient (dark at the top) for ambient-occlusion strips along wall corners
export function createEdgeShadowTexture() {
  const c = canvas(64);
  const ctx = c.getContext('2d');
  const g = ctx.createLinearGradient(0, 0, 0, c.height);
  g.addColorStop(0, 'rgba(0,0,0,0.38)');
  g.addColorStop(0.35, 'rgba(0,0,0,0.14)');
  g.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, c.width, c.height);
  return new THREE.CanvasTexture(c);
}

// stained/painted window frame wood with long grain lines
export function createFrameTexture() {
  const c = canvas(128);
  const ctx = c.getContext('2d');
  const rand = seeded(19);
  ctx.fillStyle = '#5c3b2a';
  ctx.fillRect(0, 0, c.width, c.height);
  for (let i = 0; i < 70; i++) {
    ctx.strokeStyle = rand() < 0.5 ? `rgba(30,15,8,${0.1 + rand() * 0.2})` : `rgba(140,95,60,${0.08 + rand() * 0.14})`;
    ctx.lineWidth = 0.6 + rand() * 1.4;
    const y = rand() * c.height;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.bezierCurveTo(c.width * 0.3, y + (rand() - 0.5) * 6, c.width * 0.7, y + (rand() - 0.5) * 6, c.width, y);
    ctx.stroke();
  }
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  return tex;
}

// sunflower ray-floret surface: fine lengthwise ridges (u across, v along; tip at canvas top)
export function createPetalTexture() {
  const c = canvas(128);
  const ctx = c.getContext('2d');
  const rand = seeded(77);
  ctx.fillStyle = '#efefef';
  ctx.fillRect(0, 0, c.width, c.height);
  for (let i = 0; i < 46; i++) {
    const x = rand() * c.width;
    ctx.strokeStyle = rand() < 0.6 ? `rgba(120,90,40,${0.06 + rand() * 0.1})` : `rgba(255,255,255,${0.15 + rand() * 0.2})`;
    ctx.lineWidth = 0.7 + rand() * 1.5;
    ctx.beginPath();
    ctx.moveTo(x, c.height);
    ctx.quadraticCurveTo(c.width / 2 + (x - c.width / 2) * 0.6, c.height * 0.5, c.width / 2 + (x - c.width / 2) * 0.1, 0);
    ctx.stroke();
  }
  ctx.strokeStyle = 'rgba(150,100,30,0.25)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(c.width / 2, c.height);
  ctx.lineTo(c.width / 2, 4);
  ctx.stroke();
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

// speckled dark seed / floret surface (multiplied with per-seed colors)
export function createSeedTexture() {
  const c = canvas(64);
  const ctx = c.getContext('2d');
  const rand = seeded(13);
  ctx.fillStyle = '#d8d0c8';
  ctx.fillRect(0, 0, c.width, c.height);
  for (let i = 0; i < 260; i++) {
    const g = 90 + Math.floor(rand() * 130);
    ctx.fillStyle = `rgba(${g},${g - 10},${g - 25},${0.3 + rand() * 0.5})`;
    ctx.fillRect(rand() * c.width, rand() * c.height, 1 + rand() * 3, 1 + rand() * 3);
  }
  ctx.strokeStyle = 'rgba(40,25,10,0.35)';
  for (let x = 4; x < c.width; x += 8) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x + 2, c.height);
    ctx.stroke();
  }
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

// faint smudges / dust for the window glass (read from the red channel by the glass shader)
export function createGlassSurfaceTexture() {
  const c = canvas(256);
  const ctx = c.getContext('2d');
  const rand = seeded(23);
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, c.width, c.height);
  for (let i = 0; i < 26; i++) {
    const g = ctx.createRadialGradient(0, 0, 0, 0, 0, 60);
    g.addColorStop(0, `rgba(255,255,255,${0.1 + rand() * 0.25})`);
    g.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.save();
    ctx.translate(rand() * c.width, rand() * c.height);
    ctx.scale(0.25 + rand() * 0.7, 0.1 + rand() * 0.4);
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(0, 0, 60, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
  // slightly dustier near the top and bottom edges
  const edge = ctx.createLinearGradient(0, 0, 0, c.height);
  edge.addColorStop(0, 'rgba(255,255,255,0.12)');
  edge.addColorStop(0.15, 'rgba(255,255,255,0)');
  edge.addColorStop(0.85, 'rgba(255,255,255,0)');
  edge.addColorStop(1, 'rgba(255,255,255,0.2)');
  ctx.fillStyle = edge;
  ctx.fillRect(0, 0, c.width, c.height);
  return new THREE.CanvasTexture(c);
}

// grayscale leaf surface detail (mottling, central vein, secondary veins) for the 3D
// sunflower leaf geometry. It is multiplied by the material color, so the click-to-recolor
// tint still works. u runs across the blade (x), v along it (canvas y: base at bottom).
export function createLeafTexture() {
  const size = 256;
  const c = canvas(size);
  const ctx = c.getContext('2d');
  ctx.fillStyle = '#e6e6e6';
  ctx.fillRect(0, 0, size, size);

  // soft mottling
  for (let i = 0; i < 700; i++) {
    const g = 200 + ((i * 97) % 55);
    ctx.fillStyle = `rgba(${g},${g},${g},0.18)`;
    const x = (i * 53.3) % size;
    const y = (i * 91.7) % size;
    ctx.fillRect(x, y, 3 + (i % 5), 3 + (i % 4));
  }

  const mid = size / 2;
  const bladeStart = size * 0.8; // petiole occupies the lowest 20% of the length

  // secondary veins branch from the midrib toward the leaf edge and curve to the tip
  ctx.lineCap = 'round';
  for (let side = -1; side <= 1; side += 2) {
    for (let k = 0; k < 8; k++) {
      const y0 = bladeStart - k * 20;
      const reach = 105 * (1 - k * 0.05);
      ctx.strokeStyle = 'rgba(255,255,255,0.55)';
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.moveTo(mid, y0);
      ctx.quadraticCurveTo(mid + side * reach * 0.5, y0 - 8, mid + side * reach, y0 - 46);
      ctx.stroke();
      // faint darker shadow line next to the vein for a subtle relief
      ctx.strokeStyle = 'rgba(90,90,90,0.18)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(mid, y0 + 2);
      ctx.quadraticCurveTo(mid + side * reach * 0.5, y0 - 6, mid + side * reach, y0 - 44);
      ctx.stroke();
    }
  }

  // central vein
  ctx.strokeStyle = 'rgba(255,255,255,0.9)';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(mid, size);
  ctx.lineTo(mid, 6);
  ctx.stroke();

  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

// outdoor scene seen through the window. `night` is 0 (day) .. 1 (night) so the sky can
// cross-fade during the day/night transition (true/false also work). When `target` is
// given, the same canvas texture is redrawn in place instead of allocating a new one.
export function createGlassTexture(night = 0, animationTime = 0, target = null) {
  const n = Math.min(1, Math.max(0, Number(night)));
  const tex = target || new THREE.CanvasTexture(canvas(256));
  const c = tex.image;
  const ctx = c.getContext('2d');
  const mix = (day, dark) => '#' + new THREE.Color(day).lerp(new THREE.Color(dark), n).getHexString();

  const sky = ctx.createLinearGradient(0, 0, 0, c.height);
  sky.addColorStop(0, mix('#6fc3f7', '#081827'));
  sky.addColorStop(0.65, mix('#bfe8ff', '#132d4a'));
  sky.addColorStop(1, mix('#dff4ff', '#203b5d'));
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, c.width, c.height);

  if (n > 0.02) {
    ctx.save();
    ctx.globalAlpha = n;
    for (let i = 0; i < 40; i++) {
      const x = ((i * 73.7) % c.width + (animationTime * (8 + (i % 5))) % (c.width + 30)) % (c.width + 30) - 15;
      const y = ((i * 59.3) % c.height) * 0.8 + (i % 3) * 6;
      ctx.fillStyle = i % 3 === 0 ? 'rgba(255,255,255,0.9)' : 'rgba(200,220,255,0.75)';
      ctx.fillRect(x, y, 2, 2);
    }
    ctx.restore();
  }

  const cloudSeeds = [
    { x: 0.10, y: 0.20, scale: 0.9, speed: 10 },
    { x: 0.42, y: 0.33, scale: 1.2, speed: 15 },
    { x: 0.70, y: 0.18, scale: 1.05, speed: 12 },
    { x: 0.26, y: 0.48, scale: 1.3, speed: 18 },
    { x: 0.84, y: 0.42, scale: 0.85, speed: 14 },
  ];

  for (let i = 0; i < cloudSeeds.length; i++) {
    const seed = cloudSeeds[i];
    const drift = ((animationTime * seed.speed) % (c.width + 140)) - 70;
    const x = (seed.x * c.width + drift) % (c.width + 140) - 70;
    const y = seed.y * c.height + Math.sin(animationTime * 0.7 + i) * 4;
    const scale = seed.scale;

    ctx.fillStyle = mix('#ffffff', '#b4bed2');
    ctx.globalAlpha = 0.5 - n * 0.3;
    ctx.beginPath();
    ctx.ellipse(x + 12 * scale, y + 12 * scale, 30 * scale, 14 * scale, 0, 0, Math.PI * 2);
    ctx.ellipse(x + 36 * scale, y + 12 * scale, 24 * scale, 12 * scale, 0, 0, Math.PI * 2);
    ctx.ellipse(x + 22 * scale, y + 6 * scale, 26 * scale, 16 * scale, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
  }

  // rolling hills
  ctx.fillStyle = mix('#8bc76a', '#2d3d4a');
  ctx.beginPath();
  ctx.ellipse(c.width / 2, c.height * 0.85, c.width * 0.8, c.height * 0.35, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = mix('#6fae55', '#243340');
  ctx.beginPath();
  ctx.ellipse(c.width * 0.15, c.height * 0.95, c.width * 0.5, c.height * 0.25, 0, 0, Math.PI * 2);
  ctx.fill();

  // a few trees that sway a little
  const trees = [[0.3, 0.7, 1], [0.42, 0.74, 0.8], [0.6, 0.72, 1.1], [0.7, 0.76, 0.8]];
  trees.forEach(([tx, ty, s], i) => {
    const x = tx * c.width + Math.sin(animationTime * 0.8 + i) * 1.2;
    const y = ty * c.height;
    ctx.fillStyle = mix('#5a3d25', '#1a1410');
    ctx.fillRect(x - 2 * s, y, 4 * s, 22 * s);
    ctx.fillStyle = mix('#3f8a3a', '#17281f');
    ctx.beginPath();
    ctx.arc(x, y - 4 * s, 15 * s, 0, Math.PI * 2);
    ctx.arc(x - 9 * s, y + 3 * s, 11 * s, 0, Math.PI * 2);
    ctx.arc(x + 9 * s, y + 3 * s, 11 * s, 0, Math.PI * 2);
    ctx.fill();
  });

  // moon (night) and sun (day) cross-fade
  if (n > 0.02) {
    const moonX = c.width * 0.4;
    const moonY = c.height * 0.3;
    ctx.save();
    ctx.globalAlpha = n;
    const moonGlow = ctx.createRadialGradient(moonX, moonY, 4, moonX, moonY, 22);
    moonGlow.addColorStop(0, 'rgba(255,255,255,1)');
    moonGlow.addColorStop(0.5, 'rgba(220,230,255,0.8)');
    moonGlow.addColorStop(1, 'rgba(220,230,255,0)');
    ctx.fillStyle = moonGlow;
    ctx.beginPath();
    ctx.arc(moonX, moonY, 22, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#f0f6ff';
    ctx.beginPath();
    ctx.arc(moonX, moonY, 14, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'rgba(180, 190, 210, 0.65)';
    ctx.beginPath();
    ctx.arc(moonX + 4, moonY - 3, 3.5, 0, Math.PI * 2);
    ctx.arc(moonX - 3, moonY + 4, 3.2, 0, Math.PI * 2);
    ctx.arc(moonX + 1, moonY + 6, 2.8, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
  if (n < 0.98) {
    const sunX = c.width * 0.6;
    const sunY = c.height * 0.32;
    ctx.save();
    ctx.globalAlpha = 1 - n;
    const sunGlow = ctx.createRadialGradient(sunX, sunY, 4, sunX, sunY, 38);
    sunGlow.addColorStop(0, 'rgba(255,255,255,1)');
    sunGlow.addColorStop(0.18, 'rgba(255,246,180,1)');
    sunGlow.addColorStop(0.5, 'rgba(255,220,120,0.6)');
    sunGlow.addColorStop(1, 'rgba(255,220,120,0)');
    ctx.fillStyle = sunGlow;
    ctx.beginPath();
    ctx.arc(sunX, sunY, 38, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#fff9cf';
    ctx.beginPath();
    ctx.arc(sunX, sunY, 22, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  tex.colorSpace = THREE.SRGBColorSpace;
  tex.needsUpdate = true;
  return tex;
}
