/**
 * effects.js
 * Dynamic Dark Aero Quicksilver Physics & Optics
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
 * Dark Aero Quicksilver Optics Engine
 */
function initLiquidGLEffects() {
    if (typeof liquidGL !== 'function') return;

    liquidGL({
        snapshot: "body",
        target: ".ui-overlay, .tp-overlay, .pt-modal-window",
        resolution: 1.5,
        refraction: 0.28,      // High refractive index for liquid mercury lens distortion
        aberration: 0.08,      // Metallic chromatic edge splitting
        bevelDepth: 0.95,      // Deep specular bevel to catch CSS border highlights
        bevelWidth: 0.26,      // Wide liquid metal edge curvature
        frost: 0,              // Raw quicksilver surface clarity
        shadow: true,          // Obsidian drop shadow contrast
        specular: true,        // Active animated light reflection
        reveal: "fade",
        tilt: false,           // Prevents click misalignment on interactive elements
        magnify: 1.04,         // Lens magnification for deep liquid perception
        on: {
            init(instance) {
                console.log("Dark Aero Quicksilver active:", instance);
                fixPointerEventsAndZIndex();
            }
        }
    });

    fixPointerEventsAndZIndex();
}

/**
 * Passes click interactions directly through shader overlay canvases.
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
 * Dynamic Liquid Specular Light Tracking
 */
function initGlassInteractivity() {
    const glassPanels = document.querySelectorAll('.ui-overlay, .tp-overlay, .pt-modal-window');

    glassPanels.forEach(panel => {
        panel.addEventListener('mousemove', (e) => {
            const rect = panel.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            // Dynamically update light source position for CSS specular gradients
            panel.style.setProperty('--mouse-x', `${x}px`);
            panel.style.setProperty('--mouse-y', `${y}px`);

            // Dynamic fluid shimmer calculation based on cursor proximity to center
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            const distFromCenter = Math.hypot(x - centerX, y - centerY) / Math.hypot(centerX, centerY);

            panel.style.setProperty('--fluid-intensity', `${0.2 + (1 - distFromCenter) * 0.4}`);
        });

        panel.addEventListener('mouseleave', () => {
            panel.style.setProperty('--fluid-intensity', '0.2');
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
