// index.ts
var TEXT_URL = "https://raw.githubusercontent.com/ESWAT/john-carmack-plan-archive/refs/heads/master/by_year/johnc_plan_1996.txt";
var textContainer = document.getElementById("text-container");
fetch(TEXT_URL).then((response) => response.text()).then((text) => {
  textContainer.textContent = text;
}).catch((error) => console.error("Error loading text:", error));
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
  const canvasFormat = navigator.gpu.getPreferredCanvasFormat();
  context.configure({
    device,
    format: canvasFormat,
    alphaMode: "opaque"
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
