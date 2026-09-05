// effects.js

/* Molten Quicksilver Primary Layer Configuration */
const ACTINIUM_MELT_CONFIG = {
    layerClass: 'actinium-liquid-layer',
    refraction: 0.022,
    aberration: 0.002,
    bevelDepth: 0.65,
    bevelWidth: 0.32,
    frost:      0
};

/* Quicksilver Specular Film Configuration */
const GLASS_FILM_CONFIG = {
    layerClass: 'actinium-glass-film',
    refraction: 0.008,
    aberration: 0.001,
    bevelDepth: 0.20,
    bevelWidth: 0.18,
    frost:      0.08
};

const TARGET_PANEL_SELECTOR = '.ui-overlay, .tp-overlay, .pt-modal-window';
const CANVAS_SNAPSHOT_ID    = '#renderCanvas';

let activeLiquidInstances = [];
let isRenderLoopActive    = false;

document.addEventListener('DOMContentLoaded', () => {
    initGroupAttributesObserver();
    initModalVisibilityHandler();
    initGSAPAnimations();
    initGlassInteractivity();
    
    // Defer liquidGL instantiation until 3D viewport canvas finishes mounting
    setTimeout(initLiquidEffects, 400);
});

/* Periodic Table Dynamic Data Attributes Observer */
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

/* Modal Stacking & Pointer Interaction Protection */
function initModalVisibilityHandler() {
    const modalBackdrop = document.querySelector('.pt-modal-backdrop');
    if (!modalBackdrop) return;

    const syncModalDisplay = () => {
        const isOpen = modalBackdrop.classList.contains('open');
        modalBackdrop.style.display = isOpen ? 'flex' : 'none';
        modalBackdrop.style.pointerEvents = isOpen ? 'auto' : 'none';
        if (isOpen) {
            requestAnimationFrame(() => refreshAllLiquid());
        }
    };

    syncModalDisplay();
    const observer = new MutationObserver(syncModalDisplay);
    observer.observe(modalBackdrop, { attributes: true, attributeFilter: ['class'] });
}

/* Dynamic Z-Index Elevation & Substrate Injection */
function elevateAboveLiquid(el) {
    const computed = window.getComputedStyle(el);
    if (computed.position === 'static') {
        el.style.position = 'relative';
    }
    const currentZ = parseInt(computed.zIndex, 10);
    if (isNaN(currentZ) || currentZ < 2) {
        el.style.zIndex = '2';
    }
}

function prepareLiquidLayers() {
    const panels = document.querySelectorAll(TARGET_PANEL_SELECTOR);

    panels.forEach(panel => {
        // Inject Layer 1: Quicksilver Melt
        let meltLayer = panel.querySelector(`:scope > .${ACTINIUM_MELT_CONFIG.layerClass}`);
        if (!meltLayer) {
            meltLayer = document.createElement('div');
            meltLayer.className = ACTINIUM_MELT_CONFIG.layerClass;
            meltLayer.setAttribute('aria-hidden', 'true');
            panel.prepend(meltLayer);
        }

        // Inject Layer 2: Glass Film
        let filmLayer = panel.querySelector(`:scope > .${GLASS_FILM_CONFIG.layerClass}`);
        if (!filmLayer) {
            filmLayer = document.createElement('div');
            filmLayer.className = GLASS_FILM_CONFIG.layerClass;
            filmLayer.setAttribute('aria-hidden', 'true');
            meltLayer.insertAdjacentElement('afterend', filmLayer);
        }

        // Safeguard existing UI elements above shader canvases
        Array.from(panel.children).forEach(child => {
            if (child === meltLayer || child === filmLayer) return;
            elevateAboveLiquid(child);
        });

        // Watch for dynamically inserted content (e.g., dynamic orbit rows)
        const childObserver = new MutationObserver(mutations => {
            mutations.forEach(m => m.addedNodes.forEach(node => {
                if (node.nodeType === 1 &&
                    !node.classList.contains(ACTINIUM_MELT_CONFIG.layerClass) &&
                    !node.classList.contains(GLASS_FILM_CONFIG.layerClass)) {
                    elevateAboveLiquid(node);
                }
            }));
        });
        childObserver.observe(panel, { childList: true });
    });
}

function neutralizeLiquidCanvases() {
    document.querySelectorAll('canvas').forEach(canvas => {
        if (canvas.id === 'renderCanvas') return;
        canvas.style.pointerEvents = 'none';
        canvas.style.zIndex = '0';
    });
}

/* liquidGL Boot Sequences */
function bootLiquidLayer(config) {
    try {
        liquidGL({
            snapshot:   CANVAS_SNAPSHOT_ID,
            target:     '.' + config.layerClass,
            resolution: 1.0,
            refraction: config.refraction,
            aberration: config.aberration,
            bevelDepth: config.bevelDepth,
            bevelWidth: config.bevelWidth,
            frost:      config.frost,
            shadow:     false,
            specular:   true,
            reveal:     'fade',
            tilt:       false,
            magnify:    1.0,
            on: {
                init(instance) {
                    if (instance) activeLiquidInstances.push(instance);
                    neutralizeLiquidCanvases();
                    startDynamicRenderLoop();
                }
            }
        });
    } catch (err) {
        console.warn('liquidGL substrate execution deferred:', config.layerClass, err);
    }
}

function initLiquidEffects() {
    prepareLiquidLayers();

    if (typeof liquidGL !== 'function') return;

    bootLiquidLayer(ACTINIUM_MELT_CONFIG);
    bootLiquidLayer(GLASS_FILM_CONFIG);

    neutralizeLiquidCanvases();
    setTimeout(neutralizeLiquidCanvases, 900);
}

/* Continuous Render Loop */
function refreshAllLiquid() {
    activeLiquidInstances.forEach(instance => {
        if (!instance) return;
        if (typeof instance.update === 'function') instance.update();
        else if (typeof instance.refresh === 'function') instance.refresh();
        else if (typeof instance.render === 'function') instance.render();
    });
}

function startDynamicRenderLoop() {
    if (isRenderLoopActive) return;
    isRenderLoopActive = true;
    (function tick() {
        if (!document.hidden) refreshAllLiquid();
        requestAnimationFrame(tick);
    })();
}

/* Interactive Cursor Radial Lighting */
function initGlassInteractivity() {
    const panels = document.querySelectorAll(TARGET_PANEL_SELECTOR);
    panels.forEach(panel => {
        panel.addEventListener('mousemove', (e) => {
            const rect = panel.getBoundingClientRect();
            panel.style.setProperty('--mouse-x', `${e.clientX - rect.left}px`);
            panel.style.setProperty('--mouse-y', `${e.clientY - rect.top}px`);
        });
    });
}

/* GSAP Transitions & Micro-Interactions */
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

/* Control Panel Switcher Callback */
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
