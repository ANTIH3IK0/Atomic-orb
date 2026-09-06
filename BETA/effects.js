// effects.js

const TARGET_PANEL_SELECTOR = '.ui-overlay, .tp-overlay, .pt-modal-window';
let liquidGLInstances = [];

document.addEventListener('DOMContentLoaded', () => {
    initLiquidGLQuicksilver();
    initGroupAttributesObserver();
    initModalVisibilityHandler();
    initGSAPAnimations();
    initGlassInteractivity();
});

/* LiquidGL Initialization - High Specular Quicksilver Light Reflection (Isolated Background) */
function initLiquidGLQuicksilver() {
    const panels = document.querySelectorAll(TARGET_PANEL_SELECTOR);
    if (!panels.length) return;

    panels.forEach(panel => {
        // Construct or configure LiquidGL instance on panels
        if (typeof LiquidGL !== 'undefined') {
            try {
                const lgl = new LiquidGL({
                    element: panel,
                    captureBackground: false, // Prevents sampling 3D scene/star background
                    metallic: 0.95,           // Aggressive quicksilver metallic sheen
                    specularPower: 128.0,      // Sharp pinpoint light reflections
                    lightIntensity: 1.8,      // Bright mercury highlights
                    refraction: 0.0,          // Zero background distortion pass
                    surfaceTurbulence: 0.15,   // Micro liquid surface ripples
                    color: '#08121f'
                });
                liquidGLInstances.push(lgl);
            } catch (err) {
                // Graceful fallback to CSS glass/specular shader if liquidGL constructor varies
                panel.classList.add('liquid-fallback');
            }
        }
    });
}

/* Global Liquid Refresh Callback used by index.html toggle logic */
function refreshAllLiquid() {
    liquidGLInstances.forEach(inst => {
        if (inst && typeof inst.refresh === 'function') {
            inst.refresh();
        } else if (inst && typeof inst.resize === 'function') {
            inst.resize();
        }
    });
}

/* Periodic Table Dynamic Data Attributes Observer */
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

/* Modal Stacking & Pointer Interaction Protection */
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

/* Interactive Cursor Radial Lighting (Coordinates relative to Panel) */
function initGlassInteractivity() {
    const panels = document.querySelectorAll(TARGET_PANEL_SELECTOR);
    panels.forEach(panel => {
        panel.addEventListener('mousemove', (e) => {
            const rect = panel.getBoundingClientRect();
            panel.style.setProperty('--mouse-x', `${e.clientX - rect.left}px`);
            panel.style.setProperty('--mouse-y', `${e.clientY - rect.top}px`);
        });
    });
}

/* GSAP Transitions & Micro-Interactions */
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

/* Control Panel Switcher Callback */
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
