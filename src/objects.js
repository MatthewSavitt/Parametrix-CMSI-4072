import * as THREE from 'three';

export function createCube() {
    const geometry = new THREE.BoxGeometry();
    const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    return new THREE.Mesh(geometry, material);
}

export function createSphere() {
    const geometry = new THREE.SphereGeometry(1, 32, 32);
    const material = new THREE.MeshBasicMaterial({ color: 0x0000ff });
    return new THREE.Mesh(geometry, material);
}

export function createTorus() {
    const geometry = new THREE.TorusGeometry(1, 0.4, 16, 100);
    const material = new THREE.MeshBasicMaterial({ color: 0xff00ff });
    return new THREE.Mesh(geometry, material);
}
