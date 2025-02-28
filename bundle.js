// index.ts
var TEXT_URL = "https://raw.githubusercontent.com/ESWAT/john-carmack-plan-archive/refs/heads/master/by_year/johnc_plan_1996.txt";
var navigator = window.navigator;
var textContainer = document.getElementById("text-container");
var urlDisplay = document.createElement("div");
urlDisplay.style.position = "absolute";
urlDisplay.style.bottom = "110px";
urlDisplay.style.top = "100px";
urlDisplay.style.left = "10px";
urlDisplay.style.color = "#A9A9A9";
document.body.appendChild(urlDisplay);
function loadText(url) {
  fetch(url).then((response) => response.text()).then((text) => {
    textContainer.textContent = text;
    urlDisplay.textContent = `Loaded URL: ${url}`;
  }).catch((error) => console.error("Error loading text:", error));
}
loadText(TEXT_URL);
var targetX = 0;
var targetY = 0;
var currentX = 0;
var currentY = 0;
var scrollSpeed = 10;
var easeFactor = 0.1;
document.addEventListener("keydown", (e) => {
  switch (e.key.toLowerCase()) {
    case "w":
      targetY += scrollSpeed;
      break;
    case "s":
      targetY -= scrollSpeed;
      break;
    case "a":
      targetX += scrollSpeed;
      break;
    case "d":
      targetX -= scrollSpeed;
      break;
  }
});
function animate() {
  currentX += (targetX - currentX) * easeFactor;
  currentY += (targetY - currentY) * easeFactor;
  textContainer.style.transform = `translate(${currentX}px, ${currentY}px)`;
  requestAnimationFrame(animate);
}
animate();
async function initWebGPU() {
  const canvas = document.getElementById("gpu-canvas");
  if (!canvas) {
    console.error("Canvas element not found.");
    return;
  }
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
  const context = canvas.getContext("webgpu");
  if (!context) {
    console.error("Failed to get WebGPU context.");
    return;
  }
  const canvasFormat = navigator.gpu.getPreferredCanvasFormat();
  try {
    context.configure({
      device,
      format: canvasFormat,
      alphaMode: "opaque"
    });
  } catch (error) {
    console.error("Failed to configure WebGPU context:", error);
    return;
  }
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
document.addEventListener("DOMContentLoaded", () => {
  const fileSelector = document.getElementById("fileSelector");
  const content = document.getElementById("content");
  const gpuCanvas = document.getElementById("gpu-canvas");
  const gl = gpuCanvas.getContext("webgl");
  fileSelector.style.display = "none";
  urlDisplay.style.display = "none";
  fileSelector.addEventListener("change", () => {
    const selectedFile = fileSelector.value;
    const fileUrl = `https://raw.githubusercontent.com/ESWAT/john-carmack-plan-archive/refs/heads/master/by_year/${selectedFile}`;
    loadFile(fileUrl);
    reloadCanvas();
    clearScreen();
  });
  function loadFile(fileUrl) {
    content.classList.add("fade-out");
    fetch(fileUrl).then((response) => response.text()).then((data) => {
      setTimeout(() => {
        gl.clearColor(0, 0, 0, 1);
        gl.clear(gl.COLOR_BUFFER_BIT);
        data = data.replace(/(\*|\+)/g, "$1<br>");
        data = data.replace(/---/g, "---<br>");
        content.innerHTML = data;
        content.classList.remove("fade-out");
        content.classList.add("fade-in");
        urlDisplay.textContent = `Loaded URL: ${fileUrl}`;
      }, 1000);
    }).catch((error) => console.error("Error loading file:", error));
  }
  function reloadCanvas() {
    gl.clearColor(0, 0, 0, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);
    const swipeWidth = gpuCanvas.width / 10;
    let swipePosition = 0;
    function drawSwipe() {
      gl.clearColor(0.5, 0.5, 0.5, 1);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.enable(gl.SCISSOR_TEST);
      gl.scissor(swipePosition, 0, swipeWidth, gpuCanvas.height);
      gl.clearColor(0, 0, 0, 1);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.disable(gl.SCISSOR_TEST);
      swipePosition += swipeWidth;
      if (swipePosition < gpuCanvas.width) {
        requestAnimationFrame(drawSwipe);
      }
    }
    drawSwipe();
  }
  function clearScreen() {
    content.innerHTML = "";
    gl.clearColor(0, 0, 0, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);
  }
  loadFile(fileSelector.value);
  reloadCanvas();
});
