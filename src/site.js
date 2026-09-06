import * as THREE from 'three';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const canvas = document.querySelector('#webgl');
const root = document.documentElement;
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 100);
camera.position.set(0, 0.1, 6.8);

const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.8));
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.12;

scene.add(new THREE.HemisphereLight(0xf8eee3, 0x090706, 2.5));
const key = new THREE.DirectionalLight(0xffe8d2, 4.5);
key.position.set(4, 5, 6);
scene.add(key);
const fill = new THREE.DirectionalLight(0x9e7a62, 2.2);
fill.position.set(-4, 1, 3);
scene.add(fill);
const rim = new THREE.PointLight(0xd6a25c, 42, 14, 2);
rim.position.set(-3, 2, 4);
scene.add(rim);

const cameraRig = new THREE.Group();
cameraRig.position.set(1.45, 0.25, 0);
cameraRig.rotation.set(-0.08, -0.22, 0.08);
scene.add(cameraRig);

const matte = new THREE.MeshPhysicalMaterial({ color: 0x151311, roughness: 0.25, metalness: 0.52, clearcoat: 0.75, clearcoatRoughness: 0.2 });
const black = new THREE.MeshPhysicalMaterial({ color: 0x050505, roughness: 0.16, metalness: 0.82, clearcoat: 0.8 });
const glass = new THREE.MeshPhysicalMaterial({ color: 0x07131a, roughness: 0.06, metalness: 0.18, transmission: 0.18, clearcoat: 1, clearcoatRoughness: 0.08 });
const brass = new THREE.MeshStandardMaterial({ color: 0xd4a25b, roughness: 0.23, metalness: 0.92 });
const rubber = new THREE.MeshStandardMaterial({ color: 0x080807, roughness: 0.7, metalness: 0.05 });

function mesh(geometry, material, position = [0, 0, 0], rotation = [0, 0, 0], scale = [1, 1, 1]) {
  const m = new THREE.Mesh(geometry, material);
  m.position.set(...position); m.rotation.set(...rotation); m.scale.set(...scale);
  cameraRig.add(m); return m;
}

// High-detail procedural cinema camera: body, prism, grip, mount, lens barrel, focus rings, dials and glass.
mesh(new THREE.BoxGeometry(2.65, 1.58, 1.34), matte, [0, 0, 0], [0.03, 0, 0], [1, 1, 1]);
mesh(new THREE.BoxGeometry(2.3, 1.2, 1.45), rubber, [0, -0.03, -0.72]);
mesh(new THREE.BoxGeometry(1.22, 0.42, 0.82), matte, [-0.1, 1.0, 0]);
mesh(new THREE.BoxGeometry(0.7, 0.26, 0.42), black, [-0.1, 1.32, 0]);
mesh(new THREE.BoxGeometry(0.5, 0.18, 0.36), glass, [-0.1, 1.5, 0.02]);

const grip = mesh(new THREE.BoxGeometry(0.62, 1.85, 0.72), rubber, [-0.88, -0.25, 0.03], [0.08, 0, -0.12]);
const gripDetail = mesh(new THREE.BoxGeometry(0.1, 1.2, 0.46), matte, [-1.2, -0.25, 0.03], [0.08, 0, -0.12]);

const mount = mesh(new THREE.CylinderGeometry(0.48, 0.48, 0.28, 64), brass, [0.86, -0.05, -0.02], [0, 0, Math.PI / 2]);
const mountInner = mesh(new THREE.CylinderGeometry(0.38, 0.38, 0.31, 64), black, [1.0, -0.05, -0.02], [0, 0, Math.PI / 2]);

const lensBarrel = mesh(new THREE.CylinderGeometry(0.68, 0.78, 1.35, 64), black, [1.38, -0.05, -0.02], [0, 0, Math.PI / 2]);
const focusRing = mesh(new THREE.TorusGeometry(0.73, 0.095, 18, 64), brass, [1.58, -0.05, -0.02], [0, Math.PI / 2, 0]);
const focusRing2 = mesh(new THREE.TorusGeometry(0.67, 0.055, 18, 64), brass, [1.82, -0.05, -0.02], [0, Math.PI / 2, 0]);
const front = mesh(new THREE.CylinderGeometry(0.61, 0.61, 0.16, 64), black, [2.02, -0.05, -0.02], [0, 0, Math.PI / 2]);
const glassFront = mesh(new THREE.CylinderGeometry(0.5, 0.5, 0.035, 64), glass, [2.11, -0.05, -0.02], [0, 0, Math.PI / 2]);

// Iris blades and subtle glass reflections.
const iris = new THREE.Group();
iris.position.set(2.135, -0.05, -0.02); iris.rotation.z = Math.PI / 2; cameraRig.add(iris);
for (let i = 0; i < 9; i++) {
  const blade = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.035, 0.11), brass);
  blade.position.set(Math.cos(i * Math.PI * 2 / 9) * 0.25, Math.sin(i * Math.PI * 2 / 9) * 0.25, 0.02);
  blade.rotation.z = i * Math.PI * 2 / 9;
  iris.add(blade);
}

// Top dials, shutter button, rear display and hot shoe.
for (let i = 0; i < 3; i++) {
  mesh(new THREE.CylinderGeometry(0.15 + i * 0.025, 0.15 + i * 0.025, 0.1, 32), brass, [-0.5 + i * 0.38, 0.87, 0.35], [Math.PI / 2, 0, 0]);
}
mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.08, 32), brass, [0.66, 0.85, 0.42], [Math.PI / 2, 0, 0]);
mesh(new THREE.BoxGeometry(0.36, 0.08, 0.28), brass, [0.15, 1.2, 0]);
mesh(new THREE.BoxGeometry(0.78, 0.48, 0.06), glass, [-0.45, -0.25, 0.69]);

// Floating cinematic film frames around the camera.
const frameGroup = new THREE.Group();
scene.add(frameGroup);
const frameMat = new THREE.MeshBasicMaterial({ color: 0xd6a25c, transparent: true, opacity: 0.26, wireframe: true });
for (let i = 0; i < 6; i++) {
  const frame = new THREE.Mesh(new THREE.BoxGeometry(1.15 + i * 0.08, 0.72 + i * 0.05, 0.015), frameMat);
  frame.position.set(-3.0 + i * 1.1, 0.4 + Math.sin(i) * 0.7, -1.2 - i * 0.25);
  frame.rotation.set(0.12 * i, -0.15 + i * 0.08, -0.1 * i);
  frameGroup.add(frame);
}

// Cinematic dust field.
const dustGeometry = new THREE.BufferGeometry();
const dustCount = 1500;
const dust = new Float32Array(dustCount * 3);
for (let i = 0; i < dustCount; i++) {
  dust[i * 3] = (Math.random() - 0.5) * 14;
  dust[i * 3 + 1] = (Math.random() - 0.5) * 8;
  dust[i * 3 + 2] = (Math.random() - 0.5) * 11 - 2;
}
dustGeometry.setAttribute('position', new THREE.BufferAttribute(dust, 3));
const dustPoints = new THREE.Points(dustGeometry, new THREE.PointsMaterial({ color: 0xe6c28f, size: 0.009, transparent: true, opacity: 0.42, depthWrite: false }));
scene.add(dustPoints);

const state = { scroll: 0, px: 0, py: 0, tx: 0, ty: 0, velocity: 0 };
let lastScroll = window.scrollY;
window.addEventListener('scroll', () => {
  const y = window.scrollY;
  state.velocity = y - lastScroll;
  lastScroll = y;
}, { passive: true });
window.addEventListener('pointermove', (e) => {
  state.tx = (e.clientX / window.innerWidth - 0.5) * 0.65;
  state.ty = (e.clientY / window.innerHeight - 0.5) * 0.45;
});

function resize() {
  renderer.setSize(window.innerWidth, window.innerHeight, false);
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
}
resize(); window.addEventListener('resize', resize, { passive: true });

if (!reduceMotion) {
  gsap.fromTo('.hero-copy > *', { y: 38, opacity: 0 }, { y: 0, opacity: 1, duration: 1.2, stagger: 0.1, ease: 'power4.out', delay: 0.2 });
  gsap.to(cameraRig.rotation, { y: cameraRig.rotation.y + Math.PI * 2, duration: 24, repeat: -1, ease: 'none' });
  gsap.to(frameGroup.rotation, { y: -Math.PI * 2, duration: 42, repeat: -1, ease: 'none' });

  const story = gsap.timeline({
    scrollTrigger: { trigger: '#experience', start: 'top top', end: 'bottom bottom', scrub: 1.2 }
  });
  story.to(cameraRig.position, { x: -1.1, y: 0.5, z: -0.4, ease: 'none' }, 0)
    .to(cameraRig.rotation, { x: 0.42, y: -1.05, z: -0.32, ease: 'none' }, 0)
    .to(camera.position, { z: 5.1, y: 0.7, ease: 'none' }, 0)
    .to(cameraRig.scale, { x: 0.8, y: 0.8, z: 0.8, ease: 'none' }, 0.25)
    .to(cameraRig.position, { x: 1.55, y: -0.45, z: -0.9, ease: 'none' }, 0.5)
    .to(cameraRig.rotation, { x: -0.25, y: 1.2, z: 0.25, ease: 'none' }, 0.5)
    .to(camera.position, { z: 4.4, y: -0.2, ease: 'none' }, 0.5)
    .to(cameraRig.scale, { x: 1.15, y: 1.15, z: 1.15, ease: 'none' }, 0.72)
    .to(cameraRig.position, { x: 0, y: 0, z: 0, ease: 'none' }, 0.72)
    .to(cameraRig.rotation, { x: 0.1, y: -0.25, z: 0, ease: 'none' }, 0.72);

  gsap.utils.toArray('.reveal').forEach((el) => gsap.fromTo(el, { y: 70, opacity: 0 }, { y: 0, opacity: 1, duration: 1, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 86%', toggleActions: 'play none none reverse' } }));
  gsap.utils.toArray('.story-card').forEach((card, i) => gsap.fromTo(card, { yPercent: i % 2 ? 16 : 9, scale: 0.9, opacity: 0.45 }, { yPercent: 0, scale: 1, opacity: 1, ease: 'none', scrollTrigger: { trigger: card, start: 'top bottom', end: 'center center', scrub: true } }));
  ScrollTrigger.refresh();
}

function render(time) {
  requestAnimationFrame(render);
  const t = time * 0.001;
  state.px += (state.tx - state.px) * 0.035;
  state.py += (state.ty - state.py) * 0.035;
  if (!reduceMotion) {
    cameraRig.rotation.x += (state.py * 0.24 - cameraRig.rotation.x) * 0.018;
    cameraRig.rotation.z += (-state.px * 0.12 - cameraRig.rotation.z) * 0.018;
    cameraRig.position.y += Math.sin(t * 0.75) * 0.0008;
    dustPoints.rotation.y = t * 0.008;
    dustPoints.position.y = Math.sin(t * 0.12) * 0.12;
    iris.rotation.x = Math.sin(t * 1.2) * 0.08;
    root.style.setProperty('--scroll-velocity', Math.min(Math.abs(state.velocity) / 80, 1).toFixed(3));
    state.velocity *= 0.9;
  }
  renderer.render(scene, camera);
}
requestAnimationFrame(render);
