// effects.js

/* Layer 1 — actinium quicksilver melt (bottom) */
const ACTINIUM = {
    layerClass: 'actinium-liquid-layer',
    refraction: 0.03,    // gentle viscous pull — no blocky warping
    aberration: 0.004,   // whisper of fringe
    bevelDepth: 0.55,    // deep but rounded meniscus
    bevelWidth: 0.24,    // wide soft transition — the "liquid" feel
    frost:      0
};

/* Layer 2 — weak liquid glass film (above melt, below content) */
const LIQUID_GLASS_FILM = {
    layerClass: 'actinium-glass-film',
    refraction: 0.012,   // WEAK glass pull
    aberration: 0.0015,  // near-zero fringe
    bevelDepth: 0.16,    // thin glass meniscus
    bevelWidth: 0.10,
    frost:      0.14     // faint frosted-glass grain
};

const PANEL_SELECTOR    = '.ui-overlay, .tp-overlay, .pt-modal-window';
const SNAPSHOT_SELECTOR = '#renderCanvas';

let liquidInstances = [];
let dynamicLoopRunning = false;

document.addEventListener('DOMContentLoaded', () => {
    initGroupAttributesObserver();
    initModalVisibilityHandler();
    initGSAPAnimations();
    initGlassInteractivity();
    // Let the Babylon scene render a few frames first so the
    // snapshot textures have real content to refract.
    setTimeout(initLiquidEffects, 400);
});

/* ------------------------------------------------------------------ */
/* Periodic-table group attributes (supports existing filter logic)   */
/* ------------------------------------------------------------------ */
function applyGroupDataAttributes() {
    const cards = document.querySelectorAll('.pt-element-card');
    cards.forEach(card => {
        if (card.dataset.group) return;
        const groupSpan = card.querySelector('.pt-card-top span:nth-child(2)');
        if (groupSpan) {
            const groupText = groupSpan.textContent.trim();
            const groupNum = groupText.replace('G', '');
            if (groupNum) card.dataset.group = groupNum;
        }
    });
}

function initGroupAttributesObserver() {
    applyGroupDataAttributes();
    const container = document.getElementById('ptGridContainer');
    if (container) {
        const observer = new MutationObserver(() => applyGroupDataAttributes());
        observer.observe(container, { childList: true, subtree: true });
    }
}

/* ------------------------------------------------------------------ */
/* Modal visibility — a closed backdrop must never be a pointer wall  */
/* ------------------------------------------------------------------ */
function initModalVisibilityHandler() {
    const modalBackdrop = document.querySelector('.pt-modal-backdrop');
    if (!modalBackdrop) return;

    const syncModalDisplay = () => {
        const open = modalBackdrop.classList.contains('open');
        modalBackdrop.style.display = open ? 'flex' : 'none';
        modalBackdrop.style.pointerEvents = open ? 'auto' : 'none';
        if (open) {
            // Layers become measurable only when visible — re-wake both melts
            requestAnimationFrame(() => refreshAllLiquid());
        }
    };

    syncModalDisplay();
    const observer = new MutationObserver(syncModalDisplay);
    observer.observe(modalBackdrop, { attributes: true, attributeFilter: ['class'] });
}

/* ------------------------------------------------------------------ */
/* Liquid substrate layers                                            */
/* ------------------------------------------------------------------ */

/** Raise a node above both liquid layers only if it would sink under them. */
function elevateAboveLiquid(el) {
    const cs = window.getComputedStyle(el);
    if (cs.position === 'static') el.style.position = 'relative';
    const z = parseInt(cs.zIndex, 10);
    if (isNaN(z) || z < 2) el.style.zIndex = '2';
}

/**
 * Injects the two liquid layers per panel and keeps stacking sane for
 * current AND future direct children (kernel.js rebuilds orbit rows,
 * filters and the table grid at runtime).
 */
function prepareLiquidLayers() {
    const panels = document.querySelectorAll(PANEL_SELECTOR);

    panels.forEach(panel => {
        // 1) Quicksilver melt — bottom of the panel stack
        let melt = panel.querySelector(`:scope > .${ACTINIUM.layerClass}`);
        if (!melt) {
            melt = document.createElement('div');
            melt.className = ACTINIUM.layerClass;
            melt.setAttribute('aria-hidden', 'true');
            panel.prepend(melt);
        }

        // 2) Weak liquid-glass film — directly above the melt
        let film = panel.querySelector(`:scope > .${LIQUID_GLASS_FILM.layerClass}`);
        if (!film) {
            film = document.createElement('div');
            film.className = LIQUID_GLASS_FILM.layerClass;
            film.setAttribute('aria-hidden', 'true');
            melt.insertAdjacentElement('afterend', film);
        }

        // 3) Content must sit above both layers
        Array.from(panel.children).forEach(child => {
            if (child === melt || child === film) return;
            elevateAboveLiquid(child);
        });

        // Keep future direct children above the liquid stack
        const childObserver = new MutationObserver(mutations => {
            mutations.forEach(m => m.addedNodes.forEach(node => {
                if (node.nodeType === 1 &&
                    !node.classList.contains(ACTINIUM.layerClass) &&
                    !node.classList.contains(LIQUID_GLASS_FILM.layerClass)) {
                    elevateAboveLiquid(node);
                }
            }));
        });
        childObserver.observe(panel, { childList: true });
    });
}

/** Never let shader canvases swallow clicks from the UI. */
function neutralizeLiquidCanvases() {
    document.querySelectorAll('canvas').forEach(cvs => {
        if (cvs.id === 'renderCanvas') return;
        cvs.style.pointerEvents = 'none';
        cvs.style.zIndex = '0';
    });
}

/* ------------------------------------------------------------------ */
/* liquidGL boot                                                      */
/* ------------------------------------------------------------------ */

/** Boots one liquidGL layer. Guarded: one failing layer never kills the other. */
function bootLiquidLayer(cfg) {
    try {
        liquidGL({
            snapshot:   SNAPSHOT_SELECTOR,           // refract ONLY the 3D scene
            target:     '.' + cfg.layerClass,
            resolution: 1.0,
            refraction: cfg.refraction,
            aberration: cfg.aberration,
            bevelDepth: cfg.bevelDepth,
            bevelWidth: cfg.bevelWidth,
            frost:      cfg.frost,
            shadow:     false,
            specular:   true,
            reveal:     'fade',
            tilt:       false,
            magnify:    1.0,
            on: {
                init(instance) {
                    if (instance) liquidInstances.push(instance);
                    neutralizeLiquidCanvases();
                    startDynamicRenderLoop();
                }
            }
        });
    } catch (err) {
        console.warn('liquidGL layer failed to boot:', cfg.layerClass, err);
    }
}

function initLiquidEffects() {
    prepareLiquidLayers();

    if (typeof liquidGL !== 'function') return; // CSS dark-glass fallback stays intact

    bootLiquidLayer(ACTINIUM);          // molten actinium metal
    bootLiquidLayer(LIQUID_GLASS_FILM); // weak glass film on top

    neutralizeLiquidCanvases();
    // Safety pass for late-injected shader canvases
    setTimeout(neutralizeLiquidCanvases, 900);
}

/* ------------------------------------------------------------------ */
/* Dynamic render — live refresh of EVERY liquidGL instance           */
/* ------------------------------------------------------------------ */

/** Single-shot refresh of all live instances (modal open, resize, etc.). */
function refreshAllLiquid() {
    liquidInstances.forEach(inst => {
        if (!inst) return;
        if (typeof inst.update === 'function') inst.update();
        else if (typeof inst.refresh === 'function') inst.refresh();
        else if (typeof inst.render === 'function') inst.render();
    });
}

/**
 * Frame-budgeted dynamic render loop: refreshes both liquid layers
 * every animation frame, paused while the tab is hidden.
 */
function startDynamicRenderLoop() {
    if (dynamicLoopRunning) return;
    dynamicLoopRunning = true;
    (function tick() {
        if (!document.hidden) refreshAllLiquid();
        requestAnimationFrame(tick);
    })();
}

/* ------------------------------------------------------------------ */
/* Cursor-tracked specular bloom (feeds --mouse-x / --mouse-y)        */
/* ------------------------------------------------------------------ */
function initGlassInteractivity() {
    const glassPanels = document.querySelectorAll(PANEL_SELECTOR);
    glassPanels.forEach(panel => {
        panel.addEventListener('mousemove', (e) => {
            const rect = panel.getBoundingClientRect();
            panel.style.setProperty('--mouse-x', `${e.clientX - rect.left}px`);
            panel.style.setProperty('--mouse-y', `${e.clientY - rect.top}px`);
        });
    });
}

/* ------------------------------------------------------------------ */
/* GSAP micro-interactions                                            */
/* ------------------------------------------------------------------ */
function initGSAPAnimations() {
    if (typeof gsap === 'undefined') return;

    gsap.from('#uiOverlay', { x: -40, opacity: 0, duration: 0.6, ease: 'power3.out', delay: 0.15 });
    gsap.from('#tpOverlay', { x: 40,  opacity: 0, duration: 0.6, ease: 'power3.out', delay: 0.25 });

    const buttons = document.querySelectorAll('button');
    buttons.forEach(btn => {
        btn.addEventListener('mouseenter', () => {
            gsap.to(btn, { scale: 1.02, duration: 0.18, ease: 'power1.out' });
        });
        btn.addEventListener('mouseleave', () => {
            gsap.to(btn, { scale: 1.0, duration: 0.18, ease: 'power1.out' });
        });
        btn.addEventListener('mousedown', () => {
            gsap.to(btn, { scale: 0.97, duration: 0.08, ease: 'power1.inOut' });
        });
    });
}

/* ------------------------------------------------------------------ */
/* Control panel mode switcher (AUTO / MANUAL)                        */
/* ------------------------------------------------------------------ */
function switchControlMode(mode) {
    const autoContainer = document.getElementById('autoModeContainer');
    const manualContainer = document.getElementById('manualModeContainer');
    const btnAuto = document.getElementById('btnModeAuto');
    const btnManual = document.getElementById('btnModeManual');
    if (!autoContainer || !manualContainer || !btnAuto || !btnManual) return;

    if (mode === 'auto') {
        autoContainer.classList.remove('hidden');
        manualContainer.classList.add('hidden');
        btnAuto.classList.add('active');
        btnManual.classList.remove('active');
    } else {
        autoContainer.classList.add('hidden');
        manualContainer.classList.remove('hidden');
        btnAuto.classList.remove('active');
        btnManual.classList.add('active');
    }

    if (typeof gsap !== 'undefined') {
        const activeContainer = mode === 'auto' ? autoContainer : manualContainer;
        gsap.fromTo(activeContainer,
            { opacity: 0, y: 8 },
            { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' });
    }
}
