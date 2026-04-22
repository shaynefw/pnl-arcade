(function () {
  'use strict';

  const canvas = document.getElementById('preview-canvas');
  const ctx = canvas.getContext('2d');
  const input = document.getElementById('pnl-input');
  const gallery = document.getElementById('gallery');
  const downloadBtn = document.getElementById('download-btn');
  const signButtons = document.querySelectorAll('.sign-btn');

  const state = {
    sign: '+',
    raw: '1,337.42',
    templateId: window.TEMPLATES[0].id,
    imageCache: new Map(), // id -> HTMLImageElement (loaded)
  };

  // --- Helpers -----------------------------------------------------------

  function currentTemplate() {
    return window.TEMPLATES.find(t => t.id === state.templateId) || window.TEMPLATES[0];
  }

  function parseAmount(str) {
    if (!str) return 0;
    const cleaned = String(str).replace(/[^0-9.]/g, '');
    const n = parseFloat(cleaned);
    return isNaN(n) ? 0 : n;
  }

  function formatAmount(n) {
    return n.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }

  function buildPnlText(cfg) {
    const n = parseAmount(state.raw);
    const signPrefix = state.sign === '-' ? '-' : '+';
    let body = (cfg.prefix || '') + formatAmount(n) + (cfg.suffix || '');
    let full = signPrefix + body;
    if (cfg.uppercase) full = full.toUpperCase();
    return full;
  }

  function loadImage(tpl) {
    if (state.imageCache.has(tpl.id)) {
      return Promise.resolve(state.imageCache.get(tpl.id));
    }
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => { state.imageCache.set(tpl.id, img); resolve(img); };
      img.onerror = reject;
      img.src = tpl.image;
    });
  }

  // Fit a font to a max width by shrinking size if needed.
  function fitFont(ctx, text, baseSize, fontFamily, maxWidth) {
    let size = baseSize;
    ctx.font = `${size}px ${fontFamily}`;
    if (!maxWidth) return size;
    while (ctx.measureText(text).width > maxWidth && size > 12) {
      size -= 4;
      ctx.font = `${size}px ${fontFamily}`;
    }
    return size;
  }

  // --- Rendering ---------------------------------------------------------

  async function render() {
    const tpl = currentTemplate();
    let img;
    try {
      img = await loadImage(tpl);
    } catch (e) {
      console.error('Failed to load template image', tpl.id, e);
      return;
    }

    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0);

    const cfg = tpl.text || {};
    const text = buildPnlText(cfg);
    const baseColor = state.sign === '-'
      ? (cfg.lossColor || cfg.color || '#ff3355')
      : (cfg.profitColor || cfg.color || '#ffffff');

    const size = fitFont(ctx, text, cfg.fontSize || 96,
                         cfg.fontFamily || "'Press Start 2P', monospace",
                         cfg.maxWidth);

    ctx.textAlign = cfg.align || 'center';
    ctx.textBaseline = cfg.baseline || 'middle';

    if (cfg.shadow) {
      ctx.save();
      ctx.fillStyle = 'rgba(0,0,0,0.55)';
      ctx.fillText(text, (cfg.x || canvas.width / 2) + 8, (cfg.y || canvas.height / 2) + 8);
      ctx.restore();
    }

    if (cfg.stroke && cfg.strokeWidth) {
      ctx.lineJoin = 'round';
      ctx.miterLimit = 2;
      ctx.strokeStyle = cfg.stroke;
      ctx.lineWidth = cfg.strokeWidth;
      ctx.strokeText(text, cfg.x || canvas.width / 2, cfg.y || canvas.height / 2);
    }

    ctx.fillStyle = baseColor;
    ctx.fillText(text, cfg.x || canvas.width / 2, cfg.y || canvas.height / 2);
  }

  // --- Gallery -----------------------------------------------------------

  function buildGallery() {
    gallery.innerHTML = '';
    window.TEMPLATES.forEach(tpl => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'thumb' + (tpl.id === state.templateId ? ' selected' : '');
      btn.dataset.id = tpl.id;
      btn.setAttribute('role', 'option');
      btn.setAttribute('aria-selected', tpl.id === state.templateId ? 'true' : 'false');
      btn.innerHTML = `
        <img src="${tpl.thumb || tpl.image}" alt="${tpl.name}" loading="lazy" />
        <span class="thumb-name">${tpl.name}</span>
      `;
      btn.addEventListener('click', () => {
        state.templateId = tpl.id;
        document.querySelectorAll('.thumb').forEach(el => {
          const sel = el.dataset.id === tpl.id;
          el.classList.toggle('selected', sel);
          el.setAttribute('aria-selected', sel ? 'true' : 'false');
        });
        render();
      });
      gallery.appendChild(btn);
    });
  }

  // --- Wiring ------------------------------------------------------------

  input.addEventListener('input', (e) => {
    state.raw = e.target.value;
    render();
  });

  input.addEventListener('blur', () => {
    const n = parseAmount(state.raw);
    if (!isNaN(n)) {
      state.raw = formatAmount(n);
      input.value = state.raw;
    }
  });

  signButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      state.sign = btn.dataset.sign;
      signButtons.forEach(b => b.classList.toggle('active', b === btn));
      render();
    });
  });

  downloadBtn.addEventListener('click', async () => {
    await render();
    const tpl = currentTemplate();
    const n = parseAmount(state.raw);
    const safeAmt = (state.sign === '-' ? 'loss-' : 'win-') + formatAmount(n).replace(/[^0-9]/g, '_');
    const link = document.createElement('a');
    link.download = `pnl-${tpl.id}-${safeAmt}.png`;
    link.href = canvas.toDataURL('image/png');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  });

  // --- Boot --------------------------------------------------------------

  // Ensure Press Start 2P is available before first render so measurements are accurate.
  const fontReady = (document.fonts && document.fonts.ready) || Promise.resolve();

  buildGallery();
  fontReady.then(render);
})();
