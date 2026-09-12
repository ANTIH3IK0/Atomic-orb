// effects.js - Self-contained UI effects, dynamic glass engine & idle theme controller

/* Global Theme & Particle State Hooks */
window.isRedFilterActive = false;
window.activeParticleColor = { r: 0.85, g: 0.85, b: 0.9 }; // Stark neutral quantum cloud

/* Theme Palettes */
const DEFCSS = Object.freeze({
    '--bg-dark': '#000000',
    '--ui-bg': 'rgba(12, 13, 17, 0.88)',
    '--panel-glass': 'rgba(5, 5, 6, 0.86)',
    '--card-glass': 'rgba(10, 10, 12, 0.88)',
    '--row-glass': 'rgba(8, 8, 10, 0.85)',
    '--input-bg': 'rgba(3, 3, 4, 0.95)',
    '--quicksilver-bright': '#cacaca',
    '--quicksilver-silver': '#686868',
    '--text-main': '#b3b3b3',
    '--text-sub': '#7a7a7a',
    '--text-muted': '#424242',
    '--text-accent': '#cacaca',
    '--edge-color-1': 'rgba(255, 255, 255, 0.4)',
    '--edge-color-2': 'rgba(255, 255, 255, 0.15)',
    '--edge-color-3': 'rgba(255, 255, 255, 0.03)',
    '--glow-color': 'rgba(255, 255, 255, 0.04)',
    '--text-glow': 'none',
    '--panel-border': '1px solid rgba(255, 255, 255, 0.12)',
    '--slider-thumb': '#ffffff',
    '--slider-track': 'rgba(255, 255, 255, 0.18)'
});

/* Low-Key Dark Crimson Theme */
const REDCSS = Object.freeze({
    '--bg-dark': '#030102',
    '--ui-bg': 'rgba(15, 7, 6, 0.88)',
    '--panel-glass': 'rgba(18, 3, 5, 0.92)',
    '--card-glass': 'rgba(24, 4, 7, 0.90)',
    '--row-glass': 'rgba(14, 2, 4, 0.88)',
    '--input-bg': 'rgba(8, 1, 2, 0.95)',
    '--quicksilver-bright': '#d93848',      /* Subdued deep crimson */
    '--quicksilver-silver': '#a62d3a',      /* Low-key secondary labels */
    '--text-main': '#cf3446',              /* Muted clear red */
    '--text-sub': '#9e2b38',               /* Soft subtext */
    '--text-muted': '#661b23',             /* Subdued dark text */
    '--text-accent': '#e6394a',            /* Understated highlight */
    '--edge-color-1': '#73131d',           /* Dark ambient edge specular */
    '--edge-color-2': '#4a0b12',
    '--edge-color-3': '#260509',
    '--glow-color': 'rgba(160, 20, 35, 0.12)',
    '--text-glow': '0 0 6px rgba(180, 25, 40, 0.25)',
    '--panel-border': '1px solid rgba(160, 25, 40, 0.22)',
    '--slider-thumb': '#bf2c3e',
    '--slider-track': 'rgba(160, 25, 40, 0.25)'
});

function applyCSSTheme(theme) {
    const root = document.documentElement;
    for (const [key, value] of Object.entries(theme)) {
        root.style.setProperty(key, value);
    }
}

function setRedFilterMode(enable) {
    if (window.isRedFilterActive === enable) return;
    window.isRedFilterActive = Boolean(enable);
    
    // 1. Mutate CSS Custom Properties
    applyCSSTheme(window.isRedFilterActive ? REDCSS : DEFCSS);

    // 2. Synchronize 3D Atomic Particle Cloud Colors
    window.activeParticleColor = window.isRedFilterActive 
        ? { r: 0.65, g: 0.1, b: 0.15 } 
        : { r: 0.85, g: 0.85, b: 0.9 };

    // 3. Trigger 3D Kernel Re-render Hook
    if (typeof window.rebuildQuantumModel === 'function') {
        window.rebuildQuantumModel();
    }
}

window.setRedFilterMode = setRedFilterMode;
window.applyCSSTheme = applyCSSTheme;

/* DOM Lifecycle Entry Point */
document.addEventListener('DOMContentLoaded', () => {
    injectGlobalThemeStyles();
    initGroupAttributesObserver();
    initModalVisibilityHandler();
    initGSAPAnimations();
    initSuborbitNotationObserver();
    initQuicksilverGlassEngine();
    initIdleRedFilter();
});

/* Dynamic Style Overrides Injection */
function injectGlobalThemeStyles() {
    const styleTag = document.createElement('style');
    styleTag.id = 'themeDynamicOverrides';
    styleTag.textContent = `
        .ui-overlay *, .tp-overlay *, .pt-modal-window * {
            background: var(--ui-bg);
            color: var(--text-main) !important;
            text-shadow: var(--text-glow, none) !important;
        }

        .ui-overlay, .tp-overlay, .pt-modal-window {
            border: var(--panel-border) !important;
            box-shadow: 0 0 20px var(--glow-color) !important;
        }

        input[type=range] {
            -webkit-appearance: none;
            background: transparent;
        }
        input[type=range]::-webkit-slider-thumb {
            -webkit-appearance: none;
            height: 18px;
            width: 18px;
            border-radius: 50%;
            background: var(--slider-thumb) !important;
            box-shadow: 0 0 8px var(--glow-color) !important;
            cursor: pointer;
            margin-top: -6px;
        }
        input[type=range]::-webkit-slider-runnable-track {
            width: 100%;
            height: 6px;
            background: var(--slider-track) !important;
            border-radius: 3px;
        }
    `;
    document.head.appendChild(styleTag);
}

/* Format Quantum Suborbit Notation */
function formatSuborbitNotation(text) {
    if (!text) return '';
    return text.replace(/([0-9][a-zA-Z])([0-9]+\/[0-9]+)/g, '$1<sub>$2</sub>');
}

function processSuborbitRows() {
    const targets = document.querySelectorAll('.orbit-row span, .filter-item span');
    targets.forEach(el => {
        if (!el.dataset.suborbitFormatted && el.children.length === 0) {
            const text = el.textContent.trim();
            if (/^[0-9][a-zA-Z][0-9]+\/[0-9]+$/.test(text)) {
                el.innerHTML = formatSuborbitNotation(text);
                el.classList.add('suborbit-label');
                el.dataset.suborbitFormatted = 'true';
            }
        }
    });
}

/* Scoped Mutation Observer for UI suborbit labels */
function initSuborbitNotationObserver() {
    processSuborbitRows();
    const container = document.getElementById('uiOverlay') || document.body;
    const observer = new MutationObserver(() => processSuborbitRows());
    observer.observe(container, { childList: true, subtree: true });
}

/* Dynamic Periodic Table Group Attributes */
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

/* Modal Visibility Handler */
function initModalVisibilityHandler() {
    const modalBackdrop = document.querySelector('.pt-modal-backdrop');
    if (!modalBackdrop) return;

    const syncModalDisplay = () => {
        const isOpen = modalBackdrop.classList.contains('open');
        if (isOpen) {
            modalBackdrop.style.display = 'flex';
            modalBackdrop.style.pointerEvents = 'auto';
        } else {
            modalBackdrop.style.pointerEvents = 'none';
            setTimeout(() => {
                if (!modalBackdrop.classList.contains('open')) {
                    modalBackdrop.style.display = 'none';
                }
            }, 250);
        }
    };

    syncModalDisplay();
    const observer = new MutationObserver(syncModalDisplay);
    observer.observe(modalBackdrop, { attributes: true, attributeFilter: ['class'] });
}

/* Entrance Animations */
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
}

/* Quicksilver Glass Engine: Touch Spotlight, Surface Compression & Edge Light */
function initQuicksilverGlassEngine() {
    const panels = document.querySelectorAll('.ui-overlay, .tp-overlay, .pt-modal-window');
    const PROXIMITY_THRESHOLD = 90;

    panels.forEach(panel => {
        let currentX = 0, currentY = 0;
        let targetX = 0, targetY = 0;
        let pointerX = 0, pointerY = 0;
        let opacity = 0;
        let distOpacity = 0;
        let glowOpacity = 0;
        let intensityX = 0, intensityY = 0;
        let isHovered = false;
        let animFrame = null;

        function getNearestEdgePoint(mouseX, mouseY, width, height) {
            const leftDist = mouseX;
            const rightDist = width - mouseX;
            const topDist = mouseY;
            const bottomDist = height - mouseY;
            const minDist = Math.min(leftDist, rightDist, topDist, bottomDist);

            let edgeX = mouseX;
            let edgeY = mouseY;

            if (minDist === leftDist) edgeX = 0;
            else if (minDist === rightDist) edgeX = width;
            else if (minDist === topDist) edgeY = 0;
            else if (minDist === bottomDist) edgeY = height;

            return { x: edgeX, y: edgeY, leftDist, rightDist, topDist, bottomDist };
        }

        function update() {
            currentX += (targetX - currentX) * 0.12;
            currentY += (targetY - currentY) * 0.12;

            const dist = Math.hypot(targetX - currentX, targetY - currentY);
            
            if (isHovered) {
                const targetEdgeOpacity = dist > 1.5 ? Math.min(1, dist / 25) : 0;
                opacity += (targetEdgeOpacity - opacity) * 0.12;
                glowOpacity += (1.0 - glowOpacity) * 0.15;
            } else {
                opacity += (0 - opacity) * 0.15;
                distOpacity += (0 - distOpacity) * 0.15;
                glowOpacity += (0 - glowOpacity) * 0.15;
            }

            panel.style.setProperty('--mouse-x', `${currentX.toFixed(2)}px`);
            panel.style.setProperty('--mouse-y', `${currentY.toFixed(2)}px`);
            panel.style.setProperty('--pointer-x', `${pointerX.toFixed(2)}px`);
            panel.style.setProperty('--pointer-y', `${pointerY.toFixed(2)}px`);
            panel.style.setProperty('--edge-opacity', opacity.toFixed(3));
            panel.style.setProperty('--distortion-opacity', distOpacity.toFixed(3));
            panel.style.setProperty('--glow-opacity', glowOpacity.toFixed(3));
            panel.style.setProperty('--press-intensity-x', intensityX.toFixed(3));
            panel.style.setProperty('--press-intensity-y', intensityY.toFixed(3));

            if (opacity > 0.005 || distOpacity > 0.005 || glowOpacity > 0.005 || isHovered) {
                animFrame = requestAnimationFrame(update);
            } else {
                panel.style.setProperty('--edge-opacity', '0');
                panel.style.setProperty('--distortion-opacity', '0');
                panel.style.setProperty('--glow-opacity', '0');
                animFrame = null;
            }
        }

        function handlePointerMove(clientX, clientY) {
            const rect = panel.getBoundingClientRect();
            pointerX = clientX - rect.left;
            pointerY = clientY - rect.top;

            const edgeData = getNearestEdgePoint(pointerX, pointerY, rect.width, rect.height);
            targetX = edgeData.x;
            targetY = edgeData.y;

            const minX = Math.min(edgeData.leftDist, edgeData.rightDist);
            const minY = Math.min(edgeData.topDist, edgeData.bottomDist);

            const targetIntX = Math.max(0, (PROXIMITY_THRESHOLD - minX) / PROXIMITY_THRESHOLD);
            const targetIntY = Math.max(0, (PROXIMITY_THRESHOLD - minY) / PROXIMITY_THRESHOLD);

            intensityX += (targetIntX - intensityX) * 0.2;
            intensityY += (targetIntY - intensityY) * 0.2;

            distOpacity = Math.max(intensityX, intensityY);

            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            const tiltX = (pointerY - centerY) / centerY * -2;
            const tiltY = (pointerX - centerX) / centerX * 2;

            panel.style.setProperty('--tilt-x', `${tiltX}deg`);
            panel.style.setProperty('--tilt-y', `${tiltY}deg`);

            if (!animFrame) animFrame = requestAnimationFrame(update);
        }

        panel.addEventListener('mouseenter', (e) => {
            isHovered = true;
            handlePointerMove(e.clientX, e.clientY);
        });

        panel.addEventListener('mousemove', (e) => {
            handlePointerMove(e.clientX, e.clientY);
        });

        panel.addEventListener('touchstart', (e) => {
            isHovered = true;
            if (e.touches[0]) handlePointerMove(e.touches[0].clientX, e.touches[0].clientY);
        }, { passive: true });

        panel.addEventListener('touchmove', (e) => {
            if (e.touches[0]) handlePointerMove(e.touches[0].clientX, e.touches[0].clientY);
        }, { passive: true });

        panel.addEventListener('mouseleave', () => {
            isHovered = false;
            panel.style.setProperty('--tilt-x', `0deg`);
            panel.style.setProperty('--tilt-y', `0deg`);
            if (!animFrame) animFrame = requestAnimationFrame(update);
        });

        panel.addEventListener('touchend', () => {
            isHovered = false;
            if (!animFrame) animFrame = requestAnimationFrame(update);
        });
    });
}

/* Idle Dark Crimson Trigger (10s Inactivity) */
function initIdleRedFilter() {
    const IDLE_TIMEOUT_MS = 10000;
    let idleTimer = null;

    function resetIdleTimer() {
        if (window.isRedFilterActive) {
            setRedFilterMode(false);
        }
        if (idleTimer) clearTimeout(idleTimer);
        idleTimer = setTimeout(() => {
            setRedFilterMode(true);
        }, IDLE_TIMEOUT_MS);
    }

    const activityEvents = [
        'mousemove', 
        'mousedown', 
        'keydown', 
        'touchstart', 
        'touchmove', 
        'wheel', 
        'pointermove',
        'scroll'
    ];

    activityEvents.forEach(evt => {
        window.addEventListener(evt, resetIdleTimer, { passive: true });
    });

    resetIdleTimer();
}
