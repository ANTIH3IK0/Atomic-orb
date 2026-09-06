// effects.js

document.addEventListener('DOMContentLoaded', () => {
    initGroupAttributesObserver();
    initModalVisibilityHandler();
    initGSAPAnimations();
    initGlassInteractivity();
    initSuborbitNotationObserver();
    initLiquidGlassMetallic();
});

/* Continuous Dynamic WebGL LiquidGlass Renderer Engine */
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
        
        glassEls.forEach(el => {
            el.dataset.config = JSON.stringify({
                blurAmount: 0.10,
                refraction: 0.38,
                specular: 0.45,
                edgeHighlight: 0.20,
                fresnel: 0.80,
                chromAberration: 0.025,
                opacity: 0.88,
                cornerRadius: 20
            });
        });

        const lgInstance = await LiquidGlass.init({
            root: document.body,
            glassElements: glassEls
        });

        // Continuous Animation Loop forcing LiquidGlass to re-capture moving 3D background WebGL canvas
        function continuousRefractionLoop() {
            if (lgInstance) {
                if (typeof lgInstance.update === 'function') {
                    lgInstance.update();
                } else if (typeof lgInstance.markChanged === 'function' && bgCanvas) {
                    lgInstance.markChanged(bgCanvas);
                }
            }
            requestAnimationFrame(continuousRefractionLoop);
        }
        requestAnimationFrame(continuousRefractionLoop);

    } catch (err) {
        console.warn('LiquidGlass WebGL initialization skipped:', err);
    }
}

/* Format Quantum Suborbit Notation (e.g. 1s1/2 -> 1s<sub>1/2</sub>) */
function formatSuborbitNotation(text) {
    if (!text) return '';
    return text.replace(/([0-9][a-zA-Z])([0-9]+\/[0-9]+)/g, '$1<sub>$2</sub>');
}

function processSuborbitRows() {
    const rows = document.querySelectorAll('.orbit-row');
    rows.forEach(row => {
        const targetSpans = row.querySelectorAll('span, label, div');
        targetSpans.forEach(el => {
            if (!el.dataset.suborbitFormatted && el.children.length === 0) {
                const text = el.textContent.trim();
                if (/^[0-9][a-zA-Z][0-9]+\/[0-9]+$/.test(text)) {
                    el.innerHTML = formatSuborbitNotation(text);
                    el.classList.add('suborbit-label');
                    el.dataset.suborbitFormatted = 'true';
                }
            }
        });
    });
}

function initSuborbitNotationObserver() {
    processSuborbitRows();
    const observer = new MutationObserver(() => processSuborbitRows());
    observer.observe(document.body, { childList: true, subtree: true });
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
        modalBackdrop.style.display = isOpen ? 'flex' : 'none';
        modalBackdrop.style.pointerEvents = isOpen ? 'auto' : 'none';
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
        btnAuto.classList.add('active');
        btnManual.classList.add('active');
    }

    if (typeof gsap !== 'undefined') {
        const activeContainer = mode === 'auto' ? autoContainer : manualContainer;
        gsap.fromTo(activeContainer,
            { opacity: 0, y: 6 },
            { opacity: 1, y: 0, duration: 0.3, ease: 'power2.out' });
    }
}
