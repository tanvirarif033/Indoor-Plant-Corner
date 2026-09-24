# Indoor Plant Corner

A full-screen Three.js scene of an indoor room corner — window, floor, walls, and an animated potted plant — built for a Computer Graphics university project.

## 1. Overview

The scene fills the entire browser viewport: a wood floor, two walls, a large framed window looking out on a simple outdoor scene, and a potted plant (pot + stem + 8 leaves) that gently sways. Day/night lighting is keyboard-controlled and the plant's color is mouse-controlled.

## 2. How to run

```
npm install
npm run dev
```

Open the printed local URL (e.g. `http://localhost:5173`) **in the browser** — do not double-click `index.html` directly, and do not open `dist/index.html` from a file browser. Both skip the dev server, so the browser can't resolve the `import ... from 'three'` module (or the build's `/assets/...` paths) and the page is left blank except for the static UI panel. Always go through `npm run dev` (or `npm run build && npm run preview` for a production check).

## 3. Technologies used

Three.js (r160), Vite (dev server / bundler), plain JavaScript ES modules, GLSL (custom shader), HTML5 Canvas (procedural textures — no image files, nothing that can fail to load).

## 4. Requirement mapping

| Requirement | Implementation |
|---|---|
| Custom shader | `src/shaders.js` — `ShaderMaterial` applied to every leaf in `src/main.js` |
| Lighting | `AmbientLight` + `DirectionalLight`, `src/main.js` |
| Perspective projection | `THREE.PerspectiveCamera`, `src/main.js` |
| Texture per object | `src/textures.js` — floor, wall, pot, leaf, window textures, all canvas-generated |
| Animation | leaf sine-sway + shader time uniform, `animate()` in `src/main.js` |
| Keyboard interaction | `D` / `N` / `Space` in `src/main.js` |
| Mouse interaction | `Raycaster` click handler in `src/main.js` |
| Shadows | `renderer.shadowMap`, pot/stem cast, floor/walls receive |
| Full-screen canvas | `index.html` CSS (`html, body, canvas { width/height: 100% }`) + `renderer.setSize` |

## 5. Custom shader

`src/shaders.js` defines the leaf `ShaderMaterial` (one instance per leaf, so each leaf can hold its own color):
- **Vertex shader**: the standard transform every vertex shader does — `gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0)` — plus passing UV coordinates to the fragment shader.
- **Fragment shader**: samples the leaf texture, multiplies it by a `plantColor` uniform (this is what the mouse click changes), and adds a small `sin(time * 2.0 + vUv.y * 5.0) * 0.05` brightness wave so the shader is visibly animated, not static.

Applied in `src/main.js` inside the leaf-creation loop — each leaf gets `uniforms: { map, plantColor, time }`.

## 6. Lighting

- `AmbientLight` — soft fill light so nothing is pure black.
- `DirectionalLight` — acts as sun/moon; Three.js points it from its `position` toward the origin, so moving the position changes the light **direction**, not just its color.
- Day: bright white ambient, warm strong light from `(6, 8, 4)` (window/right side).
- Night: dim blue ambient, weak cool light from `(-5, 3, -4)` (opposite side — moonlight). The shadow direction visibly flips between modes.

## 7. Perspective projection

`new THREE.PerspectiveCamera(45, aspect, 0.1, 100)` — objects farther from the camera appear smaller, matching human vision. Camera sits at `(6, 4, 8)` looking toward `(0.5, 1.8, 0)`, a 3/4 angle that keeps the window and the plant both in frame.

## 8. Textures

All generated at runtime on an HTML `<canvas>` (`src/textures.js`), applied as `.map` on each material — no external image files, so nothing can fail to load during a demo:
- Floor: striped wood planks
- Walls: subtle off-white noise
- Pot: terracotta with horizontal ridge lines
- Leaves: green ellipse with a center vein (alpha-transparent background)
- Window glass: sky + hill + sun outdoor scene

## 9. Animation

Each leaf sits on a pivot `Group`. Every frame:
```js
pivot.rotation.z = baseRotZ + Math.sin(t * 0.6 + offset) * 0.08;
pivot.userData.material.uniforms.time.value = t;
```
A slow, small-amplitude sine sway (per-leaf phase offset so they don't move in sync) plus the shader's own animated wave term.

## 10. Keyboard interaction

`window.addEventListener('keydown', ...)` in `src/main.js`:
- `D` → day mode, `N` → night mode, `Space` → toggle. The current mode is shown live in the on-screen panel.

## 11. Mouse interaction

A `click` listener converts the cursor position to normalized device coordinates and casts a `THREE.Raycaster` against the pot, stem, and all leaf meshes. On a hit, `colorIndex` cycles green → purple → red → green, and every leaf's `plantColor` shader uniform is updated directly — the 3D object itself changes, not just UI text (the panel's color label is just a readout of the same state).

## 12. Day/Night implementation

`setMode(isNight)` in `src/main.js` is the single place that updates: ambient light intensity/color, directional light intensity/color/**position**, scene background, window glass tint/opacity, and the UI mode badge.

## 13. What was wrong before / what changed

The previous version rendered correctly under a running Vite dev server but the page you saw was blank because the app wasn't being served by Vite (opened as a raw file, or the built `dist/index.html` opened directly) — neither can resolve the bundler-managed `three` import or root-absolute build asset paths. Fixes and upgrades made:
- `index.html`: hardened full-viewport CSS (`html, body, canvas` at 100% width/height), added an on-page error banner (`#fatalError`) so any future failure shows a visible message instead of a silent blank page.
- `src/main.js`: wrapped scene setup in `try/catch` reporting to that banner; enlarged the room and repositioned the camera for a bigger, clearer composition; added a plant stem; raised leaf count to 8; enabled shadow mapping (`renderer.shadowMap`, `dirLight.castShadow`, floor/wall `receiveShadow`, pot/stem `castShadow`); moved the custom shader onto the leaves (tied to the click-to-change-color interaction via the `plantColor` uniform) instead of the window glass.
- `src/shaders.js`: replaced the glass tint shader with the leaf shader (texture × color + animated wave).
- `src/textures.js`: window texture upgraded to a small outdoor scene (sky/hill/sun) instead of a flat gradient.

## 14. How to demonstrate every requirement

1. Load the app via `npm run dev` and open the printed URL — the room fills the whole browser window immediately.
2. Point out the window (top right) and the plant (pot, stem, leaves) — both clearly visible, both textured.
3. Press `N` — lighting dims, the shadow direction flips, the window darkens (light direction + intensity change).
4. Press `D` — back to bright daylight.
5. Press `Space` — toggles between the two.
6. Click directly on the leaves or pot — the plant cycles green → purple → red, and the panel's color label updates to match.
7. Point out the leaves gently swaying — that's the sine-wave animation running every frame.
8. Open `src/shaders.js` and show the vertex/fragment GLSL — that's the custom shader, applied to the leaves, and its `plantColor` uniform is exactly what the mouse click updates.
9. Resize the browser window — the scene keeps filling the viewport (camera aspect + renderer size both update on `resize`).

## 15. Likely viva questions

**Q: Which camera did you use, and why?**
A: `PerspectiveCamera` — it gives realistic depth, where farther objects appear smaller, unlike an orthographic camera.

**Q: Where is the custom shader, and what does it do?**
A: `src/shaders.js`, applied to the leaves. The vertex shader does the standard position transform; the fragment shader multiplies the leaf texture by a `plantColor` uniform and adds a small animated sine wave for a subtle "alive" shimmer.

**Q: How does clicking change the plant's color?**
A: A `Raycaster` detects which mesh the click hit. If it's the pot, stem, or a leaf, I cycle to the next color in `[green, purple, red]` and write it directly into each leaf's `plantColor` shader uniform.

**Q: How does day/night lighting work?**
A: One function, `setMode()`, changes the ambient light's intensity/color, the directional light's intensity/color/**position** (which changes its direction, since Three.js directional lights always point at the origin from their position), the background color, and the window tint.

**Q: How does the leaf animation work?**
A: Each leaf is parented to a small pivot group; every frame I set `pivot.rotation.z` to a base angle plus `sin(time * speed + offset) * 0.08`, so it sways slowly and each leaf is slightly out of phase with the others.

**Q: Why are the textures generated instead of image files?**
A: They're drawn with the HTML5 Canvas 2D API into a `CanvasTexture`, so there are zero external asset files that could go missing or fail to load during the demo.

**Q: Why do shadows look the way they do?**
A: `renderer.shadowMap` is enabled and the directional light casts shadows; the floor and walls receive them. Moving the light between day/night positions visibly changes the shadow's direction and softness.
