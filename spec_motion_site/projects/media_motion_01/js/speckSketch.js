let uiFont;

let sq = { x: 0, y: 0, s: 0 };

const DESCRIPTION =
  "we want to stray from the obvious and popular and focus on things unnoticed, that people forget or take for granted.";

const SEDIMENT_CHARS = "speck";

let sediment = null;

function specSiteFontUrlSpeck(file) {
  if (typeof document === 'undefined') return '../fonts/' + file;
  const scripts = document.getElementsByTagName('script');
  for (let i = scripts.length - 1; i >= 0; i--) {
    const src = scripts[i].src;
    if (src && /\/speckSketch\.js(\?|#|$)/.test(src)) {
      try {
        return new URL(`../fonts/${file}`, src).href;
      } catch (e) {
        break;
      }
    }
  }
  return '../fonts/' + file;
}

function preload() {
  uiFont = loadFont(specSiteFontUrlSpeck('genwan_latin_092725_1-R.otf'));
}

function setup() {
  const s = Math.min(windowWidth, windowHeight);
  const side = Math.max(520, Math.floor(s));
  const cnv = createCanvas(side, side);
  cnv.parent(document.querySelector('main'));
  if (uiFont) textFont(uiFont);
  initSediment();
}

function windowResized() {
  const s = Math.min(windowWidth, windowHeight);
  const side = Math.max(520, Math.floor(s));
  resizeCanvas(side, side);
  initSediment();
}

function initSediment() {
  const side = Math.min(width, height);
  sq.s = side * 0.72;
  sq.x = width / 2 - sq.s / 2;
  sq.y = height / 2 - sq.s / 2;

  const cell = constrain(Math.floor(sq.s / 96), 5, 10);
  const cols = Math.max(20, Math.floor(sq.s / cell));
  const rows = Math.max(20, Math.floor(sq.s / cell));

  const maskG = createGraphics(cols, rows);
  maskG.pixelDensity(1);
  maskG.clear();
  maskG.push();
  maskG.noStroke();
  maskG.fill(255);
  maskG.textAlign(CENTER, CENTER);
  if (uiFont) maskG.textFont(uiFont);
  const maskSize = Math.max(7, Math.floor(rows * 0.12));
  maskG.textSize(maskSize);
  maskG.textLeading(Math.floor(maskSize * 1.2));
  maskG.text(DESCRIPTION, cols / 2, rows / 2, cols * 0.82, rows * 0.72);
  maskG.pop();
  maskG.loadPixels();

  const blocked0 = new Uint8Array(cols * rows);
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const idx = (y * cols + x) * 4;
      const a = maskG.pixels[idx + 3];
      blocked0[y * cols + x] = a > 10 ? 1 : 0;
    }
  }

  // Dilate the mask a bit so the white sentence has breathing room.
  const blocked = new Uint8Array(cols * rows);
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      let on = 0;
      for (let oy = -1; oy <= 1 && !on; oy++) {
        for (let ox = -1; ox <= 1; ox++) {
          const xx = x + ox;
          const yy = y + oy;
          if (xx < 0 || xx >= cols || yy < 0 || yy >= rows) continue;
          if (blocked0[yy * cols + xx]) {
            on = 1;
            break;
          }
        }
      }
      blocked[y * cols + x] = on;
    }
  }

  const filled = new Uint8Array(cols * rows);
  let allowed = 0;
  for (let i = 0; i < cols * rows; i++) if (!blocked[i]) allowed++;

  const g = createGraphics(width, height);
  g.pixelDensity(1);
  g.clear();
  if (uiFont) g.textFont(uiFont);
  g.textAlign(CENTER, CENTER);
  g.fill(0);
  g.noStroke();

  const sentence = {
    cx: sq.x + sq.s / 2,
    cy: sq.y + sq.s / 2,
    w: sq.s * 0.82,
    h: sq.s * 0.72,
    size: Math.max(12, sq.s * 0.045),
    leading: Math.floor(Math.max(12, sq.s * 0.045) * 1.25),
  };

  sediment = {
    cell,
    cols,
    rows,
    blocked,
    filled,
    allowed,
    filledCount: 0,
    g,
    particles: [],
    done: false,
    doneAtMs: 0,
    spawnPerFrame: 10,
    gravity: 0.22,
    maxVy: 3.2,
    sentence,
    // Sediment-driven rising fill:
    // `mass` increases as particles settle/absorb; we map that to rows of fill.
    mass: 0,
    massPerRow: Math.max(10, Math.floor(cols * 0.85)),
    liquidTopRow: rows, // rows == nothing filled yet (surface at bottom)
  };
}

function draw() {
  background(255);

  if (!sediment) return;

  // Update surface BEFORE stepping so particles collide with the current liquid level.
  {
    const fillRows0 = Math.max(0, Math.min(sediment.rows, Math.floor(sediment.mass / sediment.massPerRow)));
    sediment.liquidTopRow = Math.max(0, sediment.rows - fillRows0);
  }

  stepSediment();

  // Recompute after stepping (mass may have increased this frame).
  const fillRows = Math.max(0, Math.min(sediment.rows, Math.floor(sediment.mass / sediment.massPerRow)));
  const fillH = Math.min(sq.s, fillRows * sediment.cell);
  const p0 = constrain(fillH / sq.s, 0, 1);
  const sentenceA = constrain(map(p0, 0.12, 0.32, 0, 1), 0, 1);

  // Solid fill rising bottom->top (no gaps).
  noStroke();
  fill(0);
  rect(sq.x, sq.y + sq.s - fillH, sq.s, fillH);

  // Cut out the sentence region so the center stays white.
  push();
  erase();
  if (uiFont) textFont(uiFont);
  textAlign(CENTER, CENTER);
  textSize(sediment.sentence.size);
  textLeading(sediment.sentence.leading);
  text(
    DESCRIPTION,
    sediment.sentence.cx,
    sediment.sentence.cy,
    sediment.sentence.w,
    sediment.sentence.h
  );
  noErase();
  pop();

  // Add the sediment texture on top (still blocks the sentence area).
  noTint();
  image(sediment.g, 0, 0);

  // Draw falling particles so it visibly "rains" characters.
  push();
  if (uiFont) textFont(uiFont);
  textAlign(CENTER, CENTER);
  fill(0);
  noStroke();
  for (const fp of sediment.particles) {
    const rCell = Math.floor(fp.r);
    const cCell = Math.floor(fp.c);
    if (cCell >= 0 && cCell < sediment.cols && rCell >= 0 && rCell < sediment.rows) {
      const idx = rCell * sediment.cols + cCell;
      if (sediment.blocked[idx]) continue; // never draw into the sentence cutout
    }
    const x = sq.x + (fp.c + 0.5) * sediment.cell;
    const y = sq.y + (fp.r + 0.5) * sediment.cell;
    if (x < sq.x || x > sq.x + sq.s || y < sq.y - sediment.cell * 6 || y > sq.y + sq.s) continue;
    textSize(sediment.cell * 2.2);
    text(fp.ch, x, y);
  }
  pop();

  // Square outline on top
  noFill();
  stroke(0, 220);
  strokeWeight(3);
  rect(sq.x, sq.y, sq.s, sq.s);

  // Keep the sentence white (as a cutout + crisp overlay).
  if (sentenceA > 0) {
    push();
    fill(255, 255 * sentenceA);
    noStroke();
    textAlign(CENTER, CENTER);
    if (uiFont) textFont(uiFont);
    textSize(sediment.sentence.size);
    textLeading(sediment.sentence.leading);
    text(
      DESCRIPTION,
      sediment.sentence.cx,
      sediment.sentence.cy,
      sediment.sentence.w,
      sediment.sentence.h
    );
    pop();
  }
}

function stepSediment() {
  if (sediment.done) return;

  const dt = Math.min(40, Math.max(8, deltaTime));
  const d = dt / 16.6667;

  // Spawn particles at the top edge of the square.
  for (let i = 0; i < sediment.spawnPerFrame; i++) {
    const c = Math.floor(random(sediment.cols));
    const ch = SEDIMENT_CHARS.charAt(Math.floor(random(SEDIMENT_CHARS.length)));
    sediment.particles.push({
      c,
      r: -random(2, 10),
      vy: random(0.2, 1.0),
      ch,
    });
  }

  const isSolid = (c, r) => {
    if (c < 0 || c >= sediment.cols || r < 0 || r >= sediment.rows) return true;
    if (r >= sediment.liquidTopRow) return true;
    const idx = r * sediment.cols + c;
    return sediment.blocked[idx] || sediment.filled[idx];
  };

  const trySettle = (c, r, ch) => {
    const rClamp = Math.min(r, sediment.liquidTopRow - 1);
    if (rClamp < 0) return true;
    if (c < 0 || c >= sediment.cols || r < 0 || r >= sediment.rows) return true;
    const idx = rClamp * sediment.cols + c;
    if (sediment.blocked[idx] || sediment.filled[idx]) return true;
    sediment.filled[idx] = 1;
    sediment.filledCount++;
    sediment.mass++; // settling contributes to the rise

    const x = sq.x + (c + 0.5) * sediment.cell;
    const y = sq.y + (rClamp + 0.5) * sediment.cell;
    const fs = sediment.cell * random(1.7, 2.6);
    sediment.g.push();
    sediment.g.translate(x, y);
    sediment.g.rotate(random(-0.55, 0.55));
    sediment.g.textSize(fs);
    sediment.g.fill(0);
    sediment.g.noStroke();
    sediment.g.text(ch, 0, 0);
    sediment.g.pop();

    return true;
  };

  // Update particles (simple sand-ish settling with slight side-slip).
  for (let i = sediment.particles.length - 1; i >= 0; i--) {
    const p = sediment.particles[i];

    p.vy = Math.min(sediment.maxVy, p.vy + sediment.gravity * d);
    p.r += p.vy * d;

    if (p.r > sediment.rows + 12) {
      sediment.particles.splice(i, 1);
      continue;
    }

    const rCell = Math.floor(p.r);
    const rBelow = rCell + 1;

    // Absorb into the rising fill surface.
    if (rCell >= sediment.liquidTopRow - 1) {
      sediment.mass++;
      sediment.particles.splice(i, 1);
      continue;
    }

    // If we've reached the bottom, settle.
    if (rCell >= sediment.rows - 1) {
      trySettle(p.c, sediment.rows - 1, p.ch);
      sediment.particles.splice(i, 1);
      continue;
    }

    const belowSolid = isSolid(p.c, rBelow);
    if (!belowSolid) continue;

    // Side slip tries (helps pile around the text-hole).
    const leftOk = !isSolid(p.c - 1, rBelow) && !isSolid(p.c - 1, rCell);
    const rightOk = !isSolid(p.c + 1, rBelow) && !isSolid(p.c + 1, rCell);
    if (leftOk || rightOk) {
      if (leftOk && rightOk) p.c += random() < 0.5 ? -1 : 1;
      else if (leftOk) p.c -= 1;
      else p.c += 1;
      continue;
    }

    // Settle on the current cell.
    trySettle(p.c, Math.max(0, rCell), p.ch);
    sediment.particles.splice(i, 1);
  }

  if (sediment.liquidTopRow <= 0) {
    sediment.done = true;
    sediment.doneAtMs = millis();
  }
}
