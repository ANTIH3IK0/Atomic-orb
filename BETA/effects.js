/**
 * effects.js
 * Quicksilver Liquid Metal Physics & High-Performance Optics
 */
document.addEventListener('DOMContentLoaded', () => {
    initGroupAttributesObserver();
    initModalVisibilityHandler();
    initGlassInteractivity();
    initGSAPAnimations();

    // Delay initialization slightly to let renderCanvas paint first frame
    setTimeout(() => {
        initLiquidGLEffects();
    }, 250);
});

/**
 * Destroys the invisible full-screen hit-shield caused by the periodic table modal when closed.
 */
function initModalVisibilityHandler() {
    const modalBackdrop = document.querySelector('.pt-modal-backdrop');
    if (!modalBackdrop) return;

    const syncModalDisplay = () => {
        if (modalBackdrop.classList.contains('open')) {
            modalBackdrop.style.display = 'flex';
            modalBackdrop.style.pointerEvents = 'auto';
        } else {
            modalBackdrop.style.display = 'none';
            modalBackdrop.style.pointerEvents = 'none';
        }
    };

    syncModalDisplay();

    // Observe class changes (e.g. when opening/closing periodic table)
    const observer = new MutationObserver(syncModalDisplay);
    observer.observe(modalBackdrop, { attributes: true, attributeFilter: ['class'] });
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
 * Restores official liquidGL physics targeting active panels only.
 */
function initLiquidGLEffects() {
    if (typeof liquidGL !== 'function') return;

    liquidGL({
        snapshot: "body",
        target: ".ui-overlay, .tp-overlay", // Exclude closed modal to prevent full-screen canvas locking
        resolution: 1.5,
        refraction: 0.12,     // Viscous liquid metallic refraction
        aberration: 0.04,     // Chromatic light splitting
        bevelDepth: 0.85,     // Sharp metallic edge bevel catching CSS borders
        bevelWidth: 0.20,
        frost: 0,             // Pure quicksilver clarity
        shadow: true,
        specular: true,       // Moving light highlights
        reveal: "fade",
        tilt: false,          // Keep false to maintain fixed hitboxes for inputs
        magnify: 1.0,
        on: {
            init(instance) {
                console.log("liquidGL Quicksilver active:", instance);
                makeCanvasesPassThrough();
            }
        }
    });

    makeCanvasesPassThrough();
}

/**
 * Ensures liquidGL canvases pass mouse clicks through to panel controls.
 */
function makeCanvasesPassThrough() {
    // Force all generated overlay canvases to ignore pointer events
    const canvases = document.querySelectorAll('canvas');
    canvases.forEach(cvs => {
        if (cvs.id !== 'renderCanvas') {
            cvs.style.pointerEvents = 'none';
        }
    });

    // Elevate all interactive elements inside panels
    const panels = document.querySelectorAll('.ui-overlay, .tp-overlay, .pt-modal-window');
    panels.forEach(panel => {
        panel.style.pointerEvents = 'auto';
        const interactiveItems = panel.querySelectorAll('button, input, select, label, a, .mode-btn, .close-btn, .pt-element-card');
        interactiveItems.forEach(el => {
            el.style.pointerEvents = 'auto';
            el.style.position = 'relative';
            el.style.zIndex = '10';
        });
    });
}

/**
 * Dynamic Cursor Specular Light Tracking
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
 * Interface Entrance Sequences & Micro-Interactions
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
