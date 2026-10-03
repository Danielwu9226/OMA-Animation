/**
 * THE SEA EATER vs THE BLOOP — 3D Oceanic Fight Scene to the Death (60s)
 * True Three.js WebGL 3D Engine, Procedural Web Audio & Video Exporter
 *
 * Source Models:
 * - The Bloop: https://sketchfab.com/3d-models/bloop-857501773f1b4f8d936abf517dd33b5a (by object)
 * - The Sea Eater: https://sketchfab.com/3d-models/sea-eater-ed3dc1df2a974ee4a3a0a7fccd191484 (by photon)
 */

document.addEventListener('DOMContentLoaded', () => {
  // =========================================================================
  // 1. THREE.JS 3D WEBGL ENGINE SETUP
  // =========================================================================
  const canvas = document.getElementById('fightCanvas');
  const viewport = document.getElementById('viewport-container');

  let width = window.innerWidth;
  let height = window.innerHeight;

  const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true,
    powerPreference: 'high-performance',
    alpha: false
  });
  renderer.setSize(width, height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2.0));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.15;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x02070e);
  scene.fog = new THREE.FogExp2(0x030d1a, 0.00065);

  const camera = new THREE.PerspectiveCamera(48, width / height, 1, 20000);
  camera.position.set(0, 180, 620);

  // OrbitControls for Free Cam mode
  let controls = null;
  if (typeof THREE.OrbitControls !== 'undefined') {
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxDistance = 3500;
    controls.minDistance = 30;
    controls.enabled = false; // Enabled only in 'free_orbit' mode
  }

  function resizeRenderer() {
    width = window.innerWidth;
    height = window.innerHeight;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
  }
  window.addEventListener('resize', resizeRenderer);

  // =========================================================================
  // 2. TIMELINE, COMBAT PHASES & STATE
  // =========================================================================
  let currentTime = 0; // 0.0 to 60.0
  const totalDuration = 60.0;
  let isPlaying = true;
  let playbackSpeed = 1.0;
  let soundEnabled = true;
  let cameraMode = 'cinematic'; // 'cinematic', 'sea_eater_pov', 'bloop_cam', 'underwater', 'aerial', 'free_orbit'
  let vhsEnabled = true;
  let lastTimestamp = 0;
  let screenShake = 0;

  // 60-Second Fight Choreography (Ending in a Mutual Fight to the Death)
  const scenePhases = [
    {
      act: 1,
      startTime: 0,
      endTime: 8,
      name: "ACT 1: ABYSSAL CONTACT & SONAR AWAKENING",
      subtitle: "PACIFIC OCEAN TRENCH // 14°N 142°E: The 25-km mountain titan 'The Sea Eater' heaves through tempest fog as hydrophones detect 'The Bloop' breaching at 40 knots...",
      move: "SONAR CONTACT",
      force: "0.0 GN",
      hz: "14.2 HZ (INFRASOUND)",
      distance: "2.4 KM",
      seHealth: 100,
      bloopHealth: 100,
      seMove: "HEAVING TALL",
      bloopMove: "SURFACING"
    },
    {
      act: 2,
      startTime: 8,
      endTime: 17,
      name: "ACT 2: [MOVE] BLOOP TORPEDO CHARGE & STILT DODGE",
      subtitle: "CHARGE & DODGE: The Bloop hits 90 knots with foaming cavitation wakes! The Sea Eater heaves its 5 km bent stilt limb into the clouds, deftly dodging as the Bloop crashes beneath the archway!",
      move: "TORPEDO CHARGE vs STILT DODGE",
      force: "14.8 GN",
      hz: "28.6 HZ (CAVITATION)",
      distance: "85 METERS",
      seHealth: 98,
      bloopHealth: 95,
      seMove: "STILT HIGH DODGE",
      bloopMove: "90-KNOT TORPEDO"
    },
    {
      act: 3,
      startTime: 17,
      endTime: 26,
      name: "ACT 3: [MOVE] SEA EATER 5KM CLAW SWIPE & DIVE DODGE",
      subtitle: "CLAW SWIPE: The Sea Eater brings its 5 km limb crashing down in a supersonic claw slash, carving glowing shockwaves! The Bloop dives beneath the swells, narrowly avoiding lethal talons!",
      move: "5KM CLAW SWIPE vs DIVE DODGE",
      force: "42.5 GN",
      hz: "52.0 HZ (SHOCKWAVE)",
      distance: "120 METERS",
      seHealth: 95,
      bloopHealth: 84,
      seMove: "SUPERSONIC TALON SWIPE",
      bloopMove: "EMERGENCY DIVE"
    },
    {
      act: 4,
      startTime: 26,
      endTime: 35,
      name: "ACT 4: [MOVE] BLOOP 140° SNAKE JAW BITE & ICHOR ERUPTION",
      subtitle: "SNAKE JAW BITE: The Bloop breaches the foam, unhinging its snake jaw to a 140° gape and clamping hundreds of razor needle teeth onto the Sea Eater's stilt! Titan ichor erupts as the mountain roars!",
      move: "140° SNAKE JAW BITE",
      force: "88.2 GN",
      hz: "34.8 HZ (TITAN SCREECH)",
      distance: "0 METERS (LOCKED)",
      seHealth: 72,
      bloopHealth: 76,
      seMove: "ICHOR ERUPTION // ROAR",
      bloopMove: "140° JAW CLAMP"
    },
    {
      act: 5,
      startTime: 35,
      endTime: 43,
      name: "ACT 5: [MOVE] BLOOP WHALE FLUKE TSUNAMI DETONATION",
      subtitle: "FLUKE TSUNAMI: The Bloop rolls and whips its colossal whale fluke down, detonating a 100-meter tsunami wave wall that crashes violently into the Sea Eater's mountain flank!",
      move: "FLUKE TSUNAMI SMACK",
      force: "112.4 GN",
      hz: "19.5 HZ (HYDRO-SEISMIC)",
      distance: "320 METERS",
      seHealth: 54,
      bloopHealth: 68,
      seMove: "TSUNAMI IMPACT ABSORB",
      bloopMove: "WHALE FLUKE WHIP"
    },
    {
      act: 6,
      startTime: 43,
      endTime: 52,
      name: "ACT 6: [MOVE] SEA EATER MOUNTAIN RAMMING CHARGE",
      subtitle: "MOUNTAIN RAMMING: Enraged, the Sea Eater surges forward like a moving continent, ramming 8.4x10^11 tons into the Bloop, cracking bone and knocking the leviathan back into churning foam!",
      move: "CONTINENTAL RAMMING SLAM",
      force: "245.0 GN",
      hz: "8.4 HZ (TECTONIC THUD)",
      distance: "10 METERS",
      seHealth: 41,
      bloopHealth: 28,
      seMove: "8.4x10^11 TON RAM",
      bloopMove: "FRACTURED TUMBLE"
    },
    {
      act: 7,
      startTime: 52,
      endTime: 60,
      name: "ACT 7: [FATAL CLIMAX] FIGHT TO THE DEATH & ABYSSAL EXTINCTION",
      subtitle: "FATAL MUTUAL DEATH: Mortally wounded, the Bloop executes a suicide 140° throat lunge into the Sea Eater's core as the cavernous arched maw crushes the Bloop's spine! Locked together, both sink into the 11,000m Mariana void!",
      move: "MUTUAL DEATH STRIKE",
      force: "480.0 GN (TERMINAL)",
      hz: "FLATLINE",
      distance: "0 METERS (VOID COLLAPSE)",
      seHealth: 0,
      bloopHealth: 0,
      seMove: "TERMINAL MAW CRUSH (DEAD)",
      bloopMove: "SUICIDAL CORE BITE (DEAD)"
    }
  ];

  function getCurrentPhase(t) {
    for (let p of scenePhases) {
      if (t >= p.startTime && t <= p.endTime) return p;
    }
    return scenePhases[scenePhases.length - 1];
  }

  // =========================================================================
  // 3. 3D LIGHTING & ATMOSPHERE
  // =========================================================================
  // Storm moonlight
  const moonLight = new THREE.DirectionalLight(0x7fc3f0, 1.4);
  moonLight.position.set(450, 950, 450);
  moonLight.castShadow = true;
  moonLight.shadow.mapSize.width = 2048;
  moonLight.shadow.mapSize.height = 2048;
  moonLight.shadow.camera.near = 100;
  moonLight.shadow.camera.far = 3000;
  moonLight.shadow.camera.left = -900;
  moonLight.shadow.camera.right = 900;
  moonLight.shadow.camera.top = 900;
  moonLight.shadow.camera.bottom = -900;
  scene.add(moonLight);

  // Abyss ambient fill
  const ambientLight = new THREE.AmbientLight(0x0d2238, 0.75);
  scene.add(ambientLight);

  // Bioluminescent Mariana Trench light (underwater)
  const trenchLight = new THREE.PointLight(0x00f2fe, 1.6, 2800);
  trenchLight.position.set(0, -120, 0);
  scene.add(trenchLight);

  // Dynamic lightning flash light
  const lightningLight = new THREE.PointLight(0xdcf0ff, 0, 8000);
  lightningLight.position.set(100, 1200, -200);
  scene.add(lightningLight);

  let lightningTimer = 0;
  let lightningActive = 0;

  function trigger3DLightning() {
    lightningActive = 1.0;
    lightningLight.intensity = 5.5 + Math.random() * 4.0;
    scene.fog.color.setHex(0x284566);
    setTimeout(() => {
      lightningLight.intensity = 1.5;
      setTimeout(() => {
        lightningLight.intensity = 4.0;
        setTimeout(() => {
          lightningLight.intensity = 0;
          scene.fog.color.setHex(0x030d1a);
          lightningActive = 0;
        }, 80);
      }, 60);
    }, 90);
  }

  // =========================================================================
  // 4. VOLUMETRIC 3D OCEAN SURFACE & UNDERWATER BED
  // =========================================================================
  const oceanSegments = 85;
  const oceanSize = 4000;
  const oceanGeometry = new THREE.PlaneGeometry(oceanSize, oceanSize, oceanSegments, oceanSegments);
  oceanGeometry.rotateX(-Math.PI / 2);

  // Store initial vertex positions for wave displacement
  const oceanPos = oceanGeometry.attributes.position;
  const initialOceanY = new Float32Array(oceanPos.count);
  for (let i = 0; i < oceanPos.count; i++) {
    initialOceanY[i] = oceanPos.getY(i);
  }

  const oceanMaterial = new THREE.MeshStandardMaterial({
    color: 0x081f2e,
    roughness: 0.18,
    metalness: 0.45,
    flatShading: true,
    transparent: true,
    opacity: 0.94
  });

  const oceanMesh = new THREE.Mesh(oceanGeometry, oceanMaterial);
  oceanMesh.receiveShadow = true;
  scene.add(oceanMesh);

  // Underwater abyssal seabed
  const floorGeo = new THREE.PlaneGeometry(5000, 5000, 20, 20);
  floorGeo.rotateX(-Math.PI / 2);
  const floorMat = new THREE.MeshStandardMaterial({
    color: 0x01050a,
    roughness: 0.9,
    metalness: 0.1
  });
  const floorMesh = new THREE.Mesh(floorGeo, floorMat);
  floorMesh.position.y = -450;
  scene.add(floorMesh);

  // 3D Tsunami Wave Mesh (Rises during Act 5)
  const tsunamiGeo = new THREE.CylinderGeometry(180, 220, 140, 32, 1, true, 0, Math.PI);
  tsunamiGeo.rotateZ(Math.PI / 2);
  const tsunamiMat = new THREE.MeshStandardMaterial({
    color: 0x226b80,
    roughness: 0.25,
    metalness: 0.35,
    transparent: true,
    opacity: 0,
    side: THREE.DoubleSide
  });
  const tsunamiMesh = new THREE.Mesh(tsunamiGeo, tsunamiMat);
  tsunamiMesh.position.set(120, -50, 0);
  scene.add(tsunamiMesh);

  // =========================================================================
  // 5. 3D MODEL 1: THE SEA EATER (TREVOR HENDERSON MYTHOS)
  // Exact anatomical replication based on Sketchfab UID: ed3dc1df2a974ee4a3a0a7fccd191484
  // Features: 5km mountain dome, central hollow arched cavern maw, 2 high bent stilt limbs with acute elbows & claws
  // =========================================================================
  const seaEaterGroup = new THREE.Group();
  scene.add(seaEaterGroup);

  // Dark glistening slimy wet skin shader matching sea_eater_ref.jpg
  const seFleshMat = new THREE.MeshStandardMaterial({
    color: 0x1e242d,
    roughness: 0.22,
    metalness: 0.42,
    bumpScale: 0.15
  });

  const seBoneMat = new THREE.MeshStandardMaterial({
    color: 0x4a5568,
    roughness: 0.35,
    metalness: 0.25
  });

  const seAbyssMawMat = new THREE.MeshBasicMaterial({
    color: 0x010204
  });

  // A. Central Mountain Archway Torso
  const archTorsoGroup = new THREE.Group();
  seaEaterGroup.add(archTorsoGroup);

  // Mountain dome cap
  const mountainDome = new THREE.Mesh(
    new THREE.SphereGeometry(140, 24, 16, 0, Math.PI * 2, 0, Math.PI * 0.55),
    seFleshMat
  );
  mountainDome.scale.set(1.5, 1.8, 1.2);
  mountainDome.position.y = 200;
  mountainDome.castShadow = true;
  mountainDome.receiveShadow = true;
  archTorsoGroup.add(mountainDome);

  // Arched Cavern Tunnel (The giant open cavern mouth that passes through the mountain)
  const archPillarLeft = new THREE.Mesh(
    new THREE.CylinderGeometry(55, 75, 260, 16),
    seFleshMat
  );
  archPillarLeft.position.set(-110, 80, 0);
  archPillarLeft.rotation.z = -0.15;
  archPillarLeft.castShadow = true;
  archTorsoGroup.add(archPillarLeft);

  const archPillarRight = new THREE.Mesh(
    new THREE.CylinderGeometry(55, 75, 260, 16),
    seFleshMat
  );
  archPillarRight.position.set(110, 80, 0);
  archPillarRight.rotation.z = 0.15;
  archPillarRight.castShadow = true;
  archTorsoGroup.add(archPillarRight);

  // Pitch-black cavernous gullet vortex inside the arch
  const gulletAbyss = new THREE.Mesh(
    new THREE.CylinderGeometry(70, 70, 140, 16),
    seAbyssMawMat
  );
  gulletAbyss.rotation.x = Math.PI / 2;
  gulletAbyss.position.set(0, 140, 0);
  archTorsoGroup.add(gulletAbyss);

  // Eerie visceral internal throat glow
  const mawInnerLight = new THREE.PointLight(0xef4444, 0.9, 280);
  mawInnerLight.position.set(0, 140, 20);
  archTorsoGroup.add(mawInnerLight);

  // Waterfalls cascading off the mountain hide
  const waterfallMat = new THREE.MeshStandardMaterial({
    color: 0x90e0ef,
    roughness: 0.1,
    transparent: true,
    opacity: 0.55
  });
  const waterfallMesh1 = new THREE.Mesh(new THREE.PlaneGeometry(24, 180), waterfallMat);
  waterfallMesh1.position.set(-70, 90, 60);
  archTorsoGroup.add(waterfallMesh1);
  const waterfallMesh2 = new THREE.Mesh(new THREE.PlaneGeometry(28, 190), waterfallMat);
  waterfallMesh2.position.set(65, 85, 60);
  archTorsoGroup.add(waterfallMesh2);

  // B. Left 5KM Bent Stilt Limb (Acute high elbow joint reaching into sky)
  const leftStiltGroup = new THREE.Group();
  leftStiltGroup.position.set(-160, 220, 0);
  seaEaterGroup.add(leftStiltGroup);

  // Upper stilt arm (rising high up into sky)
  const leftUpperArm = new THREE.Mesh(
    new THREE.CylinderGeometry(20, 32, 280, 12),
    seFleshMat
  );
  leftUpperArm.position.set(-90, 120, 0);
  leftUpperArm.rotation.z = 0.65;
  leftUpperArm.castShadow = true;
  leftStiltGroup.add(leftUpperArm);

  // Acute high elbow joint sphere
  const leftElbow = new THREE.Mesh(new THREE.SphereGeometry(30, 12, 12), seBoneMat);
  leftElbow.position.set(-190, 230, 0);
  leftStiltGroup.add(leftElbow);

  // Forearm descending vertically into the ocean
  const leftForearm = new THREE.Mesh(
    new THREE.CylinderGeometry(18, 25, 380, 12),
    seFleshMat
  );
  leftForearm.position.set(-200, 40, 0);
  leftForearm.rotation.z = -0.06;
  leftForearm.castShadow = true;
  leftStiltGroup.add(leftForearm);

  // Webbed skeletal bone claw talons
  const leftClawGroup = new THREE.Group();
  leftClawGroup.position.set(-210, -150, 0);
  leftStiltGroup.add(leftClawGroup);
  for (let c = 0; c < 5; c++) {
    const claw = new THREE.Mesh(new THREE.ConeGeometry(7, 65, 8), seBoneMat);
    claw.position.set((c - 2) * 16, -10, Math.sin(c) * 12);
    claw.rotation.x = Math.PI + 0.2;
    claw.rotation.z = (c - 2) * 0.18;
    leftClawGroup.add(claw);
  }

  // C. Right 5KM Bent Stilt Limb (Mirrored)
  const rightStiltGroup = new THREE.Group();
  rightStiltGroup.position.set(160, 220, 0);
  seaEaterGroup.add(rightStiltGroup);

  const rightUpperArm = new THREE.Mesh(
    new THREE.CylinderGeometry(20, 32, 280, 12),
    seFleshMat
  );
  rightUpperArm.position.set(90, 120, 0);
  rightUpperArm.rotation.z = -0.65;
  rightUpperArm.castShadow = true;
  rightStiltGroup.add(rightUpperArm);

  const rightElbow = new THREE.Mesh(new THREE.SphereGeometry(30, 12, 12), seBoneMat);
  rightElbow.position.set(190, 230, 0);
  rightStiltGroup.add(rightElbow);

  const rightForearm = new THREE.Mesh(
    new THREE.CylinderGeometry(18, 25, 380, 12),
    seFleshMat
  );
  rightForearm.position.set(200, 40, 0);
  rightForearm.rotation.z = 0.06;
  rightForearm.castShadow = true;
  rightStiltGroup.add(rightForearm);

  const rightClawGroup = new THREE.Group();
  rightClawGroup.position.set(210, -150, 0);
  rightStiltGroup.add(rightClawGroup);
  for (let c = 0; c < 5; c++) {
    const claw = new THREE.Mesh(new THREE.ConeGeometry(7, 65, 8), seBoneMat);
    claw.position.set((c - 2) * 16, -10, Math.sin(c) * 12);
    claw.rotation.x = Math.PI + 0.2;
    claw.rotation.z = -(c - 2) * 0.18;
    rightClawGroup.add(claw);
  }

  // Base position of Sea Eater
  seaEaterGroup.position.set(-180, 0, -80);
  seaEaterGroup.scale.set(1.15, 1.15, 1.15);

  // =========================================================================
  // 6. 3D MODEL 2: THE BLOOP (DEEP SEA WHALE LEVIATHAN)
  // Exact anatomical replication based on Sketchfab UID: 857501773f1b4f8d936abf517dd33b5a
  // Features: 12 buses long, pale blue-gray whale hide, 140° unhinging snake jaw, needle teeth rows, horizontal whale fluke
  // =========================================================================
  const bloopGroup = new THREE.Group();
  scene.add(bloopGroup);

  // Pale scaly whale hide shader matching bloop_ref.jpg
  const bloopSkinMat = new THREE.MeshStandardMaterial({
    color: 0x98b2af,
    roughness: 0.32,
    metalness: 0.18
  });

  const bloopVentralMat = new THREE.MeshStandardMaterial({
    color: 0xb5cec9,
    roughness: 0.4,
    metalness: 0.12
  });

  const bloopNeedleToothMat = new THREE.MeshStandardMaterial({
    color: 0xf5f8f5,
    roughness: 0.15,
    metalness: 0.05
  });

  const bloopThroatAbyssMat = new THREE.MeshBasicMaterial({
    color: 0x010202
  });

  // A. Main Torso (Aerodynamic spindle whale body)
  const bloopBody = new THREE.Mesh(
    new THREE.CylinderGeometry(38, 48, 140, 16),
    bloopSkinMat
  );
  bloopBody.rotation.z = Math.PI / 2;
  bloopBody.scale.set(1, 0.85, 1);
  bloopBody.castShadow = true;
  bloopGroup.add(bloopBody);

  // Ventral throat pleat ridges
  const ventralPleats = new THREE.Mesh(
    new THREE.CylinderGeometry(36, 46, 120, 12, 1, false, 0, Math.PI),
    bloopVentralMat
  );
  ventralPleats.rotation.z = Math.PI / 2;
  ventralPleats.rotation.x = Math.PI;
  ventralPleats.position.y = -4;
  bloopGroup.add(ventralPleats);

  // B. Articulated Head & Giant 140° Unhinging Snake Jaw
  const bloopHeadGroup = new THREE.Group();
  bloopHeadGroup.position.set(-70, 0, 0);
  bloopGroup.add(bloopHeadGroup);

  // Upper Snout (Rostrum)
  const bloopUpperSnout = new THREE.Mesh(
    new THREE.ConeGeometry(38, 85, 14),
    bloopSkinMat
  );
  bloopUpperSnout.rotation.z = Math.PI / 2;
  bloopUpperSnout.position.set(-38, 10, 0);
  bloopUpperSnout.scale.set(0.65, 1, 0.95);
  bloopHeadGroup.add(bloopUpperSnout);

  // Soulless Black Eye (with wet glint)
  const bloopEye = new THREE.Mesh(
    new THREE.SphereGeometry(6, 12, 12),
    new THREE.MeshBasicMaterial({ color: 0x040606 })
  );
  bloopEye.position.set(-35, 18, 28);
  bloopHeadGroup.add(bloopEye);

  const bloopEyeGlint = new THREE.Mesh(
    new THREE.SphereGeometry(1.8, 8, 8),
    new THREE.MeshBasicMaterial({ color: 0xffffff })
  );
  bloopEyeGlint.position.set(-37, 20, 31);
  bloopHeadGroup.add(bloopEyeGlint);

  // Upper Needle Teeth Rows
  const upperTeethGroup = new THREE.Group();
  bloopUpperSnout.add(upperTeethGroup);
  for (let i = 0; i < 22; i++) {
    const angle = (i / 21) * Math.PI - Math.PI / 2;
    const tooth = new THREE.Mesh(new THREE.ConeGeometry(1.6, 9, 6), bloopNeedleToothMat);
    tooth.position.set(Math.cos(angle) * 32, -35, Math.sin(angle) * 28);
    tooth.rotation.z = Math.PI;
    upperTeethGroup.add(tooth);
  }

  // Lower Unhinging Snake Jaw (Rotates up to 140° downwards)
  const bloopLowerJaw = new THREE.Group();
  bloopLowerJaw.position.set(-15, -12, 0);
  bloopHeadGroup.add(bloopLowerJaw);

  const lowerJawMesh = new THREE.Mesh(
    new THREE.ConeGeometry(36, 80, 14),
    bloopVentralMat
  );
  lowerJawMesh.rotation.z = Math.PI / 2;
  lowerJawMesh.position.set(-36, -6, 0);
  lowerJawMesh.scale.set(0.5, 1, 0.9);
  bloopLowerJaw.add(lowerJawMesh);

  // Lower Needle Teeth Rows
  for (let i = 0; i < 22; i++) {
    const angle = (i / 21) * Math.PI - Math.PI / 2;
    const tooth = new THREE.Mesh(new THREE.ConeGeometry(1.6, 9, 6), bloopNeedleToothMat);
    tooth.position.set(Math.cos(angle) * 30, -32, Math.sin(angle) * 26);
    lowerJawMesh.add(tooth);
  }

  // Dark throat abyss inside the gape
  const bloopGullet = new THREE.Mesh(
    new THREE.SphereGeometry(32, 12, 12),
    bloopThroatAbyssMat
  );
  bloopGullet.position.set(-20, 0, 0);
  bloopHeadGroup.add(bloopGullet);

  // C. Pectoral Fins (Left & Right)
  const leftFin = new THREE.Mesh(new THREE.BoxGeometry(70, 8, 30), bloopSkinMat);
  leftFin.position.set(-20, -10, 48);
  leftFin.rotation.y = 0.55;
  leftFin.rotation.z = -0.25;
  bloopGroup.add(leftFin);

  const rightFin = new THREE.Mesh(new THREE.BoxGeometry(70, 8, 30), bloopSkinMat);
  rightFin.position.set(-20, -10, -48);
  rightFin.rotation.y = -0.55;
  rightFin.rotation.z = -0.25;
  bloopGroup.add(rightFin);

  // D. Articulated Whale Fluke Spine & Tail
  const tail1 = new THREE.Group();
  tail1.position.set(70, 0, 0);
  bloopGroup.add(tail1);

  const tail1Mesh = new THREE.Mesh(new THREE.CylinderGeometry(28, 38, 90, 12), bloopSkinMat);
  tail1Mesh.rotation.z = Math.PI / 2;
  tail1Mesh.position.set(45, 0, 0);
  tail1.add(tail1Mesh);

  const tail2 = new THREE.Group();
  tail2.position.set(90, 0, 0);
  tail1.add(tail2);

  const tail2Mesh = new THREE.Mesh(new THREE.CylinderGeometry(15, 28, 85, 12), bloopSkinMat);
  tail2Mesh.rotation.z = Math.PI / 2;
  tail2Mesh.position.set(42, 0, 0);
  tail2.add(tail2Mesh);

  // Horizontal Whale Tail Fluke
  const whaleFluke = new THREE.Mesh(
    new THREE.BoxGeometry(45, 6, 120),
    bloopSkinMat
  );
  whaleFluke.position.set(80, 0, 0);
  whaleFluke.scale.set(1, 0.7, 1);
  whaleFluke.castShadow = true;
  tail2.add(whaleFluke);

  // Base position of Bloop
  bloopGroup.position.set(240, 20, 120);
  bloopGroup.scale.set(0.9, 0.9, 0.9);

  // =========================================================================
  // 7. 3D PARTICLE SYSTEMS (Rain, Sea Foam, Ichor Geysers & Shockwaves)
  // =========================================================================
  // A. 3D Storm Rain
  const rainCount = 1800;
  const rainGeo = new THREE.BufferGeometry();
  const rainPos = new Float32Array(rainCount * 3);
  for (let i = 0; i < rainCount; i++) {
    rainPos[i * 3] = (Math.random() - 0.5) * 2800;
    rainPos[i * 3 + 1] = Math.random() * 1200;
    rainPos[i * 3 + 2] = (Math.random() - 0.5) * 2800;
  }
  rainGeo.setAttribute('position', new THREE.BufferAttribute(rainPos, 3));
  const rainMat = new THREE.PointsMaterial({
    color: 0x9ec5e8,
    size: 2.2,
    transparent: true,
    opacity: 0.4
  });
  const rainSystem = new THREE.Points(rainGeo, rainMat);
  scene.add(rainSystem);

  // B. 3D Titan Ichor / Blood Geysers
  const ichorCount = 350;
  const ichorGeo = new THREE.BufferGeometry();
  const ichorPositions = new Float32Array(ichorCount * 3);
  const ichorVelocities = [];
  for (let i = 0; i < ichorCount; i++) {
    ichorPositions[i * 3] = 0;
    ichorPositions[i * 3 + 1] = -9999;
    ichorPositions[i * 3 + 2] = 0;
    ichorVelocities.push(new THREE.Vector3(0, 0, 0));
  }
  ichorGeo.setAttribute('position', new THREE.BufferAttribute(ichorPositions, 3));
  const ichorMat = new THREE.PointsMaterial({
    color: 0x10b981,
    size: 5.5,
    transparent: true,
    opacity: 0.85
  });
  const ichorSystem = new THREE.Points(ichorGeo, ichorMat);
  scene.add(ichorSystem);

  function trigger3DIchorBurst(origin, count = 120) {
    const pos = ichorGeo.attributes.position.array;
    for (let i = 0; i < count; i++) {
      const idx = Math.floor(Math.random() * ichorCount);
      pos[idx * 3] = origin.x + (Math.random() - 0.5) * 25;
      pos[idx * 3 + 1] = origin.y + (Math.random() - 0.5) * 25;
      pos[idx * 3 + 2] = origin.z + (Math.random() - 0.5) * 25;

      ichorVelocities[idx].set(
        (Math.random() - 0.5) * 14,
        Math.random() * 16 + 4,
        (Math.random() - 0.5) * 14
      );
    }
    ichorGeo.attributes.position.needsUpdate = true;
  }

  // C. 3D Infrasound / Slam Shockwave Ring
  const shockwaveGeo = new THREE.TorusGeometry(12, 4, 8, 36);
  shockwaveGeo.rotateX(Math.PI / 2);
  const shockwaveMat = new THREE.MeshBasicMaterial({
    color: 0x00f2fe,
    transparent: true,
    opacity: 0
  });
  const shockwaveMesh = new THREE.Mesh(shockwaveGeo, shockwaveMat);
  scene.add(shockwaveMesh);

  let shockwaveProgress = 1.0;
  function trigger3DShockwave(pos, color = 0x00f2fe) {
    shockwaveMesh.position.copy(pos);
    shockwaveMat.color.setHex(color);
    shockwaveProgress = 0.0;
  }

  // =========================================================================
  // 8. PROCEDURAL WEB AUDIO SYNTHESIZER (NOAA 1997 BLOOP & TREVOR HENDERSON ROAR)
  // =========================================================================
  let audioCtx = null;
  let masterGain = null;
  let mediaStreamDest = null;
  let windNoiseNode = null;
  let oceanFilterNode = null;
  let waveGain = null;
  let hasUserInteracted = false;

  function initAudio() {
    if (!audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      audioCtx = new AudioContext();

      masterGain = audioCtx.createGain();
      masterGain.gain.setValueAtTime(0.85, audioCtx.currentTime);
      masterGain.connect(audioCtx.destination);

      // Destination for Video Recording
      mediaStreamDest = audioCtx.createMediaStreamDestination();
      masterGain.connect(mediaStreamDest);

      startOceanAmbience();
    }
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
  }

  function startOceanAmbience() {
    if (!audioCtx || windNoiseNode) return;
    try {
      const bufferSize = audioCtx.sampleRate * 3;
      const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
      const data = buffer.getChannelData(0);
      let lastOut = 0.0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        data[i] = (lastOut + 0.02 * white) / 1.02;
        lastOut = data[i];
      }

      windNoiseNode = audioCtx.createBufferSource();
      windNoiseNode.buffer = buffer;
      windNoiseNode.loop = true;

      oceanFilterNode = audioCtx.createBiquadFilter();
      oceanFilterNode.type = 'lowpass';
      oceanFilterNode.frequency.setValueAtTime(280, audioCtx.currentTime);

      waveGain = audioCtx.createGain();
      waveGain.gain.setValueAtTime(0.35, audioCtx.currentTime);

      windNoiseNode.connect(oceanFilterNode);
      oceanFilterNode.connect(waveGain);
      waveGain.connect(masterGain);

      windNoiseNode.start(0);
    } catch (e) {}
  }

  // 1. THE SEA EATER ROAR (Tectonic infrasound + eerie eldritch shriek)
  function playSeaEaterRoar() {
    if (!soundEnabled || !audioCtx) return;
    initAudio();
    const now = audioCtx.currentTime;
    try {
      // Sub-bass tectonic rumble
      const subOsc = audioCtx.createOscillator();
      const subGain = audioCtx.createGain();
      subOsc.type = 'sawtooth';
      subOsc.frequency.setValueAtTime(42, now);
      subOsc.frequency.exponentialRampToValueAtTime(26, now + 3.8);

      subGain.gain.setValueAtTime(0.01, now);
      subGain.gain.linearRampToValueAtTime(0.85, now + 0.3);
      subGain.gain.exponentialRampToValueAtTime(0.001, now + 4.2);

      subOsc.connect(subGain);
      subGain.connect(masterGain);
      subOsc.start(now);
      subOsc.stop(now + 4.4);

      // Eldritch vocal tremor
      const screechOsc = audioCtx.createOscillator();
      const screechGain = audioCtx.createGain();
      screechOsc.type = 'triangle';
      screechOsc.frequency.setValueAtTime(180, now);
      screechOsc.frequency.exponentialRampToValueAtTime(320, now + 1.8);
      screechOsc.frequency.exponentialRampToValueAtTime(65, now + 4.0);

      screechGain.gain.setValueAtTime(0.01, now);
      screechGain.gain.linearRampToValueAtTime(0.65, now + 0.4);
      screechGain.gain.exponentialRampToValueAtTime(0.001, now + 4.1);

      screechOsc.connect(screechGain);
      screechGain.connect(masterGain);
      screechOsc.start(now);
      screechOsc.stop(now + 4.3);

      screenShake = 24;
      triggerFlash('flash-cyan', 160);
      trigger3DShockwave(seaEaterGroup.position, 0x00f2fe);
      trigger3DLightning();
    } catch (e) {}
  }

  // 2. THE BLOOP INFRASONIC SONAR SCREAM (1997 NOAA chirp: 10Hz-40Hz rising sweep)
  function playBloopScream() {
    if (!soundEnabled || !audioCtx) return;
    initAudio();
    const now = audioCtx.currentTime;
    try {
      const bloopOsc = audioCtx.createOscillator();
      const bloopGain = audioCtx.createGain();
      bloopOsc.type = 'sine';
      bloopOsc.frequency.setValueAtTime(14, now);
      bloopOsc.frequency.exponentialRampToValueAtTime(46, now + 1.8);
      bloopOsc.frequency.exponentialRampToValueAtTime(30, now + 3.2);

      bloopGain.gain.setValueAtTime(0.01, now);
      bloopGain.gain.linearRampToValueAtTime(0.9, now + 0.5);
      bloopGain.gain.exponentialRampToValueAtTime(0.001, now + 3.5);

      bloopOsc.connect(bloopGain);
      bloopGain.connect(masterGain);
      bloopOsc.start(now);
      bloopOsc.stop(now + 3.6);

      // Biological whale shriek
      const cryOsc = audioCtx.createOscillator();
      const cryGain = audioCtx.createGain();
      cryOsc.type = 'sawtooth';
      cryOsc.frequency.setValueAtTime(150, now);
      cryOsc.frequency.exponentialRampToValueAtTime(290, now + 1.1);
      cryOsc.frequency.exponentialRampToValueAtTime(80, now + 2.9);

      cryGain.gain.setValueAtTime(0.01, now);
      cryGain.gain.linearRampToValueAtTime(0.55, now + 0.3);
      cryGain.gain.exponentialRampToValueAtTime(0.001, now + 3.0);

      cryOsc.connect(cryGain);
      cryGain.connect(masterGain);
      cryOsc.start(now);
      cryOsc.stop(now + 3.2);

      screenShake = 20;
      triggerFlash('flash-green', 140);
      trigger3DShockwave(bloopGroup.position, 0x34d399);
    } catch (e) {}
  }

  // 3. MOVE SOUNDS
  function playClawSwipeSound() {
    if (!soundEnabled || !audioCtx) return;
    initAudio();
    const now = audioCtx.currentTime;
    try {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(480, now);
      osc.frequency.exponentialRampToValueAtTime(50, now + 0.5);

      gain.gain.setValueAtTime(0.01, now);
      gain.gain.linearRampToValueAtTime(0.7, now + 0.08);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.55);

      osc.connect(gain);
      gain.connect(masterGain);
      osc.start(now);
      osc.stop(now + 0.6);
      triggerClawSlashEffect();
    } catch (e) {}
  }

  function playJawBiteSound() {
    if (!soundEnabled || !audioCtx) return;
    initAudio();
    const now = audioCtx.currentTime;
    try {
      const snapOsc = audioCtx.createOscillator();
      const snapGain = audioCtx.createGain();
      snapOsc.type = 'triangle';
      snapOsc.frequency.setValueAtTime(95, now);
      snapOsc.frequency.exponentialRampToValueAtTime(28, now + 0.3);

      snapGain.gain.setValueAtTime(0.85, now);
      snapGain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

      snapOsc.connect(snapGain);
      snapGain.connect(masterGain);
      snapOsc.start(now);
      snapOsc.stop(now + 0.5);

      screenShake = 28;
      triggerFlash('flash-red', 180);
    } catch (e) {}
  }

  function playTsunamiSound() {
    if (!soundEnabled || !audioCtx) return;
    initAudio();
    const now = audioCtx.currentTime;
    try {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(32, now);
      osc.frequency.linearRampToValueAtTime(75, now + 1.2);
      osc.frequency.exponentialRampToValueAtTime(20, now + 3.0);

      gain.gain.setValueAtTime(0.01, now);
      gain.gain.linearRampToValueAtTime(0.8, now + 0.8);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 3.2);

      osc.connect(gain);
      gain.connect(masterGain);
      osc.start(now);
      osc.stop(now + 3.3);
      screenShake = 26;
    } catch (e) {}
  }

  function playMountainRamSound() {
    if (!soundEnabled || !audioCtx) return;
    initAudio();
    const now = audioCtx.currentTime;
    try {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(55, now);
      osc.frequency.exponentialRampToValueAtTime(18, now + 1.8);

      gain.gain.setValueAtTime(0.01, now);
      gain.gain.linearRampToValueAtTime(0.9, now + 0.1);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 2.2);

      osc.connect(gain);
      gain.connect(masterGain);
      osc.start(now);
      osc.stop(now + 2.3);
      screenShake = 36;
      triggerFlash('flash-white', 220);
      trigger3DShockwave(new THREE.Vector3(0, 40, 0), 0xff3366);
    } catch (e) {}
  }

  function playDeathFlatlineTone() {
    if (!soundEnabled || !audioCtx) return;
    initAudio();
    const now = audioCtx.currentTime;
    try {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, now); // Flatline EKG tone

      gain.gain.setValueAtTime(0.01, now);
      gain.gain.linearRampToValueAtTime(0.4, now + 0.1);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 3.5);

      osc.connect(gain);
      gain.connect(masterGain);
      osc.start(now);
      osc.stop(now + 3.6);
    } catch (e) {}
  }

  // =========================================================================
  // 9. DOM ELEMENTS & HUD CONNECTIONS
  // =========================================================================
  const hudTimer = document.getElementById('hud-timer');
  const hudSceneName = document.getElementById('hud-scene-name');
  const subtitleTime = document.getElementById('subtitle-time');
  const subtitleText = document.getElementById('subtitle-text');
  const timelineProgress = document.getElementById('timeline-progress');
  const timelineHandle = document.getElementById('timeline-handle');
  const timelineTrack = document.getElementById('timeline-track');
  const btnPlayPause = document.getElementById('btn-play-pause');
  const iconPlay = document.getElementById('icon-play');
  const iconPause = document.getElementById('icon-pause');
  const btnRestart = document.getElementById('btn-restart');
  const btnNextScene = document.getElementById('btn-next-scene');
  const btnSoundToggle = document.getElementById('btn-sound-toggle');
  const soundLabel = document.getElementById('sound-label');
  const btnTriggerRoar = document.getElementById('btn-trigger-roar');
  const btnTriggerBloop = document.getElementById('btn-trigger-bloop');
  const btnCameraToggle = document.getElementById('btn-camera-toggle');
  const cameraLabel = document.getElementById('camera-label');
  const btnVhsToggle = document.getElementById('btn-vhs-toggle');
  const vhsLabel = document.getElementById('vhs-label');
  const vhsOverlay = document.getElementById('vhs-overlay');
  const deathOverlay = document.getElementById('death-overlay');
  const btnRecordVideo = document.getElementById('btn-record-video');
  const recordLabel = document.getElementById('record-label');
  const btnInfoModal = document.getElementById('btn-info-modal');
  const btnModalClose = document.getElementById('btn-modal-close');
  const modalLore = document.getElementById('modal-lore');
  const btnSketchfabModal = document.getElementById('btn-sketchfab-modal');
  const btnSketchfabClose = document.getElementById('btn-sketchfab-close');
  const modalSketchfab = document.getElementById('modal-sketchfab');
  const impactFlash = document.getElementById('impact-flash');
  const roarShockwave = document.getElementById('roar-shockwave');
  const clawSlashOverlay = document.getElementById('claw-slash-overlay');
  const telemetryMove = document.getElementById('telemetry-move');
  const telemetryForce = document.getElementById('telemetry-force');
  const telemetryHz = document.getElementById('telemetry-hz');
  const telemetryDistance = document.getElementById('telemetry-distance');
  const telemetryHint = document.getElementById('telemetry-hint');
  const vhsTimestamp = document.getElementById('vhs-timestamp');
  const seaEaterHealth = document.getElementById('sea-eater-health');
  const bloopHealth = document.getElementById('bloop-health');
  const seStatus = document.getElementById('se-status');
  const seMoveTag = document.getElementById('se-move-tag');
  const bloopJawStatus = document.getElementById('bloop-jaw-status');
  const bloopMoveTag = document.getElementById('bloop-move-tag');
  const activeMovePill = document.getElementById('active-move-pill');

  function triggerFlash(colorClass, duration = 120) {
    impactFlash.className = `impact-flash ${colorClass}`;
    setTimeout(() => {
      impactFlash.className = 'impact-flash';
    }, duration);
  }

  function triggerClawSlashEffect() {
    clawSlashOverlay.className = 'claw-slash-overlay active';
    setTimeout(() => {
      clawSlashOverlay.className = 'claw-slash-overlay';
    }, 450);
  }

  // =========================================================================
  // 10. 3D CHOREOGRAPHY & KINEMATICS ENGINE (60-SECOND SEQUENCE)
  // =========================================================================
  // Move trigger tracking so audio fires only once per phase entry
  const triggeredMoves = {};

  function updateFightKinematics(t) {
    // 1. Natural Idle Animations
    const idleWave = Math.sin(t * 1.5) * 6;
    const idleSwell = Math.cos(t * 1.2) * 4;

    // Default neutral poses
    seaEaterGroup.position.set(-160, idleWave, -60);
    seaEaterGroup.rotation.set(0, 0.25, 0);
    leftStiltGroup.rotation.set(0, 0, 0);
    rightStiltGroup.rotation.set(0, 0, 0);
    leftStiltGroup.position.y = 220;
    rightStiltGroup.position.y = 220;

    bloopGroup.position.set(220, idleSwell, 100);
    bloopGroup.rotation.set(0, -Math.PI * 0.75, 0);
    bloopLowerJaw.rotation.z = 0.05; // Closed jaw
    tail1.rotation.y = Math.sin(t * 3.5) * 0.22;
    tail2.rotation.y = Math.sin(t * 3.5 - 0.6) * 0.35;

    // ACT 1: 00s - 08s | ABYSSAL CONTACT & AWAKENING
    if (t < 8.0) {
      const p = t / 8.0;
      bloopGroup.position.x = 420 - p * 180;
      bloopGroup.position.y = -30 + Math.sin(p * Math.PI) * 45;
      seaEaterGroup.position.y = -40 + p * 40;

      if (t >= 3.5 && !triggeredMoves['act1_chirp']) {
        triggeredMoves['act1_chirp'] = true;
        playBloopScream();
      }
      if (t >= 5.5 && !triggeredMoves['act1_roar']) {
        triggeredMoves['act1_roar'] = true;
        playSeaEaterRoar();
      }
    }

    // ACT 2: 08s - 17s | BLOOP TORPEDO CHARGE & SEA EATER STILT DODGE
    else if (t >= 8.0 && t < 17.0) {
      const p = (t - 8.0) / 9.0;

      if (!triggeredMoves['act2_charge']) {
        triggeredMoves['act2_charge'] = true;
      }

      // Bloop 90-knot charge forward
      bloopGroup.position.x = 240 - p * 460;
      bloopGroup.position.z = 100 - p * 160;
      bloopGroup.position.y = Math.sin(p * Math.PI * 2) * 15;
      bloopGroup.rotation.y = -Math.PI * 0.85;

      // Vigorous tail propulsion
      tail1.rotation.y = Math.sin(t * 9.0) * 0.45;
      tail2.rotation.y = Math.sin(t * 9.0 - 0.7) * 0.65;

      // Sea Eater lifts left stilt limb high into clouds to dodge (11s - 15s)
      if (p >= 0.3 && p <= 0.8) {
        const dodgeP = Math.sin(((p - 0.3) / 0.5) * Math.PI);
        leftStiltGroup.position.y = 220 + dodgeP * 180;
        leftStiltGroup.rotation.z = -dodgeP * 0.55;
      }
    }

    // ACT 3: 17s - 26s | SEA EATER 5KM CLAW SWIPE & BLOOP DIVE DODGE
    else if (t >= 17.0 && t < 26.0) {
      const p = (t - 17.0) / 9.0;
      bloopGroup.position.set(-60, -10, 40);
      bloopGroup.rotation.y = -Math.PI * 0.4;

      // Sea Eater wind-up and supersonic claw swipe (20s - 22s)
      if (p < 0.35) {
        // Wind-up: Heave right arm high
        const wP = p / 0.35;
        rightStiltGroup.position.y = 220 + wP * 140;
        rightStiltGroup.rotation.z = wP * 0.6;
      } else if (p >= 0.35 && p <= 0.6) {
        // Supersonic Claw Slash down
        const sP = (p - 0.35) / 0.25;
        rightStiltGroup.position.y = 360 - sP * 280;
        rightStiltGroup.rotation.z = 0.6 - sP * 1.4;

        if (!triggeredMoves['act3_slash']) {
          triggeredMoves['act3_slash'] = true;
          playClawSwipeSound();
          trigger3DShockwave(new THREE.Vector3(0, 20, 20), 0x00f2fe);
        }
      }

      // Bloop Emergency Dive Dodge (submerging deep beneath the swells)
      if (p >= 0.3 && p <= 0.7) {
        const diveP = Math.sin(((p - 0.3) / 0.4) * Math.PI);
        bloopGroup.position.y = -10 - diveP * 140;
        bloopGroup.rotation.x = diveP * 0.45;
      }
    }

    // ACT 4: 26s - 35s | BLOOP 140° SNAKE JAW BITE & ICHOR ERUPTION
    else if (t >= 26.0 && t < 35.0) {
      const p = (t - 26.0) / 9.0;

      // Bloop leaps up out of water directly at Sea Eater's right limb
      if (p < 0.3) {
        const leapP = p / 0.3;
        bloopGroup.position.set(-60 + leapP * 80, -20 + leapP * 110, 20);
        bloopGroup.rotation.set(-leapP * 0.6, -Math.PI * 0.5, 0);

        // Jaw unhinges open to 140° (approx 1.25 radians)
        bloopLowerJaw.rotation.z = leapP * 1.25;
      } else {
        // Clamped directly on the stilt limb!
        bloopGroup.position.set(20, 90, 20);
        bloopGroup.rotation.set(-0.35, -Math.PI * 0.5, 0);
        bloopLowerJaw.rotation.z = 0.7; // Clamped onto flesh

        // Sea Eater thrashes in fury
        const thrash = Math.sin(t * 14.0) * 12;
        seaEaterGroup.position.x = -160 + thrash;
        rightStiltGroup.rotation.z = Math.sin(t * 12.0) * 0.3;

        if (!triggeredMoves['act4_bite']) {
          triggeredMoves['act4_bite'] = true;
          playJawBiteSound();
          playSeaEaterRoar();
          trigger3DIchorBurst(new THREE.Vector3(20, 90, 20), 180);
        }

        // Continuous ichor bursts while clamped
        if (Math.random() < 0.25) {
          trigger3DIchorBurst(new THREE.Vector3(20, 90, 20), 40);
        }
      }
    }

    // ACT 5: 35s - 43s | BLOOP WHALE FLUKE TSUNAMI DETONATION
    else if (t >= 35.0 && t < 43.0) {
      const p = (t - 35.0) / 8.0;

      bloopGroup.position.set(160, 20, 80);
      bloopGroup.rotation.set(0, -Math.PI * 0.8, 0);

      // Fluke whips vertical and smacks down (37s)
      if (p >= 0.2 && p <= 0.45) {
        const smackP = (p - 0.2) / 0.25;
        tail1.rotation.x = -Math.sin(smackP * Math.PI) * 1.2;
        tail2.rotation.x = -Math.sin(smackP * Math.PI) * 1.5;

        if (smackP > 0.5 && !triggeredMoves['act5_tsunami']) {
          triggeredMoves['act5_tsunami'] = true;
          playTsunamiSound();
          trigger3DShockwave(new THREE.Vector3(160, 0, 80), 0x38bdf8);
        }
      }

      // Tsunami 3D wave surge
      if (p >= 0.35) {
        const waveP = (p - 0.35) / 0.65;
        tsunamiMat.opacity = Math.sin(waveP * Math.PI) * 0.85;
        tsunamiMesh.position.x = 160 - waveP * 340;
        tsunamiMesh.scale.set(1 + waveP * 0.8, 1 + waveP * 1.2, 1 + waveP * 0.8);
      } else {
        tsunamiMat.opacity = 0;
      }
    }

    // ACT 6: 43s - 52s | SEA EATER MOUNTAIN RAMMING CHARGE
    else if (t >= 43.0 && t < 52.0) {
      const p = (t - 43.0) / 9.0;
      tsunamiMat.opacity = 0;

      // Sea Eater rams forward like a moving continent (46s impact)
      if (p < 0.45) {
        const rP = p / 0.45;
        seaEaterGroup.position.x = -160 + rP * 240;
        seaEaterGroup.position.z = -60 + rP * 80;
        bloopGroup.position.set(120, 15, 60);
      } else {
        // Post-impact: Bloop tumbling backward, Sea Eater towering forward
        const hitP = (p - 0.45) / 0.55;
        seaEaterGroup.position.set(80, 0, 20);

        bloopGroup.position.x = 120 + hitP * 280;
        bloopGroup.position.y = 15 - Math.sin(hitP * Math.PI) * 35;
        bloopGroup.rotation.z = hitP * Math.PI * 2; // Tumbling spin

        if (!triggeredMoves['act6_ram']) {
          triggeredMoves['act6_ram'] = true;
          playMountainRamSound();
          trigger3DIchorBurst(new THREE.Vector3(100, 40, 40), 200);
        }
      }
    }

    // ACT 7: 52s - 60s | MUTUAL FATAL CLIMAX (FIGHT TO THE DEATH)
    else if (t >= 52.0) {
      const p = (t - 52.0) / 8.0;

      if (p < 0.45) {
        // Suicidal final charge & jaw clamp
        const lungeP = p / 0.45;
        bloopGroup.position.set(280 - lungeP * 340, -10 + lungeP * 80, 20);
        bloopGroup.rotation.set(0, -Math.PI * 0.5, 0);
        bloopLowerJaw.rotation.z = 1.35; // 140° max gape

        seaEaterGroup.position.set(-60, 0, 0);

        if (!triggeredMoves['act7_clash']) {
          triggeredMoves['act7_clash'] = true;
          playJawBiteSound();
          playSeaEaterRoar();
          playBloopScream();
          trigger3DIchorBurst(new THREE.Vector3(-40, 70, 10), 280);
          trigger3DShockwave(new THREE.Vector3(-40, 70, 10), 0xff3366);
        }
      } else {
        // Terminal Mutual Death: Guillotine maw crush & both sinking into abyss
        const sinkP = (p - 0.45) / 0.55;

        // Sea Eater and Bloop locked together sinking down into deep trench
        const sinkY = -sinkP * 320;
        seaEaterGroup.position.set(-60, sinkY, 0);
        seaEaterGroup.rotation.z = sinkP * 0.4; // Collapsing tilt
        archPillarLeft.rotation.z = -0.15 - sinkP * 0.3; // Fracturing arch
        archPillarRight.rotation.z = 0.15 + sinkP * 0.3;

        bloopGroup.position.set(-50, sinkY + 40, 10);
        bloopGroup.rotation.z = -sinkP * 0.6; // Broken spine tilt
        bloopLowerJaw.rotation.z = 0.4;

        if (sinkP >= 0.7 && !triggeredMoves['act7_flatline']) {
          triggeredMoves['act7_flatline'] = true;
          playDeathFlatlineTone();
          deathOverlay.classList.add('active');
        }

        // Giant death ichor geyser
        if (Math.random() < 0.35) {
          trigger3DIchorBurst(new THREE.Vector3(-50, sinkY + 60, 10), 60);
        }
      }
    }
  }

  // =========================================================================
  // 11. 3D CAMERA CONTROLLER (6 PERSPECTIVES)
  // =========================================================================
  const cameraModes = ['cinematic', 'sea_eater_pov', 'bloop_cam', 'underwater', 'aerial', 'free_orbit'];
  const cameraModeLabels = {
    'cinematic': 'Cinematic Cam',
    'sea_eater_pov': 'Sea Eater POV',
    'bloop_cam': 'The Bloop Cam',
    'underwater': 'Abyss Depth Cam',
    'aerial': 'Aerial Titan Cam',
    'free_orbit': 'Free Orbit 3D Cam'
  };

  btnCameraToggle.addEventListener('click', () => {
    const nextIdx = (cameraModes.indexOf(cameraMode) + 1) % cameraModes.length;
    cameraMode = cameraModes[nextIdx];
    cameraLabel.textContent = cameraModeLabels[cameraMode];

    if (controls) {
      controls.enabled = (cameraMode === 'free_orbit');
    }

    if (cameraMode === 'free_orbit') {
      telemetryHint.textContent = "DRAG TO ROTATE // WHEEL TO ZOOM";
    } else {
      telemetryHint.textContent = "PRESS 'C' TO SWITCH VIEWS";
    }
  });

  function update3DCamera(t) {
    if (cameraMode === 'free_orbit') {
      if (controls) controls.update();
      return;
    }

    const shakeX = (Math.random() - 0.5) * screenShake * 0.8;
    const shakeY = (Math.random() - 0.5) * screenShake * 0.8;

    if (cameraMode === 'cinematic') {
      // Dynamic Director's Cut tracking action
      const orbitAngle = t * 0.08 + 0.4;
      const radius = 680 + Math.sin(t * 0.3) * 120;
      const camY = 160 + Math.cos(t * 0.2) * 60;

      // Zoom closer during bite and ram acts
      let targetDist = radius;
      if (t >= 26 && t <= 35) targetDist = 420; // Close-up on bite
      if (t >= 43 && t <= 50) targetDist = 480; // Impact cam
      if (t >= 52) targetDist = 520; // Climax death view

      camera.position.x = Math.sin(orbitAngle) * targetDist + shakeX;
      camera.position.z = Math.cos(orbitAngle) * targetDist;
      camera.position.y = camY + shakeY;

      // Focus point midway between beasts
      const targetMid = new THREE.Vector3(
        (seaEaterGroup.position.x + bloopGroup.position.x) * 0.5,
        (seaEaterGroup.position.y + bloopGroup.position.y) * 0.5 + 40,
        (seaEaterGroup.position.z + bloopGroup.position.z) * 0.5
      );
      camera.lookAt(targetMid);
    }
    else if (cameraMode === 'sea_eater_pov') {
      // Mounted 5km up on the Sea Eater's head looking down at the ocean & Bloop
      camera.position.set(
        seaEaterGroup.position.x,
        seaEaterGroup.position.y + 320,
        seaEaterGroup.position.z + 40
      );
      camera.lookAt(bloopGroup.position.x, bloopGroup.position.y, bloopGroup.position.z);
    }
    else if (cameraMode === 'bloop_cam') {
      // 3rd-person chase camera right behind the Bloop's dorsal spine
      const bloopBack = new THREE.Vector3(180, 60, 40).applyAxisAngle(new THREE.Vector3(0, 1, 0), bloopGroup.rotation.y);
      camera.position.copy(bloopGroup.position).add(bloopBack);
      camera.position.y += 40;
      camera.lookAt(bloopGroup.position.x - 120, bloopGroup.position.y + 20, bloopGroup.position.z);
    }
    else if (cameraMode === 'underwater') {
      // Looking up from deep abyss at the silhouettes against tempest lightning
      camera.position.set(0, -220, 360);
      camera.lookAt(0, 60, 0);
    }
    else if (cameraMode === 'aerial') {
      // High-altitude bird's eye view
      camera.position.set(0, 1400, 200);
      camera.lookAt(0, 0, 0);
    }
  }

  // =========================================================================
  // 12. 3D RENDER LOOP
  // =========================================================================
  function render3DScene(t, dt) {
    // 1. Dynamic Ocean Swell Vertex Simulation
    const pos = oceanGeometry.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const vx = pos.getX(i);
      const vz = pos.getZ(i);
      const wave1 = Math.sin(vx * 0.006 + t * 2.8) * 14;
      const wave2 = Math.cos(vz * 0.008 + t * 2.2) * 10;
      const wave3 = Math.sin((vx + vz) * 0.012 + t * 4.0) * 5;
      pos.setY(i, initialOceanY[i] + wave1 + wave2 + wave3);
    }
    oceanGeometry.computeVertexNormals();
    oceanGeometry.attributes.position.needsUpdate = true;

    // 2. 3D Rain Update
    const rPos = rainGeo.attributes.position.array;
    for (let i = 0; i < rainCount; i++) {
      rPos[i * 3 + 1] -= 24; // Falling speed
      rPos[i * 3] -= 4; // Wind slant
      if (rPos[i * 3 + 1] < -50) {
        rPos[i * 3 + 1] = 1100;
        rPos[i * 3] = (Math.random() - 0.5) * 2800;
      }
    }
    rainGeo.attributes.position.needsUpdate = true;

    // 3. 3D Ichor Particles Update
    const icPos = ichorGeo.attributes.position.array;
    for (let i = 0; i < ichorCount; i++) {
      if (icPos[i * 3 + 1] > -9000) {
        icPos[i * 3] += ichorVelocities[i].x;
        icPos[i * 3 + 1] += ichorVelocities[i].y;
        icPos[i * 3 + 2] += ichorVelocities[i].z;
        ichorVelocities[i].y -= 0.45; // Gravity

        if (icPos[i * 3 + 1] < 0) {
          icPos[i * 3 + 1] = -9999; // Splashed in sea
        }
      }
    }
    ichorGeo.attributes.position.needsUpdate = true;

    // 4. 3D Shockwave expansion
    if (shockwaveProgress < 1.0) {
      shockwaveProgress += dt * 1.8;
      const rad = shockwaveProgress * 320 + 10;
      shockwaveMesh.scale.set(rad, rad, rad);
      shockwaveMat.opacity = Math.max(0, (1.0 - shockwaveProgress) * 0.9);
    } else {
      shockwaveMat.opacity = 0;
    }

    // 5. Screen Shake decay
    if (screenShake > 0) {
      screenShake = Math.max(0, screenShake - dt * 38);
    }

    // 6. Random stormy lightning
    lightningTimer += dt;
    if (lightningTimer > 4.5 && Math.random() < 0.04) {
      lightningTimer = 0;
      trigger3DLightning();
    }

    // 7. Update Kinematics & Camera
    updateFightKinematics(t);
    update3DCamera(t);

    // 8. Render WebGL frame
    renderer.render(scene, camera);
  }

  // =========================================================================
  // 13. MAIN ANIMATION LOOP & TIMELINE SYNC
  // =========================================================================
  function updateTimeline(dt) {
    if (isPlaying) {
      currentTime += dt * playbackSpeed;
      if (currentTime >= totalDuration) {
        currentTime = totalDuration;
        isPlaying = false;
        updatePlayPauseUI();
        if (isRecording) stopRecording();
      }
    }
    updateUI();
  }

  function updateUI() {
    const progress = Math.min(1.0, Math.max(0.0, currentTime / totalDuration));
    timelineProgress.style.width = `${progress * 100}%`;
    timelineHandle.style.left = `${progress * 100}%`;

    const mins = Math.floor(currentTime / 60);
    const secs = Math.floor(currentTime % 60);
    const ms = Math.floor((currentTime % 1) * 100);
    hudTimer.textContent = `${mins < 10 ? '0' + mins : mins}:${secs < 10 ? '0' + secs : secs}.${ms < 10 ? '0' + ms : ms} / 01:00.00`;

    const phase = getCurrentPhase(currentTime);
    hudSceneName.textContent = phase.name;
    subtitleTime.textContent = `${mins < 10 ? '0' + mins : mins}:${secs < 10 ? '0' + secs : secs}`;
    subtitleText.textContent = phase.subtitle;

    // Telemetry
    telemetryMove.textContent = phase.move;
    telemetryForce.textContent = phase.force;
    telemetryHz.textContent = phase.hz;
    telemetryDistance.textContent = phase.distance;

    // Health Bars & Move Flags
    seaEaterHealth.style.width = `${phase.seHealth}%`;
    bloopHealth.style.width = `${phase.bloopHealth}%`;
    seMoveTag.textContent = phase.seMove;
    bloopMoveTag.textContent = phase.bloopMove;
    activeMovePill.textContent = phase.move;

    if (phase.seHealth === 0) {
      seStatus.textContent = "TERMINAL (0%) - DEAD";
      seStatus.style.color = "#ff3366";
    } else {
      seStatus.textContent = `OPTIMAL (${phase.seHealth}%)`;
      seStatus.style.color = "#00f2fe";
    }

    if (phase.bloopHealth === 0) {
      bloopJawStatus.textContent = "TERMINAL (0%) - DEAD";
      bloopJawStatus.style.color = "#ff3366";
    } else {
      bloopJawStatus.textContent = `ACTIVE (${phase.bloopHealth}%)`;
      bloopJawStatus.style.color = "#34d399";
    }

    // Active Scene Chip
    document.querySelectorAll('.scene-chip').forEach(chip => {
      const chipScene = parseInt(chip.dataset.scene);
      if (chipScene === phase.act) {
        chip.classList.add('active');
      } else {
        chip.classList.remove('active');
      }
    });

    // VHS timestamp
    if (vhsTimestamp) {
      const secondPart = Math.floor(currentTime);
      vhsTimestamp.textContent = `AUG. 14 1998 - 03:41:${secondPart < 10 ? '0' + secondPart : secondPart} AM`;
    }

    // Death overlay visibility reset if rewound
    if (currentTime < 58.0) {
      deathOverlay.classList.remove('active');
    }
  }

  function updatePlayPauseUI() {
    if (isPlaying) {
      iconPlay.classList.add('hidden');
      iconPause.classList.remove('hidden');
    } else {
      iconPlay.classList.remove('hidden');
      iconPause.classList.add('hidden');
    }
  }

  function animate(timestamp) {
    if (!lastTimestamp) lastTimestamp = timestamp;
    const dt = Math.min((timestamp - lastTimestamp) / 1000, 0.1);
    lastTimestamp = timestamp;

    updateTimeline(dt);
    render3DScene(currentTime, dt);

    requestAnimationFrame(animate);
  }
  requestAnimationFrame(animate);

  // =========================================================================
  // 14. INTERACTIVE CONTROLS & EVENT LISTENERS
  // =========================================================================
  function togglePlayPause() {
    initAudio();
    isPlaying = !isPlaying;
    if (currentTime >= totalDuration && isPlaying) {
      currentTime = 0;
      deathOverlay.classList.remove('active');
      // Reset triggered move flags
      for (let k in triggeredMoves) delete triggeredMoves[k];
    }
    updatePlayPauseUI();
  }

  btnPlayPause.addEventListener('click', togglePlayPause);

  btnRestart.addEventListener('click', () => {
    initAudio();
    currentTime = 0;
    deathOverlay.classList.remove('active');
    for (let k in triggeredMoves) delete triggeredMoves[k];
    isPlaying = true;
    updatePlayPauseUI();
  });

  btnNextScene.addEventListener('click', () => {
    initAudio();
    const phase = getCurrentPhase(currentTime);
    const nextPhaseIndex = scenePhases.findIndex(p => p.act === phase.act) + 1;
    if (nextPhaseIndex < scenePhases.length) {
      currentTime = scenePhases[nextPhaseIndex].startTime;
      isPlaying = true;
      updatePlayPauseUI();
    } else {
      currentTime = 0;
      deathOverlay.classList.remove('active');
    }
  });

  // Timeline scrub
  function seekToX(clientX) {
    initAudio();
    const rect = timelineTrack.getBoundingClientRect();
    const clickX = Math.max(0, Math.min(clientX - rect.left, rect.width));
    const seekProgress = clickX / rect.width;
    currentTime = seekProgress * totalDuration;
    if (currentTime < 58) deathOverlay.classList.remove('active');
    updateUI();
  }

  let isScrubbing = false;
  timelineTrack.addEventListener('mousedown', (e) => {
    isScrubbing = true;
    seekToX(e.clientX);
  });
  window.addEventListener('mousemove', (e) => {
    if (isScrubbing) seekToX(e.clientX);
  });
  window.addEventListener('mouseup', () => {
    isScrubbing = false;
  });

  // Scene quick chips
  document.querySelectorAll('.scene-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      initAudio();
      const targetTime = parseFloat(chip.dataset.time);
      currentTime = targetTime;
      if (currentTime < 58) deathOverlay.classList.remove('active');
      isPlaying = true;
      updatePlayPauseUI();
    });
  });

  // Timeline markers
  document.querySelectorAll('.t-mark').forEach(mark => {
    mark.addEventListener('click', () => {
      initAudio();
      const targetTime = parseFloat(mark.dataset.time);
      currentTime = targetTime;
      if (currentTime < 58) deathOverlay.classList.remove('active');
      isPlaying = true;
      updatePlayPauseUI();
    });
  });

  // Speed selector
  document.querySelectorAll('.speed-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.speed-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      playbackSpeed = parseFloat(btn.dataset.speed);
    });
  });

  // Audio Toggle
  btnSoundToggle.addEventListener('click', () => {
    initAudio();
    soundEnabled = !soundEnabled;
    if (soundEnabled) {
      soundLabel.textContent = "Audio ON";
      if (masterGain) masterGain.gain.setValueAtTime(0.85, audioCtx.currentTime);
    } else {
      soundLabel.textContent = "Audio OFF";
      if (masterGain) masterGain.gain.setValueAtTime(0, audioCtx.currentTime);
    }
  });

  btnTriggerRoar.addEventListener('click', () => {
    initAudio();
    playSeaEaterRoar();
  });

  btnTriggerBloop.addEventListener('click', () => {
    initAudio();
    playBloopScream();
  });

  btnVhsToggle.addEventListener('click', () => {
    vhsEnabled = !vhsEnabled;
    if (vhsEnabled) {
      vhsOverlay.classList.remove('disabled');
      vhsLabel.textContent = "VHS: ON";
    } else {
      vhsOverlay.classList.add('disabled');
      vhsLabel.textContent = "VHS: OFF";
    }
  });

  // Lore Modal
  btnInfoModal.addEventListener('click', () => {
    modalLore.classList.remove('hidden');
  });

  btnModalClose.addEventListener('click', () => {
    modalLore.classList.add('hidden');
  });

  modalLore.addEventListener('click', (e) => {
    if (e.target === modalLore) modalLore.classList.add('hidden');
  });

  // Sketchfab 3D Models Modal
  btnSketchfabModal.addEventListener('click', () => {
    modalSketchfab.classList.remove('hidden');
  });

  btnSketchfabClose.addEventListener('click', () => {
    modalSketchfab.classList.add('hidden');
  });

  modalSketchfab.addEventListener('click', (e) => {
    if (e.target === modalSketchfab) modalSketchfab.classList.add('hidden');
  });

  // Sketchfab Modal Tabs
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
      btn.classList.add('active');
      const targetPanel = document.getElementById(btn.dataset.tab);
      if (targetPanel) targetPanel.classList.add('active');
    });
  });

  // =========================================================================
  // 15. 60-SECOND HIGH-DEFINITION VIDEO EXPORTER (WEBM WITH AUDIO)
  // =========================================================================
  let mediaRecorder = null;
  let recordedChunks = [];
  let isRecording = false;

  btnRecordVideo.addEventListener('click', () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  });

  function startRecording() {
    initAudio();
    recordedChunks = [];

    // Capture 3D WebGL stream at 60 FPS
    const canvasStream = canvas.captureStream(60);

    // Merge audio if available
    let combinedStream = canvasStream;
    if (mediaStreamDest && mediaStreamDest.stream.getAudioTracks().length > 0) {
      combinedStream = new MediaStream([
        ...canvasStream.getVideoTracks(),
        ...mediaStreamDest.stream.getAudioTracks()
      ]);
    }

    const mimeType = MediaRecorder.isTypeSupported('video/webm; codecs=vp9,opus')
      ? 'video/webm; codecs=vp9,opus'
      : (MediaRecorder.isTypeSupported('video/webm; codecs=vp8,opus')
          ? 'video/webm; codecs=vp8,opus'
          : 'video/webm');

    try {
      mediaRecorder = new MediaRecorder(combinedStream, {
        mimeType: mimeType,
        videoBitsPerSecond: 10000000 // 10 Mbps crystal clear HD
      });

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          recordedChunks.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(recordedChunks, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `SeaEater_vs_Bloop_Fight_To_The_Death_60s_${Date.now()}.webm`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        isRecording = false;
        recordLabel.textContent = "Export Video (60s)";
        btnRecordVideo.classList.remove('recording');
      };

      // Restart timeline from 0 for a complete 60s record
      currentTime = 0;
      deathOverlay.classList.remove('active');
      for (let k in triggeredMoves) delete triggeredMoves[k];
      isPlaying = true;
      playbackSpeed = 1.0;
      updatePlayPauseUI();

      mediaRecorder.start(1000);
      isRecording = true;
      recordLabel.textContent = "Recording 60s...";
      btnRecordVideo.classList.add('recording');
    } catch (err) {
      alert("Video export failed: " + err.message);
    }
  }

  function stopRecording() {
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
      mediaRecorder.stop();
    }
  }

  // Keyboard Shortcuts
  window.addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
      e.preventDefault();
      togglePlayPause();
    } else if (e.code === 'KeyR') {
      btnRestart.click();
    } else if (e.code === 'KeyN') {
      btnNextScene.click();
    } else if (e.code === 'KeyM') {
      btnSoundToggle.click();
    } else if (e.code === 'KeyC') {
      btnCameraToggle.click();
    } else if (e.code === 'KeyV') {
      btnVhsToggle.click();
    } else if (e.code === 'KeyB') {
      btnTriggerBloop.click();
    } else if (e.code === 'KeyE') {
      btnTriggerRoar.click();
    } else if (e.code === 'Escape') {
      modalLore.classList.add('hidden');
      modalSketchfab.classList.add('hidden');
    }
  });

  // Automatic AudioContext unlock on first user click
  window.addEventListener('click', () => {
    if (!hasUserInteracted) {
      hasUserInteracted = true;
      initAudio();
    }
  }, { once: true });
});
