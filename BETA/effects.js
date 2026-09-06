// effects.js

let liquidGLInstance = null;

document.addEventListener('DOMContentLoaded', () => {
    initLiquidGLQuicksilver();
    initGroupAttributesObserver();
    initModalVisibilityHandler();
    initGSAPAnimations();
    initGlassInteractivity();
    enforcePointerEvents();
});

/* Initialize LiquidGL with non-blocking refraction canvas */
function initLiquidGLQuicksilver() {
    if (typeof liquidGL !== 'function') return;

    try {
        liquidGLInstance = liquidGL({
            snapshot: "body",
            target: ".ui-overlay, .tp-overlay, .pt-modal-window",
            resolution: 1.5,
            refraction: 0.008,
            aberration: 0.002,
            bevelDepth: 0.06,
            bevelWidth: 0.10,
            frost: 0,
            shadow: true,
            specular: true,
            reveal: "fade",
            tilt: false,
            tiltFactor: 5,
            tiltEase: 400,
            magnify: 1.0,
            on: {
                init(instance) {
                    console.log("Interactive Semi-Transparent Glass Ready!", instance);
                    enforcePointerEvents();
                }
            }
        });
    } catch (err) {
        console.warn("LiquidGL initialization fallback:", err);
    }
}

/* Ensure LiquidGL Canvas Never Blocks Click Events */
function enforcePointerEvents() {
    const liquidCanvases = document.querySelectorAll('canvas:not(#renderCanvas)');
    liquidCanvases.forEach(canvas => {
        canvas.style.pointerEvents = 'none';
    });
}

/* Refresh Liquid Effects without lockups */
function refreshAllLiquid() {
    if (liquidGLInstance && typeof liquidGLInstance.refresh === 'function') {
        liquidGLInstance.refresh();
    }
    enforcePointerEvents();
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

/* Modal Synchronization */
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

/* Mouse Lighting Track */
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

/* GSAP Animations */
function initGSAPAnimations() {
    if (typeof gsap === 'undefined') return;

    gsap.from('#uiOverlay', { x: -30, opacity: 0, duration: 0.5, ease: 'power2.out', delay: 0.1 });
    gsap.from('#tpOverlay', { x: 30,  opacity: 0, duration: 0.5, ease: 'power2.out', delay: 0.2 });
}

/* Control Mode Switcher */
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
            { opacity: 0, y: 6 },
            { opacity: 1, y: 0, duration: 0.3, ease: 'power2.out' });
    }

    refreshAllLiquid();
}
