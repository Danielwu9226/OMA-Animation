/**
 * THE SEA EATER (Trevor Henderson) — 30-Second Oceanic Horror Scene
 * Procedural HTML5 Canvas Engine & Web Audio Sound Synthesizer
 */

document.addEventListener('DOMContentLoaded', () => {
  // CANVAS & DISPLAY SETUP
  const canvas = document.getElementById('fightCanvas');
  const ctx = canvas.getContext('2d');
  const viewport = document.getElementById('viewport-container');

  let width = window.innerWidth;
  let height = window.innerHeight;

  function resizeCanvas() {
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width * window.devicePixelRatio;
    canvas.height = height * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
  }
  window.addEventListener('resize', resizeCanvas);
  resizeCanvas();

  // STATE MANAGEMENT
  let currentTime = 0; // 0.0 to 30.0 seconds
  const totalDuration = 30.0;
  let isPlaying = true;
  let playbackSpeed = 1.0;
  let soundEnabled = true;
  let cameraMode = 'cinematic'; // 'cinematic', 'ship_pov', 'aerial', 'vhs_cam'
  let vhsEnabled = true;
  let lastTimestamp = 0;
  let screenShake = 0;

  // DOM ELEMENTS
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
  const btnCameraToggle = document.getElementById('btn-camera-toggle');
  const cameraLabel = document.getElementById('camera-label');
  const btnVhsToggle = document.getElementById('btn-vhs-toggle');
  const vhsLabel = document.getElementById('vhs-label');
  const vhsOverlay = document.getElementById('vhs-overlay');
  const btnInfoModal = document.getElementById('btn-info-modal');
  const btnModalClose = document.getElementById('btn-modal-close');
  const modalLore = document.getElementById('modal-lore');
  const impactFlash = document.getElementById('impact-flash');
  const roarShockwave = document.getElementById('roar-shockwave');
  const telemetryDisplacement = document.getElementById('telemetry-displacement');
  const telemetryHz = document.getElementById('telemetry-hz');
  const telemetryTarget = document.getElementById('telemetry-target');
  const vhsTimestamp = document.getElementById('vhs-timestamp');

  // =========================================================================
  // WEB AUDIO ENGINE (Procedural Oceanic Waves & The Sea Eater Iconic Roar)
  // =========================================================================
  let audioCtx = null;
  let masterGain = null;
  let waveGain = null;
  let windNoiseNode = null;
  let oceanFilterNode = null;
  let hasUserInteracted = false;

  function initAudio() {
    if (!audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      audioCtx = new AudioContext();

      masterGain = audioCtx.createGain();
      masterGain.gain.setValueAtTime(0.85, audioCtx.currentTime);
      masterGain.connect(audioCtx.destination);

      startOceanAmbience();
    }
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
  }

  // Create continuous violent ocean wave & wind wash
  function startOceanAmbience() {
    if (!audioCtx || windNoiseNode) return;

    try {
      const bufferSize = audioCtx.sampleRate * 4;
      const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
      const data = buffer.getChannelData(0);
      let lastOut = 0.0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        // Pink-ish noise filter
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

      // Low frequency wave swell modulation
      const swellOsc = audioCtx.createOscillator();
      const swellGain = audioCtx.createGain();
      swellOsc.frequency.setValueAtTime(0.25, audioCtx.currentTime); // 4-second swell cycle
      swellGain.gain.setValueAtTime(140, audioCtx.currentTime);
      swellOsc.connect(swellGain);
      swellGain.connect(oceanFilterNode.frequency);
      swellOsc.start();
    } catch (e) {
      console.warn("Ambience setup error:", e);
    }
  }

  // THE SEA EATER'S ICONIC ROAR (Multi-layered eldritch leviathan roar)
  let lastRoarTime = -10;
  function playSeaEaterRoar() {
    if (!soundEnabled || !audioCtx) return;
    initAudio();

    const now = audioCtx.currentTime;

    try {
      // 1. SUB-BASS INFRASOUND RUMBLE (Mountain tectonic resonance)
      const subOsc = audioCtx.createOscillator();
      const subGain = audioCtx.createGain();
      subOsc.type = 'sawtooth';
      subOsc.frequency.setValueAtTime(42, now);
      subOsc.frequency.exponentialRampToValueAtTime(32, now + 1.2);
      subOsc.frequency.exponentialRampToValueAtTime(58, now + 2.4);
      subOsc.frequency.exponentialRampToValueAtTime(24, now + 4.0);

      const subFilter = audioCtx.createBiquadFilter();
      subFilter.type = 'lowpass';
      subFilter.frequency.setValueAtTime(120, now);

      subGain.gain.setValueAtTime(0.01, now);
      subGain.gain.linearRampToValueAtTime(0.85, now + 0.3);
      subGain.gain.exponentialRampToValueAtTime(0.001, now + 4.2);

      subOsc.connect(subFilter);
      subFilter.connect(subGain);
      subGain.connect(masterGain);
      subOsc.start(now);
      subOsc.stop(now + 4.5);

      // 2. UNCANNY ELDRITCH HOWL / SCREECH (Signature Trevor Henderson horror tone)
      const screechOsc = audioCtx.createOscillator();
      const screechGain = audioCtx.createGain();
      screechOsc.type = 'triangle';
      screechOsc.frequency.setValueAtTime(190, now);
      screechOsc.frequency.exponentialRampToValueAtTime(120, now + 0.8);
      screechOsc.frequency.exponentialRampToValueAtTime(260, now + 2.2);
      screechOsc.frequency.exponentialRampToValueAtTime(75, now + 3.8);

      const screechFilter = audioCtx.createBiquadFilter();
      screechFilter.type = 'bandpass';
      screechFilter.frequency.setValueAtTime(450, now);
      screechFilter.Q.setValueAtTime(4.0, now);

      // Frequency modulation for terrifying vocal flutter
      const lfo = audioCtx.createOscillator();
      const lfoGain = audioCtx.createGain();
      lfo.frequency.setValueAtTime(16, now); // 16Hz stuttering roar tremor
      lfoGain.gain.setValueAtTime(45, now);
      lfo.connect(screechOsc.frequency);
      lfo.start(now);
      lfo.stop(now + 4.0);

      screechGain.gain.setValueAtTime(0.01, now);
      screechGain.gain.linearRampToValueAtTime(0.65, now + 0.4);
      screechGain.gain.exponentialRampToValueAtTime(0.001, now + 4.0);

      screechOsc.connect(screechFilter);
      screechFilter.connect(screechGain);
      screechGain.connect(masterGain);
      screechOsc.start(now);
      screechOsc.stop(now + 4.2);

      // 3. CAVERNOUS WATERFALL & ROARING GUSH
      const gushBuffer = audioCtx.createBuffer(1, audioCtx.sampleRate * 3.5, audioCtx.sampleRate);
      const gData = gushBuffer.getChannelData(0);
      for (let i = 0; i < gushBuffer.length; i++) {
        gData[i] = (Math.random() * 2 - 1) * Math.exp(-i / (audioCtx.sampleRate * 2.8));
      }
      const gushSource = audioCtx.createBufferSource();
      gushSource.buffer = gushBuffer;
      const gushFilter = audioCtx.createBiquadFilter();
      gushFilter.type = 'lowpass';
      gushFilter.frequency.setValueAtTime(600, now);
      const gushGain = audioCtx.createGain();
      gushGain.gain.setValueAtTime(0.5, now);
      gushGain.gain.exponentialRampToValueAtTime(0.01, now + 3.5);

      gushSource.connect(gushFilter);
      gushFilter.connect(gushGain);
      gushGain.connect(masterGain);
      gushSource.start(now);

      // Visual flash & shockwave
      triggerRoarShockwave();
    } catch (e) {
      console.warn("Roar audio error:", e);
    }
  }

  // SHIP DISTRESS FOGHORN
  let lastHornTime = -10;
  function playShipFoghorn() {
    if (!soundEnabled || !audioCtx) return;
    initAudio();
    const now = audioCtx.currentTime;

    try {
      const osc1 = audioCtx.createOscillator();
      const osc2 = audioCtx.createOscillator();
      const hornGain = audioCtx.createGain();

      osc1.type = 'sawtooth';
      osc2.type = 'sawtooth';

      // Deep minor third ship horn chord
      osc1.frequency.setValueAtTime(110, now);
      osc2.frequency.setValueAtTime(138.6, now);

      const hornFilter = audioCtx.createBiquadFilter();
      hornFilter.type = 'lowpass';
      hornFilter.frequency.setValueAtTime(400, now);

      hornGain.gain.setValueAtTime(0.01, now);
      hornGain.gain.linearRampToValueAtTime(0.28, now + 0.1);
      hornGain.gain.exponentialRampToValueAtTime(0.001, now + 1.8);

      osc1.connect(hornFilter);
      osc2.connect(hornFilter);
      hornFilter.connect(hornGain);
      hornGain.connect(masterGain);

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + 1.9);
      osc2.stop(now + 1.9);
    } catch (e) {}
  }

  // GARGANTUAN SWALLOWING GULP & JAW SLAM
  let lastSwallowTime = -10;
  function playSwallowGulp() {
    if (!soundEnabled || !audioCtx) return;
    initAudio();
    const now = audioCtx.currentTime;

    try {
      // 1. Suction vortex whistle & rush
      const swirlOsc = audioCtx.createOscillator();
      const swirlGain = audioCtx.createGain();
      swirlOsc.type = 'sine';
      swirlOsc.frequency.setValueAtTime(320, now);
      swirlOsc.frequency.exponentialRampToValueAtTime(50, now + 1.4);

      swirlGain.gain.setValueAtTime(0.01, now);
      swirlGain.gain.linearRampToValueAtTime(0.4, now + 0.3);
      swirlGain.gain.exponentialRampToValueAtTime(0.001, now + 1.5);

      swirlOsc.connect(swirlGain);
      swirlGain.connect(masterGain);
      swirlOsc.start(now);
      swirlOsc.stop(now + 1.5);

      // 2. Heavy jaw slam splashdown
      setTimeout(() => {
        if (!audioCtx) return;
        const slamNow = audioCtx.currentTime;
        const slamOsc = audioCtx.createOscillator();
        const slamGain = audioCtx.createGain();
        slamOsc.type = 'triangle';
        slamOsc.frequency.setValueAtTime(90, slamNow);
        slamOsc.frequency.exponentialRampToValueAtTime(20, slamNow + 0.8);

        slamGain.gain.setValueAtTime(0.7, slamNow);
        slamGain.gain.exponentialRampToValueAtTime(0.001, slamNow + 1.2);

        slamOsc.connect(slamGain);
        slamGain.connect(masterGain);
        slamOsc.start(slamNow);
        slamOsc.stop(slamNow + 1.2);

        // Flash screen
        triggerFlash('flash-red', 180);
        screenShake = 25;
      }, 700);
    } catch (e) {}
  }

  function triggerFlash(colorClass = 'flash-cyan', duration = 150) {
    impactFlash.className = `impact-flash ${colorClass}`;
    setTimeout(() => {
      impactFlash.className = 'impact-flash';
    }, duration);
  }

  function triggerRoarShockwave() {
    roarShockwave.classList.add('active');
    triggerFlash('flash-white', 120);
    screenShake = 32;
    setTimeout(() => {
      roarShockwave.classList.remove('active');
    }, 2800);
  }

  // =========================================================================
  // SCENE TIMELINE & LORE SCRIPT (0.00s to 30.00s)
  // =========================================================================
  const scenePhases = [
    {
      act: 1,
      name: "ACT 1: THE MOUNTAIN AWAKENS",
      startTime: 0.0,
      endTime: 6.0,
      subtitle: "PACIFIC OCEAN TRENCH // 14°N 142°E: A 25-kilometer mountain of black and cyan hide churns through the abyssal swells, displacing millions of tons of water.",
      displacement: "5,200 M HEIGHT // 25 KM RIDGE",
      hz: "14.2 HZ (INFRASOUND)",
      target: "MONITORING PACIFIC EXPEDITION"
    },
    {
      act: 2,
      name: "ACT 2: 5KM BONE ARMS OF DEFEATED GIANTS",
      startTime: 6.0,
      endTime: 13.0,
      subtitle: "Two 5-kilometer limbs emerge—composed of calcified leviathan skeletons, tangled whale carcasses, and massive webbed humanoid hands clawing the skies.",
      displacement: "ARM SPAN: 12,000 M // SKELETAL TITANS",
      hz: "22.8 HZ (BONE RESONANCE)",
      target: "RADAR CONTACT: MV NEPTUNE CARRIER"
    },
    {
      act: 3,
      name: "ACT 3: THE ICONIC ROAR OF THE SEA EATER",
      startTime: 13.0,
      endTime: 20.0,
      subtitle: "The Sea Eater rears its mountainous head skyward and releases its iconic, world-shattering roar—vibrating tectonic plates and shattering the ocean surface.",
      displacement: "SHOCKWAVE RADIUS: 45 KM",
      hz: "38.5 HZ // 180 DECIBELS (SEISMIC)",
      target: "WARNING: VESSEL WITHIN BLAST WAVE"
    },
    {
      act: 4,
      name: "ACT 4: TARGET ACQUISITION — VESSEL CORNERED",
      startTime: 20.0,
      endTime: 25.0,
      subtitle: "Its sunken abyssal eyes spot a lone 200m cargo vessel caught in the tempest. The webbed bone hands enclose, trapping the ship in a rising oceanic vortex.",
      displacement: "HYDRODYNAMIC MAELSTROM ACTIVE",
      hz: "18.4 HZ (VORTEX SUCTION)",
      target: "CRITICAL: MV NEPTUNE TRAPPED"
    },
    {
      act: 5,
      name: "ACT 5: THE ABYSSAL MAW — SWALLOWED WHOLE",
      startTime: 25.0,
      endTime: 30.0,
      subtitle: "The cavernous maw forms a catastrophic whirlpool. The vessel is dragged down into the darkness and swallowed whole as the leviathan submerges back into the deep.",
      displacement: "SUBMERGING: DEPTH 10,920M",
      hz: "08.1 HZ (ABYSSAL FADE)",
      target: "STATUS: VESSEL CONSUMED // ZERO SURVIVORS"
    }
  ];

  function getCurrentPhase(time) {
    for (let p of scenePhases) {
      if (time >= p.startTime && time < p.endTime) return p;
    }
    return scenePhases[scenePhases.length - 1];
  }

  // =========================================================================
  // PROCEDURAL OCEAN & MONSTER ENGINE GRAPHICS
  // =========================================================================

  // Rain particles system
  const rainDrops = [];
  const rainCount = 180;
  for (let i = 0; i < rainCount; i++) {
    rainDrops.push({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      len: 15 + Math.random() * 25,
      speed: 18 + Math.random() * 12,
      opacity: 0.15 + Math.random() * 0.35
    });
  }

  // Waterfall particles cascading down the creature's mountain body
  const waterfallParticles = [];
  const waterfallCount = 120;
  for (let i = 0; i < waterfallCount; i++) {
    waterfallParticles.push({
      xOffset: (Math.random() - 0.5) * 500,
      y: 0,
      speed: 3 + Math.random() * 5,
      size: 1 + Math.random() * 3,
      alpha: 0.3 + Math.random() * 0.5
    });
  }

  // Foam spray particles from violent waves
  const foamParticles = [];
  const foamCount = 70;
  for (let i = 0; i < foamCount; i++) {
    foamParticles.push({
      x: Math.random() * window.innerWidth,
      y: window.innerHeight * 0.7 + Math.random() * 100,
      vx: (Math.random() - 0.5) * 4,
      vy: -Math.random() * 3 - 1,
      radius: 2 + Math.random() * 4,
      alpha: 0.5 + Math.random() * 0.5,
      life: Math.random() * 60
    });
  }

  // Lighting state
  let lightningTimer = 0;
  let isLightningActive = false;

  // =========================================================================
  // MAIN DRAW ROUTINE
  // =========================================================================

  function renderScene(t) {
    ctx.save();

    // Screen shake offset
    let shakeX = 0;
    let shakeY = 0;
    if (screenShake > 0) {
      shakeX = (Math.random() - 0.5) * screenShake;
      shakeY = (Math.random() - 0.5) * screenShake;
      screenShake = Math.max(0, screenShake - 0.7);
    }
    ctx.translate(shakeX, shakeY);

    const phase = getCurrentPhase(t);
    const progress = t / totalDuration;

    // CAMERA MATRICES BASED ON MODE
    let camScale = 1.0;
    let camPanX = 0;
    let camPanY = 0;

    if (cameraMode === 'cinematic') {
      // Dynamic cinematic camera: slow zoom and sweep, tracking action
      if (t < 6.0) {
        camScale = 0.95 + (t / 6.0) * 0.05;
        camPanY = (t / 6.0) * -15;
      } else if (t < 13.0) {
        camScale = 1.0 + ((t - 6.0) / 7.0) * 0.1;
        camPanY = -15 - ((t - 6.0) / 7.0) * 20;
      } else if (t < 20.0) {
        // Roar: dramatic shake and push-in on head
        camScale = 1.15;
        camPanY = -35;
      } else if (t < 25.0) {
        // Tracking ship and looming hands
        camScale = 1.25;
        camPanX = -40;
        camPanY = 10;
      } else {
        // Swallowing maelstrom
        camScale = 1.35;
        camPanX = -20;
        camPanY = 20;
      }
    } else if (cameraMode === 'ship_pov') {
      // Low-angle perspective looking up from ship deck
      camScale = 1.5;
      camPanY = 120;
      camPanX = -width * 0.12;
    } else if (cameraMode === 'aerial') {
      // High-altitude wide satellite surveillance view
      camScale = 0.65;
      camPanY = -100;
    }

    ctx.translate(width / 2 + camPanX, height / 2 + camPanY);
    ctx.scale(camScale, camScale);
    ctx.translate(-width / 2, -height / 2);

    // 1. SKY & STORMY HORIZON
    drawSkyAndStorm(t);

    // 2. BACKGROUND OCEAN HORIZON & DISTANT SWELLS
    drawOceanBackground(t);

    // 3. THE SEA EATER (25 KM MOUNTAIN, 5 KM ARMS, HYDRODYNAMIC CONDUITS)
    drawSeaEater(t, phase);

    // 4. THE VICTIM SHIP (200M CARGO VESSEL)
    drawCargoShip(t, phase);

    // 5. FOREGROUND VIOLENT BREAKING SWELLS & FOAM
    drawOceanForeground(t);

    // 6. RAIN & STORM WEATHER FX
    drawRainAndAtmosphere(t);

    ctx.restore();
  }

  // Flocks of birds circling the 5km high peaks (gives staggering sense of scale)
  const flockBirds = [];
  for (let i = 0; i < 40; i++) {
    flockBirds.push({
      x: Math.random() * window.innerWidth,
      y: window.innerHeight * 0.05 + Math.random() * (window.innerHeight * 0.38),
      speed: 0.4 + Math.random() * 0.8,
      wingFreq: 3 + Math.random() * 4,
      size: 1.8 + Math.random() * 2.2
    });
  }

  // 1. SKY & OVERCAST TWILIGHT GLOOM (Matching Trevor Henderson's vintage mauve palette)
  function drawSkyAndStorm(t) {
    const skyGrad = ctx.createLinearGradient(0, 0, 0, height * 0.65);
    if (isLightningActive) {
      skyGrad.addColorStop(0, '#564e63');
      skyGrad.addColorStop(0.5, '#443d50');
      skyGrad.addColorStop(1, '#2c2734');
    } else {
      skyGrad.addColorStop(0, '#2e2a36');
      skyGrad.addColorStop(0.35, '#3e3947');
      skyGrad.addColorStop(0.65, '#565060');
      skyGrad.addColorStop(1, '#706979');
    }
    ctx.fillStyle = skyGrad;
    ctx.fillRect(-width * 0.5, -height * 0.5, width * 2, height * 1.5);

    // Soft murky overcast cloud layers
    ctx.save();
    ctx.fillStyle = isLightningActive ? 'rgba(100, 90, 115, 0.4)' : 'rgba(35, 30, 42, 0.45)';
    for (let c = 0; c < 5; c++) {
      const cx = (c * (width / 4) + Math.sin(t * 0.15 + c) * 40);
      const cy = height * 0.12 + Math.cos(t * 0.2 + c) * 25;
      ctx.beginPath();
      ctx.ellipse(cx, cy, width * 0.32, height * 0.2, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();

    // Flocks of tiny distant birds circling the 5km titan limbs
    drawDistantBirds(t);

    // Occasional lightning strikes (especially during the roar 13-20s)
    lightningTimer++;
    if (t >= 13.0 && t <= 19.5) {
      if (Math.random() < 0.14) {
        isLightningActive = true;
        drawLightningFork();
      } else {
        isLightningActive = false;
      }
    } else if (Math.random() < 0.02) {
      isLightningActive = true;
      drawLightningFork();
    } else {
      isLightningActive = false;
    }
  }

  function drawDistantBirds(t) {
    ctx.save();
    ctx.fillStyle = 'rgba(25, 22, 30, 0.75)';
    for (let b of flockBirds) {
      b.x = (b.x + b.speed) % (width * 1.2);
      const flap = Math.sin(t * b.wingFreq) * (b.size * 0.8);
      const bx = b.x - width * 0.1;
      const by = b.y + Math.sin(t * 0.8 + b.x * 0.01) * 6;

      ctx.beginPath();
      ctx.moveTo(bx - b.size, by + flap);
      ctx.lineTo(bx, by);
      ctx.lineTo(bx + b.size, by + flap);
      ctx.lineWidth = 1.2;
      ctx.strokeStyle = 'rgba(25, 22, 30, 0.75)';
      ctx.stroke();
    }
    ctx.restore();
  }

  function drawLightningFork() {
    ctx.save();
    ctx.strokeStyle = '#e6dcfa';
    ctx.shadowColor = '#d1c0f0';
    ctx.shadowBlur = 20;
    ctx.lineWidth = 2.5;

    let lx = width * 0.25 + Math.random() * width * 0.5;
    let ly = 0;

    ctx.beginPath();
    ctx.moveTo(lx, ly);
    for (let i = 0; i < 6; i++) {
      lx += (Math.random() - 0.5) * 60;
      ly += height * 0.09;
      ctx.lineTo(lx, ly);
    }
    ctx.stroke();
    ctx.restore();
  }

  // 2. BACKGROUND OCEAN (Dark choppy greenish-grey ocean matching Trevor Henderson art)
  function drawOceanBackground(t) {
    const horizonY = height * 0.54;
    const oceanGrad = ctx.createLinearGradient(0, horizonY, 0, height);
    oceanGrad.addColorStop(0, '#1c2628');
    oceanGrad.addColorStop(0.3, '#141d1f');
    oceanGrad.addColorStop(0.7, '#0f1718');
    oceanGrad.addColorStop(1, '#090e0f');

    ctx.fillStyle = oceanGrad;
    ctx.fillRect(-width * 0.5, horizonY, width * 2, height * 0.8);

    // Muted ocean swell texture
    ctx.save();
    ctx.strokeStyle = 'rgba(125, 145, 140, 0.2)';
    ctx.lineWidth = 1.5;
    for (let i = 0; i < 5; i++) {
      const wy = horizonY + i * 18;
      ctx.beginPath();
      ctx.moveTo(-width * 0.5, wy);
      for (let x = -width * 0.5; x < width * 1.5; x += 30) {
        const offset = Math.sin(x * 0.01 + t * 2.2 + i * 1.2) * (3 + i * 1.8);
        ctx.lineTo(x, wy + offset);
      }
      ctx.stroke();
    }
    ctx.restore();
  }

  // 3. THE SEA EATER (TREVOR HENDERSON'S EXACT DESIGN: CENTRAL ARCH MOUND & TWO GIANT BENT STILT LIMBS)
  function drawSeaEater(t, phase) {
    ctx.save();

    const seaLevelY = height * 0.54;
    const centerX = width * 0.50;

    // Movement: slow monolithic heave and sway
    const surgeX = Math.sin(t * 0.4) * 8;
    const surgeY = Math.sin(t * 0.8) * 5;
    const bodyRise = (t < 5.0) ? (0.85 + (t / 5.0) * 0.15) : 1.0;

    // Submerging in Act 5 (27.0 - 30.0s)
    let submergeOffset = 0;
    if (t > 26.5) {
      submergeOffset = ((t - 26.5) / 3.5) * 160;
    }

    const baseY = seaLevelY + 10 - ((bodyRise - 1.0) * 80) + submergeOffset + surgeY;
    const cx = centerX + surgeX;

    // A. REAR BODY SLOPING RIDGE (trails to the right into the horizon)
    drawRearSlopingBody(cx, baseY, t);

    // B. THE RIGHT BENT STILT LIMB (elbow peak rising on the right side)
    drawRightStiltLimb(cx, baseY, t, phase);

    // C. THE CENTRAL MOUNTAIN DOME & MASSIVE ARCHWAY MOUTH
    drawCentralArchDome(cx, baseY, t, phase);

    // D. THE LEFT BENT STILT LIMB (emerges from left, sharp elbow apex, flares into water)
    drawLeftStiltLimb(cx, baseY, t, phase);

    // E. WATER FOAM & SPLASH AT ALL WATER CONTACT POINTS
    drawLimbWaterImpacts(cx, baseY, t);

    ctx.restore();
  }

  // A. REAR BODY SLOPING RIDGE
  function drawRearSlopingBody(cx, cy, t) {
    ctx.save();

    // In the painting, a large rounded mountain ridge extends back and to the right
    const bodyGrad = ctx.createLinearGradient(cx, cy - 140, cx + 450, cy + 20);
    bodyGrad.addColorStop(0, '#758072');
    bodyGrad.addColorStop(0.4, '#5e685b');
    bodyGrad.addColorStop(0.8, '#3d453c');
    bodyGrad.addColorStop(1, '#252b24');

    ctx.fillStyle = bodyGrad;
    ctx.strokeStyle = '#434d41';
    ctx.lineWidth = 1.5;

    ctx.beginPath();
    ctx.moveTo(cx + 80, cy - 80);
    ctx.quadraticCurveTo(cx + 220, cy - 110, cx + 360, cy - 10);
    ctx.lineTo(cx + 460, cy + 30);
    ctx.lineTo(cx + 80, cy + 30);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.restore();
  }

  // B. THE RIGHT BENT STILT LIMB
  function drawRightStiltLimb(cx, cy, t, phase) {
    ctx.save();

    // Limb kinetics: subtle stepping motion
    const stepOffset = Math.sin(t * 0.9 + 1.2) * 8;
    const elbowX = cx + 290 + stepOffset * 0.5;
    const elbowY = cy - 260 + stepOffset * 0.3; // High acute peak on right
    const footX = cx + 440;
    const footY = cy + 25;

    // Limb gradient: pale bone-grey with soft volumetric cylindrical shading
    const limbGrad = ctx.createLinearGradient(cx + 120, cy - 100, elbowX, elbowY);
    limbGrad.addColorStop(0, '#667063');
    limbGrad.addColorStop(0.4, '#879283');
    limbGrad.addColorStop(0.8, '#a2ac9e');
    limbGrad.addColorStop(1, '#667063');

    ctx.fillStyle = limbGrad;
    ctx.strokeStyle = '#3e473c';
    ctx.lineWidth = 2;

    // Upper segment: from behind central mound up to elbow peak
    // Lower segment: from elbow peak down to right water entry
    const limbWidth = 34;

    ctx.beginPath();
    // Inner contour
    ctx.moveTo(cx + 140, cy - 60);
    ctx.lineTo(elbowX - limbWidth * 0.6, elbowY + 15);
    ctx.quadraticCurveTo(elbowX, elbowY - 10, elbowX + 15, elbowY + 15);
    ctx.lineTo(footX + 45, footY);
    ctx.lineTo(footX - 10, footY);
    ctx.lineTo(elbowX - 5, elbowY + 35);
    ctx.lineTo(cx + 175, cy - 30);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Highlight ridge along top of the limb
    ctx.strokeStyle = 'rgba(205, 218, 200, 0.45)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(cx + 155, cy - 50);
    ctx.lineTo(elbowX, elbowY);
    ctx.lineTo(footX + 25, footY);
    ctx.stroke();

    ctx.restore();
  }

  // C. THE CENTRAL MOUNTAIN DOME & MASSIVE ARCHWAY MOUTH (THE CORE ICONIC VISUAL)
  function drawCentralArchDome(cx, cy, t, phase) {
    ctx.save();

    // Breathing heave
    const breath = Math.sin(t * 1.1) * 4;
    const domeTopY = cy - 250 + breath;
    const domeBaseY = cy + 30;

    // 1. DOME OUTER MOUND SILHOUETTE
    const domeGrad = ctx.createLinearGradient(cx - 150, domeTopY, cx + 150, domeBaseY);
    domeGrad.addColorStop(0, '#9da899');
    domeGrad.addColorStop(0.3, '#869182');
    domeGrad.addColorStop(0.7, '#606a5c');
    domeGrad.addColorStop(1, '#3b4339');

    ctx.fillStyle = domeGrad;
    ctx.strokeStyle = '#2f372e';
    ctx.lineWidth = 2.5;

    // Smooth rounded arch dome
    ctx.beginPath();
    ctx.moveTo(cx - 165, domeBaseY);
    ctx.quadraticCurveTo(cx - 160, cy - 130, cx - 110, domeTopY + 35);
    ctx.quadraticCurveTo(cx - 40, domeTopY - 15, cx, domeTopY - 18);
    ctx.quadraticCurveTo(cx + 50, domeTopY - 15, cx + 115, domeTopY + 40);
    ctx.quadraticCurveTo(cx + 170, cy - 120, cx + 175, domeBaseY);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Subtle fleshy contours & soft lighting on the dome exterior
    ctx.strokeStyle = 'rgba(215, 226, 210, 0.35)';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(cx - 15, domeTopY + 35, 110, -Math.PI * 0.75, -Math.PI * 0.15);
    ctx.stroke();

    // 2. THE TITANIC PITCH-BLACK ARCHWAY MOUTH / CAVERN
    // Roar & swallowing width/height dynamics
    let archWidthMod = 0;
    let archVibrate = 0;
    if (t >= 13.0 && t <= 20.0) {
      // Roar tremor
      archVibrate = (Math.random() - 0.5) * 6;
      archWidthMod = Math.sin((t - 13.0) / 7.0 * Math.PI) * 16;
    } else if (t >= 24.5) {
      // Swallowing whole expansion
      archWidthMod = Math.min(24, (t - 24.5) * 6);
    }

    const archHalfW = 55 + archWidthMod;
    const archTopY = domeTopY + 55 + archVibrate;

    // Cavern Void Gradient: absolute darkness inside
    const voidGrad = ctx.createRadialGradient(cx, archTopY + 80, 10, cx, archTopY + 80, archHalfW + 25);
    voidGrad.addColorStop(0, '#010204');
    voidGrad.addColorStop(0.7, '#030508');
    voidGrad.addColorStop(1, '#080d12');

    ctx.fillStyle = voidGrad;
    ctx.beginPath();
    // Rounded arch top
    ctx.moveTo(cx - archHalfW, domeBaseY);
    ctx.lineTo(cx - archHalfW, archTopY + archHalfW);
    ctx.arc(cx, archTopY + archHalfW, archHalfW, Math.PI, 0, false);
    ctx.lineTo(cx + archHalfW, domeBaseY);
    ctx.closePath();
    ctx.fill();

    // Inner rim shadow giving depth to the archway tunnel
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 8;
    ctx.stroke();

    // Soft fleshy lip highlight around the outer arch margin
    ctx.strokeStyle = 'rgba(195, 208, 192, 0.5)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(cx, archTopY + archHalfW, archHalfW + 4, Math.PI, 0, false);
    ctx.stroke();

    // SHOCKWAVE PULSES EMANATING FROM THE ARCH DURING THE ICONIC ROAR (13s - 20s)
    if (t >= 13.0 && t <= 19.5) {
      ctx.save();
      for (let s = 0; s < 3; s++) {
        const shockRad = ((t * 80 + s * 45) % 180) + archHalfW;
        const shockAlpha = Math.max(0, 1.0 - shockRad / 240);
        ctx.strokeStyle = `rgba(180, 225, 220, ${shockAlpha * 0.7})`;
        ctx.lineWidth = 3.5;
        ctx.beginPath();
        ctx.ellipse(cx, archTopY + archHalfW + 20, shockRad, shockRad * 1.1, 0, 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.restore();
    }

    // SWALLOWING VORTEX SUCTION INSIDE ARCH (24.5s - 29.5s)
    if (t >= 24.5 && t <= 29.5) {
      ctx.save();
      const spinAngle = t * 6;
      ctx.strokeStyle = 'rgba(100, 180, 170, 0.4)';
      ctx.lineWidth = 2.5;
      for (let r = 1; r <= 4; r++) {
        const rad = r * 15;
        ctx.beginPath();
        ctx.ellipse(cx, archTopY + 80, rad, rad * 1.2, spinAngle + r, 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.restore();
    }

    ctx.restore();
  }

  // D. THE LEFT BENT STILT LIMB (SHARP ACUTE ELBOW APEX, FLARING DOWN INTO THE WATER)
  function drawLeftStiltLimb(cx, cy, t, phase) {
    ctx.save();

    // Stepping kinetics
    const stepOffset = Math.sin(t * 0.9) * 8;
    const elbowX = cx - 295 + stepOffset * 0.4;
    const elbowY = cy - 275 + stepOffset * 0.3; // High acute peak on left
    const footX = cx - 380;
    const footY = cy + 25;

    // Pale bone-grey cylindrical gradient matching the painting
    const limbGrad = ctx.createLinearGradient(cx - 100, cy - 60, elbowX, elbowY);
    limbGrad.addColorStop(0, '#626c5f');
    limbGrad.addColorStop(0.35, '#859081');
    limbGrad.addColorStop(0.7, '#9ea99b');
    limbGrad.addColorStop(1, '#667063');

    ctx.fillStyle = limbGrad;
    ctx.strokeStyle = '#323a30';
    ctx.lineWidth = 2;

    const limbWidth = 36;

    ctx.beginPath();
    // Origin from left side of dome
    ctx.moveTo(cx - 135, cy - 50);
    // Upper limb segment rising to elbow peak
    ctx.lineTo(elbowX - 10, elbowY + 20);
    ctx.quadraticCurveTo(elbowX, elbowY - 12, elbowX + 18, elbowY + 12);
    // Inner elbow fold
    ctx.lineTo(cx - 145, cy - 10);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Lower limb segment dropping down from elbow peak to water entry
    const lowerGrad = ctx.createLinearGradient(elbowX, elbowY, footX, footY);
    lowerGrad.addColorStop(0, '#9ea99b');
    lowerGrad.addColorStop(0.4, '#818d7d');
    lowerGrad.addColorStop(0.8, '#626e5e');
    lowerGrad.addColorStop(1, '#444e41');

    ctx.fillStyle = lowerGrad;
    ctx.beginPath();
    ctx.moveTo(elbowX - 12, elbowY + 15);
    ctx.quadraticCurveTo(elbowX + 15, elbowY + 15, footX + 25, footY);
    // Flaring stilt base / foot into the water
    ctx.lineTo(footX - 55, footY);
    ctx.quadraticCurveTo(footX - 15, cy - 100, elbowX - 16, elbowY + 20);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Top highlight along the sharp bent limb
    ctx.strokeStyle = 'rgba(215, 228, 210, 0.5)';
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.moveTo(cx - 135, cy - 45);
    ctx.lineTo(elbowX, elbowY);
    ctx.lineTo(footX - 25, footY);
    ctx.stroke();

    ctx.restore();
  }

  // E. WATER FOAM & SPLASH AT WATER CONTACT POINTS
  function drawLimbWaterImpacts(cx, cy, t) {
    ctx.save();
    ctx.fillStyle = 'rgba(200, 220, 215, 0.7)';
    ctx.shadowColor = 'rgba(255, 255, 255, 0.4)';
    ctx.shadowBlur = 6;

    // Contact points: Left foot, Center dome base, Right foot
    const contactPoints = [
      { x: cx - 400, y: cy + 22, w: 90 },
      { x: cx, y: cy + 26, w: 260 },
      { x: cx + 430, y: cy + 22, w: 100 }
    ];

    for (let cp of contactPoints) {
      ctx.beginPath();
      ctx.ellipse(cp.x, cp.y, cp.w * 0.5, 9, 0, 0, Math.PI * 2);
      ctx.fill();

      // Foam spray waves
      ctx.strokeStyle = 'rgba(225, 242, 238, 0.8)';
      ctx.lineWidth = 2;
      for (let w = 0; w < 3; w++) {
        const rw = cp.w * 0.5 + w * 18 + Math.sin(t * 4 + w) * 6;
        ctx.beginPath();
        ctx.ellipse(cp.x, cp.y + w * 4, rw, 5 + w * 2, 0, 0, Math.PI * 2);
        ctx.stroke();
      }
    }

    ctx.restore();
  }
  // 4. THE VICTIM SHIP (200M CARGO VESSEL IN FRONT OF THE ARMED ARCHWAY)
  function drawCargoShip(t, phase) {
    ctx.save();

    // Position ship right in front of the gargantuan arched tunnel entrance
    const shipBaseX = width * 0.535;
    const waveHeightAtShip = Math.sin(t * 3.2 + shipBaseX * 0.01) * 12;
    const shipBaseY = height * 0.58 + waveHeightAtShip;

    // Pitch & roll of ship in choppy sea
    const shipRoll = Math.sin(t * 3.5) * 0.11;

    // In Act 5 (24.5 - 30.0s), ship is sucked into the abyssal archway tunnel!
    let shipX = shipBaseX;
    let shipY = shipBaseY;
    let shipScale = 0.95;
    let shipAngle = shipRoll;

    if (t >= 24.5) {
      const suckProgress = Math.min(1.0, (t - 24.5) / 3.0);
      // Pulled straight into the center of the black arched portal (width * 0.50, height * 0.53)
      shipX = shipBaseX - suckProgress * (shipBaseX - width * 0.50);
      shipY = shipBaseY - suckProgress * 45;
      shipAngle = shipRoll - suckProgress * 0.85; // Tilted into maw
      shipScale = Math.max(0, 0.95 * (1.0 - suckProgress * 0.92)); // Shrinking into depth of dark cavern

      // Whirlpool vortex lines feeding into the tunnel entrance
      ctx.strokeStyle = 'rgba(140, 195, 185, 0.5)';
      ctx.lineWidth = 2.0;
      for (let v = 0; v < 3; v++) {
        const vRad = 28 + v * 20 + Math.sin(t * 5 + v) * 8;
        ctx.beginPath();
        ctx.ellipse(shipX, shipY + 12, vRad, vRad * 0.35, t * 2.5, 0, Math.PI * 2);
        ctx.stroke();
      }
    }

    // If completely swallowed (suckProgress == 1.0), skip drawing ship
    if (t >= 28.0) {
      ctx.restore();
      return;
    }

    ctx.translate(shipX, shipY);
    ctx.rotate(shipAngle);
    ctx.scale(shipScale, shipScale);

    // Ship Hull (200m scale, dwarfed completely by the 25,000m creature)
    const hullLength = 70;
    const hullHeight = 16;

    // Red bottom keel & black hull top
    ctx.fillStyle = '#991b1b'; // Antifouling red
    ctx.beginPath();
    ctx.moveTo(-hullLength * 0.5, 4);
    ctx.lineTo(hullLength * 0.5 - 6, 4);
    ctx.lineTo(hullLength * 0.5, 0);
    ctx.lineTo(-hullLength * 0.5, 0);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#1e293b'; // Slate hull
    ctx.beginPath();
    ctx.moveTo(-hullLength * 0.5, 0);
    ctx.lineTo(hullLength * 0.5 + 4, 0);
    ctx.lineTo(hullLength * 0.45, -hullHeight);
    ctx.lineTo(-hullLength * 0.48, -hullHeight);
    ctx.closePath();
    ctx.fill();

    // Stacked cargo containers (vibrant freight colors)
    const containerColors = ['#dc2626', '#2563eb', '#eab308', '#16a34a'];
    for (let c = 0; c < 5; c++) {
      ctx.fillStyle = containerColors[c % containerColors.length];
      ctx.fillRect(-22 + c * 10, -hullHeight - 9, 8, 9);
      ctx.fillRect(-22 + c * 10, -hullHeight - 16, 8, 7);
    }

    // Bridge / Superstructure & Radar mast
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(-hullLength * 0.42, -hullHeight - 22, 14, 22);

    // Warm cabin glow in the dark tempest
    ctx.fillStyle = '#fbbf24';
    ctx.fillRect(-hullLength * 0.38, -hullHeight - 18, 3, 3);
    ctx.fillRect(-hullLength * 0.32, -hullHeight - 18, 3, 3);

    // Radar mast
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(-hullLength * 0.35, -hullHeight - 22);
    ctx.lineTo(-hullLength * 0.35, -hullHeight - 34);
    ctx.stroke();

    // Bow spray foam
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.beginPath();
    ctx.arc(hullLength * 0.5, 2, 4, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  // 5. FOREGROUND VIOLENT BREAKING SWELLS & FOAM (Dark slate-green water matching art)
  function drawOceanForeground(t) {
    ctx.save();
    const seaY = height * 0.57;

    // Multi-layered churning foreground waves
    for (let layer = 0; layer < 3; layer++) {
      const ly = seaY + layer * 30;
      const waveGrad = ctx.createLinearGradient(0, ly - 20, 0, height);
      waveGrad.addColorStop(0, `rgba(22, 32, 34, ${0.85 + layer * 0.05})`);
      waveGrad.addColorStop(0.5, `rgba(14, 21, 23, ${0.9 + layer * 0.04})`);
      waveGrad.addColorStop(1, '#070b0c');

      ctx.fillStyle = waveGrad;
      ctx.beginPath();
      ctx.moveTo(-width * 0.5, height);
      ctx.lineTo(-width * 0.5, ly);

      for (let x = -width * 0.5; x < width * 1.5; x += 30) {
        const freq1 = Math.sin(x * 0.008 + t * (2.2 + layer * 0.3));
        const freq2 = Math.cos(x * 0.016 - t * 1.2);
        const waveH = (freq1 * 18) + (freq2 * 8);
        ctx.lineTo(x, ly + waveH);
      }

      ctx.lineTo(width * 1.5, height);
      ctx.closePath();
      ctx.fill();

      // Muted sea foam crest on top of each breaker
      ctx.strokeStyle = 'rgba(160, 185, 178, 0.45)';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      for (let x = -width * 0.5; x < width * 1.5; x += 30) {
        const freq1 = Math.sin(x * 0.008 + t * (2.2 + layer * 0.3));
        const freq2 = Math.cos(x * 0.016 - t * 1.2);
        const waveH = (freq1 * 18) + (freq2 * 8);
        if (x === -width * 0.5) ctx.moveTo(x, ly + waveH);
        else ctx.lineTo(x, ly + waveH);
      }
      ctx.stroke();
    }

    // Flying foam spray particles
    ctx.fillStyle = 'rgba(190, 215, 208, 0.65)';
    for (let f of foamParticles) {
      f.x += f.vx;
      f.y += f.vy;
      f.life -= 1;
      if (f.life <= 0) {
        f.x = Math.random() * width;
        f.y = height * 0.60 + Math.random() * 60;
        f.vx = (Math.random() - 0.5) * 4;
        f.vy = -Math.random() * 3 - 1;
        f.life = 35 + Math.random() * 35;
      }
      ctx.beginPath();
      ctx.arc(f.x, f.y, f.radius * 0.8, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }

  // 6. RAIN & STORM WEATHER FX
  function drawRainAndAtmosphere(t) {
    ctx.save();
    ctx.strokeStyle = 'rgba(180, 220, 255, 0.35)';
    ctx.lineWidth = 1.2;

    for (let r of rainDrops) {
      r.y += r.speed;
      r.x += 4; // Wind angle
      if (r.y > height) {
        r.y = -20;
        r.x = Math.random() * width;
      }
      ctx.beginPath();
      ctx.moveTo(r.x, r.y);
      ctx.lineTo(r.x + 5, r.y + r.len);
      ctx.stroke();
    }
    ctx.restore();
  }

  // =========================================================================
  // ANIMATION LOOP & AUDIO TRIGGER SYNCHRONIZATION
  // =========================================================================

  function updateTimeline(dt) {
    if (!isPlaying) return;

    currentTime += dt * playbackSpeed;
    if (currentTime >= totalDuration) {
      currentTime = totalDuration;
      isPlaying = false;
      updatePlayPauseUI();
    }

    // AUDIO TRIGGER TIMINGS
    // Act 3: Iconic Roar (13.0s to 17.0s)
    if (currentTime >= 13.0 && currentTime <= 13.5 && Math.abs(currentTime - lastRoarTime) > 8) {
      lastRoarTime = currentTime;
      playSeaEaterRoar();
    }

    // Act 4: Ship foghorn sounding (20.5s)
    if (currentTime >= 20.2 && currentTime <= 20.7 && Math.abs(currentTime - lastHornTime) > 6) {
      lastHornTime = currentTime;
      playShipFoghorn();
    }

    // Act 5: Swallowing vortex & jaw slam (25.5s)
    if (currentTime >= 25.2 && currentTime <= 25.7 && Math.abs(currentTime - lastSwallowTime) > 6) {
      lastSwallowTime = currentTime;
      playSwallowGulp();
    }

    updateUI();
  }

  function updateUI() {
    const phase = getCurrentPhase(currentTime);

    // Format timer: 00:SS.ms
    const secs = Math.floor(currentTime);
    const ms = Math.floor((currentTime % 1) * 100);
    const formattedSecs = secs < 10 ? '0' + secs : secs;
    const formattedMs = ms < 10 ? '0' + ms : ms;
    hudTimer.textContent = `00:${formattedSecs}.${formattedMs} / 00:30.00`;

    // Scene & subtitle update
    hudSceneName.textContent = phase.name;
    subtitleTime.textContent = `00:${formattedSecs}`;
    subtitleText.textContent = phase.subtitle;

    // Telemetry update
    telemetryDisplacement.textContent = phase.displacement;
    telemetryHz.textContent = phase.hz;
    telemetryTarget.textContent = phase.target;

    // Scrubber progress bar
    const progressPct = (currentTime / totalDuration) * 100;
    timelineProgress.style.width = `${progressPct}%`;
    timelineHandle.style.left = `${progressPct}%`;

    // Active chip highlight
    document.querySelectorAll('.scene-chip').forEach(chip => {
      const sceneId = parseInt(chip.dataset.scene, 10);
      if (sceneId === phase.act) {
        chip.classList.add('active');
      } else {
        chip.classList.remove('active');
      }
    });

    // VHS timestamp
    if (vhsTimestamp) {
      const secondPart = 22 + Math.floor(currentTime);
      vhsTimestamp.textContent = `AUG. 14 1998 - 03:41:${secondPart < 10 ? '0' + secondPart : secondPart} AM`;
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
    ctx.clearRect(0, 0, width, height);
    renderScene(currentTime);

    requestAnimationFrame(animate);
  }
  requestAnimationFrame(animate);

  // =========================================================================
  // INTERACTIVE CONTROLS & EVENT LISTENERS
  // =========================================================================

  function togglePlayPause() {
    initAudio();
    isPlaying = !isPlaying;
    if (currentTime >= totalDuration && isPlaying) {
      currentTime = 0;
    }
    updatePlayPauseUI();
  }

  btnPlayPause.addEventListener('click', togglePlayPause);

  btnRestart.addEventListener('click', () => {
    initAudio();
    currentTime = 0;
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
    }
  });

  // Timeline scrub click & drag
  function seekToX(clientX) {
    initAudio();
    const rect = timelineTrack.getBoundingClientRect();
    const clickX = Math.max(0, Math.min(clientX - rect.left, rect.width));
    const seekProgress = clickX / rect.width;
    currentTime = seekProgress * totalDuration;
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
      isPlaying = true;
      updatePlayPauseUI();
    });
  });

  // Timeline label click markers
  document.querySelectorAll('.t-mark').forEach(mark => {
    mark.addEventListener('click', () => {
      initAudio();
      const targetTime = parseFloat(mark.dataset.time);
      currentTime = targetTime;
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

  // Trigger Roar Manual Button
  btnTriggerRoar.addEventListener('click', () => {
    initAudio();
    playSeaEaterRoar();
  });

  // Camera Mode Toggle
  const cameraModes = ['cinematic', 'ship_pov', 'aerial'];
  const cameraModeLabels = {
    'cinematic': 'Cinematic Cam',
    'ship_pov': 'Ship POV Cam',
    'aerial': 'Aerial Titan Cam'
  };

  btnCameraToggle.addEventListener('click', () => {
    const nextIdx = (cameraModes.indexOf(cameraMode) + 1) % cameraModes.length;
    cameraMode = cameraModes[nextIdx];
    cameraLabel.textContent = cameraModeLabels[cameraMode];
  });

  // VHS Analog Horror Filter Toggle
  btnVhsToggle.addEventListener('click', () => {
    vhsEnabled = !vhsEnabled;
    if (vhsEnabled) {
      vhsOverlay.classList.remove('disabled');
      vhsLabel.textContent = "VHS Style: ON";
    } else {
      vhsOverlay.classList.add('disabled');
      vhsLabel.textContent = "VHS Style: OFF";
    }
  });

  // Lore Modal open/close
  btnInfoModal.addEventListener('click', () => {
    modalLore.classList.remove('hidden');
  });

  btnModalClose.addEventListener('click', () => {
    modalLore.classList.add('hidden');
  });

  modalLore.addEventListener('click', (e) => {
    if (e.target === modalLore) {
      modalLore.classList.add('hidden');
    }
  });

  // Keyboard Shortcuts
  window.addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
      e.preventDefault();
      togglePlayPause();
    } else if (e.code === 'KeyR') {
      currentTime = 0;
      isPlaying = true;
      updatePlayPauseUI();
    } else if (e.code === 'KeyM') {
      btnSoundToggle.click();
    } else if (e.code === 'KeyC') {
      btnCameraToggle.click();
    } else if (e.code === 'KeyV') {
      btnVhsToggle.click();
    } else if (e.code === 'Escape') {
      modalLore.classList.add('hidden');
    }
  });

  // Automatic AudioContext unlock on first user click anywhere
  window.addEventListener('click', () => {
    if (!hasUserInteracted) {
      hasUserInteracted = true;
      initAudio();
    }
  }, { once: true });
});
