import * as THREE from './node_modules/three/build/three.module.js';
import { createCameraControls } from './cameraControls.js';
import { createCubeMenu } from './cubeMenu.js';
import { createSphereMenu } from './sphereMenu.js';
import { initializeObjectEditMenu, getSelectedObject} from './objectEditMenu.js';
// import animation manager
import { AnimationManager } from './animationManager.js';
import { createPlaybackHUD } from './animationHud.js';
import { addObject, removeObject, getObjects } from './objectManager.js';
import { createGizmo } from './threejs-gizmo.js';

const scene = new THREE.Scene();
const renderer = new THREE.WebGLRenderer();
const animManager = new AnimationManager(scene);

renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// First create camera
const perspectiveCamera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
perspectiveCamera.position.z = 5;

// Then initialize camera controls WITHOUT objectEditor 
const cameraControls = createCameraControls(scene, renderer, perspectiveCamera);
const { getActiveCamera, onCameraChange, update:updateCameraControls, setObjectEditor } = cameraControls;

// NOW initialize objectEditor using getActiveCamera
const objectEditor = initializeObjectEditMenu(scene, getActiveCamera(), renderer, animManager);
window.selectedObjectEditor = objectEditor;
// Pass a callback to be notified when camera changes
onCameraChange((newCamera) => {
    // Update the camera reference in object edit menu
    if (objectEditor && objectEditor.updateCamera) {
        objectEditor.updateCamera(newCamera);
    }
});

//disable scrolling the whole page on accident
document.body.style.overflow = 'hidden';

// add gizmo to scene 
const boxWithGizmo = createGizmo();
scene.add(boxWithGizmo);

// Initialize cube menu
createCubeMenu(scene);
createSphereMenu(scene);
// Initialize the animation HUD
createPlaybackHUD(animManager, scene);


let lastTime = performance.now();

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

// In app.js, let's add some debug code to verify animations are running:

function animate() {
    requestAnimationFrame(animate);
    
    const currentTime = performance.now();
    const deltaTime = (currentTime - lastTime) / 1000; // Convert to seconds
    lastTime = currentTime;
    
    // Debug log every second
    if (Math.floor(currentTime/1000) !== Math.floor(lastTime/1000)) {
        console.log(`Animation time: ${animManager.globalTime.toFixed(2)}s, Paused: ${animManager.isPaused}`);
        console.log(`Active animations: ${animManager.animations.length}`);
    }
    
    // Update animation manager
    animManager.update(deltaTime);
    // Update camera controls
    updateCameraControls();
    // Update camera controls
    const activeCamera = getActiveCamera();
    if (activeCamera.update) {
        activeCamera.update();
    }

    // Update the outline to follow the selected object if it's animated
    if (objectEditor.hasActiveOutline()) {
        objectEditor.updateOutlineForAnimation();
    }
    
    // Render the scene
    renderer.render(scene, getActiveCamera());
}

animate();