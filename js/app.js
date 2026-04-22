(function () {
  'use strict';

  const canvas = document.getElementById('preview-canvas');
  const ctx = canvas.getContext('2d');
  const input = document.getElementById('pnl-input');
  const gallery = document.getElementById('gallery');
  const bannerGallery = document.getElementById('banner-gallery');
  const downloadBtn = document.getElementById('download-btn');
  const signButtons = document.querySelectorAll('.sign-btn');

  const state = {
    sign: '+',
    raw: '1,337.42',
    templateId: window.TEMPLATES[0].id,
    bannerIds: [],          // array of banner IDs, in click order
    imageCache: new Map(),  // key: src URL → HTMLImageElement
  };

  // --- Helpers -----------------------------------------------------------

  function currentTemplate() {
    return window.TEMPLATES.find(t => t.id === state.templateId) || window.TEMPLATES[0];
  }

  function selectedBanners() {
    const registry = window.BANNERS || [];
    return state.bannerIds
      .map(id => registry.find(b => b.id === id))
      .filter(Boolean);
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

  function loadImage(src) {
    if (state.imageCache.has(src)) {
      return Promise.resolve(state.imageCache.get(src));
    }
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => { state.imageCache.set(src, img); resolve(img); };
      img.onerror = reject;
      img.src = src;
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

    let tplImg;
    try {
      tplImg = await loadImage(tpl.image);
    } catch (e) {
      console.error('Failed to load template image', tpl.id, e);
      return;
    }

    const banners = selectedBanners();
    let bannerImgs = [];
    try {
      bannerImgs = await Promise.all(banners.map(b => loadImage(b.image)));
    } catch (e) {
      console.error('Failed to load banner image(s)', e);
    }

    // Final width matches template width; banners scale to match.
    const W = tplImg.naturalWidth;
    const tplH = tplImg.naturalHeight;
    const bannerHeights = bannerImgs.map(img => {
      const s = W / img.naturalWidth;
      return Math.round(img.naturalHeight * s);
    });
    const totalBannerH = bannerHeights.reduce((a, b) => a + b, 0);
    const H = tplH + totalBannerH;

    canvas.width = W;
    canvas.height = H;
    ctx.clearRect(0, 0, W, H);

    // 1. Template
    ctx.drawImage(tplImg, 0, 0);

    // 2. P&L text overlay
    const cfg = tpl.text || {};
    const text = buildPnlText(cfg);
    const baseColor = state.sign === '-'
      ? (cfg.lossColor || cfg.color || '#ff3355')
      : (cfg.profitColor || cfg.color || '#ffffff');

    fitFont(ctx, text, cfg.fontSize || 96,
            cfg.fontFamily || "'Press Start 2P', monospace",
            cfg.maxWidth);

    ctx.textAlign = cfg.align || 'center';
    ctx.textBaseline = cfg.baseline || 'middle';

    if (cfg.shadow) {
      ctx.save();
      ctx.fillStyle = 'rgba(0,0,0,0.55)';
      ctx.fillText(text, (cfg.x || W / 2) + 8, (cfg.y || tplH / 2) + 8);
      ctx.restore();
    }

    if (cfg.stroke && cfg.strokeWidth) {
      ctx.lineJoin = 'round';
      ctx.miterLimit = 2;
      ctx.strokeStyle = cfg.stroke;
      ctx.lineWidth = cfg.strokeWidth;
      ctx.strokeText(text, cfg.x || W / 2, cfg.y || tplH / 2);
    }

    ctx.fillStyle = baseColor;
    ctx.fillText(text, cfg.x || W / 2, cfg.y || tplH / 2);

    // 3. Banners stacked below, scaled to template width, in click order
    let y = tplH;
    bannerImgs.forEach((img, i) => {
      const h = bannerHeights[i];
      ctx.drawImage(img, 0, y, W, h);
      y += h;
    });
  }

  // --- Template gallery (single-select) ----------------------------------

  function buildTemplateGallery() {
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
        document.querySelectorAll('#gallery .thumb').forEach(el => {
          const sel = el.dataset.id === tpl.id;
          el.classList.toggle('selected', sel);
          el.setAttribute('aria-selected', sel ? 'true' : 'false');
        });
        render();
      });
      gallery.appendChild(btn);
    });
  }

  // --- Banner gallery (multi-select, preserves click order) --------------

  function refreshBannerBadges() {
    document.querySelectorAll('#banner-gallery .thumb').forEach(el => {
      const idx = state.bannerIds.indexOf(el.dataset.id);
      const sel = idx !== -1;
      el.classList.toggle('selected', sel);
      el.setAttribute('aria-selected', sel ? 'true' : 'false');
      const badge = el.querySelector('.order-badge');
      if (badge) badge.textContent = sel ? String(idx + 1) : '';
    });
  }

  function buildBannerGallery() {
    bannerGallery.innerHTML = '';
    (window.BANNERS || []).forEach(bn => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'thumb';
      btn.dataset.id = bn.id;
      btn.setAttribute('role', 'option');
      btn.setAttribute('aria-selected', 'false');
      btn.innerHTML = `
        <img src="${bn.thumb || bn.image}" alt="${bn.name}" loading="lazy" />
        <span class="order-badge"></span>
        <span class="thumb-name">${bn.name}</span>
      `;
      btn.addEventListener('click', () => {
        const idx = state.bannerIds.indexOf(bn.id);
        if (idx === -1) state.bannerIds.push(bn.id);
        else state.bannerIds.splice(idx, 1);
        refreshBannerBadges();
        render();
      });
      bannerGallery.appendChild(btn);
    });
    refreshBannerBadges();
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
    const bannerSuffix = state.bannerIds.length ? '-' + state.bannerIds.join('-') : '';
    const link = document.createElement('a');
    link.download = `pnl-${tpl.id}-${safeAmt}${bannerSuffix}.png`;
    link.href = canvas.toDataURL('image/png');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  });

  // --- Info modal --------------------------------------------------------

  const infoBtn = document.getElementById('info-btn');
  const infoModal = document.getElementById('info-modal');

  function openInfo() {
    infoModal.hidden = false;
    document.body.style.overflow = 'hidden';
  }
  function closeInfo() {
    infoModal.hidden = true;
    document.body.style.overflow = '';
  }

  if (infoBtn && infoModal) {
    infoBtn.addEventListener('click', openInfo);
    infoModal.addEventListener('click', (e) => {
      if (e.target.dataset && e.target.dataset.close) closeInfo();
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !infoModal.hidden) closeInfo();
    });
  }

  // --- Boot --------------------------------------------------------------

  const fontReady = (document.fonts && document.fonts.ready) || Promise.resolve();

  buildTemplateGallery();
  buildBannerGallery();
  fontReady.then(render);
})();
