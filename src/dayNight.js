import * as THREE from 'three';

// ============================================================
// DAY / NIGHT
//
// setMode() only chooses the target. Every frame update(dt) eases
// nightMix toward it (delta-time based) and applyEnvironment()
// blends lights, sky, glass and scenery, so the change is a smooth
// transition rather than a hard cut.
// ============================================================
export function createDayNight({
  scene,
  ambientLight,
  dirLight,
  windowLight,
  lampLight,
  lampBulbMaterial,
  outdoorGround,
  glassUniforms,
  sunflower
}) {

  let isNight = false;

  let nightMix = 0;

  let lampOn = false;

  let lampLevel = 0;


  const modeLabel =
    document.getElementById(
      'mode'
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


  function toggleNight() {

    setMode(
      !isNight
    );
  }


  function toggleLamp() {

    lampOn =
      !lampOn;

    updateLabels();
  }


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


  // advances the night/lamp blend by dt seconds, re-applying the
  // environment only when something actually changed, and returns
  // the current nightMix (0..1) for callers that redraw with it
  // every frame regardless (e.g. the window scenery sky).
  function update(dt) {

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

    return nightMix;
  }


  return {
    setMode,
    toggleNight,
    toggleLamp,
    applyEnvironment,
    update
  };
}
