import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.150.0/build/three.module.js';
import "https://cdnjs.cloudflare.com/ajax/libs/gif.js/0.2.0/gif.js";
const GIF = window.GIF;

export function initializeGIFExport(scene, animationManager, getActiveCamera, renderer) {
    // Track processing state
    let isProcessing = false;
    let showPaths = false;
    let frameMode = 'frames'; // 'frames' or 'samples'
    let framesPerSecond = 30;
    let secondsPerFrame = 1 / framesPerSecond;
    let totalFrames = 100;

    function exportToGIF(options = {}) {
        if (isProcessing) return;
        
        // Get options
        showPaths = options.showPaths || false;
        frameMode = options.frameMode || 'frames';
        framesPerSecond = options.framesPerSecond || 30;
        secondsPerFrame = 1 / framesPerSecond;
        totalFrames = options.totalFrames || 100;
        
        // Start processing
        isProcessing = true;
        
        // Show progress UI
        showProgressUI();
        
        // Disable camera controls
        disableCameraControls();
        
        // Hide UI elements except paths if requested
        const uiElements = hideUIElements(showPaths);
        
        // Get animation time range
        const startTime = animationManager.startTime;
        const endTime = animationManager.endTime;
        const duration = endTime - startTime;
        
        // Calculate frames
        let frames = [];
        let numFrames;
        
        if (frameMode === 'frames') {
            numFrames = Math.floor(duration * framesPerSecond);
            for (let i = 0; i < numFrames; i++) {
                const time = startTime + (i * secondsPerFrame);
                frames.push(time);
            }
        } else { // samples mode
            numFrames = totalFrames;
            for (let i = 0; i < numFrames; i++) {
                const time = startTime + (duration * (i / (numFrames - 1)));
                frames.push(time);
            }
        }
        
        // Get viewport dimensions
        const width = renderer.domElement.width;
        const height = renderer.domElement.height;
        
        // Initialize GIF encoder
        const gif = new GIF({
            workers: 2,
            quality: 10,
            width: width,
            height: height,
            workerScript: './gif.worker.js' // Worker file is in the project root
        });
        
        // Process frames
        let currentFrame = 0;
        processNextFrame();
        
        function processNextFrame() {
            if (currentFrame >= frames.length) {
                // All frames processed, finish GIF
                gif.on('finished', function(blob) {
                    // Download the GIF
                    const url = URL.createObjectURL(blob);
                    downloadGIF(url, 'parametrix-animation.gif');
                    
                    // Cleanup
                    restoreUIElements(uiElements);
                    enableCameraControls();
                    hideProgressUI();
                    isProcessing = false;
                });
                
                gif.render();
                return;
            }
            
            // Set animation time
            const time = frames[currentFrame];
            animationManager.setTime(time);
            
            // Render the scene
            renderer.render(scene, getActiveCamera());
            
            // Get frame data from canvas
            const canvas = renderer.domElement;
            
            // Add frame to GIF
            gif.addFrame(canvas, {
                copy: true,
                delay: Math.round(secondsPerFrame * 1000) // Convert to milliseconds
            });
            
            // Update progress
            updateProgress(currentFrame / frames.length);
            
            // Process next frame
            currentFrame++;
            setTimeout(processNextFrame, 0);
        }
    }
    
    function downloadGIF(url, filename) {
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }
    
    let progressUI;
    function showProgressUI() {
        progressUI = document.createElement('div');
        progressUI.style.position = 'fixed';
        progressUI.style.top = '50%';
        progressUI.style.left = '50%';
        progressUI.style.transform = 'translate(-50%, -50%)';
        progressUI.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
        progressUI.style.color = 'white';
        progressUI.style.padding = '20px';
        progressUI.style.borderRadius = '10px';
        progressUI.style.zIndex = '10000';
        
        const title = document.createElement('div');
        title.textContent = 'Exporting to GIF...';
        title.style.marginBottom = '10px';
        progressUI.appendChild(title);
        
        const progressBar = document.createElement('div');
        progressBar.style.width = '200px';
        progressBar.style.height = '20px';
        progressBar.style.backgroundColor = '#333';
        progressBar.style.borderRadius = '5px';
        progressBar.style.overflow = 'hidden';
        
        const progress = document.createElement('div');
        progress.id = 'export-progress';
        progress.style.width = '0%';
        progress.style.height = '100%';
        progress.style.backgroundColor = '#4CAF50';
        progressBar.appendChild(progress);
        
        progressUI.appendChild(progressBar);
        document.body.appendChild(progressUI);
    }
    
    function updateProgress(percent) {
        const progress = document.getElementById('export-progress');
        if (progress) {
            progress.style.width = `${percent * 100}%`;
        }
    }
    
    function hideProgressUI() {
        if (progressUI && progressUI.parentNode) {
            progressUI.parentNode.removeChild(progressUI);
        }
    }
    
    function disableCameraControls() {
        // Disable keyboard and mouse events
        document.body.style.pointerEvents = 'none';
    }
    
    function enableCameraControls() {
        // Enable keyboard and mouse events
        document.body.style.pointerEvents = 'auto';
    }
    
    function hideUIElements(keepPaths) {
        const uiElements = [];
        
        // Hide all menu containers
        const menus = document.querySelectorAll('[style*="position: absolute"]');
        menus.forEach(menu => {
            if (menu.style.display !== 'none') {
                uiElements.push({ element: menu, display: menu.style.display });
                menu.style.display = 'none';
            }
        });
        
        // Hide all buttons
        const buttons = document.querySelectorAll('button');
        buttons.forEach(button => {
            if (button.style.display !== 'none') {
                uiElements.push({ element: button, display: button.style.display });
                button.style.display = 'none';
            }
        });
        
        // Optionally hide paths
        if (!keepPaths) {
            scene.traverse(obj => {
                if (obj.isAnimationPath) {
                    uiElements.push({ element: obj, visible: obj.visible });
                    obj.visible = false;
                }
            });
        }
        
        return uiElements;
    }
    
    function restoreUIElements(uiElements) {
        uiElements.forEach(item => {
            if (item.element.isObject3D) {
                item.element.visible = item.visible;
            } else {
                item.element.style.display = item.display;
            }
        });
    }
    
    return { exportToGIF };
}