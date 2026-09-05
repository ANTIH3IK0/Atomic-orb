/**
 * effects.js
 * Dynamic Low-Key Dark Quicksilver Engine (Non-Blocking Event Loop)
 */
/* Actinium optical constants — heavy viscous metal, ionized sheen */
const ACTINIUM = {
    snapshot:   '#renderCanvas',
    layerClass: 'actinium-liquid-layer',
    panels:     '.ui-overlay, .tp-overlay, .pt-modal-window',
    refraction: 0.045,   // viscous pull of molten metal
    aberration: 0.008,   // faint ionized fringe
    bevelDepth: 0.78,    // deep quicksilver edge
    bevelWidth: 0.18,
    resolution: 1.0
};

let actiniumInstance = null;
let actiniumLoopRunning = false;

document.addEventListener('DOMContentLoaded', () => {
    initGroupAttributesObserver();
    initModalVisibilityHandler();
    initGSAPAnimations();
    initGlassInteractivity();
    // Let the Babylon scene render a few frames first so the
    // snapshot texture has real content to refract.
    setTimeout(initActiniumLiquid, 400);
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
            // Layer becomes measurable only when visible — re-wake the melt
            requestAnimationFrame(() => refreshActinium());
        }
    };

    syncModalDisplay();
    const observer = new MutationObserver(syncModalDisplay);
    observer.observe(modalBackdrop, { attributes: true, attributeFilter: ['class'] });
}

/* ------------------------------------------------------------------ */
/* Liquid substrate layers                                            */
/* ------------------------------------------------------------------ */

/** Raise a node above the liquid layer only if it would sink under it. */
function elevateAboveLiquid(el) {
    const cs = window.getComputedStyle(el);
    if (cs.position === 'static') el.style.position = 'relative';
    const z = parseInt(cs.zIndex, 10);
    if (isNaN(z) || z < 1) el.style.zIndex = '2';
}

/**
 * Injects one .actinium-liquid-layer per panel (behind all content)
 * and keeps stacking sane for current AND future direct children
 * (kernel.js rebuilds orbit rows, filters and the table grid).
 */
function prepareActiniumLayers() {
    const panels = document.querySelectorAll(ACTINIUM.panels);

    panels.forEach(panel => {
        let layer = panel.querySelector(`:scope > .${ACTINIUM.layerClass}`);
        if (!layer) {
            layer = document.createElement('div');
            layer.className = ACTINIUM.layerClass;
            layer.setAttribute('aria-hidden', 'true');
            panel.prepend(layer);
        }

        Array.from(panel.children).forEach(child => {
            if (child.classList.contains(ACTINIUM.layerClass)) return;
            elevateAboveLiquid(child);
        });

        const childObserver = new MutationObserver(mutations => {
            mutations.forEach(m => m.addedNodes.forEach(node => {
                if (node.nodeType === 1 && !node.classList.contains(ACTINIUM.layerClass)) {
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

/** Defensive texture refresh — liquidGL API variants differ. */
function refreshActinium() {
    const inst = actiniumInstance;
    if (!inst) return;
    if (typeof inst.update === 'function') inst.update();
    else if (typeof inst.refresh === 'function') inst.refresh();
    else if (typeof inst.render === 'function') inst.render();
}

/**
 * Frame-budgeted live refraction loop:
 * every 2nd frame, paused while the tab is hidden.
 */
function startActiniumLoop() {
    if (actiniumLoopRunning) return;
    actiniumLoopRunning = true;
    let frame = 0;
    (function tick() {
        frame++;
        if (!document.hidden && (frame % 2 === 0)) refreshActinium();
        requestAnimationFrame(tick);
    })();
}

/** Boots the actinium-quicksilver shader stack. */
function initActiniumLiquid() {
    prepareActiniumLayers();

    if (typeof liquidGL !== 'function') return; // CSS dark-glass fallback stays intact

    liquidGL({
        snapshot:   ACTINIUM.snapshot,   // refract ONLY the 3D scene
        target:     '.' + ACTINIUM.layerClass,
        resolution: ACTINIUM.resolution,
        refraction: ACTINIUM.refraction,
        aberration: ACTINIUM.aberration,
        bevelDepth: ACTINIUM.bevelDepth,
        bevelWidth: ACTINIUM.bevelWidth,
        frost:      0,
        shadow:     false,
        specular:   true,
        reveal:     'fade',
        tilt:       false,
        magnify:    1.0,
        on: {
            init(instance) {
                actiniumInstance = instance || null;
                neutralizeLiquidCanvases();
                startActiniumLoop();
                // Safety pass for late-injected shader canvases
                setTimeout(neutralizeLiquidCanvases, 900);
            }
        }
    });

    neutralizeLiquidCanvases();
}

/* ------------------------------------------------------------------ */
/* Cursor-tracked specular bloom (feeds --mouse-x / --mouse-y)        */
/* ------------------------------------------------------------------ */
function initGlassInteractivity() {
    const glassPanels = document.querySelectorAll(ACTINIUM.panels);
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
