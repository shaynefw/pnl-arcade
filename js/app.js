(function () {
  'use strict';

  const canvas = document.getElementById('preview-canvas');
  const ctx = canvas.getContext('2d');
  const input = document.getElementById('pnl-input');
  const gallery = document.getElementById('gallery');
  const bannerGallery = document.getElementById('banner-gallery');
  const downloadBtn = document.getElementById('download-btn');
  const signButtons = document.querySelectorAll('.sign-btn');
  const carouselTrack = document.getElementById('carousel-track');
  const carouselDots = document.getElementById('carousel-dots');
  const carouselPrev = document.querySelector('#carousel .carousel-nav.prev');
  const carouselNext = document.querySelector('#carousel .carousel-nav.next');

  const FEATURED_COUNT = 9;
  const CAROUSEL_VISIBLE = 3;
  const CAROUSEL_INTERVAL_MS = 4500;
  const SKIP_FROM_FEATURED = new Set([
    'simple-green', 'simple-amber', 'simple-magenta', 'robot-crusher',
  ]);

  const state = {
    sign: '+',
    raw: '1,337.42',
    templateId: window.TEMPLATES[0].id,
    bannerIds: [],          // array of banner IDs, in click order
    imageCache: new Map(),  // key: src URL → HTMLImageElement
    yOffsetPct: null,       // null = use template default; otherwise 0-100
    fontSizePct: 100,       // percentage of template's fontSize
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

    // Apply user slider overrides (position + font size).
    const sizeMult = (state.fontSizePct || 100) / 100;
    const baseFontSize = (cfg.fontSize || 96) * sizeMult;
    const baseMaxWidth = cfg.maxWidth ? cfg.maxWidth * sizeMult : undefined;
    fitFont(ctx, text, baseFontSize,
            cfg.fontFamily || "'Press Start 2P', monospace",
            baseMaxWidth);

    ctx.textAlign = cfg.align || 'center';
    ctx.textBaseline = cfg.baseline || 'middle';

    const drawX = cfg.x || W / 2;
    const drawY = state.yOffsetPct != null
      ? (state.yOffsetPct / 100) * tplH
      : (cfg.y || tplH / 2);

    if (cfg.shadow) {
      ctx.save();
      ctx.fillStyle = 'rgba(0,0,0,0.55)';
      ctx.fillText(text, drawX + 8, drawY + 8);
      ctx.restore();
    }

    if (cfg.stroke && cfg.strokeWidth) {
      ctx.lineJoin = 'round';
      ctx.miterLimit = 2;
      ctx.strokeStyle = cfg.stroke;
      ctx.lineWidth = cfg.strokeWidth;
      ctx.strokeText(text, drawX, drawY);
    }

    ctx.fillStyle = baseColor;
    ctx.fillText(text, drawX, drawY);

    // 3. Banners stacked below, scaled to template width, in click order
    let y = tplH;
    bannerImgs.forEach((img, i) => {
      const h = bannerHeights[i];
      ctx.drawImage(img, 0, y, W, h);
      y += h;
    });

    // Sync the Y slider's position to the template default if the user
    // hasn't touched it yet (now that real tplH is known). Inverted so
    // thumb at top = text at top.
    if (state.yOffsetPct == null && ySlider) {
      const defaultYPct = Math.round(((cfg.y || tplH / 2) / tplH) * 100);
      ySlider.value = String(100 - defaultYPct);
    }
  }

  // --- Featured carousel (auto-rotating, selects on click) ---------------

  let carouselIdx = 0;
  let carouselTimer = null;

  function featuredTemplates() {
    const all = window.TEMPLATES || [];
    return all
      .filter(t => !SKIP_FROM_FEATURED.has(t.id))
      .slice(-FEATURED_COUNT);
  }

  function updateCarouselSelectionState() {
    if (!carouselTrack) return;
    // Every rendered card (real + clone) with matching id gets highlighted.
    [...carouselTrack.children].forEach(el => {
      el.classList.toggle('is-selected', el.dataset.id === state.templateId);
    });
  }

  function showCarouselSlide(i) {
    if (!carouselTrack) return;
    const items = featuredTemplates();
    if (!items.length) return;
    carouselIdx = ((i % items.length) + items.length) % items.length;
    const slidePct = 100 / CAROUSEL_VISIBLE;
    carouselTrack.style.transform = `translateX(-${carouselIdx * slidePct}%)`;
    if (carouselDots) {
      [...carouselDots.children].forEach((el, j) => {
        el.classList.toggle('active', j === carouselIdx);
        el.setAttribute('aria-selected', j === carouselIdx ? 'true' : 'false');
      });
    }
  }

  function startCarouselRotate() {
    stopCarouselRotate();
    const items = featuredTemplates();
    if (items.length <= CAROUSEL_VISIBLE) return;
    carouselTimer = setInterval(() => {
      showCarouselSlide(carouselIdx + 1);
    }, CAROUSEL_INTERVAL_MS);
  }

  function stopCarouselRotate() {
    if (carouselTimer) { clearInterval(carouselTimer); carouselTimer = null; }
  }

  function pauseThenResume() {
    stopCarouselRotate();
    setTimeout(startCarouselRotate, 8000);
  }

  function buildCarousel() {
    if (!carouselTrack) return;
    const items = featuredTemplates();
    carouselTrack.innerHTML = '';
    // Duplicate the first CAROUSEL_VISIBLE items at the end so the slide
    // can advance past the last "real" index and wrap smoothly.
    const rendered = items.concat(items.slice(0, CAROUSEL_VISIBLE));
    rendered.forEach((tpl) => {
      const slide = document.createElement('button');
      slide.type = 'button';
      slide.className = 'carousel-slide';
      slide.dataset.id = tpl.id;
      slide.setAttribute('aria-label', 'Select ' + tpl.name);
      slide.innerHTML = `
        <img src="${tpl.thumb || tpl.image}" alt="${tpl.name}" loading="lazy" />
        <span class="carousel-title">${tpl.name}</span>
      `;
      slide.addEventListener('click', () => {
        state.templateId = tpl.id;
        syncGallerySelection();
        updateCarouselSelectionState();
        resetSliders();
        render();
        pauseThenResume();
      });
      carouselTrack.appendChild(slide);
    });

    // When the transform advances into the duplicated clone region, snap
    // silently back to the matching real position.
    carouselTrack.addEventListener('transitionend', () => {
      if (carouselIdx >= items.length) {
        carouselTrack.style.transition = 'none';
        carouselIdx = carouselIdx - items.length;
        const slidePct = 100 / CAROUSEL_VISIBLE;
        carouselTrack.style.transform = `translateX(-${carouselIdx * slidePct}%)`;
        // Force reflow then restore transition for next tick.
        void carouselTrack.offsetWidth;
        carouselTrack.style.transition = '';
      }
    });

    if (carouselDots) {
      carouselDots.innerHTML = '';
      items.forEach((_, i) => {
        const dot = document.createElement('button');
        dot.type = 'button';
        dot.className = 'dot' + (i === 0 ? ' active' : '');
        dot.dataset.idx = String(i);
        dot.setAttribute('role', 'tab');
        dot.setAttribute('aria-label', 'Slide ' + (i + 1));
        dot.addEventListener('click', () => {
          showCarouselSlide(i);
          pauseThenResume();
        });
        carouselDots.appendChild(dot);
      });
    }

    if (carouselPrev) carouselPrev.addEventListener('click', () => {
      showCarouselSlide(carouselIdx - 1);
      pauseThenResume();
    });
    if (carouselNext) carouselNext.addEventListener('click', () => {
      showCarouselSlide(carouselIdx + 1);
      pauseThenResume();
    });

    updateCarouselSelectionState();
  }

  function syncGallerySelection() {
    document.querySelectorAll('#gallery .thumb').forEach(el => {
      const sel = el.dataset.id === state.templateId;
      el.classList.toggle('selected', sel);
      el.setAttribute('aria-selected', sel ? 'true' : 'false');
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
        syncGallerySelection();
        updateCarouselSelectionState();
        resetSliders();
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

  const downloadToast = document.getElementById('download-toast');
  let toastHideTimer = null;
  let toastFinalizeTimer = null;
  function showDownloadToast(filename) {
    if (!downloadToast) return;
    const sub = downloadToast.querySelector('.toast-sub');
    if (sub) sub.textContent = filename ? `Saved ${filename}` : 'Check your Downloads folder';
    downloadToast.hidden = false;
    // Force reflow so the transition plays on each show
    // eslint-disable-next-line no-unused-expressions
    downloadToast.offsetWidth;
    downloadToast.classList.add('is-visible');
    if (toastHideTimer) clearTimeout(toastHideTimer);
    if (toastFinalizeTimer) clearTimeout(toastFinalizeTimer);
    toastHideTimer = setTimeout(() => {
      downloadToast.classList.remove('is-visible');
      toastFinalizeTimer = setTimeout(() => { downloadToast.hidden = true; }, 260);
    }, 2200);
  }

  downloadBtn.addEventListener('click', async () => {
    await render();
    const tpl = currentTemplate();
    const n = parseAmount(state.raw);
    const safeAmt = (state.sign === '-' ? 'loss-' : 'win-') + formatAmount(n).replace(/[^0-9]/g, '_');
    const bannerSuffix = state.bannerIds.length ? '-' + state.bannerIds.join('-') : '';
    const filename = `pnl-${tpl.id}-${safeAmt}${bannerSuffix}.png`;
    const link = document.createElement('a');
    link.download = filename;
    link.href = canvas.toDataURL('image/png');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showDownloadToast(filename);
  });

  // --- Position / size sliders -------------------------------------------

  const ySlider = document.getElementById('y-slider');
  const sizeSlider = document.getElementById('size-slider');
  const sliderReset = document.getElementById('slider-reset');

  function resetSliders() {
    state.yOffsetPct = null;
    state.fontSizePct = 100;
    const tpl = currentTemplate();
    const cfg = tpl.text || {};
    // Initialize Y slider: thumb at top = text at top → inverted mapping.
    const tplImg = state.imageCache.get(tpl.image);
    const tplH = tplImg ? tplImg.naturalHeight : 2048;
    const defaultYPct = Math.round(((cfg.y || tplH / 2) / tplH) * 100);
    if (ySlider) ySlider.value = String(100 - defaultYPct);
    if (sizeSlider) sizeSlider.value = '100';
  }

  if (ySlider) {
    // Slider value 100 = thumb at top = text at top (yOffsetPct = 0).
    // Slider value 0   = thumb at bottom = text at bottom (yOffsetPct = 100).
    ySlider.addEventListener('input', (e) => {
      state.yOffsetPct = 100 - parseInt(e.target.value, 10);
      render();
    });
  }
  if (sizeSlider) {
    sizeSlider.addEventListener('input', (e) => {
      state.fontSizePct = parseInt(e.target.value, 10);
      render();
    });
  }
  if (sliderReset) {
    sliderReset.addEventListener('click', () => {
      resetSliders();
      render();
    });
  }

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
  buildCarousel();
  startCarouselRotate();
  fontReady.then(render);
})();
