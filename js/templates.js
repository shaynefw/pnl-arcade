/**
 * P&L Arcade — Template Registry
 * -------------------------------
 * To add a new template:
 *   1. Drop the image into assets/templates/
 *   2. Copy one of the entries below and adjust its config:
 *        - image:        path to the file
 *        - thumb:        optional smaller thumbnail (falls back to image)
 *        - name:         label shown in the gallery
 *        - text.x/y:     position of the P&L text (in image pixels)
 *        - text.fontSize, fontFamily, align, baseline
 *        - text.color, stroke, strokeWidth
 *        - text.profitColor / lossColor (overrides color based on +/-)
 *        - text.prefix / suffix (e.g. "$", " USD", "PNL: ")
 *        - text.shadow (drop shadow behind the text)
 *        - text.uppercase (force caps — good for arcade fonts)
 *        - text.maxWidth (optional: auto-shrink to fit this width in px)
 *   3. Reload the page. That's it.
 */

// --- Simple "scoreboard" templates ---------------------------------------
// Clean arcade-style backdrops with no decorative title competing with
// the P&L. Procedural SVG so they stay crisp at any size.

function scoreboardSVG({ bg, neon, corner }) {
  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1080" viewBox="0 0 1080 1080" shape-rendering="crispEdges">
  <defs>
    <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
      <rect width="40" height="40" fill="${bg}"/>
      <path d="M40 0 H0 V40" fill="none" stroke="${neon}" stroke-opacity="0.08" stroke-width="1"/>
    </pattern>
  </defs>
  <rect width="1080" height="1080" fill="url(#grid)"/>
  <!-- outer frame -->
  <rect x="40" y="40" width="1000" height="1000" fill="none" stroke="${neon}" stroke-width="6"/>
  <rect x="56" y="56" width="968" height="968" fill="none" stroke="${neon}" stroke-opacity="0.3" stroke-width="2"/>
  <!-- corner blocks (arcade marquee feel) -->
  <rect x="40"   y="40"   width="48" height="48" fill="${corner}"/>
  <rect x="992"  y="40"   width="48" height="48" fill="${corner}"/>
  <rect x="40"   y="992"  width="48" height="48" fill="${corner}"/>
  <rect x="992"  y="992"  width="48" height="48" fill="${corner}"/>
  <!-- scoreboard plate behind the P&L -->
  <rect x="120" y="380" width="840" height="320" fill="#000" fill-opacity="0.4" stroke="${neon}" stroke-opacity="0.4" stroke-width="2"/>
  <!-- small header label -->
  <g font-family="'Press Start 2P', monospace" text-anchor="middle" fill="${neon}" opacity="0.85">
    <text x="540" y="175" font-size="28" letter-spacing="4">DAILY P&amp;L</text>
  </g>
  <!-- small footer tag -->
  <g font-family="'Press Start 2P', monospace" text-anchor="middle" fill="${neon}" opacity="0.45">
    <text x="540" y="940" font-size="16" letter-spacing="3">P&amp;L ARCADE</text>
  </g>
</svg>`;
  return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
}

const SIMPLE_GREEN  = scoreboardSVG({ bg: '#0a1a14', neon: '#00ff88', corner: '#00ff88' });
const SIMPLE_AMBER  = scoreboardSVG({ bg: '#1a1200', neon: '#ffaa00', corner: '#ffaa00' });
const SIMPLE_MAGENTA = scoreboardSVG({ bg: '#14001a', neon: '#ff44bb', corner: '#ff44bb' });

// --- Banner registry -----------------------------------------------------
// Banners are optional, pre-rendered graphics stacked below the P&L card.
// Users can pick zero, one, or many (rendered in click order).
// Banner image width is scaled up/down to match the template width.
// To add a new banner:
//   1. Drop the PNG into assets/pnl-banners/
//   2. Add an entry below with { id, name, image, thumb }

window.BANNERS = [
  {
    id: 'clearedge',
    name: 'ClearEdge',
    image: 'assets/pnl-banners/clearedge-banner.png',
    thumb: 'assets/pnl-banners/clearedge-banner.png',
  },
  {
    id: 'cosniper',
    name: 'Co$niper',
    image: 'assets/pnl-banners/cosniper-banner.png',
    thumb: 'assets/pnl-banners/cosniper-banner.png',
  },
  {
    id: 'rapidfire',
    name: 'Rapidfire',
    image: 'assets/pnl-banners/rapidfire-banner.png',
    thumb: 'assets/pnl-banners/rapidfire-banner.png',
  },
  {
    id: 'ghosteye',
    name: 'GhostEye',
    image: 'assets/pnl-banners/ghosteye-banner.png',
    thumb: 'assets/pnl-banners/ghosteye-banner.png',
  },
];

// --- Template registry ---------------------------------------------------

window.TEMPLATES = [
  {
    id: 'winning-podium',
    name: 'Winning Podium',
    image: 'assets/templates/win-pnl-01.png',
    thumb: 'assets/templates/win-pnl-01.png',
    text: {
      // Banner is 1673x288, centered at (1026, 1664) on a 2048x2048 canvas.
      x: 1026, y: 1664,
      fontSize: 220,
      fontFamily: "'Press Start 2P', monospace",
      align: 'center',
      baseline: 'middle',
      color: '#0a0a14',
      profitColor: '#0e4a22',   // dark forest green, reads on cream
      lossColor:   '#7a0e1a',   // dark blood red
      stroke: '#f5efcf',        // pale-cream outline blends into banner
      strokeWidth: 6,
      prefix: '$',
      shadow: false,
      uppercase: false,
      maxWidth: 1500,
    },
  },
  {
    id: 'boss-defeated',
    name: 'Boss Defeated',
    image: 'assets/templates/win-pnl-02.jpg',
    thumb: 'assets/templates/win-pnl-02.jpg',
    text: {
      // No dedicated banner. Bull icon sits bottom-left, candle bottom-right;
      // narrower maxWidth keeps text inside the ring floor between them.
      x: 1024, y: 1980,
      fontSize: 105,
      fontFamily: "'Press Start 2P', monospace",
      align: 'center',
      baseline: 'middle',
      color: '#00ff88',
      profitColor: '#00ff88',
      lossColor:   '#ff3355',
      stroke: '#000000',
      strokeWidth: 12,
      prefix: '$',
      shadow: true,
      uppercase: false,
      maxWidth: 1200,
    },
  },
  {
    id: 'red-vs-green',
    name: 'Red vs Green',
    image: 'assets/templates/win-pnl-03.jpg',
    thumb: 'assets/templates/win-pnl-03.jpg',
    text: {
      // Cream banner at y=1672..2010, center (1024, 1841), width ~1973.
      x: 1024, y: 1841,
      fontSize: 220,
      fontFamily: "'Press Start 2P', monospace",
      align: 'center',
      baseline: 'middle',
      color: '#0a0a14',
      profitColor: '#0e4a22',
      lossColor:   '#7a0e1a',
      stroke: '#f5efcf',
      strokeWidth: 6,
      prefix: '$',
      shadow: false,
      uppercase: false,
      maxWidth: 1700,
    },
  },
  {
    id: 'saber-trader',
    name: 'Saber Trader',
    image: 'assets/templates/win-pnl-04.jpg',
    thumb: 'assets/templates/win-pnl-04.jpg',
    text: {
      // Banner y=1289..1926; bear paws intrude on the left/right corners of
      // the banner, so keep maxWidth well inside those.
      x: 1043, y: 1607,
      fontSize: 200,
      fontFamily: "'Press Start 2P', monospace",
      align: 'center',
      baseline: 'middle',
      color: '#0a0a14',
      profitColor: '#0e4a22',
      lossColor:   '#7a0e1a',
      stroke: '#f5efcf',
      strokeWidth: 8,
      prefix: '$',
      shadow: false,
      uppercase: false,
      maxWidth: 1200,
    },
  },
  {
    id: 'market-queen',
    name: 'Market Queen',
    image: 'assets/templates/win-pnl-06.jpg',
    thumb: 'assets/templates/win-pnl-06.jpg',
    text: {
      // Dark banner y~1625..1920, centered at (1025, 1772) on 2048x2048.
      // Bright neon green on near-black; no stroke needed, shadow adds depth.
      x: 1025, y: 1772,
      fontSize: 200,
      fontFamily: "'Press Start 2P', monospace",
      align: 'center',
      baseline: 'middle',
      color: '#e6e6f0',
      profitColor: '#00ff88',
      lossColor:   '#ff3355',
      stroke: null,
      strokeWidth: 0,
      prefix: '$',
      shadow: true,
      uppercase: false,
      maxWidth: 1650,
    },
  },
  {
    id: 'shadow-ninja',
    name: 'Shadow Ninja',
    image: 'assets/templates/win-pnl-07.jpg',
    thumb: 'assets/templates/win-pnl-07.jpg',
    text: {
      // Dark banner y=1783..1991, center (1023, 1887), w=1936.
      x: 1023, y: 1887,
      fontSize: 150,
      fontFamily: "'Press Start 2P', monospace",
      align: 'center', baseline: 'middle',
      color: '#ffffff',
      profitColor: '#00ff88',
      lossColor:   '#ff3355',
      stroke: null, strokeWidth: 0,
      prefix: '$', shadow: true, uppercase: false,
      maxWidth: 1700,
    },
  },
  {
    id: 'ghost-hunter',
    name: 'Ghost Hunter',
    image: 'assets/templates/win-pnl-08.jpg',
    thumb: 'assets/templates/win-pnl-08.jpg',
    text: {
      // No dedicated banner — top overlay over the dark sky.
      x: 1024, y: 140,
      fontSize: 120,
      fontFamily: "'Press Start 2P', monospace",
      align: 'center', baseline: 'middle',
      color: '#00ff88',
      profitColor: '#00ff88',
      lossColor:   '#ff3355',
      stroke: '#000000', strokeWidth: 12,
      prefix: '$', shadow: true, uppercase: false,
      maxWidth: 1500,
    },
  },
  {
    id: 'mountain-warrior',
    name: 'Mountain Warrior',
    image: 'assets/templates/win-pnl-09.jpg',
    thumb: 'assets/templates/win-pnl-09.jpg',
    text: {
      x: 1024, y: 160,
      fontSize: 120,
      fontFamily: "'Press Start 2P', monospace",
      align: 'center', baseline: 'middle',
      color: '#ffcc00',
      profitColor: '#ffcc00',
      lossColor:   '#ff3355',
      stroke: '#000000', strokeWidth: 12,
      prefix: '$', shadow: true, uppercase: false,
      maxWidth: 1500,
    },
  },
  {
    id: 'zombie-trader',
    name: 'Zombie Trader',
    image: 'assets/templates/win-pnl-10.jpg',
    thumb: 'assets/templates/win-pnl-10.jpg',
    text: {
      x: 1024, y: 160,
      fontSize: 120,
      fontFamily: "'Press Start 2P', monospace",
      align: 'center', baseline: 'middle',
      color: '#00ff88',
      profitColor: '#00ff88',
      lossColor:   '#ff3355',
      stroke: '#000000', strokeWidth: 12,
      prefix: '$', shadow: true, uppercase: false,
      maxWidth: 1500,
    },
  },
  {
    id: 'brick-smasher',
    name: 'Brick Smasher',
    image: 'assets/templates/win-pnl-11.jpg',
    thumb: 'assets/templates/win-pnl-11.jpg',
    text: {
      x: 1024, y: 140,
      fontSize: 110,
      fontFamily: "'Press Start 2P', monospace",
      align: 'center', baseline: 'middle',
      color: '#ffcc00',
      profitColor: '#ffcc00',
      lossColor:   '#ff3355',
      stroke: '#000000', strokeWidth: 12,
      prefix: '$', shadow: true, uppercase: false,
      maxWidth: 1500,
    },
  },
  {
    id: 'princess-wins',
    name: 'Princess Wins',
    image: 'assets/templates/win-pnl-12.jpg',
    thumb: 'assets/templates/win-pnl-12.jpg',
    text: {
      x: 1024, y: 130,
      fontSize: 110,
      fontFamily: "'Press Start 2P', monospace",
      align: 'center', baseline: 'middle',
      color: '#ffcc00',
      profitColor: '#ffcc00',
      lossColor:   '#ff3355',
      stroke: '#000000', strokeWidth: 12,
      prefix: '$', shadow: true, uppercase: false,
      maxWidth: 1500,
    },
  },
  {
    id: 'night-driver',
    name: 'Night Driver',
    image: 'assets/templates/win-pnl-13.jpg',
    thumb: 'assets/templates/win-pnl-13.jpg',
    text: {
      x: 1024, y: 150,
      fontSize: 120,
      fontFamily: "'Press Start 2P', monospace",
      align: 'center', baseline: 'middle',
      color: '#ff44bb',
      profitColor: '#ff44bb',
      lossColor:   '#ff3355',
      stroke: '#000000', strokeWidth: 12,
      prefix: '$', shadow: true, uppercase: false,
      maxWidth: 1500,
    },
  },
  {
    id: 'market-witcher',
    name: 'Market Witcher',
    image: 'assets/templates/win-pnl-14.jpg',
    thumb: 'assets/templates/win-pnl-14.jpg',
    text: {
      x: 1024, y: 140,
      fontSize: 120,
      fontFamily: "'Press Start 2P', monospace",
      align: 'center', baseline: 'middle',
      color: '#00ff88',
      profitColor: '#00ff88',
      lossColor:   '#ff3355',
      stroke: '#000000', strokeWidth: 12,
      prefix: '$', shadow: true, uppercase: false,
      maxWidth: 1500,
    },
  },
  {
    id: 'rekt-sensei',
    name: 'Rekt Sensei',
    image: 'assets/templates/win-pnl-15.jpg',
    thumb: 'assets/templates/win-pnl-15.jpg',
    text: {
      x: 1024, y: 160,
      fontSize: 120,
      fontFamily: "'Press Start 2P', monospace",
      align: 'center', baseline: 'middle',
      color: '#ffcc00',
      profitColor: '#ffcc00',
      lossColor:   '#ff3355',
      stroke: '#000000', strokeWidth: 12,
      prefix: '$', shadow: true, uppercase: false,
      maxWidth: 1500,
    },
  },
  {
    id: 'wizard-trader',
    name: 'Wizard Trader',
    image: 'assets/templates/win-pnl-16.png',
    thumb: 'assets/templates/win-pnl-16.png',
    text: {
      // Dark banner y=1624..2047, center (1023, 1835).
      x: 1024, y: 1835,
      fontSize: 200,
      fontFamily: "'Press Start 2P', monospace",
      align: 'center', baseline: 'middle',
      color: '#ffffff',
      profitColor: '#00ff88',
      lossColor:   '#ff3355',
      stroke: null, strokeWidth: 0,
      prefix: '$', shadow: true, uppercase: false,
      maxWidth: 1700,
    },
  },
  {
    id: 'super-saiyan',
    name: 'Super Saiyan',
    image: 'assets/templates/win-pnl-17.png',
    thumb: 'assets/templates/win-pnl-17.png',
    text: {
      // Big empty dark banner y=1525..2047, center (1023, 1786).
      x: 1024, y: 1786,
      fontSize: 260,
      fontFamily: "'Press Start 2P', monospace",
      align: 'center', baseline: 'middle',
      color: '#ffcc00',
      profitColor: '#ffcc00',
      lossColor:   '#ff3355',
      stroke: '#000000', strokeWidth: 6,
      prefix: '$', shadow: true, uppercase: false,
      maxWidth: 1750,
    },
  },
  // --- Simple scoreboard templates (stay at the end for users who want
  // a clean backdrop with no scene) -------------------------------------
  {
    id: 'simple-green',
    name: 'Simple · Green',
    image: SIMPLE_GREEN,
    thumb: SIMPLE_GREEN,
    text: {
      x: 540, y: 540,
      fontSize: 110,
      fontFamily: "'Press Start 2P', monospace",
      align: 'center',
      baseline: 'middle',
      color: '#00ff88',
      profitColor: '#00ff88',
      lossColor:   '#ff3355',
      stroke: '#001a0c',
      strokeWidth: 8,
      prefix: '$',
      shadow: true,
      uppercase: false,
      maxWidth: 780,
    },
  },
  {
    id: 'simple-amber',
    name: 'Simple · Amber',
    image: SIMPLE_AMBER,
    thumb: SIMPLE_AMBER,
    text: {
      x: 540, y: 540,
      fontSize: 110,
      fontFamily: "'Press Start 2P', monospace",
      align: 'center',
      baseline: 'middle',
      color: '#ffaa00',
      profitColor: '#ffaa00',
      lossColor:   '#ff3355',
      stroke: '#1a1200',
      strokeWidth: 8,
      prefix: '$',
      shadow: true,
      uppercase: false,
      maxWidth: 780,
    },
  },
  {
    id: 'simple-magenta',
    name: 'Simple · Magenta',
    image: SIMPLE_MAGENTA,
    thumb: SIMPLE_MAGENTA,
    text: {
      x: 540, y: 540,
      fontSize: 110,
      fontFamily: "'Press Start 2P', monospace",
      align: 'center',
      baseline: 'middle',
      color: '#ff44bb',
      profitColor: '#ff44bb',
      lossColor:   '#ff3355',
      stroke: '#1a0014',
      strokeWidth: 8,
      prefix: '$',
      shadow: true,
      uppercase: false,
      maxWidth: 780,
    },
  },
  {
    id: 'robot-crusher',
    name: 'Robot Crusher',
    image: 'assets/templates/win-pnl-05.jpeg',
    thumb: 'assets/templates/win-pnl-05.jpeg',
    text: {
      // 1024x1024 image, no banner. Overlay top-center over the candlestick sky.
      x: 512, y: 110,
      fontSize: 88,
      fontFamily: "'Press Start 2P', monospace",
      align: 'center',
      baseline: 'middle',
      color: '#ffcc00',
      profitColor: '#ffcc00',
      lossColor:   '#ff3355',
      stroke: '#000000',
      strokeWidth: 8,
      prefix: '$',
      shadow: true,
      uppercase: false,
      maxWidth: 900,
    },
  },
];
