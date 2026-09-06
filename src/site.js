import * as THREE from 'three';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const canvas = document.querySelector('#webgl');
const root = document.documentElement;
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100);
camera.position.set(0, 0.15, 6.3);

const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.8));
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.08;

scene.add(new THREE.HemisphereLight(0xf7f0e8, 0x160f0c, 2.2));
const key = new THREE.DirectionalLight(0xffefe4, 3.2);
key.position.set(3, 5, 5);
scene.add(key);
const rim = new THREE.PointLight(0xd9a35f, 34, 12, 2);
rim.position.set(-3, 1, 3);
scene.add(rim);

const rig = new THREE.Group();
scene.add(rig);

const body = new THREE.Mesh(
  new THREE.IcosahedronGeometry(1.48, 5),
  new THREE.MeshPhysicalMaterial({
    color: 0x171311,
    roughness: 0.24,
    metalness: 0.42,
    clearcoat: 0.85,
    clearcoatRoughness: 0.2,
  }),
);
body.scale.set(1.0, 1.22, 0.72);
rig.add(body);

const lens = new THREE.Mesh(
  new THREE.CylinderGeometry(0.54, 0.72, 0.72, 64),
  new THREE.MeshPhysicalMaterial({ color: 0x090909, metalness: 0.78, roughness: 0.18, clearcoat: 0.55 }),
);
lens.rotation.z = Math.PI / 2;
lens.position.set(0.86, -0.18, 0.05);
rig.add(lens);

const ring = new THREE.Mesh(
  new THREE.TorusGeometry(0.52, 0.055, 20, 64),
  new THREE.MeshStandardMaterial({ color: 0xd6a55a, metalness: 0.9, roughness: 0.2 }),
);
ring.rotation.y = Math.PI / 2;
ring.position.copy(lens.position);
ring.position.x += 0.37;
rig.add(ring);

const accent = new THREE.Mesh(
  new THREE.BoxGeometry(0.38, 0.15, 0.58),
  new THREE.MeshStandardMaterial({ color: 0xc58a4b, metalness: 0.7, roughness: 0.3 }),
);
accent.position.set(-0.32, 0.63, 0.06);
accent.rotation.z = -0.12;
rig.add(accent);

const particlesGeometry = new THREE.BufferGeometry();
const particleCount = 950;
const particlePositions = new Float32Array(particleCount * 3);
for (let i = 0; i < particleCount; i += 1) {
  const i3 = i * 3;
  particlePositions[i3] = (Math.random() - 0.5) * 11;
  particlePositions[i3 + 1] = (Math.random() - 0.5) * 7;
  particlePositions[i3 + 2] = (Math.random() - 0.5) * 8 - 2;
}
particlesGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
const particles = new THREE.Points(
  particlesGeometry,
  new THREE.PointsMaterial({ color: 0xf0cf9f, size: 0.012, transparent: true, opacity: 0.48, depthWrite: false }),
);
scene.add(particles);

const state = { progress: 0, pointerX: 0, pointerY: 0, targetX: 0, targetY: 0 };

function resize() {
  const width = window.innerWidth;
  const height = window.innerHeight;
  renderer.setSize(width, height, false);
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
}
resize();
window.addEventListener('resize', resize, { passive: true });

window.addEventListener('pointermove', (event) => {
  state.targetX = (event.clientX / window.innerWidth - 0.5) * 0.65;
  state.targetY = (event.clientY / window.innerHeight - 0.5) * 0.4;
});

if (!prefersReducedMotion) {
  gsap.to('.hero-copy > *', { y: 0, opacity: 1, duration: 1.15, stagger: 0.1, ease: 'power3.out', delay: 0.2 });
  gsap.to(rig.rotation, { y: Math.PI * 2, duration: 30, ease: 'none', repeat: -1 });
  gsap.to(body.rotation, { x: 0.16, duration: 4.5, ease: 'sine.inOut', yoyo: true, repeat: -1 });
  gsap.to(particles.rotation, { y: Math.PI * 2, duration: 90, ease: 'none', repeat: -1 });

  gsap.to(state, {
    progress: 1,
    ease: 'none',
    scrollTrigger: {
      trigger: '#experience',
      start: 'top top',
      end: 'bottom bottom',
      scrub: 1.1,
    },
    onUpdate: () => {
      const p = state.progress;
      gsap.to(rig.position, { x: p * 1.1, y: Math.sin(p * Math.PI) * 0.16, duration: 0.35, overwrite: true });
      gsap.to(rig.scale, { x: 1 - p * 0.18, y: 1 - p * 0.18, z: 1 - p * 0.18, duration: 0.35, overwrite: true });
      gsap.to(camera.position, { z: 6.3 - p * 1.2, y: 0.15 + p * 0.35, duration: 0.35, overwrite: true });
      root.style.setProperty('--scroll-progress', p.toFixed(3));
    },
  });

  gsap.utils.toArray('.reveal').forEach((el) => {
    gsap.fromTo(el, { y: 50, opacity: 0 }, { y: 0, opacity: 1, duration: 1, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 86%', toggleActions: 'play none none reverse' } });
  });

  gsap.utils.toArray('.story-card').forEach((card, index) => {
    gsap.fromTo(card, { yPercent: index % 2 === 0 ? 10 : 18, scale: 0.92, opacity: 0.45 }, { yPercent: 0, scale: 1, opacity: 1, ease: 'none', scrollTrigger: { trigger: card, start: 'top bottom', end: 'center center', scrub: true } });
  });

  ScrollTrigger.refresh();
}

function tick(time) {
  requestAnimationFrame(tick);
  const t = time * 0.001;
  state.pointerX += (state.targetX - state.pointerX) * 0.035;
  state.pointerY += (state.targetY - state.pointerY) * 0.035;
  if (!prefersReducedMotion) {
    rig.rotation.x += (state.pointerY * 0.32 - rig.rotation.x) * 0.028;
    rig.rotation.z += (-state.pointerX * 0.12 - rig.rotation.z) * 0.028;
    particles.position.y = Math.sin(t * 0.18) * 0.05;
  }
  renderer.render(scene, camera);
}

requestAnimationFrame(tick);
