const TEXT_URL = 'https://raw.githubusercontent.com/ESWAT/john-carmack-plan-archive/refs/heads/master/by_year/johnc_plan_1996.txt';

const textContainer = document.getElementById('text-container') as HTMLDivElement;

// Load text and insert it inside the container
fetch(TEXT_URL)
    .then(response => response.text())
    .then(text => {
        textContainer.textContent = text;
    })
    .catch(error => console.error('Error loading text:', error));

// Smooth scrolling variables
let targetX = 0, targetY = 0;
let currentX = 0, currentY = 0;
const scrollSpeed = 10; // pixels to move per key press
const easeFactor = 0.1;

// Listen for WASD key presses to update target offset
document.addEventListener('keydown', (e) => {
    switch(e.key.toLowerCase()){
        case 'w': targetY += scrollSpeed; break;
        case 's': targetY -= scrollSpeed; break;
        case 'a': targetX += scrollSpeed; break;
        case 'd': targetX -= scrollSpeed; break;
    }
});

// Animation loop for smooth scrolling
function animate() {
    currentX += (targetX - currentX) * easeFactor;
    currentY += (targetY - currentY) * easeFactor;
    textContainer.style.transform = `translate(${currentX}px, ${currentY}px)`;
    requestAnimationFrame(animate);
}
animate();

// WebGPU: Initialize and clear the canvas
async function initWebGPU() {
    const canvas = document.getElementById('gpu-canvas') as HTMLCanvasElement;
    if (!navigator.gpu) {
        console.error("WebGPU not available.");
        return;
    }
  
    const adapter = await navigator.gpu.requestAdapter();
    if (!adapter) {
        console.error("Failed to get GPU adapter.");
        return;
    }
    const device = await adapter.requestDevice();
    const context = canvas.getContext("webgpu") as GPUCanvasContext;
  
    const canvasFormat = navigator.gpu.getPreferredCanvasFormat();
    context.configure({
        device: device,
        format: canvasFormat,
        alphaMode: 'opaque'
    });
  
    function frame() {
        const commandEncoder = device.createCommandEncoder();
        const textureView = context.getCurrentTexture().createView();
        const renderPass = commandEncoder.beginRenderPass({
            colorAttachments: [{
                view: textureView,
                clearValue: { r: 0, g: 0, b: 0, a: 1 },
                loadOp: "clear",
                storeOp: "store"
            }]
        });
        renderPass.end();
        device.queue.submit([commandEncoder.finish()]);
        requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
}

initWebGPU();
