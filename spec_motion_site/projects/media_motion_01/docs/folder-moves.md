# Safe Folder Moves

## Rules
- Search for a file's name before moving it
- Move one file at a time, test after each
- Never move and rename in the same step
- Commit before you start each session

---

## ~~Step 1 — Create `js/modules/`~~ ✓ Done
## ~~Step 2 — Move `docs/`~~ ✓ Done
## ~~Step 3 — Move `assets/spec-logo.png`~~ ✓ Done
`sketch.js` path already updated to `'../assets/spec-logo.png'`

---

## Step 4 — Commit what you have now
**Risk: none · Do this before anything else**

Moves from steps 2 and 3 are sitting uncommitted. If something breaks later
you have no clean rollback point.

```
git add spec_motion_site/projects/media_motion_01/assets/
git add spec_motion_site/projects/media_motion_01/docs/
git add spec_motion_site/projects/media_motion_01/js/sketch.js
git rm spec_motion_site/assets/spec-logo.png
git rm spec_motion_site/docs/MOTION_POST_1_2.md
git commit -m "move assets and docs into media_motion_01"
```

---

## Step 5 — Clean up `about/`
**Risk: none**

`spec_motion_site/about/` only has a `.gitkeep` placeholder.
Delete the folder if the about page isn't being built soon.

```
spec_motion_site/about/   ←  delete
```

If you plan to build it, leave it and add `index.html` when ready.

---

## Step 6 — Move `fonts/` into `media_motion_01/`
**Risk: medium · Path updates: 3 JS files**

`fonts/` lives at site level but is only ever used by `media_motion_01`.
Moving it closer to what uses it makes the project self-contained.

Move:
```
spec_motion_site/fonts/   →   spec_motion_site/projects/media_motion_01/fonts/
```

Then update the font URL helper in all three JS files.
Each file has the same pattern — find this line:

```js
return '../fonts/' + file;
```

And the dynamic URL line:
```js
return new URL(`../../../fonts/${file}`, src).href;
```

Change both to:
```js
return '../fonts/' + file;                          // stays the same
return new URL(`../fonts/${file}`, src).href;       // remove two ../
```

Files to update:
- `js/sketch.js`
- `js/speckSketch.js`
- `js/vennLiquidFunComposite.js`

Test: open any gallery page and confirm text renders with the custom font.

---

## Step 7 — Group stills pages into `html/stills/`
**Risk: medium · Path updates: several files**

These four files are all stills-only views with no outbound links of their own:

```
html/post2-stills-grid-1.html
html/post2-stills-grid-2.html
html/post2-gallery-stills.html
html/post2-gallery-1-5.html
```

Move them to:
```
html/stills/post2-stills-grid-1.html
html/stills/post2-stills-grid-2.html
html/stills/post2-gallery-stills.html
html/stills/post2-gallery-1-5.html
```

After moving, update references in:
- `post1-2.html` — references `post2-gallery-stills.html` and `post2-gallery-1-5.html`
  as `data-src` values (change to `stills/post2-gallery-stills.html` etc.)
- Each moved file's own internal iframe srcs that reference `post2-gallery.html`
  — add `../` prefix since they're now one level deeper

Do one file at a time. Test after each.

---

## Step 8 — Group redirect aliases into `html/redirects/`
**Risk: low · Path updates: none needed**

These files are pure redirect shims — they contain no content of their own:

```
html/testing.html    →  redirects to post1-2.html
html/post2.html      →  redirects to post1-2.html
```

Move them to:
```
html/redirects/testing.html
html/redirects/post2.html
```

The redirect targets inside them use relative paths (`post1-2.html`).
After moving one level deeper, update the target to `../post1-2.html`.

Nothing else in the project links to these files so no other updates needed.

---

## Hold — fonts (if skipping Step 6)
**Risk: medium · Path updates: 3 JS files**

If you skip Step 6, leave fonts here:
```
spec_motion_site/fonts/   ←  leave for now
```

---

## Do not touch
Too many cross-references. Leave until there is a specific reason.

```
projects/media_motion_01/html/post1-2.html        ←  core hub, 400+ lines, many internal links
projects/media_motion_01/html/post2-gallery.html  ←  loaded as iframe by many files
projects/media_motion_01/js/sketch.js             ←  loaded by almost every page
projects/media_motion_01/js/galleryShell.js       ←  loaded by every gallery
projects/media_motion_01/css/galleryShell.css     ←  loaded by every gallery
```

---

## For reference — redirect files (keep these)
These are intentional short-URL aliases, not junk:

```
spec_motion_site/post1-2.html          →  projects/media_motion_01/html/post1-2.html
html/testing.html                      →  post1-2.html
html/post2.html                        →  post1-2.html
```
