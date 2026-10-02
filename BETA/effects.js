// effects.js - Self-contained UI effects, dynamic glass engine & idle theme controller

/* Global Theme & Particle State Hooks */
window.isRedFilterActive = false;
window.activeParticleColor = { r: 0.85, g: 0.85, b: 0.9 }; // Stark neutral quantum cloud
window.globalThemeFactor = 0.0; // Global sync variable (0.0 = Neutral, 1.0 = Red Filter)

/* Theme Palettes */
const DEFCSS = Object.freeze({
    '--bg-dark': '#000000',
    '--ui-bg': 'rgba(7, 8, 10, 0.88)',
    '--mode-bg': 'rgba(6, 6, 7, 0.9)',
    '--panel-glass': 'rgba(5, 5, 6, 0.86)',
    '--card-glass': 'rgba(7, 7, 8, 0.88)',
    '--row-glass': 'rgba(5, 5, 7, 0.85)',
    '--input-bg': 'rgba(3, 3, 4, 0.95)',
    '--bg-fil': 'blur(28px)',
    '--met-edge': 'rgba(62, 58, 75, 0.12)',
    '--bs-shad': 'rgba(0, 0, 0, 0.85)',
    '--l1': '#ffffff',
    '--l2': '#cac4f5',
    '--l3': '#291a4e',
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
    '--bg-dark': '#0e0103',
    '--ui-bg': 'rgba(0, 0, 0, 0.0)',
    '--mode-bg': 'rgba(0, 0, 0, 0.0)',
    '--panel-glass': 'rgba(0, 0, 0, 0.0)',
    '--card-glass': 'rgba(0, 0, 0, 0.0)',
    '--row-glass': 'rgba(0, 0, 0, 0.0)',
    '--input-bg': 'rgba(0, 0, 0, 0.0)',
    '--bg-fil': 'none',
    '--met-edge': 'rgba(66, 8, 17, 0.12)',
    '--bs-shad': 'rgba(0, 0, 0, 0.0)',
    '--l1': '#ff0000',
    '--l2': '#b11731',
    '--l3': '#851430',
    '--quicksilver-bright': '#9e424b',      
    '--quicksilver-silver': '#86353a',   
    '--text-main': '#812c2c',             
    '--text-sub': '#80363d',              
    '--text-muted': '#7e2c33',             
    '--text-accent': '#8a3840',            
    '--edge-color-1': '#613f42',          
    '--edge-color-2': '#4d2327',
    '--edge-color-3': '#522a2e',
    '--glow-color': 'rgba(160, 20, 35, 0.12)',
    '--text-glow': '0 0 6px rgba(180, 25, 40, 0.25)',
    '--panel-border': '1px solid rgba(0, 0, 0, 0.0)',
    '--slider-thumb': '#4e181e',
    '--slider-track': 'rgba(160, 25, 40, 0.25)'
});
/* const REDCSS = Object.freeze({
    '--bg-dark': '#030102',
    '--ui-bg': 'rgba(15, 7, 6, 0.88)',
    '--mode-bg': 'rgba(29, 13, 8, 0.90)',
    '--panel-glass': 'rgba(18, 3, 5, 0.92)',
    '--card-glass': 'rgba(24, 4, 7, 0.90)',
    '--row-glass': 'rgba(14, 2, 4, 0.88)',
    '--input-bg': 'rgba(8, 1, 2, 0.95)',
    '--quicksilver-bright': '#d93848',      // Subdued deep crimson
    '--quicksilver-silver': '#a62d3a',      // Low-key secondary labels
    '--text-main': '#cf3446',              // Muted clear red
    '--text-sub': '#9e2b38',               // Soft subtext 
    '--text-muted': '#661b23',             // Subdued dark text 
    '--text-accent': '#e6394a',            // Understated highlight 
    '--edge-color-1': '#73131d',           // Dark ambient edge specular
    '--edge-color-2': '#4a0b12',
    '--edge-color-3': '#260509',
    '--glow-color': 'rgba(160, 20, 35, 0.12)',
    '--text-glow': '0 0 6px rgba(180, 25, 40, 0.25)',
    '--panel-border': '1px solid rgba(160, 25, 40, 0.22)',
    '--slider-thumb': '#bf2c3e',
    '--slider-track': 'rgba(160, 25, 40, 0.25)'
}); */

function applyCSSTheme(theme) {
    const root = document.documentElement;
    for (const [key, value] of Object.entries(theme)) {
        root.style.setProperty(key, value);
    }
}

function setRedFilterMode(enable) {
    if (window.isRedFilterActive === enable) return;
    window.isRedFilterActive = Boolean(enable);
    
    // Synchronize global theme factor
    window.globalThemeFactor = window.isRedFilterActive ? 1.0 : 0.0;

    // 1. Mutate CSS Custom Properties
    applyCSSTheme(window.isRedFilterActive ? REDCSS : DEFCSS);

    // 2. Synchronize 3D Atomic Particle Cloud Colors
    window.activeParticleColor = window.isRedFilterActive 
        ? { r: 0.65, g: 0.1, b: 0.15 } 
        : { r: 0.85, g: 0.85, b: 0.9 };

    if (typeof scene !== 'undefined' && scene) {
        if (window.isRedFilterActive) {
            scene.clearColor = new BABYLON.Color4(0.0118, 0.0008, 0.0098, 1.0);
        } else {
            scene.clearColor = new BABYLON.Color4(0.01, 0.02, 0.04, 1.0); 
        }
    }

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
    initUltraDarkFX();
    renderProjectList();
});

/* Dynamic Style Overrides Injection */
function injectGlobalThemeStyles() {
    const styleTag = document.createElement('style');
    styleTag.id = 'themeDynamicOverrides';
    styleTag.textContent = `
        .ui-overlay *, .tp-overlay *, .pt-modal-window * {
            color: var(--text-main) !important;
            text-shadow: var(--text-glow, none) !important;
        }

        .ui-overlay, .tp-overlay, .pt-modal-window {
            background: var(--ui-bg);
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
    const modalBackdrops = document.querySelectorAll('.pt-modal-backdrop');
    if (!modalBackdrops.length) return;

    modalBackdrops.forEach(modalBackdrop => {
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
    });
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
    const btnElementLook = document.getElementById('btnElementLook');

    if (!btnAuto || !btnManual || !btnElementLook) return;

    // Reset button states
    btnAuto.classList.remove('active');
    btnManual.classList.remove('active');
    btnElementLook.classList.remove('active');

    let activeContainer = null;

    if (mode === 'auto') {
        btnAuto.classList.add('active');
        if (autoContainer) autoContainer.classList.remove('hidden');
        if (manualContainer) manualContainer.classList.add('hidden');
        activeContainer = autoContainer;

        // Cleanup element look mesh and restore orbitals when returning to builder
        if (window.realLookRenderer) window.realLookRenderer.clear();
        if (typeof showOrbitalCloud === 'function') showOrbitalCloud();

    } else if (mode === 'manual') {
        btnManual.classList.add('active');
        if (autoContainer) autoContainer.classList.add('hidden');
        if (manualContainer) manualContainer.classList.remove('hidden');
        activeContainer = manualContainer;

        // Cleanup element look mesh and restore orbitals when returning to builder
        if (window.realLookRenderer) window.realLookRenderer.clear();
        if (typeof showOrbitalCloud === 'function') showOrbitalCloud();

    } else if (mode === 'elementLook') {
        btnElementLook.classList.add('active');
        if (autoContainer) autoContainer.classList.add('hidden');
        if (manualContainer) manualContainer.classList.add('hidden');

        // Hide electron cloud orbitals
        if (typeof hideOrbitalCloud === 'function') hideOrbitalCloud();

        // Render real element look
        if (typeof getElementPhysicalProps === 'function' && window.realLookRenderer) {
            const activeElement = window.currentElement || {
                Z: 79, mass: 196.966, s: 1, p: 0, d: 10, f: 14, g: 0
            };

            const props = getElementPhysicalProps(
                activeElement.Z,
                activeElement.mass,
                activeElement.s,
                activeElement.p,
                activeElement.d,
                activeElement.f,
                activeElement.g
            );

            window.realLookRenderer.renderElement(props);
        }
    }

    // GSAP animation for panel switching
    if (typeof gsap !== 'undefined' && activeContainer) {
        gsap.fromTo(activeContainer,
            { opacity: 0, y: 6 },
            { opacity: 1, y: 0, duration: 0.3, ease: 'power2.out' });
    }
}

/* Germanium Oxide Quicksilver Engine */
function initQuicksilverGlassEngine() {
    // Inject Germanium Oxide Palette & Idle Red CSS Styles
    if (!document.getElementById('quicksilverEngineStyles')) {
        const style = document.createElement('style');
        style.id = 'quicksilverEngineStyles';
        style.textContent = `
            /* Hide non-content scrollbar leaks caused by transforms */
            .ui-overlay::-webkit-scrollbar, 
            .tp-overlay::-webkit-scrollbar, 
            .pt-modal-window::-webkit-scrollbar {
                width: 4px;
            }

            .ui-overlay, .tp-overlay, .pt-modal-window {
                transform: perspective(1000px) rotateX(var(--tilt-x, 0deg)) rotateY(var(--tilt-y, 0deg)) scale3d(var(--scale-s, 1), var(--scale-s, 1), 1) !important;
                transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1), 
                            border-radius 0.3s cubic-bezier(0.16, 1, 0.3, 1), 
                            box-shadow 0.3s ease;
                will-change: transform, border-radius;
            }

            /* Edge Rim: Germanium Oxide Rainbow (Active) -> Crimson Red (Idle) */
            .ui-overlay::before, .tp-overlay::before, .pt-modal-window::before {
                content: "";
                position: absolute;
                inset: 0;
                border-radius: inherit;
                padding: 1px;
                background: 
                    /* Dark Specular Core Spark */
                    radial-gradient(circle 180px at var(--light-x, 50%) var(--light-y, 50%), 
                        rgba(200, 200, 220, 0.8) 0%, 
                        rgba(120, 110, 140, 0.3) 25%, 
                        transparent 70%),
                    /* Scatter 1: Germanium Oxide Copper-Red */
                    radial-gradient(ellipse 260px 160px at var(--scatter-x1, 30%) var(--scatter-y1, 30%), 
                        rgba(180, 35, 20, var(--rainbow-op, 0.5)) 0%, 
                        rgba(110, 20, 10, var(--rainbow-op, 0.25)) 45%, 
                        transparent 75%),
                    /* Scatter 2: Deep Amethyst / Violet Prism */
                    radial-gradient(ellipse 220px 240px at var(--scatter-x2, 70%) var(--scatter-y2, 70%), 
                        rgba(75, 15, 95, var(--rainbow-op, 0.5)) 0%, 
                        rgba(40, 10, 60, var(--rainbow-op, 0.25)) 50%, 
                        transparent 80%),
                    /* Scatter 3: Smoked Slate Cyan / Amber Oxide */
                    radial-gradient(circle 280px at var(--scatter-x3, 50%) var(--scatter-y3, 20%), 
                        rgba(20, 65, 85, var(--rainbow-op, 0.45)) 0%, 
                        rgba(130, 80, 15, var(--rainbow-op, 0.25)) 50%, 
                        transparent 85%),
                    /* IDLE MODE: Deep Germanium Crimson Red Glow */
                    radial-gradient(circle 350px at 50% 50%, 
                        rgba(208, 24, 24, var(--idle-red-op, 0.45)) 0%, 
                        rgba(80, 5, 5, var(--idle-red-op, 0.25)) 60%, 
                        transparent 90%);

                -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
                -webkit-mask-composite: xor;
                mask-composite: exclude;
                pointer-events: none !important;
                opacity: var(--edge-opacity, 0.4);
                transition: opacity 0.3s ease;
                z-index: 10;
            }

            /* Interior Refraction Lens */
            .ui-overlay::after, .tp-overlay::after, .pt-modal-window::after {
                content: "";
                position: absolute;
                inset: 0;
                border-radius: inherit;
                background: 
                    /* Dark Smoked Core Focus Glow */
                    radial-gradient(circle 160px at var(--pointer-x, 50%) var(--pointer-y, 50%), 
                        rgba(200, 200, 220, 0.08) 0%, 
                        rgba(120, 40, 50, 0.04) 40%, 
                        transparent 70%),
                    /* Idle Crimson Internal Wash */
                    radial-gradient(circle 300px at 50% 50%, 
                        rgba(180, 20, 20, calc(0.12 * var(--idle-red-op, 0.45))) 0%, 
                        transparent 80%);
                pointer-events: none !important;
                opacity: var(--glow-opacity, 0.3);
                transition: opacity 0.3s ease;
                mix-blend-mode: screen;
                z-index: 2;
            }
        `;
        document.head.appendChild(style);
    }

    const panels = document.querySelectorAll('.ui-overlay, .tp-overlay, .pt-modal-window');

    panels.forEach(panel => {
        let currentX = 0, currentY = 0;
        let targetX = 0, targetY = 0;
        let pointerX = 0, pointerY = 0;
        
        // Low sensitivity tilt limits
        let rotX = 0, rotY = 0;
        let scaleVal = 1.0;
        
        // Dynamic Corner Morph Radii (px)
        let tl = 10, tr = 10, br = 10, bl = 10;

        // Dark Rainbow Scatter Coordinates
        let sc1X = 50, sc1Y = 50;
        let sc2X = 50, sc2Y = 50;
        let sc3X = 50, sc3Y = 50;

        let activeFactor = 0; // 1 = Hovered (Germanium Rainbow), 0 = Idle (Red)
        let isHovered = false;
        let isPressed = false;
        let animFrame = null;

        function update() {
            // Smooth LERP Damping
            currentX += (targetX - currentX) * 0.1;
            currentY += (targetY - currentY) * 0.1;

            if (isHovered) {
                activeFactor += (1.0 - activeFactor) * 0.1;
            } else {
                activeFactor += (0 - activeFactor) * 0.08;
            }

            // CSS Variables for Transforms & Subtle Corner Morphing
            panel.style.setProperty('--tilt-x', `${rotX.toFixed(2)}deg`);
            panel.style.setProperty('--tilt-y', `${rotY.toFixed(2)}deg`);
            panel.style.setProperty('--scale-s', `${(isPressed ? 0.985 : scaleVal).toFixed(3)}`);
            panel.style.borderRadius = `${tl.toFixed(1)}px ${tr.toFixed(1)}px ${br.toFixed(1)}px ${bl.toFixed(1)}px`;

            // Position Custom Properties
            panel.style.setProperty('--light-x', `${currentX.toFixed(2)}px`);
            panel.style.setProperty('--light-y', `${currentY.toFixed(2)}px`);
            panel.style.setProperty('--pointer-x', `${pointerX.toFixed(2)}px`);
            panel.style.setProperty('--pointer-y', `${pointerY.toFixed(2)}px`);
            
            panel.style.setProperty('--scatter-x1', `${sc1X.toFixed(2)}%`);
            panel.style.setProperty('--scatter-y1', `${sc1Y.toFixed(2)}%`);
            panel.style.setProperty('--scatter-x2', `${sc2X.toFixed(2)}%`);
            panel.style.setProperty('--scatter-y2', `${sc2Y.toFixed(2)}%`);
            panel.style.setProperty('--scatter-x3', `${sc3X.toFixed(2)}%`);
            panel.style.setProperty('--scatter-y3', `${sc3Y.toFixed(2)}%`);

            // Mode Opacity Crossfade: Rainbow vs Red Idle
            panel.style.setProperty('--rainbow-op', activeFactor.toFixed(3));
            panel.style.setProperty('--idle-red-op', (1.0 - activeFactor).toFixed(3));
            panel.style.setProperty('--edge-opacity', (0.35 + activeFactor * 0.45).toFixed(3));
            panel.style.setProperty('--glow-opacity', (0.2 + activeFactor * 0.5).toFixed(3));

            if (animFrame) {
                animFrame = requestAnimationFrame(update);
            }
        }

        function handlePointerMove(clientX, clientY) {
            const rect = panel.getBoundingClientRect();
            pointerX = clientX - rect.left;
            pointerY = clientY - rect.top;

            const normX = (pointerX / rect.width) * 2 - 1;  // -1 to 1
            const normY = (pointerY / rect.height) * 2 - 1; // -1 to 1

            targetX = Math.max(0, Math.min(rect.width, pointerX));
            targetY = Math.max(0, Math.min(rect.height, pointerY));

            // Extremely gentle 3D tilt (Max ±3.0 deg for usability)
            rotX = -normY * 3.0; 
            rotY = normX * 3.0;

            scaleVal = 1.0;

            // Controlled Corner Radius Shift (10px ± 2px max)
            const flex = 2.5;
            tl = 10 + (-normX - normY) * flex;
            tr = 10 + (normX - normY) * flex;
            br = 10 + (normX + normY) * flex;
            bl = 10 + (-normX + normY) * flex;

            // Germanium Oxide Rainbow Scatter Angles
            const angle = Math.atan2(normY, normX);
            const distPct = Math.hypot(normX, normY) * 35;

            sc1X = 50 + Math.cos(angle) * distPct;
            sc1Y = 50 + Math.sin(angle) * distPct;

            sc2X = 50 + Math.cos(angle + Math.PI * 0.6) * distPct;
            sc2Y = 50 + Math.sin(angle + Math.PI * 0.6) * distPct;

            sc3X = 50 + Math.cos(angle - Math.PI * 0.6) * distPct;
            sc3Y = 50 + Math.sin(angle - Math.PI * 0.6) * distPct;
        }

        // Pointer Event Handlers
        panel.addEventListener('mouseenter', (e) => {
            isHovered = true;
            handlePointerMove(e.clientX, e.clientY);
            if (!animFrame) animFrame = requestAnimationFrame(update);
        });

        panel.addEventListener('mousemove', (e) => {
            handlePointerMove(e.clientX, e.clientY);
        });

        panel.addEventListener('pointerdown', () => {
            isPressed = true;
        });

        panel.addEventListener('pointerup', () => {
            isPressed = false;
        });

        panel.addEventListener('mouseleave', () => {
            isHovered = false;
            isPressed = false;
            rotX = 0;
            rotY = 0;
            scaleVal = 1.0;
            tl = tr = br = bl = 10;
        });

        // Start animation loop
        animFrame = requestAnimationFrame(update);
    });
}

/* Color & Theme Interpolation Engine */
function parseRGBA(str) {
    if (!str || str === 'none') return { r: 0, g: 0, b: 0, a: 0 };
    str = str.trim();
    if (str.startsWith('#')) {
        let hex = str.slice(1);
        if (hex.length === 3) hex = hex.split('').map(c => c + c).join('');
        const num = parseInt(hex, 16);
        return { r: (num >> 16) & 255, g: (num >> 8) & 255, b: num & 255, a: 1 };
    }
    const m = str.match(/rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)\s*(?:,\s*([\d.]+)\s*)?\)/);
    if (m) {
        return {
            r: parseFloat(m[1]),
            g: parseFloat(m[2]),
            b: parseFloat(m[3]),
            a: m[4] !== undefined ? parseFloat(m[4]) : 1
        };
    }
    return { r: 0, g: 0, b: 0, a: 0 };
}

function lerp(a, b, t) {
    return a + (b - a) * t;
}

function lerpColorStr(c1Str, c2Str, factor) {
    const c1 = parseRGBA(c1Str);
    const c2 = parseRGBA(c2Str);
    const r = Math.round(lerp(c1.r, c2.r, factor));
    const g = Math.round(lerp(c1.g, c2.g, factor));
    const b = Math.round(lerp(c1.b, c2.b, factor));
    const a = lerp(c1.a, c2.a, factor);
    return `rgba(${r}, ${g}, ${b}, ${a.toFixed(3)})`;
}

function interpolateCSSValue(key, v1, v2, factor) {
    if (key === '--bg-fil') {
        const blurPx = lerp(28, 0, factor);
        return blurPx > 0.5 ? `blur(${blurPx.toFixed(1)}px)` : 'none';
    }
    if (key === '--text-glow') {
        if (factor <= 0.01) return 'none';
        const alpha = factor * 0.25;
        return `0 0 6px rgba(180, 25, 40, ${alpha.toFixed(3)})`;
    }
    if (key === '--panel-border') {
        return `1px solid ${lerpColorStr('rgba(255, 255, 255, 0.12)', 'rgba(0, 0, 0, 0.0)', factor)}`;
    }
    return lerpColorStr(v1, v2, factor);
}

// Global Progress Index: 0 = DEFCSS (Unlocked), 100 = REDCSS (Idle)
let currentProgress = 0;

function applyThemeProgress(progressIndex) {
    currentProgress = Math.max(0, Math.min(100, progressIndex));
    const factor = currentProgress / 100; // 0.0 to 1.0
    const root = document.documentElement;

    for (const key of Object.keys(DEFCSS)) {
        const v1 = DEFCSS[key];
        const v2 = REDCSS[key];
        const blended = interpolateCSSValue(key, v1, v2, factor);
        root.style.setProperty(key, blended);
    }

    // Synchronize 3D Atomic Particle Cloud Colors
    window.activeParticleColor = {
        r: lerp(0.85, 0.65, factor),
        g: lerp(0.85, 0.1, factor),
        b: lerp(0.9, 0.15, factor)
    };

    // Synchronize Babylon scene clearColor if active
    if (typeof scene !== 'undefined' && scene) {
        scene.clearColor = new BABYLON.Color4(
            lerp(0.01, 0.0118, factor),
            lerp(0.02, 0.0008, factor),
            lerp(0.04, 0.0098, factor),
            1.0
        );
    }

    window.isRedFilterActive = (factor > 0.5);

    if (typeof window.rebuildQuantumModel === 'function') {
        window.rebuildQuantumModel();
    }
}

/* Idle Dark Crimson Trigger & 3-Second Interpolated Hold Controller */
function initIdleRedFilter() {
    const IDLE_TIMEOUT_MS = 30000; // 30s inactivity delay
    const LOCK_ANIM_MS = 1000;     // 1s max fade to red
    const UNLOCK_HOLD_MS = 3000;   // 3s hold fade back to default

    let idleTimer = null;
    let animFrameId = null;
    let lastTimestamp = null;
    let isHolding = false;

    const idleUnlockBtn = document.getElementById('idleUnlockBtn');

    function resetIdleTimer() {
        if (idleTimer) clearTimeout(idleTimer);

        // Do not queue idle timers while in transition or locked state
        if (currentProgress > 0 || window.isRedFilterActive) return;

        idleTimer = setTimeout(() => {
            startAnimationLoop();
        }, IDLE_TIMEOUT_MS);
    }

    function updateTransition(timestamp) {
        if (!lastTimestamp) lastTimestamp = timestamp;
        const delta = timestamp - lastTimestamp;
        lastTimestamp = timestamp;

        if (isHolding) {
            // Holding: REDCSS (100) -> DEFCSS (0) over 3000ms
            currentProgress -= (100 / UNLOCK_HOLD_MS) * delta;
            if (currentProgress <= 0) {
                applyThemeProgress(0);
                animFrameId = null;
                lastTimestamp = null;
                if (idleUnlockBtn) idleUnlockBtn.style.display = 'none';
                resetIdleTimer();
                return;
            }
        } else {
            // Inactive: DEFCSS (0) -> REDCSS (100) over 1000ms max
            if (currentProgress < 100) {
                currentProgress += (100 / LOCK_ANIM_MS) * delta;
                if (currentProgress >= 100) {
                    applyThemeProgress(100);
                    animFrameId = null;
                    lastTimestamp = null;
                    if (idleUnlockBtn) idleUnlockBtn.style.display = 'flex';
                    return;
                }
            } else {
                animFrameId = null;
                lastTimestamp = null;
                if (idleUnlockBtn) idleUnlockBtn.style.display = 'flex';
                return;
            }
        }

        applyThemeProgress(currentProgress);
        animFrameId = requestAnimationFrame(updateTransition);
    }

    function startAnimationLoop() {
        if (!animFrameId) {
            lastTimestamp = null;
            animFrameId = requestAnimationFrame(updateTransition);
        }
    }

    function handlePointerDown(e) {
        if (currentProgress > 0 || window.isRedFilterActive) {
            if (e.cancelable) e.preventDefault();
            isHolding = true;
            startAnimationLoop();
        } else {
            resetIdleTimer();
        }
    }

    function handlePointerRelease() {
        if (isHolding) {
            isHolding = false;
            if (currentProgress > 0) {
                startAnimationLoop();
            }
        }
    }

    // Suppress context menus on both mobile and desktop during idle hold
    window.addEventListener('contextmenu', (e) => {
        if (currentProgress > 0 || window.isRedFilterActive) {
            e.preventDefault();
        }
    });

    // Universal Pointer API (Handles Desktop Mouse, Mobile Touch, & Stylus seamlessly)
    window.addEventListener('pointerdown', handlePointerDown, { passive: false });
    window.addEventListener('pointerup', handlePointerRelease, { passive: true });
    window.addEventListener('pointercancel', handlePointerRelease, { passive: true });
    window.addEventListener('pointerleave', handlePointerRelease, { passive: true });
    window.addEventListener('pointerout', handlePointerRelease, { passive: true });
    window.addEventListener('blur', handlePointerRelease, { passive: true });

    // Track user interaction while unlocked to reset idle timeout
    const activityEvents = ['pointermove', 'keydown', 'wheel', 'scroll'];
    activityEvents.forEach(evt => {
        window.addEventListener(evt, () => {
            if (currentProgress === 0 && !window.isRedFilterActive) {
                resetIdleTimer();
            }
        }, { passive: true });
    });

    resetIdleTimer();
}

/**
 * Advanced Ultra-Dark Visual Effects Library (effects.js)
 */

const UltraDarkFX = {
  /**
   * Generates a procedural tileable noise texture canvas for film grain / dark mesh overlay
   */
  createGrainTexture(width = 256, height = 256, opacity = 0.08) {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    const imgData = ctx.createImageData(width, height);
    const buffer = new Uint32Array(imgData.data.buffer);

    for (let i = 0; i < buffer.length; i++) {
      // Dark grayscale micro-noise with subtle alpha variation
      const noise = (Math.random() * 255) | 0;
      const alpha = (Math.random() * opacity * 255) | 0;
      buffer[i] = (alpha << 24) | (noise << 16) | (noise << 8) | noise;
    }

    ctx.putImageData(imgData, 0, 0);
    return canvas;
  },

  /**
   * Initializes a full-screen ultra-dark atmospheric background canvas
   * Features: Radial dark vignette, continuous grain texture, subtle floating dark matter nodes
   */
  initAtmosphericBackground(container = document.body) {
    const canvas = document.createElement('canvas');
    canvas.id = 'fx-dark-atmosphere';
    Object.assign(canvas.style, {
      position: 'fixed',
      top: '0',
      left: '0',
      width: '100vw',
      height: '100vh',
      pointerEvents: 'none',
      zIndex: '-2',
      background: '#040406'
    });

    container.appendChild(canvas);
    const ctx = canvas.getContext('2d');
    const grainTile = this.createGrainTexture(256, 256, 0.06);

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    let mouseX = width / 2;
    let mouseY = height / 2;
    let targetMouseX = mouseX;
    let targetMouseY = mouseY;

    window.addEventListener('resize', () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    });

    window.addEventListener('mousemove', (e) => {
      targetMouseX = e.clientX;
      targetMouseY = e.clientY;
    });

    const render = () => {
      // Smooth mouse damping
      mouseX += (targetMouseX - mouseX) * 0.05;
      mouseY += (targetMouseY - mouseY) * 0.05;

      // Deep obsidian base clear
      ctx.fillStyle = '#030305';
      ctx.fillRect(0, 0, width, height);

      // Interactive radial ambient spotlight (Ultra dark cyan/violet rim glow)
      const glowRadius = Math.max(width, height) * 0.6;
      const gradient = ctx.createRadialGradient(
        mouseX, mouseY, 0,
        mouseX, mouseY, glowRadius
      );
      gradient.addColorStop(0, 'rgba(18, 24, 38, 0.45)');
      gradient.addColorStop(0.5, 'rgba(8, 10, 18, 0.8)');
      gradient.addColorStop(1, 'rgba(3, 3, 5, 1)');

      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      // Repeat grain pattern across canvas
      const pattern = ctx.createPattern(grainTile, 'repeat');
      if (pattern) {
        ctx.fillStyle = pattern;
        ctx.fillRect(0, 0, width, height);
      }

      requestAnimationFrame(render);
    };

    render();
  },

  /**
   * Creates an interactive, textured quantum particle field with magnetic spring physics
   */
  initQuantumParticleGrid(canvasId = 'fx-quantum-grid') {
    let canvas = document.getElementById(canvasId);
    if (!canvas) {
      canvas = document.createElement('canvas');
      canvas.id = canvasId;
      Object.assign(canvas.style, {
        position: 'fixed',
        top: '0',
        left: '0',
        width: '100vw',
        height: '100vh',
        pointerEvents: 'none',
        zIndex: '-1'
      });
      document.body.appendChild(canvas);
    }

    const ctx = canvas.getContext('2d');
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const particleCount = Math.floor((width * height) / 12000);
    const particles = [];

    const mouse = { x: -1000, y: -1000, radius: 180 };

    window.addEventListener('mousemove', (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    });

    window.addEventListener('resize', () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    });

    class Particle {
      constructor() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.vx = (Math.random() - 0.5) * 0.4;
        this.vy = (Math.random() - 0.5) * 0.4;
        this.baseRadius = Math.random() * 1.5 + 0.5;
        this.alpha = Math.random() * 0.5 + 0.2;
        this.hue = Math.random() > 0.8 ? 190 : 260; // Cyber cyan / Deep magenta tint
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;

        // Screen boundary bounce
        if (this.x < 0 || this.x > width) this.vx *= -1;
        if (this.y < 0 || this.y > height) this.vy *= -1;

        // Mouse repulsion / perturbation
        const dx = mouse.x - this.x;
        const dy = mouse.y - this.y;
        const dist = Math.hypot(dx, dy);

        if (dist < mouse.radius) {
          const force = (1 - dist / mouse.radius) * 2;
          const angle = Math.atan2(dy, dx);
          this.x -= Math.cos(angle) * force;
          this.y -= Math.sin(angle) * force;
        }
      }

      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.baseRadius, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${this.hue}, 40%, 60%, ${this.alpha})`;
        ctx.shadowColor = `hsla(${this.hue}, 80%, 50%, 0.5)`;
        ctx.shadowBlur = 8;
        ctx.fill();
        ctx.shadowBlur = 0;
      }
    }

    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle());
    }

    const animate = () => {
      ctx.clearRect(0, 0, width, height);

      // Render connecting triangular network lines
      for (let i = 0; i < particles.length; i++) {
        particles[i].update();
        particles[i].draw();

        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.hypot(dx, dy);

          if (dist < 110) {
            const lineAlpha = (1 - dist / 110) * 0.15;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(100, 140, 200, ${lineAlpha})`;
            ctx.lineWidth = 0.6;
            ctx.stroke();
          }
        }
      }

      requestAnimationFrame(animate);
    };

    animate();
  },

  /**
   * Applies modern dynamic dark glassmorphism & subtle chromatic aberration on hover
   */
  initInteractiveElementEffects(selector = '.fx-interactive') {
    const elements = document.querySelectorAll(selector);

    elements.forEach((el) => {
      Object.assign(el.style, {
        transition: 'transform 0.25s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.25s ease',
        willChange: 'transform, box-shadow'
      });

      el.addEventListener('mousemove', (e) => {
        const rect = el.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;

        const tiltX = (y / rect.height) * -8;
        const tiltY = (x / rect.width) * 8;

        el.style.transform = `perspective(1000px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) scale3d(1.02, 1.02, 1.02)`;
        el.style.boxShadow = `
          0 15px 35px rgba(0, 0, 0, 0.8),
          -2px 0 10px rgba(0, 240, 255, 0.15),
          2px 0 10px rgba(255, 0, 128, 0.15)
        `;
      });

      el.addEventListener('mouseleave', () => {
        el.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
        el.style.boxShadow = 'none';
      });
    });
  },

  /**
   * Injects global dark textured CSS scanlines and ambient noise overlays into the document
   */
  injectUltraDarkStyles() {
    const style = document.createElement('style');
    style.textContent = `
      /* Dark Scanline Texture Overlay */
      body::after {
        content: "";
        position: fixed;
        top: 0; left: 0;
        width: 100vw; height: 100vh;
        background: linear-gradient(
          rgba(18, 16, 26, 0) 50%, 
          rgba(0, 0, 0, 0.25) 50%
        );
        background-size: 100% 4px;
        pointer-events: none;
        z-index: 9999;
        opacity: 0.35;
      }

      /* Dark Vignette Frame */
      body::before {
        content: "";
        position: fixed;
        top: 0; left: 0;
        width: 100vw; height: 100vh;
        box-shadow: inset 0 0 120px rgba(0, 0, 0, 0.95);
        pointer-events: none;
        z-index: 9998;
      }
    `;
    document.head.appendChild(style);
  }
};

/**
 * Convenience entry point to run on window DOM load
 */
function initUltraDarkFX() {
  UltraDarkFX.injectUltraDarkStyles();
  UltraDarkFX.initAtmosphericBackground();
  UltraDarkFX.initQuantumParticleGrid();
  UltraDarkFX.initInteractiveElementEffects();
}

// Attach to window object for execution inside DOMContentLoaded listener
window.initUltraDarkFX = initUltraDarkFX;
window.UltraDarkFX = UltraDarkFX;

/* Modal Visibility Handler */
function initModalVisibilityHandler() {
    const modalBackdrops = document.querySelectorAll('.pt-modal-backdrop');
    if (!modalBackdrops.length) return;

    modalBackdrops.forEach(modalBackdrop => {
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
    });
}

// Open Project Manager Modal
function openProjectManagerModal() {
    const modal = document.getElementById('projectModal');
    if (modal) {
        modal.classList.add('open');
        renderProjectList();
    }
}

// Close Project Manager Modal
function closeProjectManagerModal() {
    const modal = document.getElementById('projectModal');
    if (modal) {
        modal.classList.remove('open');
    }
}

// Render Saved Projects into the list
function renderProjectList() {
    const listEl = document.getElementById('projectList');
    const countEl = document.getElementById('projectCount');
    const buttonCountEl = document.getElementById('projectCountButtonTag');
    if (!listEl) return;

    const savedProjects = JSON.parse(localStorage.getItem('atomic_orb_projects') || '[]');
    
    if (countEl) countEl.textContent = savedProjects.length;
    if (buttonCountEl) buttonCountEl.textContent = savedProjects.length;

    if (savedProjects.length === 0) {
        listEl.innerHTML = `<li style="color:var(--text-muted); font-size:11px; text-align:center; padding:16px; font-family:'JetBrains Mono';">No saved projects found.</li>`;
        return;
    }

    listEl.innerHTML = savedProjects.map((proj, index) => `
        <li class="project-item">
            <div class="project-info">
                <span class="project-name">${proj.name || 'Untitled Atom'}</span>
                <span class="project-date">Z: ${proj.Z || '?'} | Saved: ${proj.date || 'N/A'}</span>
            </div>
            <div class="project-actions">
                <button onclick="loadProject(${index})">LOAD</button>
                <button class="delete-btn" onclick="deleteProject(${index})">DELETE</button>
            </div>
        </li>
    `).join('');
}

/*
// Save Current Quantum Parameters & Camera / Internal Data to LocalStorage
function saveCurrentProject() {
    const savedProjects = JSON.parse(localStorage.getItem('atomic_orb_projects') || '[]');
    if (savedProjects.length >= 10) {
        alert("Project storage limit reached (10 max). Please delete an existing project before saving.");
        return;
    }

    const ZVal = document.getElementById('inputZ')?.value || '1';
    const element = (typeof getElementData === 'function') ? getElementData(parseInt(ZVal, 10)) : 
                    ((typeof ELEMENTS_DATA !== 'undefined') ? ELEMENTS_DATA.find(e => e.Z == ZVal) : null);
    const defaultName = element ? `${element.name} (Z=${ZVal})` : `Atom Z=${ZVal}`;

    const projectName = prompt("Enter a name for this project:", defaultName);
    if (projectName === null) return; // User cancelled prompt

    // Capture 3D camera position, angles, radius, and target
    let cameraData = null;
    if (typeof camera !== 'undefined' && camera) {
        cameraData = {
            x: camera.position ? camera.position.x : parseFloat(document.getElementById('tpX')?.value || 0),
            y: camera.position ? camera.position.y : parseFloat(document.getElementById('tpY')?.value || 0),
            z: camera.position ? camera.position.z : parseFloat(document.getElementById('tpZ')?.value || 0),
            alpha: camera.alpha,
            beta: camera.beta,
            radius: camera.radius,
            target: camera.target ? { x: camera.target.x, y: camera.target.y, z: camera.target.z } : null
        };
    } else {
        cameraData = {
            x: document.getElementById('tpX')?.value || '',
            y: document.getElementById('tpY')?.value || '',
            z: document.getElementById('tpZ')?.value || ''
        };
    }

    // Capture active mode state (auto, manual, elementLook)
    let activeMode = 'auto';
    if (document.getElementById('btnModeManual')?.classList.contains('active')) {
        activeMode = 'manual';
    } else if (document.getElementById('btnElementLook')?.classList.contains('active')) {
        activeMode = 'elementLook';
    }

    // Capture dynamic suborbit configuration inputs
    const suborbitInputs = [];
    document.querySelectorAll('#orbitsBuilderContainer input').forEach(inp => {
        if (inp.id || inp.name || inp.dataset.suborbitKey) {
            suborbitInputs.push({
                id: inp.id,
                key: inp.dataset.suborbitKey || inp.name,
                value: inp.value
            });
        }
    });

    // Capture orbital visibility filter states
    const filterStates = (typeof visibilityState !== 'undefined') ? { ...visibilityState } : {};

    const projectData = {
        name: projectName.trim() || defaultName,
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
        Z: ZVal,
        maxN: document.getElementById('inputMaxN')?.value || '2',
        inputEn: document.getElementById('inputEn')?.value || '',
        manualZ: document.getElementById('inputZManual')?.value || ZVal,
        config: document.getElementById('inputConfig')?.value || '',
        elec: document.getElementById('inputElec')?.value || '',
        n: document.getElementById('inputN')?.value || '',
        l: document.getElementById('inputL')?.value || '',
        gI: document.getElementById('inputGI')?.value || '',
        spinS: document.getElementById('inputTotalSpinS')?.value || '',
        electricField: document.getElementById('inputElectricField')?.value || '',
        opacity: document.getElementById('opacityRange')?.value || '0.35',
        activeMode: activeMode,
        camera: cameraData,
        suborbitInputs: suborbitInputs,
        filterStates: filterStates
    };

    savedProjects.push(projectData);
    localStorage.setItem('atomic_orb_projects', JSON.stringify(savedProjects));
    
    renderProjectList();
    alert(`Project "${projectData.name}" saved successfully!`);
}
*/

/*
// Load Saved Project Parameters and Fully Sync with Internal Data, Camera, & Configurations
async function loadProject(index) {
    try {
        const savedProjects = JSON.parse(localStorage.getItem('atomic_orb_projects') || '[]');
        const proj = savedProjects[index];
        if (!proj) return;

        const zVal = parseInt(proj.Z, 10) || 1;

        // 1. Sync internal element data from ELEMENTS_DATA repository
        let elemData = null;
        if (typeof getElementData === 'function') {
            elemData = getElementData(zVal);
        } else if (typeof ELEMENTS_DATA !== 'undefined') {
            elemData = ELEMENTS_DATA.find(e => e.Z === zVal);
        }

        if (elemData) {
            window.currentElement = elemData;
        }

        // 2. Update UI Element Header / Tag Indicators
        const selectedTag = document.getElementById('selectedElementTag');
        if (selectedTag && elemData) {
            selectedTag.textContent = `${elemData.name} (${elemData.sym}, Z=${elemData.Z})`;
        }

        // 3. Restore Auto Builder fields
        if (document.getElementById('inputZ')) document.getElementById('inputZ').value = proj.Z;
        if (document.getElementById('inputMaxN')) document.getElementById('inputMaxN').value = proj.maxN;
        if (document.getElementById('inputEn')) document.getElementById('inputEn').value = proj.inputEn || '';

        // 4. Restore Manual Mode fields
        if (document.getElementById('inputZManual')) document.getElementById('inputZManual').value = proj.manualZ || proj.Z;
        if (document.getElementById('inputConfig')) document.getElementById('inputConfig').value = proj.config || '';
        if (document.getElementById('inputElec')) document.getElementById('inputElec').value = proj.elec || '';
        if (document.getElementById('inputN')) document.getElementById('inputN').value = proj.n || '';
        if (document.getElementById('inputL')) document.getElementById('inputL').value = proj.l || '';

        // 5. Fallback nuclear & physical quantum properties
        const inputGI = document.getElementById('inputGI');
        if (inputGI) {
            const fallbackGI = elemData ? elemData.gI : 0.0;
            inputGI.value = (proj.gI !== undefined && proj.gI !== '') ? proj.gI : fallbackGI;
        }

        const inputSpinS = document.getElementById('inputTotalSpinS');
        if (inputSpinS) {
            const fallbackSpin = (typeof calculateTotalSpinS === 'function') ? calculateTotalSpinS(zVal) : 0.5;
            inputSpinS.value = (proj.spinS !== undefined && proj.spinS !== '') ? proj.spinS : fallbackSpin;
        }

        if (document.getElementById('inputElectricField')) {
            document.getElementById('inputElectricField').value = proj.electricField || '';
        }

        // 6. Restore Opacity State
        if (proj.opacity !== undefined) {
            const opacitySlider = document.getElementById('opacityRange');
            if (opacitySlider) {
                opacitySlider.value = proj.opacity;
                if (typeof updateOpacity === 'function') {
                    updateOpacity(proj.opacity);
                }
            }
        }

        // 7. Rebuild Suborbit Controls and restore custom suborbit electron inputs
        if (typeof generateOrbitsBuilder === 'function') {
            generateOrbitsBuilder();
        }

        if (Array.isArray(proj.suborbitInputs)) {
            proj.suborbitInputs.forEach(item => {
                if (item.id) {
                    const el = document.getElementById(item.id);
                    if (el) el.value = item.value;
                } else if (item.key) {
                    const el = document.querySelector(`[data-suborbit-key="${item.key}"], [name="${item.key}"]`);
                    if (el) el.value = item.value;
                }
            });
        }

        // Restore Orbital Visibility Filters
        if (proj.filterStates) {
            if (typeof visibilityState !== 'undefined') {
                Object.assign(visibilityState, proj.filterStates);
            }
            Object.entries(proj.filterStates).forEach(([key, val]) => {
                const chk = document.querySelector(`input[data-filter="${key}"]`) || document.getElementById(`filter_${key}`);
                if (chk) chk.checked = Boolean(val);
            });
        }

        // 8. Switch Active Control Mode BEFORE rebuilding model so the Dirac solver uses active tab parameters
        if (proj.activeMode && typeof switchControlMode === 'function') {
            switchControlMode(proj.activeMode);
        }

        // 9. Rebuild 3D Quantum Dirac Model
        if (typeof rebuildQuantumModel === 'function') {
            await rebuildQuantumModel();
        }

        // 10. Restore Camera Position, Angles, Target, and TP Panel Inputs
        if (proj.camera) {
            if (typeof userHasCustomInit !== 'undefined') {
                userHasCustomInit = true; // Lock custom view state
            }

            const tpX = document.getElementById('tpX');
            const tpY = document.getElementById('tpY');
            const tpZ = document.getElementById('tpZ');

            if (tpX && proj.camera.x !== undefined) tpX.value = typeof proj.camera.x === 'number' ? proj.camera.x.toFixed(2) : proj.camera.x;
            if (tpY && proj.camera.y !== undefined) tpY.value = typeof proj.camera.y === 'number' ? proj.camera.y.toFixed(2) : proj.camera.y;
            if (tpZ && proj.camera.z !== undefined) tpZ.value = typeof proj.camera.z === 'number' ? proj.camera.z.toFixed(2) : proj.camera.z;

            if (typeof camera !== 'undefined' && camera) {
                if (proj.camera.target && camera.target) {
                    camera.target.set(Number(proj.camera.target.x), Number(proj.camera.target.y), Number(proj.camera.target.z));
                }
                if (proj.camera.alpha !== undefined) camera.alpha = Number(proj.camera.alpha);
                if (proj.camera.beta !== undefined) camera.beta = Number(proj.camera.beta);
                if (proj.camera.radius !== undefined) camera.radius = Number(proj.camera.radius);

                if (proj.camera.x !== undefined && proj.camera.y !== undefined && proj.camera.z !== undefined) {
                    camera.position.set(Number(proj.camera.x), Number(proj.camera.y), Number(proj.camera.z));
                }
            } else if (typeof teleportCamera === 'function') {
                teleportCamera();
            }
        }

        // 11. Close Project Manager Modal
        if (typeof closeProjectManagerModal === 'function') {
            closeProjectManagerModal();
        }
    } catch (err) {
        console.error("[loadProject Error] Exception while loading project index", index, err);
    }
}
*/

// Delete Saved Project Entry
function deleteProject(index) {
    let savedProjects = JSON.parse(localStorage.getItem('atomic_orb_projects') || '[]');
    if (index >= 0 && index < savedProjects.length) {
        savedProjects.splice(index, 1);
        localStorage.setItem('atomic_orb_projects', JSON.stringify(savedProjects));
        renderProjectList();
    }
}

// Render Saved Projects List and Sync Count Indicators
function renderProjectList() {
    const listEl = document.getElementById('projectList');
    const countEl = document.getElementById('projectCount');
    const buttonCountEl = document.getElementById('projectCountButtonTag');

    const savedProjects = JSON.parse(localStorage.getItem('atomic_orb_projects') || '[]');
    
    if (countEl) countEl.textContent = savedProjects.length;
    if (buttonCountEl) buttonCountEl.textContent = savedProjects.length;

    if (!listEl) return;

    if (savedProjects.length === 0) {
        listEl.innerHTML = `<li style="color:var(--text-muted); font-size:11px; text-align:center; padding:16px; font-family:'JetBrains Mono';">No saved projects found.</li>`;
        return;
    }

    listEl.innerHTML = savedProjects.map((proj, index) => `
        <li class="project-item">
            <div class="project-info">
                <span class="project-name">${proj.name || 'Untitled Atom'}</span>
                <span class="project-date">Z: ${proj.Z || '?'} | Saved: ${proj.date || 'N/A'}</span>
            </div>
            <div class="project-actions">
                <button onclick="loadProject(${index})">LOAD</button>
                <button class="delete-btn" onclick="deleteProject(${index})">DELETE</button>
            </div>
        </li>
    `).join('');
}

// Helper to calculate required maxN shell depth from atomic number Z
function getRequiredMaxN(z) {
    if (z <= 0) return 1;

    let n = 1;
    let capacity = 2; // Period 1 capacity (1s)

    while (z > capacity) {
        z -= capacity;
        n++;
        // Period length sequence: 2, 8, 8, 18, 18, 32, 32, 50, 50...
        // Formula for capacity at period n: 2 * Math.floor((n + 2) / 2)^2
        const k = Math.floor((n + 2) / 2);
        capacity = 2 * k * k;
    }

    return n;
}

// Save Current Quantum Parameters & Camera / Internal Data to LocalStorage
function saveCurrentProject() {
    const savedProjects = JSON.parse(localStorage.getItem('atomic_orb_projects') || '[]');
    if (savedProjects.length >= 4) {
        alert("Project storage limit reached (4 max). Please delete an existing project before saving.");
        return;
    }

    const ZVal = parseInt(document.getElementById('inputZ')?.value || '1', 10);
    const element = (typeof getElementData === 'function') ? getElementData(ZVal) : 
                    ((typeof ELEMENTS_DATA !== 'undefined') ? ELEMENTS_DATA.find(e => e.Z == ZVal) : null);
    const defaultName = element ? `${element.name} (Z=${ZVal})` : `Atom Z=${ZVal}`;

    const projectName = prompt("Enter a name for this project:", defaultName);
    if (projectName === null) return;

    let cameraData = null;
    if (typeof camera !== 'undefined' && camera) {
        cameraData = {
            x: camera.position ? camera.position.x : parseFloat(document.getElementById('tpX')?.value || 0),
            y: camera.position ? camera.position.y : parseFloat(document.getElementById('tpY')?.value || 0),
            z: camera.position ? camera.position.z : parseFloat(document.getElementById('tpZ')?.value || 0),
            alpha: camera.alpha,
            beta: camera.beta,
            radius: camera.radius,
            target: camera.target ? { x: camera.target.x, y: camera.target.y, z: camera.target.z } : null
        };
    } else {
        cameraData = {
            x: document.getElementById('tpX')?.value || '',
            y: document.getElementById('tpY')?.value || '',
            z: document.getElementById('tpZ')?.value || ''
        };
    }

    let activeMode = 'auto';
    if (document.getElementById('btnModeManual')?.classList.contains('active')) {
        activeMode = 'manual';
    } else if (document.getElementById('btnElementLook')?.classList.contains('active')) {
        activeMode = 'elementLook';
    }

    const suborbitInputs = [];
    document.querySelectorAll('#orbitsBuilderContainer input').forEach(inp => {
        if (inp.id || inp.name || inp.dataset.suborbitKey) {
            suborbitInputs.push({
                id: inp.id,
                key: inp.dataset.suborbitKey || inp.name,
                value: inp.value
            });
        }
    });

    const filterStates = (typeof visibilityState !== 'undefined') ? { ...visibilityState } : {};
    const reqMaxN = Math.max(parseInt(document.getElementById('inputMaxN')?.value || '1', 10), getRequiredMaxN(ZVal));

    const projectData = {
        name: projectName.trim() || defaultName,
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
        Z: ZVal,
        maxN: reqMaxN,
        inputEn: document.getElementById('inputEn')?.value || '',
        manualZ: document.getElementById('inputZManual')?.value || ZVal,
        config: document.getElementById('inputConfig')?.value || '',
        elec: document.getElementById('inputElec')?.value || '',
        n: document.getElementById('inputN')?.value || '',
        l: document.getElementById('inputL')?.value || '',
        gI: document.getElementById('inputGI')?.value || '',
        spinS: document.getElementById('inputTotalSpinS')?.value || '',
        electricField: document.getElementById('inputElectricField')?.value || '',
        opacity: document.getElementById('opacityRange')?.value || '0.35',
        activeMode: activeMode,
        camera: cameraData,
        suborbitInputs: suborbitInputs,
        filterStates: filterStates
    };

    savedProjects.push(projectData);
    localStorage.setItem('atomic_orb_projects', JSON.stringify(savedProjects));
    
    renderProjectList();
    alert(`Project "${projectData.name}" saved successfully!`);
}

// Load Saved Project Parameters and Fully Sync with Internal Data, Camera, & Configurations
// Load Saved Project Parameters and Fully Sync with Internal Data, Camera, & Configurations
async function loadProject(index) {
    try {
        const savedProjects = JSON.parse(localStorage.getItem('atomic_orb_projects') || '[]');
        let proj = savedProjects[index];
        if (!proj) {
            console.warn(`[loadProject]: No project found at index ${index}`);
            return;
        }

        // Unwrap nested project structure if stored via saveProjectsToStorage ({ id, name, data: {...} })
        const data = proj.data || proj;

        // Extract auto & manual parameter sources
        const autoParams = data.autoParameters || data;
        const manualParams = data.manualParameters || data;

        // 1. Resolve Target Atomic Number (Z) and Max N upfront
        const targetInitZ = 172;
        const zVal = parseInt(autoParams.Z || data.Z, 10) || targetInitZ;

        let requiredMaxN = parseInt(autoParams.maxN || data.maxN, 10);
        if (isNaN(requiredMaxN)) {
            if (typeof getRequiredMaxN === 'function') {
                requiredMaxN = getRequiredMaxN(zVal);
            } else {
                requiredMaxN = 9; // Fallback depth for superheavy baseline
            }
        }

        // 2. Sync Element Metadata Context
        let elemData = null;
        if (typeof getElementData === 'function') {
            elemData = getElementData(zVal);
        } else if (typeof ELEMENTS_DATA !== 'undefined' && Array.isArray(ELEMENTS_DATA)) {
            elemData = ELEMENTS_DATA.find(e => e.Z === zVal);
        }

        if (!elemData && zVal === targetInitZ) {
            elemData = { Z: 172, sym: "Unk", name: "Superheavy 172", period: 8, group: 0, cat: "unknown", A: 420, gI: 0.0 };
        }

        if (elemData) {
            window.currentElement = elemData;
            const selectedTag = document.getElementById('selectedElementTag');
            if (selectedTag) {
                selectedTag.textContent = `${elemData.name} (${elemData.sym}, Z=${elemData.Z})`;
            }
        }

        // 3. Update Baseline Control Inputs
        if (document.getElementById('inputZ')) document.getElementById('inputZ').value = zVal;
        if (document.getElementById('inputMaxN')) document.getElementById('inputMaxN').value = requiredMaxN;
        if (document.getElementById('inputEn')) document.getElementById('inputEn').value = autoParams.bindingEn || data.inputEn || '';

        // Restore Manual Mode fields
        if (document.getElementById('inputZManual')) document.getElementById('inputZManual').value = manualParams.Z || zVal;
        if (document.getElementById('inputConfig')) document.getElementById('inputConfig').value = manualParams.config || data.config || '';
        if (document.getElementById('inputElec')) document.getElementById('inputElec').value = manualParams.elec || data.elec || '';
        if (document.getElementById('inputN')) document.getElementById('inputN').value = manualParams.n || data.n || '';
        if (document.getElementById('inputL')) document.getElementById('inputL').value = manualParams.l || data.l || '';

        // Physical Quantum Properties
        const inputGI = document.getElementById('inputGI');
        if (inputGI) {
            const fallbackGI = elemData ? elemData.gI : 5.585;
            const savedGI = manualParams.gI ?? data.gI;
            inputGI.value = (savedGI !== undefined && savedGI !== '') ? savedGI : fallbackGI;
        }

        const inputSpinS = document.getElementById('inputTotalSpinS');
        if (inputSpinS) {
            const fallbackSpin = (typeof calculateTotalSpinS === 'function') ? calculateTotalSpinS(zVal) : 0.5;
            const savedSpin = manualParams.totalSpinS ?? data.spinS;
            inputSpinS.value = (savedSpin !== undefined && savedSpin !== '') ? savedSpin : fallbackSpin;
        }

        const inputEF = document.getElementById('inputElectricField');
        if (inputEF) {
            const savedEF = manualParams.electricField ?? data.electricField;
            inputEF.value = (savedEF !== undefined && savedEF !== '') ? savedEF : '';
        }

        // 4. Build Orbit DOM Layout ONCE
        if (typeof generateOrbitsBuilder === 'function') {
            generateOrbitsBuilder(false);
        }

        // 5. Restore Suborbit Electron Configurations & Excitations
        let restoredElectronsCount = 0;
        const subMap = data.subConfig || data.orbitals || {};
        const exMap = data.excitations || {};

        // A. Restore from Array format (suborbitInputs)
        if (Array.isArray(data.suborbitInputs) && data.suborbitInputs.length > 0) {
            data.suborbitInputs.forEach(item => {
                let el = null;
                if (item.id) el = document.getElementById(item.id);
                if (!el && item.key) el = document.querySelector(`[data-suborbit-key="${item.key}"], [name="${item.key}"]`);
                if (el) {
                    el.value = item.value;
                    restoredElectronsCount += parseInt(item.value, 10) || 0;
                }
            });
        }

        // B. Restore from Map / DOM Orbit Rows (subConfig & excitations)
        document.querySelectorAll('.orbit-row').forEach(row => {
            const label = row.querySelector('.orbit-label')?.innerText?.trim();
            const eInput = row.querySelector('.e-input');
            const exInput = row.querySelector('.ex-input');

            if (label) {
                if (eInput && subMap[label] !== undefined) {
                    eInput.value = subMap[label];
                    restoredElectronsCount += parseInt(subMap[label], 10) || 0;
                }
                if (exInput && exMap[label] !== undefined) {
                    exInput.value = exMap[label];
                }
            }
        });

        // C. Fallback: Populate default baseline if no electron configurations were set
        if (restoredElectronsCount === 0) {
            if (typeof populateDefaultSuborbitElectrons === 'function') {
                populateDefaultSuborbitElectrons(zVal);
            } else if (typeof getElectronConfigForZ === 'function') {
                const preloadConfig = getElectronConfigForZ(zVal);
                if (preloadConfig && preloadConfig.subConfig) {
                    document.querySelectorAll('.orbit-row').forEach(row => {
                        const label = row.querySelector('.orbit-label')?.innerText?.trim();
                        const eInput = row.querySelector('.e-input');
                        if (eInput && preloadConfig.subConfig[label] !== undefined) {
                            eInput.value = preloadConfig.subConfig[label];
                        }
                    });
                }
            }
        }

        // 6. Restore Opacity & Global Settings
        const globalSettings = data.globalSettings || {};
        const opacityVal = globalSettings.meshOpacity ?? data.opacity;
        if (opacityVal !== undefined) {
            const opacitySlider = document.getElementById('opacityRange');
            if (opacitySlider) {
                opacitySlider.value = opacityVal;
                if (typeof updateOpacity === 'function') {
                    updateOpacity(opacityVal);
                }
            }
        }

        // 7. Restore Orbital Visibility Filters
        const filterStates = data.filterStates || data.visibilityState;
        if (filterStates) {
            if (typeof visibilityState !== 'undefined') {
                Object.assign(visibilityState, filterStates);
            }
            Object.entries(filterStates).forEach(([key, val]) => {
                const chk = document.querySelector(`input[data-filter="${key}"]`) || document.getElementById(`filter_${key}`);
                if (chk) chk.checked = Boolean(val);
            });
        }

        // 8. Switch Active Control Mode BEFORE Rebuilding 3D Model
        const mode = data.activeMode || data.mode;
        if (mode && typeof switchControlMode === 'function') {
            switchControlMode(mode);
        }

        // 9. Rebuild 3D Quantum Dirac Model
        if (typeof rebuildQuantumModel === 'function') {
            await rebuildQuantumModel();
        }

        // 10. Restore Camera State & Target
        if (data.camera) {
            if (typeof userHasCustomInit !== 'undefined') {
                userHasCustomInit = true;
            }

            const tpX = document.getElementById('tpX');
            const tpY = document.getElementById('tpY');
            const tpZ = document.getElementById('tpZ');

            if (tpX && data.camera.x !== undefined) tpX.value = typeof data.camera.x === 'number' ? data.camera.x.toFixed(2) : data.camera.x;
            if (tpY && data.camera.y !== undefined) tpY.value = typeof data.camera.y === 'number' ? data.camera.y.toFixed(2) : data.camera.y;
            if (tpZ && data.camera.z !== undefined) tpZ.value = typeof data.camera.z === 'number' ? data.camera.z.toFixed(2) : data.camera.z;

            if (typeof camera !== 'undefined' && camera) {
                if (data.camera.target && camera.target) {
                    camera.target.set(Number(data.camera.target.x), Number(data.camera.target.y), Number(data.camera.target.z));
                }
                if (data.camera.alpha !== undefined) camera.alpha = Number(data.camera.alpha);
                if (data.camera.beta !== undefined) camera.beta = Number(data.camera.beta);
                if (data.camera.radius !== undefined) camera.radius = Number(data.camera.radius);

                if (data.camera.x !== undefined && data.camera.y !== undefined && data.camera.z !== undefined) {
                    camera.position.set(Number(data.camera.x), Number(data.camera.y), Number(data.camera.z));
                }
            } else if (typeof teleportCamera === 'function') {
                teleportCamera();
            }
        }

        // 11. Close Project Manager Modal
        if (typeof closeProjectManagerModal === 'function') {
            closeProjectManagerModal();
        }

        console.log(`[loadProject]: Successfully loaded project index ${index} (Z = ${zVal})`);
    } catch (err) {
        console.error("[loadProject Error] Exception while loading project index", index, err);
    }
}