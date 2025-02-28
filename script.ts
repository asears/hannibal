document.addEventListener('DOMContentLoaded', () => {
    const fileSelector = document.getElementById('fileSelector') as HTMLSelectElement;
    const content = document.getElementById('content') as HTMLDivElement;
    const gpuCanvas = document.getElementById('gpu-canvas') as HTMLCanvasElement;
    const gl = gpuCanvas.getContext('webgl') as WebGLRenderingContext;

    fileSelector.addEventListener('change', () => {
        const selectedFile = fileSelector.value;
        loadFile(selectedFile);
        reloadCanvas();
    });

    function loadFile(fileName: string) {
        content.classList.add('fade-out');
        fetch(`https://raw.githubusercontent.com/yourusername/yourrepo/main/${fileName}`)
            .then(response => response.text())
            .then(data => {
                setTimeout(() => {
                    content.innerHTML = data;
                    content.classList.remove('fade-out');
                    content.classList.add('fade-in');
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
