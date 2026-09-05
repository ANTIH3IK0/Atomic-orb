/**
 * effects.js
 * Quicksilver Liquid Metal Physics & Refraction Optics
 */
document.addEventListener('DOMContentLoaded', () => {
    initGroupAttributesObserver();
    initLiquidGLEffects();
    initGSAPAnimations();
    initGlassInteractivity();
});

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
 * Heavy Liquid Metal Refraction & High-Specular Optics via Official liquidGL API
 */
function initLiquidGLEffects() {
    if (typeof liquidGL !== 'function') return;

    liquidGL({
        snapshot: "body",
        target: ".ui-overlay, .tp-overlay, .pt-modal-window, button.apply-btn, button.secondary-btn, .close-btn",
        resolution: 2.0,
        refraction: 0.88,      // Extreme refraction strength for deep distortion
        aberration: 0.48,      // Strong chromatic light warping & prismatic split
        bevelDepth: 0.85,      // Deep liquid edge bevel catching 1px borders
        bevelWidth: 0.28,      // Broad metallic specular gradient along edges
        frost: 0,              // Crystal clarity for raw mercury reflectivity
        shadow: true,          // Obsidian drop shadows
        specular: true,        // High-intensity animated specular reflections
        reveal: "fade",
        tilt: true,            // Physics-based 3D surface tilt
        tiltFactor: 8,         // Heavy liquid mass inertia
        tiltEase: 450,         // Viscous fluid settle timing
        magnify: 1.08,         // Heavy liquid lens distortion
        on: {
            init(instance) {
                console.log("Quicksilver liquidGL active:", instance);
            }
        }
    });
}

/**
 * Dynamic Dynamic Lighting & Cursor Tracking
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
 * Interface Motion Sequences
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
 * Control Mode Switcher Callback
 */
function switchControlMode(mode) {
    const autoContainer = document.getElementById('autoModeContainer');
    const manualContainer = document.getElementById('manualModeContainer');
    const btnAuto = document.getElementById('btnModeAuto');
    const btnManual = document.getElementById('btnModeManual');

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
