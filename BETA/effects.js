// effects.js

document.addEventListener('DOMContentLoaded', () => {
    initGroupAttributesObserver();
    initModalVisibilityHandler();
    initGSAPAnimations();
    initGlassInteractivity();
    initSuborbitNotationObserver();
    initLiquidGlassMetallic();
});

/* Throttled High-Reflection WebGL LiquidGlass Engine */
async function initLiquidGlassMetallic() {
    try {
        const bgCanvas = document.getElementById('renderCanvas');
        if (bgCanvas) {
            bgCanvas.setAttribute('data-dynamic', 'true');
        }

        const module = await import('../__libs/liquidglass/dist/index.js').catch(() =>
            import('https://cdn.jsdelivr.net/npm/@ybouane/liquidglass/dist/index.js')
        );
        const { LiquidGlass } = module;

        const glassEls = document.querySelectorAll('.ui-overlay, .tp-overlay, .pt-modal-window');
        
        // Aggressive specular reflection and edge highlight setup
        glassEls.forEach(el => {
            el.dataset.config = JSON.stringify({
                blurAmount: 0.08,
                refraction: 0.55,
                specular: 1.40,        /* Boosted light reflection */
                edgeHighlight: 0.90,   /* Sharp metallic glass edges */
                fresnel: 1.20,         /* Aggressive angle reflections */
                chromAberration: 0.04,
                opacity: 0.90,
                cornerRadius: 20
            });
        });

        const lgInstance = await LiquidGlass.init({
            root: document.body,
            glassElements: glassEls
        });

        // Frame Throttler (Limits texture capturing to 30 FPS to eliminate performance lag)
        let lastFrameTime = 0;
        const fpsInterval = 1000 / 30;

        function throttledRefractionLoop(timestamp) {
            requestAnimationFrame(throttledRefractionLoop);

            const elapsed = timestamp - lastFrameTime;
            if (elapsed > fpsInterval) {
                lastFrameTime = timestamp - (elapsed % fpsInterval);

                if (lgInstance) {
                    if (typeof lgInstance.update === 'function') {
                        lgInstance.update();
                    } else if (typeof lgInstance.markChanged === 'function' && bgCanvas) {
                        lgInstance.markChanged(bgCanvas);
                    }
                }
            }
        }
        requestAnimationFrame(throttledRefractionLoop);

    } catch (err) {
        console.warn('LiquidGlass WebGL initialization skipped:', err);
    }
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

/* Modal Visibility Handler with smooth transition sync */
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

/* Cursor Specular Tracking */
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
