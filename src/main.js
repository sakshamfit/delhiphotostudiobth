import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import cameraModelUrl from '../assets/models/canon-camera.glb?url';

// Registering the plugin here (rather than loading a CDN UMD file as an ES module)
// makes the production bundle self-contained and avoids browser import-map issues.
gsap.registerPlugin(ScrollTrigger);

const canvas = document.getElementById('bg');
const content = document.getElementById('content');
const debugEnabled = new URLSearchParams(window.location.search).get('debug') === '1';

const diagnostics = {
  threeInitialized: false,
  webgl: false,
  renderer: false,
  cameraModel: 'LOADING',
  sceneObjects: 0,
  canvasWidth: 0,
  canvasHeight: 0,
  gsap: Boolean(gsap),
  scrollTrigger: Boolean(ScrollTrigger),
};

let debugPanel;
let fallbackMessage;
let renderer = null;
let scene = null;
let camera = null;
let model = null;
let mixer = null;
let animationFrame = 0;
let clock = null;
let scrollAnimationStarted = false;
let resizeObserver = null;
let sceneTarget = new THREE.Vector3(0, 0, 0);
let cameraOrbitScale = 1;

function statusText(value) {
  if (typeof value === 'boolean') return value ? 'YES' : 'NO';
  return value;
}

function createDebugPanel() {
  if (!debugEnabled) return;

  debugPanel = document.createElement('aside');
  debugPanel.id = 'three-debug-panel';
  debugPanel.setAttribute('aria-live', 'polite');
  debugPanel.innerHTML = `
    <strong>3D production diagnostics</strong>
    <div data-key="threeInitialized"></div>
    <div data-key="webgl"></div>
    <div data-key="renderer"></div>
    <div data-key="cameraModel"></div>
    <div data-key="sceneObjects"></div>
    <div data-key="canvasWidth"></div>
    <div data-key="canvasHeight"></div>
    <div data-key="gsap"></div>
    <div data-key="scrollTrigger"></div>
  `;
  document.body.appendChild(debugPanel);

  const style = document.createElement('style');
  style.textContent = `
    #three-debug-panel {
      position: fixed;
      right: 1rem;
      bottom: 1rem;
      z-index: 100;
      width: min(22rem, calc(100vw - 2rem));
      padding: .85rem 1rem;
      color: #f8fafc;
      background: rgba(24, 24, 27, .94);
      border: 1px solid rgba(248, 250, 252, .25);
      border-radius: .5rem;
      box-shadow: 0 .75rem 2rem rgba(0, 0, 0, .2);
      font: 12px/1.55 ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
      pointer-events: none;
    }
    #three-debug-panel strong {
      display: block;
      margin-bottom: .35rem;
      color: #fff;
      font: 600 13px/1.4 ui-sans-serif, system-ui, sans-serif;
    }
  `;
  document.head.appendChild(style);
}

function updateDiagnostics(patch = {}) {
  Object.assign(diagnostics, patch);
  diagnostics.sceneObjects = scene ? scene.children.length : 0;

  if (!debugPanel) return;
  const labels = {
    threeInitialized: 'Three.js initialized',
    webgl: 'WebGL',
    renderer: 'Renderer',
    cameraModel: 'Camera model',
    sceneObjects: 'Scene objects',
    canvasWidth: 'Canvas width',
    canvasHeight: 'Canvas height',
    gsap: 'GSAP',
    scrollTrigger: 'ScrollTrigger',
  };

  Object.entries(labels).forEach(([key, label]) => {
    const node = debugPanel.querySelector(`[data-key="${key}"]`);
    if (node) node.textContent = `${label}: ${statusText(diagnostics[key])}`;
  });
}

function showFallback(message) {
  if (!fallbackMessage) {
    fallbackMessage = document.createElement('p');
    fallbackMessage.id = 'scene-fallback';
    fallbackMessage.setAttribute('role', 'status');
    fallbackMessage.style.cssText = `
      position: fixed;
      left: 1rem;
      bottom: 1rem;
      z-index: 2;
      max-width: min(28rem, calc(100vw - 2rem));
      padding: .65rem .85rem;
      color: #241d2b;
      background: rgba(245, 237, 224, .9);
      border: 1px solid rgba(36, 29, 43, .18);
      border-radius: .35rem;
      font: 500 13px/1.4 system-ui, sans-serif;
    `;
    document.body.appendChild(fallbackMessage);
  }
  fallbackMessage.textContent = message;
  fallbackMessage.hidden = false;
}

function detectWebGL() {
  if (!window.WebGLRenderingContext) return false;

  const testCanvas = document.createElement('canvas');
  try {
    return Boolean(
      testCanvas.getContext('webgl2', { failIfMajorPerformanceCaveat: false }) ||
      testCanvas.getContext('webgl', { failIfMajorPerformanceCaveat: false }) ||
      testCanvas.getContext('experimental-webgl', { failIfMajorPerformanceCaveat: false }),
    );
  } catch (error) {
    console.error('[3D] WebGL detection failed', error);
    return false;
  }
}

function getCanvasSize() {
  const bounds = canvas?.getBoundingClientRect();
  const width = Math.max(1, Math.floor(bounds?.width || window.innerWidth || 1));
  const height = Math.max(1, Math.floor(bounds?.height || window.innerHeight || 1));
  return { width, height };
}

function resizeRenderer() {
  const { width, height } = getCanvasSize();
  updateDiagnostics({ canvasWidth: width, canvasHeight: height });

  if (!camera || !renderer) return;
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  renderer.setSize(width, height, false);
}

function addSceneLightingAndGround() {
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
  scene.add(ambientLight);

  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
  directionalLight.position.set(5, 10, 7);
  directionalLight.castShadow = true;
  scene.add(directionalLight);

  const fillLight = new THREE.DirectionalLight(0xffffff, 0.3);
  fillLight.position.set(-5, 5, -5);
  scene.add(fillLight);

  const groundGeometry = new THREE.PlaneGeometry(20, 20);
  const groundMaterial = new THREE.MeshStandardMaterial({
    color: 0xf5ede0,
    roughness: 0.8,
    metalness: 0.1,
  });
  const ground = new THREE.Mesh(groundGeometry, groundMaterial);
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -0.5;
  ground.receiveShadow = true;
  scene.add(ground);
}

function setupRenderer() {
  diagnostics.webgl = detectWebGL();
  updateDiagnostics({ webgl: diagnostics.webgl });

  if (!canvas) {
    const error = new Error('The #bg canvas element is missing.');
    console.error('[3D] Renderer initialization failed', error);
    showFallback('The 3D canvas is unavailable, but the studio site is still usable.');
    return false;
  }

  if (!diagnostics.webgl) {
    const error = new Error('WebGL is not available in this browser or device.');
    console.error('[3D] Renderer initialization failed', error);
    showFallback('3D preview is unavailable on this device. The studio site is still usable.');
    return false;
  }

  try {
    renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance',
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setClearColor(0x000000, 0);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    updateDiagnostics({ renderer: true });
    resizeRenderer();
    return true;
  } catch (error) {
    console.error('[3D] Renderer initialization failed', error);
    showFallback('3D preview could not be initialized. The studio site is still usable.');
    updateDiagnostics({ renderer: false });
    return false;
  }
}

function validateAndFrameModel(loadedModel) {
  loadedModel.scale.set(0.4, 0.4, 0.4);
  loadedModel.position.set(0, 0, 0);
  scene.add(loadedModel);

  const initialBounds = new THREE.Box3().setFromObject(loadedModel);
  const size = initialBounds.getSize(new THREE.Vector3());
  const center = initialBounds.getCenter(new THREE.Vector3());
  const maxDimension = Math.max(size.x, size.y, size.z);

  if (
    !Number.isFinite(maxDimension) ||
    maxDimension <= 0 ||
    ![size.x, size.y, size.z, center.x, center.y, center.z].every(Number.isFinite)
  ) {
    throw new Error('The camera model has an invalid or empty bounding box.');
  }

  // GLB files can be authored with a far-away origin. Recenter only the loaded
  // asset, so the existing orbit design remains centered on the camera.
  loadedModel.position.sub(center);
  const centeredBounds = new THREE.Box3().setFromObject(loadedModel);
  sceneTarget = centeredBounds.getCenter(new THREE.Vector3());

  // Preserve the original composition when the asset dimensions are sensible.
  // Only refit the camera when the model would otherwise be microscopic or out
  // of frame, which prevents a bad GLB transform from producing a blank scene.
  const currentDistance = camera.position.distanceTo(sceneTarget);
  const fitDistance = (maxDimension * 1.25) / (2 * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)));
  cameraOrbitScale = THREE.MathUtils.clamp(fitDistance / cameraOrbits.hero.radius, 0.05, 10);
  if (!Number.isFinite(currentDistance) || currentDistance < maxDimension * 0.45 || currentDistance > maxDimension * 20) {
    const distance = Math.max(camera.near * 4, fitDistance);
    camera.position.set(0, Math.max(maxDimension * 0.3, distance * 0.2), distance);
  }
  camera.lookAt(sceneTarget);

  console.log('[3D] Camera bounds', {
    width: Number(size.x.toFixed(3)),
    height: Number(size.y.toFixed(3)),
    depth: Number(size.z.toFixed(3)),
    maxDimension: Number(maxDimension.toFixed(3)),
  });
}

function addModelAnimations() {
  if (!model) return;

  try {
    gsap.to(model.rotation, {
      y: model.rotation.y + Math.PI * 2,
      duration: 25,
      repeat: -1,
      ease: 'none',
    });
    const baseY = model.position.y;
    gsap.to(model.position, {
      y: baseY + 0.15,
      duration: 3,
      yoyo: true,
      repeat: -1,
      ease: 'sine.inOut',
    });
  } catch (error) {
    console.error('[3D] Camera animation initialization failed', error);
  }
}

const cameraOrbits = {
  hero: { radius: 4, height: 2, angle: 0 },
  wedding: { radius: 3.5, height: 1.5, angle: Math.PI / 4 },
  cinematography: { radius: 3, height: 1, angle: Math.PI / 2 },
  prewedding: { radius: 2.5, height: 0.5, angle: (Math.PI * 3) / 4 },
  candid: { radius: 2, height: 0, angle: Math.PI },
  destination: { radius: 2.5, height: -0.5, angle: (Math.PI * 5) / 4 },
  finale: { radius: 3.5, height: 1.5, angle: (Math.PI * 3) / 2 },
};

function showStaticSections() {
  document.querySelectorAll('section').forEach((section) => {
    section.style.opacity = '1';
    section.style.transform = 'translateY(0)';
  });
}

function initScrollAnimations() {
  if (scrollAnimationStarted) return;
  scrollAnimationStarted = true;

  const sections = Array.from(document.querySelectorAll('section'));
  if (!sections.length) {
    console.error('[Animation] ScrollTrigger initialization failed: no sections found.');
    return;
  }

  if (!gsap || !ScrollTrigger || !camera) {
    console.error('[Animation] ScrollTrigger initialization failed: required scene or animation dependency is missing.');
    showStaticSections();
    updateDiagnostics({ scrollTrigger: false });
    return;
  }

  try {
    sections.forEach((section) => {
      const orbit = cameraOrbits[section.id];
      if (!orbit) {
        console.error(`[Animation] No camera orbit configured for section #${section.id}.`);
        return;
      }

      gsap.to(camera.position, {
        duration: 1,
        scrollTrigger: {
          trigger: section,
          start: 'top center',
          end: 'bottom center',
          scrub: true,
          onUpdate: (self) => {
            const targetX = Math.sin(orbit.angle) * orbit.radius * cameraOrbitScale;
            const targetZ = Math.cos(orbit.angle) * orbit.radius * cameraOrbitScale;
            const targetY = orbit.height * cameraOrbitScale;
            const progress = self.progress;
            const blend = THREE.MathUtils.lerp(0.05, 0.14, progress);

            camera.position.x = THREE.MathUtils.lerp(camera.position.x, targetX, blend);
            camera.position.z = THREE.MathUtils.lerp(camera.position.z, targetZ, blend);
            camera.position.y = THREE.MathUtils.lerp(camera.position.y, targetY, blend);
            camera.lookAt(sceneTarget);
          },
        },
      });

      gsap.fromTo(
        section,
        { opacity: 0, y: 50 },
        {
          opacity: 1,
          y: 0,
          scrollTrigger: {
            trigger: section,
            start: 'top 70%',
            end: 'top 30%',
            scrub: true,
          },
        },
      );
    });

    ScrollTrigger.refresh();
    updateDiagnostics({ scrollTrigger: true });
  } catch (error) {
    console.error('[Animation] ScrollTrigger initialization failed', error);
    showStaticSections();
    updateDiagnostics({ scrollTrigger: false });
  }
}

function loadCameraModel() {
  const loader = new GLTFLoader();
  console.log('[3D] Loading camera...', cameraModelUrl);
  updateDiagnostics({ cameraModel: 'LOADING' });

  loader.load(
    cameraModelUrl,
    (gltf) => {
      try {
        model = gltf.scene;
        validateAndFrameModel(model);
        model.traverse((child) => {
          if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
          }
        });

        if (gltf.animations?.length) {
          mixer = new THREE.AnimationMixer(model);
          gltf.animations.forEach((clip) => mixer.clipAction(clip).play());
        }

        addModelAnimations();
        updateDiagnostics({ cameraModel: 'LOADED' });
        console.log('[3D] Camera loaded successfully');
        initScrollAnimations();
      } catch (error) {
        console.error('[3D] Camera loading failed', error);
        if (model) scene.remove(model);
        model = null;
        updateDiagnostics({ cameraModel: 'FAILED' });
        showFallback('The camera preview is unavailable, but the studio site is still usable.');
        initScrollAnimations();
      }
    },
    (progress) => {
      if (progress.total) {
        console.log(`[3D] Camera loading: ${Math.round((progress.loaded / progress.total) * 100)}%`);
      }
    },
    (error) => {
      console.error('[3D] Camera loading failed', error);
      updateDiagnostics({ cameraModel: 'FAILED' });
      showFallback('The camera preview is unavailable, but the studio site is still usable.');
      initScrollAnimations();
    },
  );
}

function startRenderLoop() {
  if (!renderer) return;
  clock = new THREE.Clock();

  const render = () => {
    animationFrame = window.requestAnimationFrame(render);
    if (mixer) mixer.update(clock.getDelta());
    renderer.render(scene, camera);
  };
  render();
}

function initScene() {
  createDebugPanel();
  updateDiagnostics();

  // The scene, camera, lights, and UI are independent. A renderer/model error
  // is reported and isolated instead of being allowed to abort the page.
  scene = new THREE.Scene();
  const { width, height } = getCanvasSize();
  camera = new THREE.PerspectiveCamera(45, width / height, 0.01, 1000);
  camera.position.set(0, 2, 4);
  camera.lookAt(0, 0, 0);
  diagnostics.threeInitialized = true;
  updateDiagnostics({ threeInitialized: true, canvasWidth: width, canvasHeight: height });

  addSceneLightingAndGround();
  const canRender = setupRenderer();
  if (canRender) startRenderLoop();

  const resize = () => {
    resizeRenderer();
    if (ScrollTrigger) ScrollTrigger.refresh();
  };
  window.addEventListener('resize', resize, { passive: true });
  if (typeof ResizeObserver !== 'undefined' && canvas) {
    resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(canvas);
  }

  loadCameraModel();
}

window.addEventListener('error', (event) => {
  // Keep the browser's normal error handling intact while adding a searchable
  // production prefix for deployments and the debug overlay workflow.
  console.error('[Runtime] Uncaught browser error', event.error || event.message);
});
window.addEventListener('unhandledrejection', (event) => {
  console.error('[Runtime] Unhandled promise rejection', event.reason);
});

try {
  initScene();
} catch (error) {
  console.error('[3D] Scene initialization failed', error);
  showFallback('The 3D preview is unavailable, but the studio site is still usable.');
  updateDiagnostics({ threeInitialized: false, renderer: false, cameraModel: 'FAILED' });
  showStaticSections();
}

// Expose read-only-ish diagnostics for QA without adding anything to the normal UI.
window.__DPS_3D_DIAGNOSTICS__ = diagnostics;

// Avoid an unused-variable warning in stricter bundler configurations while
// keeping references available during debugging sessions.
void content;
void animationFrame;
void resizeObserver;
