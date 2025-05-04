import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.150.0/build/three.module.js';
import { parametricFunctions } from './parametricFunctions.js';

export class ProjectManager {
    constructor(scene, animationManager, getActiveCamera) {
        this.scene = scene;
        this.animationManager = animationManager;
        this.getActiveCamera = getActiveCamera;
    }

    // Save project to JSON
    saveProject() {
        const project = {
            version: "1.0",
            metadata: {
                name: "Parametrix Animation",
                created: new Date().toISOString(),
                lastModified: new Date().toISOString()
            },
            timeline: {
                startTime: this.animationManager.startTime,
                endTime: this.animationManager.endTime,
                duration: this.animationManager.endTime - this.animationManager.startTime
            },
            ui: {
                showAnimationPaths: window.showAnimationPaths || false  // Save the path visibility state
            },
            objects: [],
            camera: null
        };

        // Serialize objects and their animations
        this.scene.traverse(obj => {
            if (obj.isMesh) {
                const objectData = {
                    id: obj.uuid,
                    type: obj.geometry.type,
                    geometry: this.serializeGeometry(obj.geometry),
                    material: this.serializeMaterial(obj.material),
                    transform: {
                        position: obj.position.toArray(),
                        rotation: obj.rotation.toArray(),
                        scale: obj.scale.toArray()
                    },
                    animations: this.serializeObjectAnimations(obj)
                };
                project.objects.push(objectData);
            }
        });

        // Serialize camera
        const camera = this.getActiveCamera();
        project.camera = {
            type: camera.isPerspectiveCamera ? 'perspective' : 'orthographic',
            position: camera.position.toArray(),
            rotation: camera.rotation.toArray()
        };

        return JSON.stringify(project, null, 2);
    }


    loadProject(jsonData) {
        const project = JSON.parse(jsonData);
        
        // Clear current scene
        this.clearScene();
        
        // Reset animation manager state
        this.animationManager.animations = [];
        this.animationManager.globalTime = 0;
        this.animationManager.isPaused = true;
        
        // Load UI state
        if (project.ui && project.ui.showAnimationPaths !== undefined) {
            window.showAnimationPaths = project.ui.showAnimationPaths;
        }

        // Load timeline settings
        this.animationManager.startTime = project.timeline.startTime;
        this.animationManager.endTime = project.timeline.endTime;

        // Load objects
        project.objects.forEach(objData => {
            const obj = this.deserializeObject(objData);
            if (obj) {
                this.scene.add(obj);
                
                // Add animations
                objData.animations.forEach(animData => {
                    const reconstructedAnim = this.reconstructAnimation(animData);
                    this.animationManager.addAnimation(obj, reconstructedAnim);
                });
            }
        });
        
        // Load camera
        const camera = this.getActiveCamera();
        camera.position.fromArray(project.camera.position);
        camera.rotation.fromArray(project.camera.rotation);
        
        // Set initial time and update all objects
        this.animationManager.globalTime = project.timeline.startTime;
        this.animationManager.updateAllObjects(this.animationManager.globalTime);
        
        // Dispatch event to update UI
        const event = new CustomEvent('project-loaded', {
            detail: {
                startTime: project.timeline.startTime,
                endTime: project.timeline.endTime,
                showAnimationPaths: window.showAnimationPaths
            }
        });
        window.dispatchEvent(event);
        
        // Redraw animation paths with the loaded visibility state
        const objectEditor = window.selectedObjectEditor;
        if (objectEditor && objectEditor.redrawAllAnimationPaths) {
            objectEditor.redrawAllAnimationPaths();
        }
        // Start animation if it was playing before save
        this.animationManager.isPaused = false;
    }

    reconstructAnimation(animData) {
        console.log('Reconstructing animation:', animData);
        
        const reconstructed = {
            property: animData.property,
            axis: animData.axis,
            startT: animData.startT,
            endT: animData.endT,
            functions: {}
        };
        
        // Reconstruct functions
        if (animData.functions) {
            Object.keys(animData.functions).forEach(axis => {
                const funcData = animData.functions[axis];
                if (funcData.type && parametricFunctions[funcData.type]) {
                    reconstructed.functions[axis] = {
                        apply: parametricFunctions[funcData.type].apply,
                        params: { ...funcData.params },
                        functionName: funcData.type
                    };
                } else {
                    console.error(`Function "${funcData.type}" not found in parametricFunctions`);
                }
            });
        }
        
        return reconstructed;
    }

    reconstructAnimation(animData) {
        const reconstructed = {
            property: animData.property,
            axis: animData.axis,
            startT: animData.startT,
            endT: animData.endT,
            functions: {}
        };
        
        // Reconstruct functions
        if (animData.functions) {
            Object.keys(animData.functions).forEach(axis => {
                const funcData = animData.functions[axis];
                if (funcData.type && parametricFunctions[funcData.type]) {
                    reconstructed.functions[axis] = {
                        apply: parametricFunctions[funcData.type].apply,
                        params: { ...funcData.params },
                        functionName: funcData.type  // Add this to help with debugging
                    };
                }
            });
        }
        
        return reconstructed;
    }

    serializeGeometry(geometry) {
        const params = {};
        if (geometry.type === 'BoxGeometry') {
            params.width = geometry.parameters.width;
            params.height = geometry.parameters.height;
            params.depth = geometry.parameters.depth;
        } else if (geometry.type === 'SphereGeometry') {
            params.radius = geometry.parameters.radius;
            params.widthSegments = geometry.parameters.widthSegments;
            params.heightSegments = geometry.parameters.heightSegments;
        } else if (geometry.type === 'TorusGeometry') {
            params.radius = geometry.parameters.radius;
            params.tube = geometry.parameters.tube;
            params.radialSegments = geometry.parameters.radialSegments;
            params.tubularSegments = geometry.parameters.tubularSegments;
            params.arc = geometry.parameters.arc;
        } else if (geometry.type === 'ConeGeometry') {
            params.radius = geometry.parameters.radius;
            params.height = geometry.parameters.height;
            params.radialSegments = geometry.parameters.radialSegments;
        } else if (geometry.type === 'CylinderGeometry') {
            params.radiusTop = geometry.parameters.radiusTop;
            params.radiusBottom = geometry.parameters.radiusBottom;
            params.height = geometry.parameters.height;
            params.radialSegments = geometry.parameters.radialSegments;
        }
        return params;
    }

    serializeMaterial(material) {
        if (!material) return null;
        
        return {
            color: material.color ? material.color.getHexString() : 'ffffff'
        };
    }

    serializeObjectAnimations(obj) {
        const animations = [];
        if (obj.animations) {
            obj.animations.forEach(anim => {
                const serializedAnim = {
                    property: anim.property,
                    axis: anim.axis,
                    startT: anim.startT,
                    endT: anim.endT,
                    functions: {}
                };
                
                // Serialize functions by storing the function name and parameters
                if (anim.functions) {
                    Object.keys(anim.functions).forEach(axis => {
                        const func = anim.functions[axis];
                        // Find the function name by checking parametricFunctions
                        let functionName = func.functionName;
                        
                        // If functionName is not available, try to identify it
                        if (!functionName) {
                            for (const [name, definition] of Object.entries(parametricFunctions)) {
                                if (definition.apply === func.apply) {
                                    functionName = name;
                                    break;
                                }
                            }
                        }
                        
                        if (functionName) {
                            // Create a clean copy of parameters to avoid any reference issues
                            const cleanParams = {};
                            if (func.params) {
                                Object.keys(func.params).forEach(paramName => {
                                    cleanParams[paramName] = func.params[paramName];
                                });
                            }
                            
                            serializedAnim.functions[axis] = {
                                type: functionName,
                                params: cleanParams
                            };
                        }
                    });
                }
                
                animations.push(serializedAnim);
            });
        }
        return animations;
    }

    reconstructAnimation(animData) {
        const reconstructed = {
            property: animData.property,
            axis: animData.axis,
            startT: animData.startT,
            endT: animData.endT,
            functions: {}
        };
        
        // Reconstruct functions
        if (animData.functions) {
            Object.keys(animData.functions).forEach(axis => {
                const funcData = animData.functions[axis];
                if (funcData.type && parametricFunctions[funcData.type]) {
                    // Create a fresh copy of parameters to avoid reference issues
                    const freshParams = {};
                    
                    // Copy only the parameters that exist in the saved animation
                    if (funcData.params) {
                        Object.keys(funcData.params).forEach(paramName => {
                            freshParams[paramName] = funcData.params[paramName];
                        });
                    }
                    
                    reconstructed.functions[axis] = {
                        apply: parametricFunctions[funcData.type].apply,
                        params: freshParams,  // Use the fresh copy
                        functionName: funcData.type
                    };
                } else {
                    console.error(`Function "${funcData.type}" not found in parametricFunctions`);
                }
            });
        }
        
        return reconstructed;
    }

    deserializeObject(objData) {
        let geometry, material, mesh;
        
        // Create geometry
        if (objData.type === 'BoxGeometry') {
            geometry = new THREE.BoxGeometry(
                objData.geometry.width,
                objData.geometry.height,
                objData.geometry.depth
            );
        } else if (objData.type === 'SphereGeometry') {
            geometry = new THREE.SphereGeometry(
                objData.geometry.radius,
                objData.geometry.widthSegments,
                objData.geometry.heightSegments
            );
        } else if (objData.type === 'TorusGeometry') {
            geometry = new THREE.TorusGeometry(
                objData.geometry.radius,
                objData.geometry.tube,
                objData.geometry.radialSegments,
                objData.geometry.tubularSegments,
                objData.geometry.arc
            );
        } else if (objData.type === 'ConeGeometry') {
            geometry = new THREE.ConeGeometry(
                objData.geometry.radius,
                objData.geometry.height,
                objData.geometry.radialSegments
            );
        } else if (objData.type === 'CylinderGeometry') {
            geometry = new THREE.CylinderGeometry(
                objData.geometry.radiusTop,
                objData.geometry.radiusBottom,
                objData.geometry.height,
                objData.geometry.radialSegments
            );
        }
        
        // Create material - just color (for now)
        if (objData.material && objData.material.color) {
            material = new THREE.MeshBasicMaterial({
                color: '#' + objData.material.color
            });
        } else {
            material = new THREE.MeshBasicMaterial({
                color: '#00ff00'
            });
        }
        
        // Create mesh
        if (geometry && material) {
            mesh = new THREE.Mesh(geometry, material);
            mesh.uuid = objData.id;
            mesh.position.fromArray(objData.transform.position);
            mesh.rotation.fromArray(objData.transform.rotation);
            mesh.scale.fromArray(objData.transform.scale);
            
            return mesh;
        } else {
            console.error('Failed to create mesh: Missing geometry or material');
            return null;
        }
    }

    clearScene() {
        const objectsToRemove = [];
        this.scene.traverse(obj => {
            if (obj.isMesh) {
                objectsToRemove.push(obj);
            }
        });
        objectsToRemove.forEach(obj => {
            this.animationManager.clearAnimations(obj);
            this.scene.remove(obj);
            if (obj.geometry) obj.geometry.dispose();
            if (obj.material) obj.material.dispose();
        });
    }

    // Helper methods for file operations
    downloadProject(filename = 'parametrix-project.json') {
        const projectData = this.saveProject();
        const blob = new Blob([projectData], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }

    async loadFromFile(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (event) => {
                try {
                    this.loadProject(event.target.result);
                    resolve();
                } catch (error) {
                    reject(error);
                }
            };
            reader.onerror = reject;
            reader.readAsText(file);
        });
    }
}