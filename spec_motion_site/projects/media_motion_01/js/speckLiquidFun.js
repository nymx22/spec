/**
 * Speck word: Matter.js letters → per-letter break → LiquidFun particles (shared world).
 * Matter uses +Y down; Box2D uses +Y up — we map (mx, my) ↔ (mx, -my).
 */
(function () {
  const MAX_PARTICLES_TOTAL = 5000;
  const LETTERS_IN_SPECK = 5;
  const PER_LETTER_CAP = Math.floor(MAX_PARTICLES_TOTAL / LETTERS_IN_SPECK);
  const PARTICLE_RADIUS = 4;
  const ALPHA_THRESHOLD = 200;
  const MIN_SAMPLE_DIST = 5;
  const MAX_RANDOM_TRIES = 8000;
  const WALL_SEGS = 48;
  const SPLASH_SPEED_SCALE = 0.045;
  const SPLASH_MAX = 0.9;

  let LF = null;
  let lfWorld = null;
  let particleSystem = null;
  let totalSpawned = 0;
  let breaking = new Set();
  let lfAccMs = 0;
  let maskG = null;
  let maskFont = null;
  let maskTextSize = 24;
  let matterStartedAt = 0;
  const BREAK_GRACE_MS = 750;
  const BREAK_MIN_ACTIVITY = 0.16;

  /** Box2D Step(velIters, posIters); lfSimSpeed = physics substeps per 1/60s bucket (demo can use >1). */
  let lfStepV = 8;
  let lfStepP = 3;
  let lfSimSpeed = 1;
  let lfMaxSubsteps = 4;
  // Additional per-step velocity damping (air resistance) applied to particle velocities.
  let lfAirDrag = 0;
  // Extra damping for upward-moving particles (helps suppress high pop-back after collisions).
  let lfUpwardExtraDrag = 0;

  function available() {
    return typeof window !== 'undefined' && window.liquidfun && window.liquidfun.b2World;
  }

  function matterToLf(x, y) {
    return { x, y: -y };
  }

  function lfToMatter(x, y) {
    return { x, y: -y };
  }

  function withLfWorld(w, fn) {
    const g = typeof world !== 'undefined' ? world : undefined;
    world = w;
    try {
      return fn();
    } finally {
      world = g;
    }
  }

  function velocityAtWorldPointMatter(body, wx, wy) {
    const dx = wx - body.position.x;
    const dy = wy - body.position.y;
    return {
      x: body.velocity.x - dy * body.angularVelocity,
      y: body.velocity.y + dx * body.angularVelocity,
    };
  }

  function addCircleWallLF(b2w, cx, cy, radiusMatter, frictionOpt, restitutionOpt) {
    const chain = new LF.b2ChainShape();
    for (let i = 0; i < WALL_SEGS; i++) {
      const a = (i / WALL_SEGS) * Math.PI * 2;
      const mx = cx + Math.cos(a) * radiusMatter;
      const my = cy + Math.sin(a) * radiusMatter;
      const p = matterToLf(mx, my);
      chain.vertices.push(new LF.b2Vec2(p.x, p.y));
    }
    chain.CreateLoop();
    const bd = new LF.b2BodyDef();
    bd.position = new LF.b2Vec2(0, 0);
    const body = b2w.CreateBody(bd);
    const fd = new LF.b2FixtureDef();
    fd.shape = chain;
    fd.friction = frictionOpt != null ? frictionOpt : 0.12;
    fd.restitution = restitutionOpt != null ? restitutionOpt : 0.03;
    fd.density = 0;
    withLfWorld(b2w, () => body.CreateFixtureFromDef(fd));
  }

  function destroyInternal() {
    lfAccMs = 0;
    lfStepV = 8;
    lfStepP = 3;
    lfSimSpeed = 1;
    lfMaxSubsteps = 4;
    lfAirDrag = 0;
    lfUpwardExtraDrag = 0;
    breaking.clear();
    totalSpawned = 0;
    maskG = null;
    if (lfWorld && particleSystem) {
      try {
        lfWorld.DestroyParticleSystem(particleSystem);
      } catch (e) {}
    }
    particleSystem = null;
    if (lfWorld) {
      const bodies = lfWorld.bodies.slice();
      for (const b of bodies) {
        try {
          lfWorld.DestroyBody(b);
        } catch (e2) {}
      }
    }
    lfWorld = null;
    LF = null;
  }

  /**
   * @param {object} o
   * @param {Array<{x:number,y:number}>} o.targets
   * @param {number} o.rFinal
   * @param {number} o.gravityY matter gravity (positive down)
   * @param {number} o.bottomCirclePad
   */
  function initWorld(o) {
    if (!available()) return false;
    destroyInternal();
    LF = window.liquidfun;
    const g = matterToLf(0, o.gravityY);
    lfWorld = new LF.b2World(new LF.b2Vec2(g.x, g.y));

    const psd = new LF.b2ParticleSystemDef();
    psd.radius = PARTICLE_RADIUS;
    psd.dampingStrength = 0.85;
    psd.viscousStrength = 0.25;
    psd.elasticStrength = 0.58;
    psd.springStrength = 0.58;
    psd.repulsiveStrength = 1.15;
    psd.pressureStrength = 0.48;
    psd.powderStrength = 0.25;
    psd.surfaceTensionNormalStrength = 0.08;
    psd.surfaceTensionPressureStrength = 0.08;
    particleSystem = lfWorld.CreateParticleSystem(psd);
    particleSystem.SetRadius(PARTICLE_RADIUS);
    particleSystem.SetDamping(0.72);

    const t = o.targets;
    const r = o.rFinal;
    const pad = o.bottomCirclePad || 0;
    withLfWorld(lfWorld, () => {
      addCircleWallLF(lfWorld, t[0].x, t[0].y, r);
      addCircleWallLF(lfWorld, t[1].x, t[1].y, r + pad);
      addCircleWallLF(lfWorld, t[2].x, t[2].y, r + pad);
    });

    matterStartedAt = typeof performance !== 'undefined' ? performance.now() : Date.now();
    lfStepV = 8;
    lfStepP = 3;
    lfSimSpeed = 1;
    lfMaxSubsteps = 4;
    lfAirDrag = 0;
    lfUpwardExtraDrag = 0;
    return true;
  }

  /**
   * post1.2 · 2 / isolated demo: one circular bucket + viscous water blob (Matter-style +Y down).
   * No Matter.js. Coordinates match p5 canvas pixels (x right, y down).
   * @param {{ width:number, height:number, gravityY?: number }} o
   * Tuned for snappy motion at pixel scale: strong gravity, low drag, slippery walls, extra Step iters + sim speed.
   */
  function initDemoWorld(o) {
    if (!available()) return false;
    destroyInternal();
    LF = window.liquidfun;
    const gy = o.gravityY != null ? o.gravityY : 25;
    const g = matterToLf(0, gy);
    lfWorld = new LF.b2World(new LF.b2Vec2(g.x, g.y));

    const demoRadius = 3.2;
    const psd = new LF.b2ParticleSystemDef();
    psd.radius = demoRadius;
    psd.dampingStrength = 0.6;
    psd.viscousStrength = 0.2;
    psd.elasticStrength = 0.01;
    psd.springStrength = 0.01;
    psd.repulsiveStrength = 0.0;
    psd.pressureStrength = 0.04;
    psd.powderStrength = 0.2;
    psd.surfaceTensionNormalStrength = 0.02;
    psd.surfaceTensionPressureStrength = 0.02;
    particleSystem = lfWorld.CreateParticleSystem(psd);
    particleSystem.SetRadius(demoRadius);
    particleSystem.SetDamping(0.72);

    lfStepV = 17;
    lfStepP = 6;
    lfSimSpeed = 5;
    lfMaxSubsteps = 4;
    lfAirDrag = 0.005;
    lfUpwardExtraDrag = 0.02;

    const w = o.width;
    const h = o.height;
    const cx = w / 2;
    const cy = h / 2;
    const wallR = Math.min(w, h) * 0.38;
    withLfWorld(lfWorld, () => addCircleWallLF(lfWorld, cx, cy, wallR, 0.35, 0.20));

    const mx = cx;
    const my = cy - wallR * 0.42;
    const pLF = matterToLf(mx, my);
    const circle = new LF.b2CircleShape();
    circle.position.Set(pLF.x, pLF.y);
    circle.radius = Math.min(w, h) * 0.07;
    const pgd = new LF.b2ParticleGroupDef();
    pgd.shape = circle;
    pgd.color = new LF.b2ParticleColor(30, 100, 220, 255);
    pgd.flags = LF.b2_waterParticle;
    particleSystem.CreateParticleGroup(pgd);

    matterStartedAt = 0;
    return true;
  }

  function ensureMask(font, textSizePx) {
    if (typeof createGraphics !== 'function') return null;
    if (maskG && maskFont === font && maskTextSize === textSizePx) return maskG;
    maskFont = font;
    maskTextSize = textSizePx;
    const w = Math.ceil(textSizePx * 2.2);
    const h = Math.ceil(textSizePx * 2);
    maskG = createGraphics(w, h);
    maskG.pixelDensity(1);
    return maskG;
  }

  function sampleGlyphWorldPoints(ch, font, textSizePx, body, collisionNormalMatter) {
    const g = ensureMask(font, textSizePx);
    if (!g) return [];
    const gw = g.width;
    const gh = g.height;
    g.clear();
    g.background(0, 0, 0, 0);
    g.textFont(font);
    g.textSize(textSizePx);
    g.textAlign(3, 3);
    g.noStroke();
    g.fill(255, 255, 255, 255);
    g.text(ch, gw / 2, gh / 2);
    g.loadPixels();

    const px = g.pixels;
    const inside = [];
    for (let j = 0; j < gh; j++) {
      for (let i = 0; i < gw; i++) {
        const idx = (j * gw + i) * 4;
        const a = px[idx + 3];
        if (a >= ALPHA_THRESHOLD) inside.push({ iu: i + 0.5, iv: j + 0.5 });
      }
    }
    if (inside.length === 0) return [];

    const quota = Math.min(PER_LETTER_CAP, Math.max(0, MAX_PARTICLES_TOTAL - totalSpawned));
    const accepted = [];
    const cos = Math.cos(body.angle);
    const sin = Math.sin(body.angle);
    const cx = body.position.x;
    const cy = body.position.y;

    let tries = 0;
    while (accepted.length < quota && tries < MAX_RANDOM_TRIES) {
      tries++;
      const s = inside[(Math.random() * inside.length) | 0];
      const lx = s.iu - gw / 2;
      const ly = s.iv - gh / 2;
      let ok = true;
      for (const q of accepted) {
        const d = (q.lx - lx) * (q.lx - lx) + (q.ly - ly) * (q.ly - ly);
        if (d < MIN_SAMPLE_DIST * MIN_SAMPLE_DIST) {
          ok = false;
          break;
        }
      }
      if (!ok) continue;
      accepted.push({ lx, ly });
    }

    const nx = collisionNormalMatter ? collisionNormalMatter.x : 0;
    const ny = collisionNormalMatter ? collisionNormalMatter.y : 0;
    const vcm = body.velocity;
    const impact = Math.abs(vcm.x * nx + vcm.y * ny);
    const splash = Math.min(SPLASH_MAX, impact * SPLASH_SPEED_SCALE);

    const out = [];
    for (const { lx, ly } of accepted) {
      const wx = cx + cos * lx - sin * ly;
      const wy = cy + sin * lx + cos * ly;
      const vm = velocityAtWorldPointMatter(body, wx, wy);
      vm.x += nx * splash;
      vm.y += ny * splash;
      out.push({ wx, wy, vx: vm.x, vy: vm.y });
    }
    return out;
  }

  /**
   * @param {object} body letter Matter body
   * @param {object} p5Inst
   * @param {p5.Font} font
   * @param {number} textSizePx
   * @param {object|null} normalMatter optional {x,y} world normal for splash
   */
  function breakLetterBody(body, ch, font, textSizePx, normalMatter, matterWorld, speckBodies) {
    if (!particleSystem || !lfWorld || breaking.has(body.id)) return;
    const now = typeof performance !== 'undefined' ? performance.now() : Date.now();
    if (now - matterStartedAt < BREAK_GRACE_MS) return;
    breaking.add(body.id);

    const pts = sampleGlyphWorldPoints(ch, font, textSizePx, body, normalMatter);
    const pd = new LF.b2ParticleDef();
    pd.flags = LF.b2_waterParticle | LF.b2_viscousParticle;
    pd.group = 0;
    pd.lifetime = 0;
    pd.color = new LF.b2ParticleColor(255, 255, 255, 255);
    pd.userData = 0;

    for (const p of pts) {
      if (totalSpawned >= MAX_PARTICLES_TOTAL) break;
      const lf = matterToLf(p.wx, p.wy);
      const vl = matterToLf(p.vx, p.vy);
      pd.position = new LF.b2Vec2(lf.x, lf.y);
      pd.velocity = new LF.b2Vec2(vl.x, vl.y);
      particleSystem.CreateParticle(pd);
      totalSpawned++;
    }

    const idx = speckBodies.findIndex((e) => e.body === body);
    if (idx >= 0) speckBodies.splice(idx, 1);
    window.Matter.World.remove(matterWorld, body);
  }

  /**
   * @param {Matter.Pair[]} pairs
   */
  function wallNormalTowardLetter(wallBody, letterBody) {
    const b = wallBody.bounds;
    const wcx = (b.min.x + b.max.x) * 0.5;
    const wcy = (b.min.y + b.max.y) * 0.5;
    let nx = letterBody.position.x - wcx;
    let ny = letterBody.position.y - wcy;
    const h = Math.hypot(nx, ny) || 1;
    return { x: nx / h, y: ny / h };
  }

  function handleCollisions(pairs, font, textSizePx, matterWorld, speckBodies, speckWalls) {
    if (!particleSystem || !pairs || !speckWalls) return;
    for (const pair of pairs) {
      const a = pair.bodyA;
      const b = pair.bodyB;
      const wallA = speckWalls.indexOf(a) >= 0;
      const wallB = speckWalls.indexOf(b) >= 0;
      const letterBody = wallA && !wallB ? b : wallB && !wallA ? a : null;
      if (!letterBody) continue;
      const wallBody = wallA ? a : b;
      const entry = speckBodies.find((e) => e.body === letterBody);
      if (!entry) continue;

      const activity =
        Math.hypot(letterBody.velocity.x, letterBody.velocity.y) +
        Math.abs(letterBody.angularVelocity) * 22;
      if (activity < BREAK_MIN_ACTIVITY) continue;

      let nx = 0;
      let ny = 0;
      const coll = pair.collision;
      if (coll && coll.normal) {
        nx = coll.normal.x;
        ny = coll.normal.y;
        const toward = wallNormalTowardLetter(wallBody, letterBody);
        if (nx * toward.x + ny * toward.y < 0) {
          nx = -nx;
          ny = -ny;
        }
      } else {
        const t = wallNormalTowardLetter(wallBody, letterBody);
        nx = t.x;
        ny = t.y;
      }

      breakLetterBody(letterBody, entry.ch, font, textSizePx, { x: nx, y: ny }, matterWorld, speckBodies);
    }
  }

  function step(dtMs) {
    if (!lfWorld || !particleSystem) return;
    const h = 1000 / 60;
    lfAccMs += dtMs;
    let n = 0;
    while (lfAccMs >= h && n < lfMaxSubsteps) {
      for (let r = 0; r < lfSimSpeed; r++) {
        lfWorld.Step(1 / 60, lfStepV, lfStepP);
        if (lfAirDrag > 0 || lfUpwardExtraDrag > 0) {
          const vel = particleSystem.GetVelocityBuffer();
          if (vel && vel.length >= 2) {
            for (let i = 0; i < vel.length; i += 2) {
              // Box2D Y-up: vy > 0 means upward movement.
              const vy = vel[i + 1];
              const extra = vy > 0 ? lfUpwardExtraDrag : 0;
              const mul = Math.max(0, 1 - lfAirDrag - extra);
              vel[i] *= mul;
              vel[i + 1] *= mul;
            }
          }
        }
      }
      lfAccMs -= h;
      n++;
    }
  }

  /**
   * @param {number} [fr=255] fill R (post2 speck uses default white)
   * @param {number} [fg=255]
   * @param {number} [fb=255]
   */
  function drawParticles(fr, fg, fb) {
    if (!particleSystem) return;
    const buf = particleSystem.GetPositionBuffer();
    const vbuf = particleSystem.GetVelocityBuffer();
    const r = particleSystem.radius;
    if (!buf || buf.length < 2) return;

    const R = fr == null ? 255 : fr;
    const G = fg == null ? 255 : fg;
    const B = fb == null ? 255 : fb;

    noStroke();
    for (let i = 0; i < buf.length; i += 2) {
      const m = lfToMatter(buf[i], buf[i + 1]);
      const vx = vbuf[i];
      const vy = -vbuf[i + 1];
      const speed = Math.hypot(vx, vy);
      const alpha = constrain(210 + speed * 14, 220, 255);
      const j = (i >> 1) % 7;
      const vr = 1 + j * 0.02;
      fill(R, G, B, alpha);
      circle(m.x, m.y, r * 2 * vr);
    }
  }

  function hasParticles() {
    return particleSystem && particleSystem.GetPositionBuffer().length >= 2;
  }

  window.SpecSpeckLiquid = {
    available,
    initWorld,
    initDemoWorld,
    destroy: destroyInternal,
    handleCollisions,
    step,
    drawParticles,
    hasParticles,
  };
})();
