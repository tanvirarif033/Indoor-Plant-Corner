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
export function createGlassTexture(isNight = false, animationTime = 0) {
  const c = canvas(256);
  const ctx = c.getContext('2d');

  const sky = ctx.createLinearGradient(0, 0, 0, c.height);
  if (isNight) {
    sky.addColorStop(0, '#081827');
    sky.addColorStop(0.7, '#132d4a');
    sky.addColorStop(1, '#203b5d');
  } else {
    sky.addColorStop(0, '#6fc3f7');
    sky.addColorStop(0.65, '#bfe8ff');
    sky.addColorStop(1, '#dff4ff');
  }
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, c.width, c.height);

  if (isNight) {
    for (let i = 0; i < 40; i++) {
      const x = ((i * 73.7) % c.width + (animationTime * (8 + (i % 5))) % (c.width + 30)) % (c.width + 30) - 15;
      const y = ((i * 59.3) % c.height) * 0.8 + (i % 3) * 6;
      ctx.fillStyle = i % 3 === 0 ? 'rgba(255,255,255,0.9)' : 'rgba(200,220,255,0.75)';
      ctx.fillRect(x, y, 2, 2);
    }
  }

  const cloudColor = isNight ? 'rgba(180, 190, 210, 0.2)' : 'rgba(255, 255, 255, 0.55)';
  const cloudShadow = isNight ? 'rgba(100, 110, 150, 0.15)' : 'rgba(255, 255, 255, 0.3)';

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

    ctx.fillStyle = cloudShadow;
    ctx.beginPath();
    ctx.ellipse(x + 12 * scale, y + 12 * scale, 30 * scale, 14 * scale, 0, 0, Math.PI * 2);
    ctx.ellipse(x + 36 * scale, y + 12 * scale, 24 * scale, 12 * scale, 0, 0, Math.PI * 2);
    ctx.ellipse(x + 22 * scale, y + 6 * scale, 26 * scale, 16 * scale, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = cloudColor;
    ctx.beginPath();
    ctx.ellipse(x + 12 * scale, y + 12 * scale, 30 * scale, 14 * scale, 0, 0, Math.PI * 2);
    ctx.ellipse(x + 36 * scale, y + 12 * scale, 24 * scale, 12 * scale, 0, 0, Math.PI * 2);
    ctx.ellipse(x + 22 * scale, y + 6 * scale, 26 * scale, 16 * scale, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.fillStyle = isNight ? '#2d3d4a' : '#8bc76a';
  ctx.beginPath();
  ctx.ellipse(c.width / 2, c.height * 0.85, c.width * 0.8, c.height * 0.35, 0, 0, Math.PI * 2);
  ctx.fill();

  if (isNight) {
    const moonX = c.width * 0.20;
    const moonY = c.height * 0.22;
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
  } else {
    const sunX = c.width * 0.78;
    const sunY = c.height * 0.22;
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
  }

  const tex = new THREE.CanvasTexture(c);
  return tex;
}
