const imageInput = document.getElementById('image-input');
const imageCanvas = document.getElementById('image-canvas');
const imageCtx = imageCanvas.getContext('2d');
const imageCount = document.getElementById('image-count');

let model;

// Load the PoseNet model
async function loadModel() {
  model = await posenet.load({
    architecture: 'MobileNetV1',
    outputStride: 16,
    inputResolution: { width: 1280, height: 960 }, // Increased resolution
    multiplier: 0.75,
  });
  console.log('PoseNet model loaded!');
}

// Detect people in the uploaded image
imageInput.addEventListener('change', async (event) => {
  const file = event.target.files[0];
  if (!file) return;

  const img = new Image();
  img.onload = async () => {
    imageCanvas.width = img.width;
    imageCanvas.height = img.height;
    imageCtx.drawImage(img, 0, 0);

    // Estimate poses from the image
    const poses = await model.estimateMultiplePoses(imageCanvas, {
      flipHorizontal: false,
      maxDetections: 100,  // Increase max detections for crowded scenes
      scoreThreshold: 0.2,  // Lower threshold for detection
      nmsRadius: 20,
    });

    let count = 0;

    poses.forEach((pose) => {
      // We check for heads based on 'nose' or 'eye' keypoints
      const keypoint = pose.keypoints.find((kp) => kp.part === 'nose' && kp.score > 0.3);
      
      // Count people based on nose/keypoints with high confidence
      if (keypoint) {
        count++;
        const { x, y } = keypoint.position;

        // Draw a circle or bounding box for better visualization
        imageCtx.beginPath();
        imageCtx.arc(x, y, 200, 0, 2 * Math.PI);
        imageCtx.fillStyle = 'rgba(255, 0, 0, 0.01)';
        imageCtx.fill();

        // Label each person for identification
        imageCtx.fillStyle = '#FF0000';
        imageCtx.fillText(`Person ${count}`, x - 20, y - 30);
      }
    });

    // Update count display
    imageCount.textContent = count;
  };

  img.src = URL.createObjectURL(file);
});

// Initialize the app
(async function startApp() {
  await loadModel();
})();
