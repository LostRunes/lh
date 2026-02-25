import * as THREE from 'three';
import { Hands } from '@mediapipe/hands';
import { Camera } from '@mediapipe/camera_utils';
import { drawConnectors, drawLandmarks } from '@mediapipe/drawing_utils';
import { SHAPE_TYPES, getSpreadPoints, getIPoints, getHeartPoints, getUPoints, getHehePoints } from './shapes.js';
import { detectGesture } from './gestures.js';

// --- Configuration ---
const PARTICLE_COUNT = 3500; // Reduced for clarity
const INTERPOLATION_FACTOR = 0.08;
const NOISE_STRENGTH = 0.015;

// --- State ---
let scene, camera, renderer, particles;
let targetPoints = [];
let currentGesture = 'NONE';
let targetRotation = new THREE.Euler(0, 0, 0);
let handLerpRotation = new THREE.Euler(0, 0, 0);

// --- Initialization ---

async function init() {
    const loadingScreen = document.getElementById('loading-screen');

    try {
        setupThreeJS();
        createParticles();
        await setupMediaPipe();

        if (loadingScreen) {
            // Ensure loading screen stays for at least 4.5 seconds for the animation
            setTimeout(() => {
                loadingScreen.style.opacity = '0';
                setTimeout(() => loadingScreen.style.display = 'none', 500);
            }, 5500);
        }
    } catch (err) {
        console.error("Initialization failed:", err);
        alert("Failed to access camera. Please check permissions.");
    }
}

function createCircleTexture() {
    const size = 64;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');

    const gradient = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
    gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
    gradient.addColorStop(0.2, 'rgba(0, 242, 255, 0.8)');
    gradient.addColorStop(0.5, 'rgba(128, 0, 255, 0.3)');
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size, size);

    const texture = new THREE.CanvasTexture(canvas);
    return texture;
}

function setupThreeJS() {
    const canvas = document.getElementById('particle-canvas');
    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 15;

    renderer = new THREE.WebGLRenderer({
        canvas,
        antialias: true,
        alpha: true
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    window.addEventListener('resize', onWindowResize);
}

const GALAXY_COLORS = [
    new THREE.Color(0x00f2ff), // Cyan
    new THREE.Color(0x8a2be2), // BlueViolet
    new THREE.Color(0xff00ff), // Magenta
    new THREE.Color(0x4b0082), // Indigo
    new THREE.Color(0xffffff)  // White (sparse)
];

function createParticles() {
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(PARTICLE_COUNT * 3);
    const colors = new Float32Array(PARTICLE_COUNT * 3);

    targetPoints = getSpreadPoints(PARTICLE_COUNT, 20);

    for (let i = 0; i < PARTICLE_COUNT; i++) {
        // Initial spread
        positions[i * 3] = (Math.random() - 0.5) * 40;
        positions[i * 3 + 1] = (Math.random() - 0.5) * 40;
        positions[i * 3 + 2] = (Math.random() - 0.5) * 40;

        // Galaxy color palette
        const color = GALAXY_COLORS[Math.floor(Math.random() * GALAXY_COLORS.length)];
        colors[i * 3] = color.r;
        colors[i * 3 + 1] = color.g;
        colors[i * 3 + 2] = color.b;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
        size: 0.18,
        vertexColors: true,
        transparent: true,
        map: createCircleTexture(),
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        sizeAttenuation: true
    });

    particles = new THREE.Points(geometry, material);
    scene.add(particles);
}

async function setupMediaPipe() {
    const videoElement = document.getElementById('input-video');
    const canvasElement = document.getElementById('output-canvas');
    const canvasCtx = canvasElement.getContext('2d');
    const hands = new Hands({
        locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
    });

    hands.setOptions({
        maxNumHands: 1,
        modelComplexity: 1,
        minDetectionConfidence: 0.6,
        minTrackingConfidence: 0.6
    });

    hands.onResults((results) => {
        canvasCtx.save();
        canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);

        if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
            const landmarks = results.multiHandLandmarks[0];

            // Gesture logic
            const gesture = detectGesture(landmarks);
            if (gesture !== currentGesture) {
                handleGestureChange(gesture);
            }

            // Rotation Logic
            calculateRotation(landmarks);

        } else {
            if (currentGesture !== 'SPREAD') handleGestureChange('SPREAD');
            targetRotation.set(0, 0, 0);
        }
        canvasCtx.restore();
    });

    const camera = new Camera(videoElement, {
        onFrame: async () => {
            await hands.send({ image: videoElement });
        },
        width: 640,
        height: 480
    });

    return camera.start();
}

/**
 * Calculates hand orientation and maps it to target rotation
 */
function calculateRotation(landmarks) {
    // 0: Wrist, 9: Middle Finger MCP
    const wrist = landmarks[0];
    const middleBase = landmarks[9];

    // Pitch (up/down)
    const pitch = (middleBase.y - wrist.y) * 2;
    // Yaw (left/right) - mirrored video so flip sign
    const yaw = (middleBase.x - wrist.x) * 3;

    // Roll (tilt) - Index MCP (5) vs Pinky MCP (17)
    const roll = (landmarks[17].y - landmarks[5].y) * 4;

    targetRotation.x = pitch;
    targetRotation.y = -yaw;
    targetRotation.z = roll;
}

function handleGestureChange(gesture) {
    currentGesture = gesture;
    switch (gesture) {
        case 'SPREAD': targetPoints = getSpreadPoints(PARTICLE_COUNT, 20); break;
        case 'I': targetPoints = getIPoints(PARTICLE_COUNT); break;
        case 'HEART': targetPoints = getHeartPoints(PARTICLE_COUNT); break;
        case 'U': targetPoints = getUPoints(PARTICLE_COUNT); break;
        case 'HEHE': targetPoints = getHehePoints(PARTICLE_COUNT); break;
    }
}

function animate() {
    requestAnimationFrame(animate);

    if (particles) {
        const positions = particles.geometry.attributes.position.array;

        for (let i = 0; i < PARTICLE_COUNT; i++) {
            const target = targetPoints[i];
            positions[i * 3] += (target.x - positions[i * 3]) * INTERPOLATION_FACTOR + (Math.random() - 0.5) * NOISE_STRENGTH;
            positions[i * 3 + 1] += (target.y - positions[i * 3 + 1]) * INTERPOLATION_FACTOR + (Math.random() - 0.5) * NOISE_STRENGTH;
            positions[i * 3 + 2] += (target.z - positions[i * 3 + 2]) * INTERPOLATION_FACTOR + (Math.random() - 0.5) * NOISE_STRENGTH;
        }

        particles.geometry.attributes.position.needsUpdate = true;

        // Smoothly interpolate rotation
        particles.rotation.x += (targetRotation.x - particles.rotation.x) * 0.05;
        particles.rotation.y += (targetRotation.y - particles.rotation.y) * 0.05;
        particles.rotation.z += (targetRotation.z - particles.rotation.z) * 0.05;

        // Base idle rotation
        particles.rotation.y += 0.001;
    }

    renderer.render(scene, camera);
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
}

init().then(() => {
    animate();
});
