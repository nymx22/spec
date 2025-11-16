let originalImg;
let img;
let canvas;
let gridSize = 100; // Number of rows and columns
let canvasSize = 800;

const sliderRanges = {
  tileSize: { min: 1, max: 40, step: 1, default: 4 },
  circleScale: { min: 0.1, max: 10, step: 0.1, default: 1 },
  shapeIndex: { min: 0, max: 3, step: 1, default: 0 },
};

let params = {
  tileSize: sliderRanges.tileSize.default,
  circleScale: sliderRanges.circleScale.default,
  shapeIndex: sliderRanges.shapeIndex.default,
};

let gui;
let uploadInput, uploadLabel, uploadButton;

function preload() {
  // img = loadImage('image.png');
  originalImg = loadImage('spec0823_texture-1.png');
}

function setup() {
  canvasSize = Math.min(windowWidth, windowHeight);
  canvas = createCanvas(canvasSize, canvasSize);
  positionCanvasInWindow();
  gui = new dat.GUI();
  gui.add(params, 'tileSize', sliderRanges.tileSize.min, sliderRanges.tileSize.max, sliderRanges.tileSize.step)
    .name('Tile Size')
    .onChange(updateGrid);
  gui.add(params, 'circleScale', sliderRanges.circleScale.min, sliderRanges.circleScale.max, sliderRanges.circleScale.step)
    .name('Circle Scale');
  gui.add(params, 'shapeIndex', sliderRanges.shapeIndex.min, sliderRanges.shapeIndex.max, sliderRanges.shapeIndex.step)
    .name('Shape')
    .listen();
  button = createButton('save image');
  button.mousePressed(saveDrawing);
  positionButtonBelowGui();
  updateGrid();
  //noLoop(); // No continuous drawing needed
  
  // Remove any pre-existing upload input from HTML (if any)
  const oldInput = document.getElementById('img-upload');
  if (oldInput) oldInput.remove();
  const oldLabel = document.getElementById('upload-label');
  if (oldLabel) oldLabel.remove();
  const oldButton = document.getElementById('upload-button');
  if (oldButton) oldButton.remove();

  // Hidden file input
  uploadInput = createFileInput(handleImageUpload);
  uploadInput.id('img-upload');
  uploadInput.attribute('accept', 'image/*');
  uploadInput.style('display', 'none'); // Hide actual file input

  // Custom 'Upload Image' button
  uploadButton = createButton('Upload Image');
  uploadButton.id('upload-button');
  uploadButton.mousePressed(() => uploadInput.elt.click());
  uploadButton.style('display', 'inline-block');

  positionUploadControl();
}

function handleImageUpload(file) {
  if (!file || !file.data) return;
  loadImage(file.data, (loadedImg) => {
    if (loadedImg) {
      originalImg = loadedImg;
      updateGrid();
    } else {
      alert('Could not load image.');
    }
  });
}

function draw() {
  // background('blue');

  // let tileSize = canvasSize/gridSize;
  
  // for (let y = 0; y < gridSize; y++) {
  //   for (let x = 0; x < gridSize; x++) {
  //     // Get the brightness value of the pixel at (x, y)
  //     let i = (y * img.width + x) * 4;
  //     let r = img.pixels[i]; // Assuming grayscale, so use the red value

  //     let circleSize = r/255*tileSize;

  //     fill('red');
  //     stroke('green');
  //     strokeWeight(2);
  //     ellipse(x * tileSize + tileSize/2, y * tileSize + tileSize/2, circleSize, circleSize);
  //   }
  // }

  background('white');
  //the pixel shapes: dark values more squished, light values more stretched
  let tileSize = canvasSize/gridSize;
  
  for (let y = 0; y < gridSize; y++) {
    for (let x = 0; x < gridSize; x++) {
      // Get the brightness value of the pixel at (x, y)
      let i = (y * img.width + x) * 4;
      let r = img.pixels[i]; // Assuming grayscale, so use the red value

      r =r / 255 *200;
      r = 255 -r;

      let circleSize = (r/255*tileSize) * params.circleScale;

      const baseX = x * tileSize;
      const baseY = y * tileSize;

      drawShape(baseX, baseY, tileSize, circleSize);
    }
  }
}


function saveDrawing() {
  save("Picture.png");
}

function updateGrid() {
  gridSize = Math.max(1, Math.floor(canvasSize / params.tileSize));
  if (originalImg) {
    img = originalImg.get();
    img.resize(gridSize, gridSize);
    img.loadPixels();
  }
}

function windowResized() {
  canvasSize = Math.min(windowWidth, windowHeight);
  resizeCanvas(canvasSize, canvasSize);
  positionCanvasInWindow();
  updateGrid();
  if (typeof button !== 'undefined') {
    positionButtonBelowGui();
  }
  positionUploadControl();
}

function positionButtonBelowGui() {
  if (!gui || typeof button === 'undefined') return;
  const rect = gui.domElement.getBoundingClientRect();
  // Position button just below the GUI panel, aligned to its left edge
  button.position(rect.left, rect.bottom + 30);
}

function positionUploadControl() {
  if (!gui || !uploadInput || !uploadButton) return;
  const rect = gui.domElement.getBoundingClientRect();
  // Place Upload Image button just below GUI
  uploadButton.position(rect.left, rect.bottom + 24);
  if (typeof button !== 'undefined') {
    // Move save button further down
    button.position(rect.left, rect.bottom + 60);
  }
}

function positionCanvasInWindow() {
  if (!canvas) return;
  const x = (windowWidth - canvasSize) / 2;
  const y = (windowHeight - canvasSize) / 2;
  canvas.position(x, y);
}

function drawShape(baseX, baseY, tileSize, circleSize) {
  const centerX = baseX + tileSize / 2;
  const centerY = baseY + tileSize / 2;

  push();
  switch (params.shapeIndex) {
    case 1:
      noStroke();
      fill('black');
      ellipse(centerX, centerY, tileSize, circleSize);
      break;
    case 2:
      noStroke();
      fill('black');
      quad(
        centerX,
        centerY - circleSize / 2,
        centerX + tileSize / 2,
        centerY,
        centerX,
        centerY + circleSize / 2,
        centerX - tileSize / 2,
        centerY
      );
      break;
    case 3:
      noFill();
      stroke('black');
      strokeWeight(2);
      bezier(
        centerX - tileSize / 2,
        centerY - circleSize / 2,
        centerX - tileSize / 4,
        centerY,
        centerX + tileSize / 4,
        centerY,
        centerX + tileSize / 2,
        centerY + circleSize / 2
      );
      break;
    default:
      noStroke();
      fill('black');
      rect(baseX, centerY - circleSize / 2, tileSize, circleSize);
  }
  pop();
}