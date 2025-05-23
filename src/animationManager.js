export class AnimationManager {
    constructor(scene) {
        this.scene = scene;
        this.animations = []; // Store animation details for each object
        this.globalTime = 0; // Global playback time
        this.isPaused = true; // Playback state
        this.loop = true; // Global loop toggle
        this.startTime = 0; // Start time for the animation
        this.endTime = 6.28; // End time for the animation
    }

    addAnimation(object, animationConfig) {
        console.log("Adding animation:", animationConfig);
        
        // Update start/end times of the timeline if needed
        this.startTime = Math.min(this.startTime, animationConfig.startT);
        this.endTime = Math.max(this.endTime, animationConfig.endT);
        
        // Initialize animations array if it doesn't exist
        if (!object.animations) {
            object.animations = [];
        }
        // Remove any existing animation for the same property and axis
        object.animations = object.animations.filter(anim => 
            !(anim.property === animationConfig.property && anim.axis === animationConfig.axis)
        );
        
        // Remove from global animations list too
        this.animations = this.animations.filter(anim => 
            !(anim.object === object && anim.property === animationConfig.property && anim.axis === animationConfig.axis)
        );
        
        // Add this animation to the object's animations
        object.animations.push(animationConfig);
        
        // Add to global animations list
        this.animations.push({ object, ...animationConfig });
        
        // Ensure the update method is created
        object.update = (time) => {
            if (!object.animations || object.animations.length === 0) return;
            
            object.animations.forEach(anim => {
                const { property, axis, startT, endT, functions } = anim;
                
                if (time < startT) return;
                
                let localTime;
                if (this.loop) {
                    const duration = endT - startT;
                    const elapsed = time - startT;
                    localTime = startT + (elapsed % duration);
                } else {
                    localTime = Math.min(time, endT);
                }
                
                if (functions[axis]) {
                    const { apply, params } = functions[axis];
                    const value = apply(localTime, params);
                    
                    if (property === 'position') {
                        object.position[axis] = value;
                    } else if (property === 'rotation') {
                        object.rotation[axis] = value;
                    } else if (property === 'scale') {
                        object.scale[axis] = Math.max(0.01, value);
                    } else if (property === 'color' && object.material && object.material.color) {
                        // Color animation
                        if (axis === 'r') object.material.color.r = value / 255;
                        if (axis === 'g') object.material.color.g = value / 255;
                        if (axis === 'b') object.material.color.b = value / 255;
                    }
                }
            });
        };
        
        // Apply animation immediately with current time
        object.update(this.globalTime);
        
        // Debug log to verify the animation is added
        console.log(`Animation added to ${object.uuid}, total animations: ${this.animations.length}`);
    }    addAnimation(object, animationConfig) {
        console.log("Adding animation:", animationConfig);
        
        // Update start/end times of the timeline if needed
        this.startTime = Math.min(this.startTime, animationConfig.startT);
        this.endTime = Math.max(this.endTime, animationConfig.endT);
        
        // Store animation reference for this object
        if (!object.animations) {
            object.animations = [];
        }
        
        // Add this animation to the object's animations
        object.animations.push(animationConfig);
        
        // Add to global animations list
        this.animations.push({ object, ...animationConfig });
        
        // Create or replace the update method on the object
        object.update = (time) => {
            if (!object.animations || object.animations.length === 0) return;
            
            object.animations.forEach(anim => {
                const { property, axis, startT, endT, functions } = anim;
                
                // Skip if outside time range and not looping
                if (time < startT) return;
                
                // Calculate local time based on global time
                let localTime;
                if (this.loop) {
                    // Loop the animation (cycle between startT and endT)
                    const duration = endT - startT;
                    const elapsed = time - startT;
                    localTime = startT + (elapsed % duration);
                } else {
                    // Play once and clamp to endT
                    localTime = Math.min(time, endT);
                }
                
                // Apply the function to the specified property and axis
                if (functions[axis]) {
                    const { apply, params } = functions[axis];
                    const value = apply(localTime, params);
                    
                    // Apply to the object
                    if (property === 'position') {
                        object.position[axis] = value;
                    } else if (property === 'rotation') {
                        object.rotation[axis] = value;
                    } else if (property === 'scale') {
                        object.scale[axis] = Math.max(0.01, value); // Prevent negative/zero scale
                    }
                }
            });
        };
        
        // Apply animation immediately with current time
        object.update(this.globalTime);
        
        // Debug log to verify the animation is added
        console.log(`Animation added to ${object.uuid}, total animations: ${this.animations.length}`);
    }

    removeAnimation(object, property, axis) {
        // Remove from object's animations
        if (object.animations) {
            object.animations = object.animations.filter(
                anim => !(anim.property === property && anim.axis === axis)
            );
        }
        
        // Remove from global animations list
        this.animations = this.animations.filter(
            anim => !(anim.object === object && anim.property === property && anim.axis === axis)
        );

        this.recalculateTimeRange();
    }

    // Add this to your AnimationManager class:
    clearAnimations(object) {
        // Remove all animations for an object
        if (object.animations) {
            object.animations = [];
        }
        
        // Remove from global animations list
        this.animations = this.animations.filter(anim => anim.object !== object);
        
        // Find and remove any paths associated with this object
        if (this.scene) {
            this.scene.traverse(obj => {
                if (obj.isAnimationPath && obj.userData && obj.userData.targetObject === object.uuid) {
                    this.scene.remove(obj);
                    obj.geometry.dispose();
                    obj.material.dispose();
                }
            });
        }
    }

    recalculateTimeRange() {
        if (this.animations.length === 0) {
            this.startTime = 0;
            this.endTime = 6.28; // Default
            return;
        }
        
        // Find min start and max end
        this.startTime = Math.min(...this.animations.map(a => a.startT));
        this.endTime = Math.max(...this.animations.map(a => a.endT));
    }

    togglePlayPause() {
        this.isPaused = !this.isPaused;
    }

    toggleLoop() {
        this.loop = !this.loop;
    }

    notLooping() {
        return (!this.loop);
    }

    setTime(time) {
        this.globalTime = time;
        
        // Apply to all objects immediately
        this.updateAllObjects(time);
    }
    
    updateAllObjects(time) {
        const getLocalTime = (anim, globalTime) => {
        if (globalTime < anim.startT) {return anim.startT;
        }
        if (globalTime > anim.endT) {
            return anim.endT;
        }
        return globalTime;
        };
    
        // Process each object with animations
        const animatedObjects = new Set(this.animations.map(a => a.object));
        
        animatedObjects.forEach(obj => {
            if (!obj || !obj.animations || obj.animations.length === 0) return;
            
            // Group animations by property
            const animsByProperty = {
                position: obj.animations.filter(a => a.property === 'position'),
                rotation: obj.animations.filter(a => a.property === 'rotation'),
                scale: obj.animations.filter(a => a.property === 'scale'),
                color: obj.animations.filter(a => a.property === 'color')
            };
            
            // Process position, rotation, scale animations (similar structure)
            ['position', 'rotation', 'scale'].forEach(property => {
                if (animsByProperty[property].length > 0) {
                    animsByProperty[property].forEach(anim => {
                        Object.keys(anim.functions).forEach(axis => {
                            if (['x', 'y', 'z'].includes(axis)) {
                                const { apply, params } = anim.functions[axis];
                                const localTime = getLocalTime(anim, time);
                                let value = apply(localTime, params);
                                
                                // Ensure scale doesn't go negative
                                if (property === 'scale') {
                                    value = Math.max(0.001, value);
                                }
                                
                                obj[property][axis] = value;
                            }
                        });
                    });
                }
            });
            
            // Process color animations (special case)
            if (animsByProperty.color.length > 0 && obj.material && obj.material.color) {
                const colorValues = { r: null, g: null, b: null };
                
                animsByProperty.color.forEach(anim => {
                    Object.keys(anim.functions).forEach(channel => {
                        if (['r', 'g', 'b'].includes(channel)) {
                            const { apply, params } = anim.functions[channel];
                            const localTime = getLocalTime(anim, time);
                            
                            // Get 0-255 value and clamp
                            let colorValue = apply(localTime, params);
                            colorValue = Math.max(0, Math.min(255, colorValue));
                            
                            // Convert to 0-1 for Three.js
                            colorValues[channel] = colorValue / 255;
                        }
                    });
                });
                
                // Apply color changes (only for channels that have animations)
                if (colorValues.r !== null) obj.material.color.r = colorValues.r;
                if (colorValues.g !== null) obj.material.color.g = colorValues.g;
                if (colorValues.b !== null) obj.material.color.b = colorValues.b;
            }
        });
    }

    getAnimationsForObject(object) {
        // Return all animations associated with this object
        return this.animations.filter(anim => anim.object === object);
    }

    update(deltaTime) {
        if (this.isPaused) return;
        const nextTime = this.globalTime + deltaTime;
        if(this.notLooping() && nextTime > this.endTime) {
            this.globalTime = this.endTime;
            this.isPaused = true;

            const event = new CustomEvent('animation-ended');
            window.dispatchEvent(event);

            this.updateAllObjects(this.globalTime);
            return;
        }
        this.globalTime += deltaTime;
        
        // Loop back to start if past end time
        if (this.loop && this.globalTime > this.endTime) {
            this.globalTime = this.startTime;
        }
        
        // Update all objects
        this.updateAllObjects(this.globalTime);
    }
}