const TEXT_URL = 'https://raw.githubusercontent.com/ESWAT/john-carmack-plan-archive/refs/heads/master/by_year/johnc_plan_1996.txt';

const textContainer = document.getElementById('text-container') as HTMLDivElement;
const urlDisplay = document.createElement('div');
urlDisplay.style.position = 'absolute';
urlDisplay.style.bottom = '10px';
urlDisplay.style.left = '10px';
urlDisplay.style.color = '#A9A9A9';
document.body.appendChild(urlDisplay);

// Load text and insert it inside the container
function loadText(url: string) {
    fetch(url)
        .then(response => response.text())
        .then(text => {
            textContainer.textContent = text;
            urlDisplay.textContent = `Loaded URL: ${url}`;
        })
        .catch(error => console.error('Error loading text:', error));
}

loadText(TEXT_URL);

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

document.addEventListener('DOMContentLoaded', () => {
    const fileSelector = document.getElementById('fileSelector') as HTMLSelectElement;
    const content = document.getElementById('content') as HTMLDivElement;
    const gpuCanvas = document.getElementById('gpu-canvas') as HTMLCanvasElement;
    const gl = gpuCanvas.getContext('webgl') as WebGLRenderingContext;

    fileSelector.addEventListener('change', () => {
        const selectedFile = fileSelector.value;
        const fileUrl = `https://raw.githubusercontent.com/ESWAT/john-carmack-plan-archive/refs/heads/master/by_year/${selectedFile}`;
        loadFile(fileUrl);
        reloadCanvas();
    });

    function loadFile(fileUrl: string) {
        content.classList.add('fade-out');
        fetch(fileUrl)
            .then(response => response.text())
            .then(data => {
                setTimeout(() => {
                    // Clear the canvas
                    gl.clearColor(0.0, 0.0, 0.0, 1.0);
                    gl.clear(gl.COLOR_BUFFER_BIT);

                    // Insert line breaks for each * and + character
                    data = data.replace(/(\*|\+)/g, '$1<br>');

                    // Break after each header containing --- characters
                    data = data.replace(/---/g, '---<br>');

                    content.innerHTML = data;
                    content.classList.remove('fade-out');
                    content.classList.add('fade-in');
                    urlDisplay.textContent = `Loaded URL: ${fileUrl}`;
                }, 1000); // Wait for the fade-out effect to complete
            })
            .catch(error => console.error('Error loading file:', error));
    }

    function reloadCanvas() {
        // Clear the canvas
        gl.clearColor(0.0, 0.0, 0.0, 1.0);
        gl.clear(gl.COLOR_BUFFER_BIT);

        // Create a screen swipe effect
        const swipeWidth = gpuCanvas.width / 10;
        let swipePosition = 0;

        function drawSwipe() {
            gl.clearColor(0.5, 0.5, 0.5, 1.0); // Grey foreground
            gl.clear(gl.COLOR_BUFFER_BIT);

            gl.enable(gl.SCISSOR_TEST);
            gl.scissor(swipePosition, 0, swipeWidth, gpuCanvas.height);
            gl.clearColor(0.0, 0.0, 0.0, 1.0); // Black background
            gl.clear(gl.COLOR_BUFFER_BIT);
            gl.disable(gl.SCISSOR_TEST);

            swipePosition += swipeWidth;
            if (swipePosition < gpuCanvas.width) {
                requestAnimationFrame(drawSwipe);
            }
        }

        drawSwipe();
    }

    // Load the initial file
    loadFile(fileSelector.value);
    reloadCanvas();
});
