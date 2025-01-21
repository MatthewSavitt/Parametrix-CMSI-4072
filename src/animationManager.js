export class AnimationManager {
    constructor(scene) {
        this.scene = scene;
        this.animations = []; // Store animation details for each object
        this.globalTime = 0; // Global playback time
        this.isPaused = true; // Playback state
        this.loop = true; // Global loop toggle
    }

    addAnimation(object, animationConfig) {
        this.animations.push({ object, ...animationConfig });
    }

    togglePlayPause() {
        this.isPaused = !this.isPaused;
    }

    toggleLoop() {
        this.loop = !this.loop;
    }

    update(deltaTime) {
        if (this.isPaused) return;

        this.globalTime += deltaTime;

        this.animations.forEach((anim) => {
            const { object, startT, endT, functions, loop } = anim;

            const localTime = this.globalTime % (endT - startT) + startT;
            if (!this.loop && this.globalTime > endT) return;

            ['x', 'y', 'z'].forEach((axis) => {
                if (functions[axis]) {
                    const { apply, params } = functions[axis];
                    object.position[axis] = apply(localTime, params);
                }
            });
        });
    }

}
