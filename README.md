# Indoor Plant Corner

A full-screen Three.js scene of an indoor room corner: wood floor, plaster walls, a framed window looking out on an animated outdoor scene, a pendant lamp, and a potted sunflower that sways in the breeze. Day/night lighting is keyboard-controlled and the leaf color is mouse-controlled.

## 1. How to run

```
npm install
npm run dev
```

Open the printed local URL (e.g. `http://localhost:5173`) in the browser. Do not double-click `index.html` or open `dist/index.html` from a file browser: the browser can't resolve the bundler-managed `import ... from 'three'` or the build's asset paths, and the page stays blank. For a production check use `npm run build && npm run preview`.

If startup fails, an on-page error banner (`#fatalError`) shows the message instead of a silent blank page.

## 2. Technologies

Three.js, Vite (dev server / bundler), plain JavaScript ES modules, GLSL (custom shaders), HTML5 Canvas (procedural textures).

## 3. Requirement mapping

| Requirement | Implementation |
|---|---|
| Custom shaders | `src/shaders.js` (GLSL). **Window glass** is a full hand-written `ShaderMaterial` (vertex + fragment: fresnel reflection, sweeping sheen, smudge texture), created in `src/roomWindow.js`. **Sunflower leaves** keep `MeshStandardMaterial` (so lighting and shadows still work) and get GLSL injected via `onBeforeCompile` in `src/sunflower.js`: vertex wind flutter that grows toward the leaf tip, plus fragment mottling and a translucent fresnel rim that fades at night. |
| Lighting | `src/lighting.js`: `HemisphereLight` fill, shadow-casting `DirectionalLight` (sun by day, moon by night, aimed through the window), `PointLight` skylight at the window, warm `PointLight` pendant lamp; soft shadows. `src/dayNight.js` blends everything smoothly between day and night. |
| Perspective projection | `THREE.PerspectiveCamera` in `src/camera.js`, placed inside the room at eye height; `updateProjectionMatrix()` is called on resize. |
| Texture for each object | Floor, walls and ceiling use photographed PBR sets (diffuse + normal + roughness). Every other object has its own texture: terracotta pot, soil, window frame and trim, lamp, concrete foundation, grass, glass smudges, window scenery (sky, clouds, hills, trees, stars, moon), stem, leaf veins, petals, seeds and sepals. |
| Animation | Delta-time loop in `src/main.js`: stem/leaf/flower-head sway, GLSL leaf flutter, drifting clouds and stars, sweeping glass sheen, eased day/night and lamp transitions. |
| Mouse interaction | OrbitControls (clamped so the camera stays inside the room). Clicking the pot, soil or plant raycasts the hit and cycles the leaf color green → purple → red; drags are ignored. |
| Keyboard interaction | See the table below. |

### Keyboard controls

| Key | Action |
|---|---|
| `N` / `Space` | Toggle day / night |
| `L` | Toggle the pendant lamp (it also follows day/night by default) |
| `C` | Cycle leaf color (same as clicking the plant) |
| `R` | Reset the camera |
| `W A S D` / arrow keys | Walk around the room |
| `Q` / `E` | Lower / raise the view |

## 4. Texture credits

The floor, wall and ceiling maps in `src/assets/textures/` are CC0 (public domain) photographed materials from Poly Haven:

- Walls / ceiling: https://polyhaven.com/a/white_stucco
- Floor: https://polyhaven.com/a/wooden_floor_02

All other textures are drawn procedurally with the Canvas 2D API at runtime (`src/textures.js`, `src/sunflower.js`). All models are built from Three.js geometries, and the code is original work.

## 5. How to demonstrate every requirement

1. Run `npm run dev` and open the URL. The room fills the whole window.
2. Point out the window, lamp and sunflower (pot, stem, leaves, flower head), all textured.
3. Press `N`. The lighting fades to night, the sun/moon direction changes, shadows move, the window scenery turns to stars and moon, and the lamp switches on.
4. Press `N` or `Space` again to fade back to day. Press `L` to toggle the lamp on its own.
5. Click the leaves or pot (or press `C`). The leaf color cycles green → purple → red and the panel label updates.
6. Watch the leaves and flower head sway, and the glass sheen and clouds drift.
7. Drag with the mouse to orbit, scroll to zoom, and use `W A S D` / `Q` / `E` to walk. Press `R` to reset.
8. Open `src/shaders.js` to show the GLSL for the glass and the leaves.
9. Resize the window. The scene keeps filling the viewport.

## 6. Likely viva questions

**Which camera did you use, and why?**
`PerspectiveCamera(60°, aspect, 0.1, 60)`. It gives realistic depth (distant objects look smaller), unlike an orthographic camera.

**Where are the custom shaders and what do they do?**
`src/shaders.js`. The window glass is a complete `ShaderMaterial`: the vertex shader computes world-space normal and view direction, and the fragment shader mixes a tint with a sky reflection by fresnel, adds a moving diagonal sheen and a smudge texture. The leaves use `onBeforeCompile` to inject a vertex wind-flutter displacement and a fragment mottling/rim-light effect into the standard material, so they still receive Three.js lights and shadows.

**How does clicking change the plant color?**
A `Raycaster` (`src/clickToColor.js`) checks whether the click hit the pot, soil or plant. If so, it advances an index through the `leafColors` array (green, purple, red) and applies the color to the leaf materials. Drags are ignored so orbiting doesn't trigger it.

**How does day/night lighting work?**
`setMode()` only chooses the target. Each frame `update(dt)` eases a `nightMix` value toward 0 or 1, and `applyEnvironment()` lerps the hemisphere light, sun/moon intensity, color and position, skylight, background, glass uniforms, lamp and leaf rim light. The result is a smooth transition.

**How does the animation work?**
Each frame uses a clamped delta time. The plant's stem, leaves and head follow sine functions with per-leaf phase offsets, the leaf vertex shader gets `uTime` for flutter, the glass shader gets `uTime` for the sheen, and the window scenery is redrawn about 16 times per second.

**Why are most textures generated instead of image files?**
They are drawn with Canvas 2D into `CanvasTexture`s, which keeps the project self-contained and original. Only the floor, wall and ceiling use photographed CC0 texture sets, credited above, because realistic plaster and wood are hard to fake procedurally.

**Why do shadows look the way they do?**
The renderer's shadow map is enabled and the directional light casts shadows onto surfaces that receive them. Moving the light between its day and night positions changes the shadow direction.
