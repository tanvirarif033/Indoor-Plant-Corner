import * as THREE from 'three';

// all textures are drawn on canvas at runtime so no external image files are needed

function canvas(size = 256) {
  const c = document.createElement('canvas');
  c.width = c.height = size;
  return c;
}

// wooden plank floor texture
export function createFloorTexture() {
  const c = canvas(256);
  const ctx = c.getContext('2d');
  const plankColors = ['#9c6b3e', '#8a5a30', '#a9764a'];
  const plankH = 32;
  for (let y = 0; y < c.height; y += plankH) {
    ctx.fillStyle = plankColors[(y / plankH) % plankColors.length];
    ctx.fillRect(0, y, c.width, plankH);
    ctx.strokeStyle = 'rgba(0,0,0,0.2)';
    ctx.strokeRect(0, y, c.width, plankH);
  }
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(4, 4);
  return tex;
}

// subtle painted wall texture
export function createWallTexture() {
  const c = canvas(256);
  const ctx = c.getContext('2d');
  ctx.fillStyle = '#e8e2d6';
  ctx.fillRect(0, 0, c.width, c.height);
  for (let i = 0; i < 600; i++) {
    ctx.fillStyle = `rgba(0,0,0,${Math.random() * 0.03})`;
    ctx.fillRect(Math.random() * c.width, Math.random() * c.height, 2, 2);
  }
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(2, 2);
  return tex;
}

// terracotta ceramic pot texture with horizontal ridges
export function createPotTexture() {
  const c = canvas(128);
  const ctx = c.getContext('2d');
  ctx.fillStyle = '#c1683b';
  ctx.fillRect(0, 0, c.width, c.height);
  for (let y = 0; y < c.height; y += 10) {
    ctx.fillStyle = 'rgba(0,0,0,0.08)';
    ctx.fillRect(0, y, c.width, 2);
  }
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = THREE.RepeatWrapping;
  tex.repeat.set(3, 1);
  return tex;
}

// leaf-shaped texture with transparent background and a center vein
export function createLeafTexture() {
  const c = canvas(128);
  const ctx = c.getContext('2d');
  ctx.clearRect(0, 0, c.width, c.height);
  ctx.fillStyle = '#3f8f3f';
  ctx.beginPath();
  ctx.ellipse(64, 64, 50, 34, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = 'rgba(20,60,20,0.6)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(14, 64);
  ctx.lineTo(114, 64);
  ctx.stroke();
  const tex = new THREE.CanvasTexture(c);
  return tex;
}

// simple outdoor scene texture seen through the window glass
export function createGlassTexture() {
  const c = canvas(256);
  const ctx = c.getContext('2d');
  const sky = ctx.createLinearGradient(0, 0, 0, c.height);
  sky.addColorStop(0, '#6fc3f7');
  sky.addColorStop(0.65, '#bfe8ff');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, c.width, c.height);

  ctx.fillStyle = '#8bc76a'; // distant ground/hill
  ctx.beginPath();
  ctx.ellipse(c.width / 2, c.height * 0.85, c.width * 0.8, c.height * 0.35, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#fff6d0'; // sun
  ctx.beginPath();
  ctx.arc(c.width * 0.78, c.height * 0.22, 18, 0, Math.PI * 2);
  ctx.fill();

  const tex = new THREE.CanvasTexture(c);
  return tex;
}
