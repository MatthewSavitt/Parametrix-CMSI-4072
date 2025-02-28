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
        // Update start/end times of the timeline if needed
        this.startTime = Math.min(this.startTime, animationConfig.startT);
        this.endTime = Math.max(this.endTime, animationConfig.endT);
        
        // Check if the object already has animations
        if (!object.animations) {
            object.animations = [];
            
            // Add an update method to the object
            object.update = (time) => {
                // Apply all animations for this object, using the provided time
                object.animations.forEach(anim => {
                    const { property, axis, startT, endT, functions, loop } = anim;
                    
                    // Skip if outside time range and not looping
                    if (time < startT) return;
                    if (time > endT && !loop && !this.loop) return;
                    
                    // Calculate local time based on global time
                    let localTime;
                    if (loop || this.loop) {
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
        }
        
        // Add this animation to the object's animations
        object.animations.push(animationConfig);
        
        // Add to global animations list
        this.animations.push({ object, ...animationConfig });
        
        // Apply animation immediately with current time
        object.update(this.globalTime);
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

    clearAnimations(object) {
        // Remove all animations for an object
        if (object.animations) {
            object.animations = [];
        }
        
        // Remove from global animations list
        this.animations = this.animations.filter(anim => anim.object !== object);

        this.recalculateTimeRange();
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

    setTime(time) {
        this.globalTime = time;
        
        // Apply to all objects immediately
        this.updateAllObjects(time);
    }
    
    updateAllObjects(time) {
        // Update all animated objects at the given time
        const objects = new Set(this.animations.map(a => a.object));
        objects.forEach(obj => {
            if (obj.update) {
                obj.update(time);
            }
        });
    }

    update(deltaTime) {
        if (this.isPaused) return;
        
        this.globalTime += deltaTime;
        
        // Loop back to start if past end time
        if (this.loop && this.globalTime > this.endTime) {
            this.globalTime = this.startTime;
        }
        
        // Update all objects
        this.updateAllObjects(this.globalTime);
    }
}