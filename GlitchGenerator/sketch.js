let originalImg;
let img;
let canvas;
let gridSize = 100; // Number of rows and columns
let canvasSize = 800;
let guiWidth = 0; // Will be 20% of window width or height depending on layout
let guiHeight = 0; // For mobile layout
const MIN_CANVAS_SIZE = 500;

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
  // Calculate responsive layout
  calculateLayout();
  
  canvas = createCanvas(canvasSize, canvasSize);
  positionCanvasAndGui();
  
  gui = new dat.GUI();
  gui.add(params, 'tileSize', sliderRanges.tileSize.min, sliderRanges.tileSize.max, sliderRanges.tileSize.step)
    .name('Tile Size')
    .onChange(updateGrid);
  gui.add(params, 'circleScale', sliderRanges.circleScale.min, sliderRanges.circleScale.max, sliderRanges.circleScale.step)
    .name('Circle Scale');
  gui.add(params, 'shapeIndex', sliderRanges.shapeIndex.min, sliderRanges.shapeIndex.max, sliderRanges.shapeIndex.step)
    .name('Shape')
    .listen();
  
  // Style the close button
  styleCloseButton();
  
  // Position GUI based on screen size
  if (windowWidth >= 768) {
    positionGuiInRightPanel();
  } else {
    positionGuiBelowCanvas();
  }
  
  button = createButton('Download');
  button.mousePressed(saveDrawing);
  positionButtonsInGui();
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
  uploadButton = createButton('Upload');
  uploadButton.id('upload-button');
  uploadButton.mousePressed(() => uploadInput.elt.click());
  uploadButton.style('display', 'inline-block');

  positionButtonsInGui();
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

function calculateLayout() {
  if (windowWidth >= 768) {
    // Desktop: 80% canvas, 20% GUI side-by-side
    const totalWidth = windowWidth;
    guiWidth = totalWidth * 0.2;
    canvasSize = Math.floor(totalWidth * 0.8);
    // Make canvas square, but respect minimum size
    canvasSize = Math.max(MIN_CANVAS_SIZE, Math.min(canvasSize, windowHeight));
    guiHeight = canvasSize; // GUI matches canvas height
  } else {
    // Mobile: full width canvas, GUI below taking 20% of viewport height
    // If viewport width is smaller than minimum, use full width
    if (windowWidth < MIN_CANVAS_SIZE) {
      canvasSize = windowWidth;
    } else {
      // Otherwise, use minimum size or available space (80% of height for canvas)
      canvasSize = Math.max(MIN_CANVAS_SIZE, Math.min(windowWidth, windowHeight * 0.8));
    }
    guiWidth = windowWidth; // GUI takes full width on mobile
    // GUI takes 20% of viewport height, but ensure it's at least enough for buttons
    const minGuiHeight = 250; // Minimum height to show controls + buttons
    guiHeight = Math.max(minGuiHeight, windowHeight * 0.2);
    // But don't exceed available space
    guiHeight = Math.min(guiHeight, windowHeight - canvasSize);
  }
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
  // Recalculate layout on resize
  calculateLayout();
  
  resizeCanvas(canvasSize, canvasSize);
  positionCanvasAndGui();
  
  // Position GUI based on screen size
  // Use a small delay to ensure canvas resize is complete
  setTimeout(() => {
    if (windowWidth >= 768) {
      positionGuiInRightPanel();
    } else {
      positionGuiBelowCanvas();
    }
    
    // Restyle close button after resize
    styleCloseButton();
    
    positionButtonsInGui();
  }, 10);
  
  updateGrid();
}

function positionCanvasAndGui() {
  if (!canvas) return;
  if (windowWidth >= 768) {
    // Desktop: canvas on the left, centered vertically
    const x = 0;
    const y = (windowHeight - canvasSize) / 2;
    canvas.position(x, y);
  } else {
    // Mobile: canvas centered horizontally, at top
    const x = (windowWidth - canvasSize) / 2;
    const y = 0;
    canvas.position(x, y);
  }
}

function positionGuiInRightPanel() {
  if (!gui) return;
  const el = gui.domElement;
  // Position GUI in the right 20% panel (desktop)
  const guiX = canvasSize; // Right edge of canvas
  const guiY = (windowHeight - canvasSize) / 2; // Align with canvas top
  
  // Ensure canvasSize is up to date (recalculate if needed)
  const currentCanvasSize = canvasSize;
  
  el.style.position = 'absolute';
  el.style.left = `${guiX}px`;
  el.style.top = `${guiY}px`;
  el.style.width = `${guiWidth}px`;
  el.style.maxWidth = 'none';
  el.style.height = `${currentCanvasSize}px`; // Match canvas height
  el.style.minHeight = `${currentCanvasSize}px`; // Ensure minimum height
  el.style.maxHeight = `${currentCanvasSize}px`; // Ensure maximum height
  el.style.overflowY = 'auto'; // Allow scrolling if content exceeds height
  el.style.overflowX = 'hidden';
  el.style.zIndex = '10';
}

function positionGuiBelowCanvas() {
  if (!gui) return;
  const el = gui.domElement;
  // Position GUI below canvas on mobile, taking 20% of viewport height
  const guiX = 0; // Full width
  const guiY = canvasSize; // Below canvas
  
  el.style.position = 'absolute';
  el.style.left = `${guiX}px`;
  el.style.top = `${guiY}px`;
  el.style.width = `${guiWidth}px`;
  el.style.maxWidth = 'none';
  el.style.height = `${guiHeight}px`;
  el.style.maxHeight = `${windowHeight - canvasSize}px`; // Don't exceed available space
  el.style.overflowY = 'auto';
  el.style.overflowX = 'hidden';
  el.style.zIndex = '10';
  // Ensure scrolling works
  el.style.webkitOverflowScrolling = 'touch';
}

function styleCloseButton() {
  if (!gui) return;
  
  // Use setTimeout to ensure GUI is fully rendered
  setTimeout(() => {
    const el = gui.domElement;
    if (!el) return;
    
    // Find the close button (dat.GUI uses .close-button or .close-top class)
    const closeButton = el.querySelector('.close-button') || 
                        el.querySelector('.close-top') || 
                        el.querySelector('.close-bottom') ||
                        el.querySelector('button[title*="close" i]') ||
                        el.querySelector('button[title*="Close" i]');
    
    if (closeButton) {
      // Move close button to the end (after all sliders and controls)
      el.appendChild(closeButton);
      
      // Style close button to match full GUI width
      closeButton.style.width = '100%';
      closeButton.style.marginTop = '10px';
      closeButton.style.marginBottom = '0';
      closeButton.style.marginLeft = '0';
      closeButton.style.marginRight = '0';
      closeButton.style.boxSizing = 'border-box';
      closeButton.style.display = 'block';
    }
  }, 150);
}

function positionButtonsInGui() {
  if (!gui) return;
  const el = gui.domElement;
  
  if (windowWidth >= 768) {
    // Desktop: buttons inside GUI panel
    // Remove buttons from mobile container if they exist
    const mobileContainer = document.getElementById('gui-button-container-mobile');
    if (mobileContainer) {
      if (typeof button !== 'undefined' && button.elt && button.elt.parentNode === mobileContainer) {
        mobileContainer.removeChild(button.elt);
      }
      if (uploadButton && uploadButton.elt && uploadButton.elt.parentNode === mobileContainer) {
        mobileContainer.removeChild(uploadButton.elt);
      }
      mobileContainer.remove();
    }
    
    // Create a container div for buttons inside GUI (desktop)
    setTimeout(() => {
      if (!el) return;
      
      let buttonContainer = document.getElementById('gui-button-container-desktop');
      if (buttonContainer && buttonContainer.parentNode !== el) {
        buttonContainer.remove();
        buttonContainer = null;
      }
      if (!buttonContainer) {
        buttonContainer = document.createElement('div');
        buttonContainer.id = 'gui-button-container-desktop';
        buttonContainer.style.marginTop = '20px';
        buttonContainer.style.padding = '10px';
        buttonContainer.style.width = '100%';
        buttonContainer.style.boxSizing = 'border-box';
        el.appendChild(buttonContainer);
      }
      
      // Append buttons to container
      if (typeof button !== 'undefined' && button.elt) {
        if (button.elt.parentNode !== buttonContainer) {
          if (button.elt.parentNode) {
            button.elt.parentNode.removeChild(button.elt);
          }
          buttonContainer.appendChild(button.elt);
        }
        // Style button to be a block element within GUI
        button.elt.style.position = 'relative';
        button.elt.style.display = 'block';
        button.elt.style.width = '100%';
        button.elt.style.marginBottom = '10px';
        button.elt.style.marginLeft = '0';
        button.elt.style.marginTop = '0';
        button.elt.style.left = 'auto';
        button.elt.style.top = 'auto';
      }
      
      if (uploadButton && uploadButton.elt) {
        if (uploadButton.elt.parentNode !== buttonContainer) {
          if (uploadButton.elt.parentNode) {
            uploadButton.elt.parentNode.removeChild(uploadButton.elt);
          }
          buttonContainer.appendChild(uploadButton.elt);
        }
        // Style button to be a block element within GUI
        uploadButton.elt.style.position = 'relative';
        uploadButton.elt.style.display = 'block';
        uploadButton.elt.style.width = '100%';
        uploadButton.elt.style.marginLeft = '0';
        uploadButton.elt.style.marginTop = '0';
        uploadButton.elt.style.left = 'auto';
        uploadButton.elt.style.top = 'auto';
      }
    }, 100);
  } else {
    // Mobile: buttons inside GUI panel below controls
    // Remove buttons from desktop container if they exist
    const desktopContainer = document.getElementById('gui-button-container-desktop');
    if (desktopContainer) {
      if (typeof button !== 'undefined' && button.elt && button.elt.parentNode === desktopContainer) {
        desktopContainer.removeChild(button.elt);
      }
      if (uploadButton && uploadButton.elt && uploadButton.elt.parentNode === desktopContainer) {
        desktopContainer.removeChild(uploadButton.elt);
      }
      desktopContainer.remove();
    }
    
    // Append buttons to GUI element so they scroll with it
    setTimeout(() => {
      if (!el) return;
      
      // Remove buttons from their current parent if they exist
      if (typeof button !== 'undefined' && button.elt) {
        if (button.elt.parentNode && button.elt.parentNode !== el) {
          button.elt.parentNode.removeChild(button.elt);
        }
      }
      if (uploadButton && uploadButton.elt) {
        if (uploadButton.elt.parentNode && uploadButton.elt.parentNode !== el) {
          uploadButton.elt.parentNode.removeChild(uploadButton.elt);
        }
      }
      
      // Create a container div for buttons inside GUI
      let buttonContainer = document.getElementById('gui-button-container-mobile');
      if (buttonContainer && buttonContainer.parentNode !== el) {
        buttonContainer.remove();
        buttonContainer = null;
      }
      if (!buttonContainer) {
        buttonContainer = document.createElement('div');
        buttonContainer.id = 'gui-button-container-mobile';
        buttonContainer.style.marginTop = '20px';
        buttonContainer.style.padding = '10px';
        buttonContainer.style.width = '100%';
        buttonContainer.style.boxSizing = 'border-box';
        el.appendChild(buttonContainer);
      }
      
      // Append buttons to container
      if (typeof button !== 'undefined' && button.elt) {
        if (button.elt.parentNode !== buttonContainer) {
          buttonContainer.appendChild(button.elt);
        }
        // Style button to be a block element within GUI
        button.elt.style.position = 'relative';
        button.elt.style.display = 'block';
        button.elt.style.width = '100%';
        button.elt.style.marginBottom = '10px';
        button.elt.style.marginLeft = '0';
        button.elt.style.marginTop = '0';
        button.elt.style.left = 'auto';
        button.elt.style.top = 'auto';
        button.elt.style.pointerEvents = 'auto';
        button.elt.style.zIndex = 'auto';
      }
      
      if (uploadButton && uploadButton.elt) {
        if (uploadButton.elt.parentNode !== buttonContainer) {
          buttonContainer.appendChild(uploadButton.elt);
        }
        // Style button to be a block element within GUI
        uploadButton.elt.style.position = 'relative';
        uploadButton.elt.style.display = 'block';
        uploadButton.elt.style.width = '100%';
        uploadButton.elt.style.marginLeft = '0';
        uploadButton.elt.style.marginTop = '0';
        uploadButton.elt.style.left = 'auto';
        uploadButton.elt.style.top = 'auto';
        uploadButton.elt.style.pointerEvents = 'auto';
        uploadButton.elt.style.zIndex = 'auto';
      }
    }, 200);
  }
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