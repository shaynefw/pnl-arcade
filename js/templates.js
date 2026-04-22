/**
 * P&L Arcade — Template Registry
 * -------------------------------
 * To add a new template:
 *   1. Drop the image into assets/templates/ (PNG, ideally 1080x1080 or 1080x1350)
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
 *
 * The `image` field can also be a data:image/svg+xml URL so the app ships
 * with working placeholders before real art is dropped in.
 */

// --- Placeholder pixel-art templates (swap for real PNGs later) ---------

function placeholderSVG({ bg, stripe, title, subtitle, accent }) {
  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1080" viewBox="0 0 1080 1080" shape-rendering="crispEdges">
  <defs>
    <pattern id="px" width="16" height="16" patternUnits="userSpaceOnUse">
      <rect width="16" height="16" fill="${bg}"/>
      <rect width="1" height="1" x="0" y="0" fill="${stripe}" opacity="0.35"/>
      <rect width="1" height="1" x="8" y="8" fill="${stripe}" opacity="0.35"/>
    </pattern>
  </defs>
  <rect width="1080" height="1080" fill="url(#px)"/>
  <rect x="40" y="40" width="1000" height="1000" fill="none" stroke="${accent}" stroke-width="8"/>
  <rect x="60" y="60" width="960" height="960" fill="none" stroke="${stripe}" stroke-width="4" stroke-dasharray="16 8"/>
  <g font-family="'Press Start 2P', monospace" text-anchor="middle">
    <text x="540" y="180" font-size="64" fill="${accent}" stroke="#000" stroke-width="6" paint-order="stroke">${title}</text>
    <text x="540" y="260" font-size="28" fill="${stripe}">${subtitle}</text>
  </g>
  <g font-family="'Press Start 2P', monospace" text-anchor="middle" opacity="0.6">
    <text x="540" y="960" font-size="22" fill="${stripe}">DAILY REPORT</text>
    <text x="540" y="1000" font-size="18" fill="${stripe}">— P&amp;L ARCADE —</text>
  </g>
</svg>`;
  return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
}

const PLACEHOLDER_STREET = placeholderSVG({
  bg: '#1a0033', stripe: '#ff4db8', accent: '#ffcc00',
  title: 'STREET TRADER', subtitle: 'ROUND 1 — FIGHT',
});
const PLACEHOLDER_BOSS = placeholderSVG({
  bg: '#002233', stripe: '#00e5ff', accent: '#00ff88',
  title: 'BOSS BATTLE', subtitle: 'MARKET VS YOU',
});
const PLACEHOLDER_COIN = placeholderSVG({
  bg: '#220011', stripe: '#ffcc00', accent: '#ff3355',
  title: 'COIN RUN', subtitle: 'BONUS STAGE',
});

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
    id: 'street-trader',
    name: 'Street Trader',
    image: PLACEHOLDER_STREET,
    thumb: PLACEHOLDER_STREET,
    text: {
      x: 540, y: 560,
      fontSize: 140,
      fontFamily: "'Press Start 2P', monospace",
      align: 'center',
      baseline: 'middle',
      color: '#ffffff',
      profitColor: '#00ff88',
      lossColor: '#ff3355',
      stroke: '#000000',
      strokeWidth: 10,
      prefix: '$',
      shadow: true,
      uppercase: false,
      maxWidth: 900,
    },
  },
  {
    id: 'boss-battle',
    name: 'Boss Battle',
    image: PLACEHOLDER_BOSS,
    thumb: PLACEHOLDER_BOSS,
    text: {
      x: 540, y: 620,
      fontSize: 120,
      fontFamily: "'Press Start 2P', monospace",
      align: 'center',
      baseline: 'middle',
      color: '#00ff88',
      profitColor: '#00ff88',
      lossColor: '#ff3355',
      stroke: '#001a0c',
      strokeWidth: 12,
      prefix: 'PNL: $',
      shadow: true,
      uppercase: true,
      maxWidth: 900,
    },
  },
  {
    id: 'coin-run',
    name: 'Coin Run',
    image: PLACEHOLDER_COIN,
    thumb: PLACEHOLDER_COIN,
    text: {
      x: 540, y: 540,
      fontSize: 160,
      fontFamily: "'Press Start 2P', monospace",
      align: 'center',
      baseline: 'middle',
      color: '#ffcc00',
      profitColor: '#ffcc00',
      lossColor: '#ff3355',
      stroke: '#1a1200',
      strokeWidth: 12,
      prefix: '$',
      suffix: '',
      shadow: true,
      uppercase: false,
      maxWidth: 900,
    },
  },
];
