# Motion post 1.2

Hub: [`projects/media_motion_01/html/post1-2.html`](../projects/media_motion_01/html/post1-2.html) (also `spec_motion_site/post1-2.html` → same).

- **0** — Embedded notes: this file in an edit/preview iframe (`motion-post-1-2-doc.html`).
- **1** — Venn still-images gallery (`html/stills/post2-gallery-stills.html`) with 14 slides (2 grid slides + 12 still slides).
- **1.5** — Venn live-motions gallery (`html/stills/post2-gallery-1-5.html`) for zoom/overlap/media-pair/space sequences.
- **2** — design ideas gallery (`html/galleries/post1-2-gallery-2.html`): **Still 02→03** through **Still 07→08** live motions (same as 1.5 slides 2–7; hub hashes `#live-02-03` … `#live-07-08`), then Venn frames 4 and 5 (`#venn-frame-4`, `#venn-frame-5`).
- **2.5 · live motions design** — six-slide gallery (`html/galleries/post1-2-gallery-2-5.html`): same six motions as item **2** slides 1–6; hub `#live-motions-design`, deep links `#live-six-02-03` … `#live-six-07-08` (aliases `#2.5`, `#2a`, `#livesix`, `#venn-live-six`). All slides use **`liveMotionsDesign=1`**: motions **loop** (restart when each cycle finishes). Slide 1 also runs **speck-exclusive sediment** after the zoom; **POST2** sits below the speck label at full opacity. Item **2** does not use that flag.
- **2.7 · live motions design** — mostly the same as **2.5** (`html/galleries/post1-2-gallery-2-7.html`); hub **`#live-motions-design-2-7`**, **eleven** slides: **`#live-seven-02-03`**, **`#live-seven-02-03-in`** (**`motionZoomedIn=1`**, no zoom), **`#live-seven-03-04`**, **`#live-seven-3-5`** (duplicate **03→04** / **`motionSegment=34`**, between slides **3** and **4**), **`#live-seven-04-05`**, **`#live-seven-04-05-in`** (**`motionSpectrumSettled=1`**, **04→05** without rotation — post-Still-05 pose, phrase fade only), **`#live-seven-05-06`** … **`#live-seven-07-08`** (alias **`#2.7`**). **Every** slide uses **`liveMotionsDesign=1`** and **`liveMotions27=1`** so speck-exclusive sediment (**`23`**) and spectrum-isolated reader / phrase motion (**`45`**) use the same **2.7** tuning and **loop** restarts as the rest of the shell (compact frames **4–6** **`34`/`45`/`56`/`67`/`78`**).
- **3** — LiquidFun gallery cycling three demos (`liquidfun-phases/liquidfun-gallery.html`).
- **2a · world** — Circular bucket + fluid only, no Venn (`phase-3-speckliquid-world-only.html`).
- **2b · glyph** — One glyph breaks apart in the liquid (`phase-4-break-one-glyph-no-collision.html`).
- **2c · speck word** — “Speck” as letters in the circle (`phase-4-speck-word.html`).
- **3** — Same three-circle Venn as frame 1, with step-2 `initDemoWorld` fluid clipped to the top circle (`html/dev/venn-liquidfun-composite.html`).
