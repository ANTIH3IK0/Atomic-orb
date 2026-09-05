/**
 * effects.js
 * Quicksilver Liquid Metal Physics & High-Performance Specular Optics
 */
document.addEventListener('DOMContentLoaded', () => {
    initGroupAttributesObserver();
    initGlassInteractivity();
    initGSAPAnimations();

    // Delay liquidGL execution until 3D canvas is ready
    setTimeout(() => {
        initLiquidGLEffects();
    }, 400);
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
 * Eliminates pitch-black rendering by targeting #renderCanvas directly 
 * and elevating panel content z-indices via JavaScript.
 */
function initLiquidGLEffects() {
    if (typeof liquidGL !== 'function') return;

    const panels = document.querySelectorAll('.ui-overlay, .tp-overlay, .pt-modal-window');

    panels.forEach((panel) => {
        // Programmatically elevate all UI children above the WebGL background layer
        Array.from(panel.children).forEach(child => {
            if (!child.classList.contains('liquid-gl-bg-layer')) {
                if (window.getComputedStyle(child).position === 'static') {
                    child.style.position = 'relative';
                }
                child.style.zIndex = '2';
            }
        });

        // Inject container layer for the liquid shader
        if (!panel.querySelector('.liquid-gl-bg-layer')) {
            const bgLayer = document.createElement('div');
            bgLayer.className = 'liquid-gl-bg-layer';
            bgLayer.style.position = 'absolute';
            bgLayer.style.top = '0';
            bgLayer.style.left = '0';
            bgLayer.style.width = '100%';
            bgLayer.style.height = '100%';
            bgLayer.style.zIndex = '0';
            bgLayer.style.pointerEvents = 'none';
            bgLayer.style.borderRadius = 'inherit';
            bgLayer.style.overflow = 'hidden';

            panel.prepend(bgLayer);
        }
    });

    liquidGL({
        snapshot: "#renderCanvas", // Refracts only the 3D scene, eliminating dark UI recursion
        target: ".liquid-gl-bg-layer",
        resolution: 1.0,
        refraction: 0.04,
        aberration: 0.01,
        bevelDepth: 0.85,
        bevelWidth: 0.20,
        frost: 0,
        shadow: false,
        specular: true,
        reveal: "fade",
        tilt: false,
        magnify: 1.0,
        on: {
            init(instance) {
                console.log("Quicksilver liquidGL active on 3D canvas snapshot:", instance);
            }
        }
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
