/**
 * effects.js
 * Quicksilver Liquid Metal Physics & High-Performance Specular Optics
 */
document.addEventListener('DOMContentLoaded', () => {
    initGroupAttributesObserver();
    initGlassInteractivity();
    initGSAPAnimations();

    // Injects a metallic gradient texture source for liquidGL sampling
    // Resolves pitch-black rendering caused by unpreserved WebGL buffers
    createSnapshotSource();

    setTimeout(() => {
        initLiquidGLEffects();
        fixPointerEventsAndZIndex();
    }, 300);
});

function createSnapshotSource() {
    if (document.getElementById('liquidSnapshotSource')) return;
    const source = document.createElement('div');
    source.id = 'liquidSnapshotSource';
    source.style.cssText = `
        position: fixed;
        top: 0; left: 0;
        width: 100vw; height: 100vh;
        z-index: -9999;
        pointer-events: none;
        background: radial-gradient(circle at 30% 30%, #5a6e85 0%, #121822 45%, #030508 75%),
                    linear-gradient(135deg, #2a3848 0%, #080d14 50%, #485c72 100%);
        background-blend-mode: overlay;
    `;
    document.body.appendChild(source);
}

function applyGroupDataAttributes() {
    const cards = document.querySelectorAll('.pt-element-card');
    cards.forEach(card => {
        if (card.dataset.group) return;
        const groupSpan = card.querySelector('.pt-card-top span:nth-child(2)');
        if (groupSpan) {
            const groupText = groupSpan.textContent.trim();
            const groupNum = groupText.replace('G', '');
            if (groupNum) {
                card.dataset.group = groupNum;
            }
        }
    });
}

function initGroupAttributesObserver() {
    applyGroupDataAttributes();

    const container = document.getElementById('ptGridContainer');
    if (container) {
        const observer = new MutationObserver(() => {
            applyGroupDataAttributes();
        });
        observer.observe(container, { childList: true, subtree: true });
    }
}

/**
 * Initializes liquidGL targeting a non-black gradient snapshot source
 */
function initLiquidGLEffects() {
    if (typeof liquidGL !== 'function') return;

    const panels = document.querySelectorAll('.ui-overlay, .tp-overlay, .pt-modal-window');

    panels.forEach((panel) => {
        if (!panel.querySelector('.liquid-gl-bg-layer')) {
            const bgLayer = document.createElement('div');
            bgLayer.className = 'liquid-gl-bg-layer';
            bgLayer.style.cssText = `
                position: absolute;
                top: 0; left: 0;
                width: 100%; height: 100%;
                z-index: 0;
                pointer-events: none;
                border-radius: inherit;
                overflow: hidden;
            `;
            panel.prepend(bgLayer);
        }
    });

    liquidGL({
        snapshot: "#liquidSnapshotSource", // Samples from custom non-black metallic source
        target: ".liquid-gl-bg-layer",
        resolution: 1.0,
        refraction: 0.08,      // Viscous fluid displacement
        aberration: 0.02,      // Subtle chromatic dispersion
        bevelDepth: 0.85,      // Crisp metallic border reflection
        bevelWidth: 0.20,
        frost: 0,
        shadow: false,
        specular: true,        // High-gloss moving specular highlight
        reveal: "fade",
        tilt: false,
        magnify: 1.0,
        on: {
            init(instance) {
                console.log("Quicksilver liquidGL active with custom texture source:", instance);
                fixPointerEventsAndZIndex();
            }
        }
    });
}

/**
 * Forces interactive elements above the WebGL overlay canvas layer
 */
function fixPointerEventsAndZIndex() {
    const panels = document.querySelectorAll('.ui-overlay, .tp-overlay, .pt-modal-window');

    panels.forEach(panel => {
        panel.style.pointerEvents = 'auto';

        // Elevate all interactive UI elements
        const uiElements = panel.querySelectorAll('button, input, select, label, header, .mode-switch-bar, .input-card, .orbit-row, .filter-item, .pt-modal-header, .pt-scroll-area');
        uiElements.forEach(el => {
            el.style.position = 'relative';
            el.style.zIndex = '10';
            el.style.pointerEvents = 'auto';
        });

        // Set shader canvases to pass through click events
        const canvases = panel.querySelectorAll('canvas, .liquid-gl-bg-layer');
        canvases.forEach(c => {
            c.style.pointerEvents = 'none';
            c.style.zIndex = '0';
        });
    });
}

/**
 * Dynamic Cursor Specular Lighting
 */
function initGlassInteractivity() {
    const glassPanels = document.querySelectorAll('.ui-overlay, .tp-overlay, .pt-modal-window');

    glassPanels.forEach(panel => {
        panel.addEventListener('mousemove', (e) => {
            const rect = panel.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            panel.style.setProperty('--mouse-x', `${x}px`);
            panel.style.setProperty('--mouse-y', `${y}px`);
        });
    });
}

/**
 * GSAP Interface Micro-Interactions
 */
function initGSAPAnimations() {
    if (typeof gsap === 'undefined') return;

    gsap.from('#uiOverlay', {
        x: -60,
        opacity: 0,
        duration: 0.8,
        ease: 'power3.out',
        delay: 0.1
    });

    gsap.from('#tpOverlay', {
        x: 60,
        opacity: 0,
        duration: 0.8,
        ease: 'power3.out',
        delay: 0.2
    });

    const buttons = document.querySelectorAll('button');
    buttons.forEach(btn => {
        btn.addEventListener('mouseenter', () => {
            gsap.to(btn, {
                scale: 1.02,
                duration: 0.2,
                ease: 'power1.out'
            });
        });

        btn.addEventListener('mouseleave', () => {
            gsap.to(btn, {
                scale: 1.0,
                duration: 0.2,
                ease: 'power1.out'
            });
        });

        btn.addEventListener('mousedown', () => {
            gsap.to(btn, {
                scale: 0.97,
                duration: 0.08,
                ease: 'power1.inOut'
            });
        });
    });
}

/**
 * Control Panel Mode Switcher Callback
 */
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
        gsap.fromTo(activeContainer, { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' });
    }
}
