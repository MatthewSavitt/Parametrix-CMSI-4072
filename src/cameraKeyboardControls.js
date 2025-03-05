import * as THREE from './node_modules/three/build/three.module.js';
//import the selectedobject if it is currently selected
//import { selectedObject } from './objectManager.js';
export function initializeCameraKeyboardControls(getActiveCamera) {
    // Movement speed and rotation sensitivity
    const moveSpeed = 0.1;
    const rotateSpeed = 0.007;
    const rollFactor = 0.0005;
    const smoothingFactor = 0.1;
    let cameraQuaternion = new THREE.Quaternion();
    // Tracking key states
    const keys = {
        w: false,
        a: false,
        s: false,
        d: false,
        q: false,
        e: false,
        f: false,
        g: false,
        z: false,
        x: false
    };
    
    // Mouse rotation tracking
    let isMouseRotating = false;
    let lastMouseX = 0;
    let lastMouseY = 0;
    
    // Set up event listeners for keyboard
    document.addEventListener('keydown', (event) => { //how to make this work with home, since its not a letter?
        // // Convert key to lowercase for consistency
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
            const deltaX = (event.clientX - lastMouseX) * -rotateSpeed;
            const deltaY = (event.clientY - lastMouseY) * rotateSpeed;
            const camera = getActiveCamera();
            let axis = new THREE.Vector3(-deltaY, deltaX, rollFactor * (deltaX**2 + deltaY**2)).normalize();
            let angle = Math.sqrt(deltaX**2 + deltaY**2);
            let deltaQuat = new THREE.Quaternion();
            deltaQuat.setFromAxisAngle(axis, angle)
            
            // Rotate camera based on mouse movement
            camera.setRotationFromQuaternion(cameraQuaternion.multiply(deltaQuat));
            
            lastMouseX = event.clientX - smoothingFactor;
            lastMouseY = event.clientY - smoothingFactor;
        }
    });
    
    // Update function to be called in animation loop
    function update() {
        const camera = getActiveCamera();;
        if (!camera) return false;
        let moved = false;
        if (isMouseRotating === true) {
            moved = true;
        }

        // Create direction vectors
        const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion);
        const right = new THREE.Vector3(1, 0, 0).applyQuaternion(camera.quaternion);
        const up = new THREE.Vector3(0, 1, 0).applyQuaternion(camera.quaternion);
        
        // Apply movement based on keys
        if (keys.w) { camera.position.addScaledVector(forward, moveSpeed); moved = true; }
        if (keys.s) { camera.position.addScaledVector(forward, -moveSpeed); moved = true; }
        if (keys.a) { camera.position.addScaledVector(right, -moveSpeed); moved = true; }
        if (keys.d) { camera.position.addScaledVector(right, moveSpeed); moved = true; }
        if (keys.g) { () => { camera.position.setScaledVector(0, 0, 5); camera.rotation.setScaledVector(0, 0, 0); moved = true; } }
        if (keys.z) { camera.position.addScaledVector(up, -moveSpeed); moved = true; }
        if (keys.x) { camera.position.addScaledVector(up, moveSpeed); moved = true; }
        // if (selectedObject && keys.f) { 
        //     camera.position.copy(selectedObject.position -(forward.multiplyScalar(5)));
        //     moved = true;
        //     camera.lookAt(selectedObject.position);
        // }
        
        // Apply roll rotation
        if (keys.q) { camera.rotation.z += 0.02; moved = true; }
        if (keys.e) { camera.rotation.z -= 0.02; moved = true; }   
        //save to camera quaternion
        cameraQuaternion.copy(camera.quaternion); 
        return moved;
    }
    
    return { update };
}