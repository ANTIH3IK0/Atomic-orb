// effects.js

let liquidGLInstance = null;

document.addEventListener('DOMContentLoaded', () => {
    initLiquidGLQuicksilver();
    initGroupAttributesObserver();
    initModalVisibilityHandler();
    initGSAPAnimations();
    initGlassInteractivity();
});

/* Official LiquidGL Initialization - Dark Extra-Blue Black Quicksilver Theme */
function initLiquidGLQuicksilver() {
    if (typeof liquidGL !== 'function') return;

    try {
        liquidGLInstance = liquidGL({
            snapshot: "body",
            target: ".ui-overlay, .tp-overlay, .pt-modal-window",
            resolution: 2.0,
            refraction: 0.015,   // Dark quicksilver refraction strength
            aberration: 0.005,   // Clean, non-distorting specular edge tint
            bevelDepth: 0.14,    // Deep bevel for thick liquid mercury edges
            bevelWidth: 0.18,    // Broad metallic edge reflection
            frost: 0,            // Pure, crystal clear reflection
            shadow: true,        // Deep shadow beneath panels
            specular: true,      // Enable animated high-contrast light highlights
            reveal: "fade",
            tilt: false,
            tiltFactor: 5,
            tiltEase: 400,
            magnify: 1.0,
            on: {
                init(instance) {
                    console.log("Dark Extra-Blue Quicksilver LiquidGL Ready!", instance);
                }
            }
        });
    } catch (err) {
        console.warn("LiquidGL initialization fallback:", err);
    }
}

/* Global Liquid Refresh Handler */
function refreshAllLiquid() {
    if (liquidGLInstance && typeof liquidGLInstance.refresh === 'function') {
        liquidGLInstance.refresh();
    }
}

/* Dynamic Data-Group Attribute Applicator for Periodic Table Elements */
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

/* Modal Synchronization & Pointer Events Protection */
function initModalVisibilityHandler() {
    const modalBackdrop = document.querySelector('.pt-modal-backdrop');
    if (!modalBackdrop) return;

    const syncModalDisplay = () => {
        const isOpen = modalBackdrop.classList.contains('open');
        modalBackdrop.style.display = isOpen ? 'flex' : 'none';
        modalBackdrop.style.pointerEvents = isOpen ? 'auto' : 'none';
        if (isOpen) refreshAllLiquid();
    };

    syncModalDisplay();
    const observer = new MutationObserver(syncModalDisplay);
    observer.observe(modalBackdrop, { attributes: true, attributeFilter: ['class'] });
}

/* Dynamic Mouse Cursor Lighting Track for Extra Metallic Gloss */
function initGlassInteractivity() {
    const panels = document.querySelectorAll('.ui-overlay, .tp-overlay, .pt-modal-window');
    panels.forEach(panel => {
        panel.addEventListener('mousemove', (e) => {
            const rect = panel.getBoundingClientRect();
            panel.style.setProperty('--mouse-x', `${e.clientX - rect.left}px`);
            panel.style.setProperty('--mouse-y', `${e.clientY - rect.top}px`);
        });
    });
}

/* GSAP Entry Animations & Micro-Interactions */
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

/* Control Mode Switcher Callback */
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

    refreshAllLiquid();
}
