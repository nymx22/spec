let img;
let gridSize = 100; // Number of rows and columns
let canvasSize = 800;

function preload() {
 // img = loadImage('image.png');
 img = loadImage('spec0823_texture-1.png');
  
  
}

function setup() {
  createCanvas(canvasSize, canvasSize);
  button = createButton('save image');
  button.position(10, 410);
  button.mousePressed(saveDrawing);
  img.resize(gridSize, gridSize);
  img.loadPixels(); // Load the pixels of the resized image
  noLoop(); // No continuous drawing needed
  
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

      let circleSize = r/255*tileSize;

      fill('black');
    
      noStroke();
      rect(x * tileSize + tileSize/2, y * tileSize - circleSize/2, tileSize, circleSize);
    }
  }
}


function saveDrawing() {
  save("Picture.png");
}