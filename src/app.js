import * as THREE from './node_modules/three/build/three.module.js';
import { createCameraControls } from './cameraControls.js';
import { createCubeMenu } from './cubeMenu.js';
import { createSphereMenu } from './sphereMenu.js';
import { initializeObjectEditMenu } from './objectEditMenu.js';

const scene = new THREE.Scene();
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const perspectiveCamera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
perspectiveCamera.position.z = 5;

// Initialize camera controls and getActiveCamera function
const getActiveCamera = createCameraControls(scene, renderer, perspectiveCamera);

// Initialize cube menu
createCubeMenu(scene);
createSphereMenu(scene);
initializeObjectEditMenu(scene, getActiveCamera(), renderer);
// Handle window resize
window.addEventListener('resize', () => {
    renderer.setSize(window.innerWidth, window.innerHeight);

    // Update active camera's projection matrix
    const activeCamera = getActiveCamera();
    if (activeCamera.isPerspectiveCamera) {
        activeCamera.aspect = window.innerWidth / window.innerHeight;
    } else if (activeCamera.isOrthographicCamera) {
        activeCamera.left = window.innerWidth / -100;
        activeCamera.right = window.innerWidth / 100;
        activeCamera.top = window.innerHeight / 100;
        activeCamera.bottom = window.innerHeight / -100;
    }
    activeCamera.updateProjectionMatrix();
});

// Animation loop
function animate() {
    requestAnimationFrame(animate);

    // Dynamically use the current active camera
    renderer.render(scene, getActiveCamera());
}

animate();
