/**
 * effects.js
 * Dark Low-Key Quicksilver & Dynamic Liquid Optics Engine
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
 * Prevents the closed modal backdrop from blocking viewport clicks.
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
 * Low-Key Smoked Quicksilver Physics Configuration
 */
let liquidInstance = null;

function initLiquidGLEffects() {
    if (typeof liquidGL !== 'function') return;

    liquidInstance = liquidGL({
        snapshot: "body",
        target: ".ui-overlay, .tp-overlay, .pt-modal-window",
        resolution: 1.0,
        refraction: 0.025,     // Low distortion (低調) - eliminates wild purple warping
        aberration: 0.002,     // Minimal chromatic dispersion - removes pink/purple fringe
        bevelDepth: 0.35,      // Soft, sleek dark bevel
        bevelWidth: 0.10,      // Subtle edge light reflection
        frost: 0,
        shadow: true,          // Dark obsidian drop depth
        specular: true,        // Muted metallic light response
        reveal: "fade",
        tilt: false,
        magnify: 1.00,         // Exact 1:1 scale (no zoom distortion)
        on: {
            init(instance) {
                console.log("Dark Low-Key Quicksilver active:", instance);
                fixPointerEventsAndZIndex();
                startDynamicRenderLoop(instance);
            }
        }
    });

    fixPointerEventsAndZIndex();
}

/**
 * Continuous RequestAnimationFrame Loop to keep liquidGL dynamic with moving 3D scene
 */
function startDynamicRenderLoop(instance) {
    let frameCount = 0;

    function renderStep() {
        // Force refresh every 3 frames to dynamically mirror moving 3D particles behind panels
        if (frameCount % 3 === 0 && instance && typeof instance.update === 'function') {
            instance.update();
        }
        frameCount++;
        requestAnimationFrame(renderStep);
    }

    requestAnimationFrame(renderStep);
}

/**
 * Ensures liquidGL WebGL canvases pass clicks directly to panel controls.
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
 * Dynamic Cursor Fluid Ripple Interactivity
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

            // Dynamically trigger liquid update on mouse movement for active liquid flow
            if (liquidInstance && typeof liquidInstance.update === 'function') {
                liquidInstance.update();
            }
        });
    });
}

/**
 * GSAP Micro-Interactions
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
        btnAuto.classList.remove('active');
        btnManual.classList.add('active');
    }

    if (typeof gsap !== 'undefined') {
        const activeContainer = mode === 'auto' ? autoContainer : manualContainer;
        gsap.fromTo(activeContainer, { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' });
    }
}
