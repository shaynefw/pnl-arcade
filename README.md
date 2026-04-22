# P&L Arcade — Trading Meme Generator

A lightweight, front-end-only web app for posting daily P&L as retro pixel-art
arcade graphics.

## Run locally
Open `index.html` directly in a browser, or serve the folder with any static
server:

```bash
cd pnl-generator
python3 -m http.server 5173
# → http://localhost:5173
```

## Adding a new template

1. Drop your PNG into `assets/templates/` (1080×1080 works well).
2. Open `js/templates.js` and add an entry to the `window.TEMPLATES` array:

```js
{
  id: 'my-new-template',
  name: 'My New Template',
  image: 'assets/templates/my-new.png',
  thumb: 'assets/templates/my-new.png',   // optional
  text: {
    x: 540, y: 560,                       // pixel position on the image
    fontSize: 140,
    fontFamily: "'Press Start 2P', monospace",
    align: 'center',                      // left | center | right
    baseline: 'middle',                   // top | middle | bottom
    color: '#ffffff',                     // default text color
    profitColor: '#00ff88',               // used when sign = +
    lossColor:   '#ff3355',               // used when sign = -
    stroke: '#000000',
    strokeWidth: 10,
    prefix: '$',                          // e.g. '$' or 'PNL: $'
    suffix: '',
    shadow: true,
    uppercase: false,
    maxWidth: 900,                        // auto-shrink to fit
  },
}
```

3. Reload the page. Your template shows up in the gallery automatically.

## File layout
```
pnl-generator/
├── index.html
├── css/style.css
├── js/
│   ├── templates.js   ← template registry (edit this)
│   └── app.js         ← renderer + UI wiring
└── assets/templates/  ← drop real template PNGs here
```

## Notes
- Rendering is done on a `<canvas>` sized to the template image, so downloads
  are full-resolution even though the on-screen preview is scaled.
- Ships with three procedural SVG placeholders so the app works before any
  real art is added. Replace them in `templates.js` by pointing `image` /
  `thumb` at paths under `assets/templates/`.
