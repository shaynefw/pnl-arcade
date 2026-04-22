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
