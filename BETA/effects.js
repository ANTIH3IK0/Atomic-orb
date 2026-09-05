/**
 * effects.js
 * Dynamic Low-Key Dark Quicksilver Engine (Non-Blocking Event Loop)
 */
document.addEventListener('DOMContentLoaded', () => {
    initGroupAttributesObserver();
    initModalVisibilityHandler();
    initGSAPAnimations();
    initGlassInteractivity();

    setTimeout(() => {
        initLiquidGLEffects();
    }, 250);
});

/**
 * Prevents closed modal backdrop from creating an invisible pointer barrier.
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
 * Low-Key Smoked Quicksilver Engine + Non-Blocking Render Loop
 */
let liquidInstance = null;
let isRendering = false;

function initLiquidGLEffects() {
    if (typeof liquidGL !== 'function') return;

    liquidInstance = liquidGL({
        snapshot: "#renderCanvas", // Target the underlying 3D canvas directly
        target: ".ui-overlay, .tp-overlay, .pt-modal-window",
        resolution: 1.0,
        refraction: 0.02,     // Subtle refractive index (低調)
        aberration: 0.001,    // Near-zero chromatic fringe
        bevelDepth: 0.30,     // Soft, dark smoked glass edge
        bevelWidth: 0.08,
        frost: 0,
        shadow: true,
        specular: true,
        reveal: "fade",
        tilt: false,
        magnify: 1.00,
        on: {
            init(instance) {
                console.log("Dynamic Quicksilver active:", instance);
                fixPointerEventsAndZIndex();
                startDynamicLoop(instance);
            }
        }
    });

    fixPointerEventsAndZIndex();
}

/**
 * Non-blocking, frame-budgeted rendering loop.
 * Replaces while(true)+sleep without locking the main browser thread.
 */
function startDynamicLoop(instance) {
    if (isRendering) return;
    isRendering = true;

    function renderFrame() {
        if (instance) {
            // Force texture snapshot refresh on every animation frame
            if (typeof instance.update === 'function') {
                instance.update();
            } else if (typeof instance.refresh === 'function') {
                instance.refresh();
            } else if (typeof instance.render === 'function') {
                instance.render();
            }
        }
        requestAnimationFrame(renderFrame);
    }

    requestAnimationFrame(renderFrame);
}

/**
 * Pass mouse input through WebGL shader overlays to active controls.
 */
function fixPointerEventsAndZIndex() {
    const canvases = document.querySelectorAll('canvas:not(#renderCanvas)');
    canvases.forEach(cvs => {
        cvs.style.pointerEvents = 'none';
        cvs.style.zIndex = '0';
    });

    const panels = document.querySelectorAll('.ui-overlay, .tp-overlay, .pt-modal-window');
    panels.forEach(panel => {
        panel.style.pointerEvents = 'auto';
        const interactiveElements = panel.querySelectorAll('button, input, select, label, a, .mode-btn, .close-btn, .pt-element-card, .action-link');
        interactiveElements.forEach(el => {
            el.style.position = 'relative';
            el.style.zIndex = '10';
            el.style.pointerEvents = 'auto';
        });
    });
}

/**
 * Dynamic Pointer Specular Reflection
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
        x: -40,
        opacity: 0,
        duration: 0.6,
        ease: 'power3.out',
        delay: 0.15
    });

    gsap.from('#tpOverlay', {
        x: 40,
        opacity: 0,
        duration: 0.6,
        ease: 'power3.out',
        delay: 0.25
    });

    const buttons = document.querySelectorAll('button');
    buttons.forEach(btn => {
        btn.addEventListener('mouseenter', () => {
            gsap.to(btn, {
                scale: 1.02,
                duration: 0.18,
                ease: 'power1.out'
            });
        });

        btn.addEventListener('mouseleave', () => {
            gsap.to(btn, {
                scale: 1.0,
                duration: 0.18,
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
        btnAuto.classList.add('active');
        btnManual.classList.add('active');
    }

    if (typeof gsap !== 'undefined') {
        const activeContainer = mode === 'auto' ? autoContainer : manualContainer;
        gsap.fromTo(activeContainer, { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' });
    }
}
