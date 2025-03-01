import * as THREE from './node_modules/three/build/three.module.js';

export function initializeCameraKeyboardControls(getActiveCamera) {
    // Movement speed and rotation sensitivity
    const moveSpeed = 0.1;
    const rotateSpeed = 0.01;
    
    // Tracking key states
    const keys = {
        w: false,
        a: false,
        s: false,
        d: false,
        q: false,
        e: false
    };
    
    // Mouse rotation tracking
    let isMouseRotating = false;
    let lastMouseX = 0;
    let lastMouseY = 0;
    
    // Set up event listeners for keyboard
    document.addEventListener('keydown', (event) => {
        if (keys.hasOwnProperty(event.key.toLowerCase())) {
            keys[event.key.toLowerCase()] = true;
        }
    });
    
    document.addEventListener('keyup', (event) => {
        if (keys.hasOwnProperty(event.key.toLowerCase())) {
            keys[event.key.toLowerCase()] = false;
        }
    });
    
    // Set up event listeners for mouse rotation (right-click drag)
    document.addEventListener('mousedown', (event) => {
        // Middle mouse button (button 1) for camera rotation
        if (event.button === 1) {
            isMouseRotating = true;
            lastMouseX = event.clientX;
            lastMouseY = event.clientY;
            event.preventDefault();
        }
    });
    
    document.addEventListener('mouseup', (event) => {
        if (event.button === 1) {
            isMouseRotating = false;
        }
    });
    
    document.addEventListener('mousemove', (event) => {
        if (isMouseRotating) {
            const deltaX = event.clientX - lastMouseX;
            const deltaY = event.clientY - lastMouseY;
            
            const camera = getActiveCamera();
            
            // Rotate camera based on mouse movement
            camera.rotation.y -= deltaX * rotateSpeed;
            camera.rotation.x -= deltaY * rotateSpeed;
            
            // Clamp vertical rotation to avoid flipping
            camera.rotation.x = Math.max(-Math.PI/2, Math.min(Math.PI/2, camera.rotation.x));
            
            lastMouseX = event.clientX;
            lastMouseY = event.clientY;
        }
    });
    
    // Update function to be called in animation loop
    function update() {
        const camera = getActiveCamera();
        
        if (!camera) return false;
        let moved = false;
        if (isMouseRotating === true) {
            moved = true;
        }
        
        // Create direction vectors
        const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion);
        const right = new THREE.Vector3(1, 0, 0).applyQuaternion(camera.quaternion);
        
        // Apply movement based on keys
        if (keys.w) { camera.position.addScaledVector(forward, moveSpeed); moved = true; }
        if (keys.s) { camera.position.addScaledVector(forward, -moveSpeed); moved = true; }
        if (keys.a) { camera.position.addScaledVector(right, -moveSpeed); moved = true; }
        if (keys.d) { camera.position.addScaledVector(right, moveSpeed); moved = true; }
        
        // Apply roll rotation
        if (keys.q) { camera.rotation.z += 0.02; moved = true; }
        if (keys.e) { camera.rotation.z -= 0.02; moved = true; }    
        return moved;
    }
    
    return { update };
}