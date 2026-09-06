// effects.js

document.addEventListener('DOMContentLoaded', () => {
    initGroupAttributesObserver();
    initModalVisibilityHandler();
    initGSAPAnimations();
    initSuborbitNotationObserver();
    initQuicksilverGlassEngine();
});

/* Unified Quicksilver Liquid Glass Engine */
function initQuicksilverGlassEngine() {
    const panels = document.querySelectorAll('.ui-overlay, .tp-overlay, .pt-modal-window');
    
    panels.forEach(panel => {
        // Track cursor for dynamic specular highlights & subtle 3D tilt
        panel.addEventListener('mousemove', (e) => {
            const rect = panel.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            // Calculate relative offset for specular light (-1 to 1)
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            const tiltX = (y - centerY) / centerY * -2;
            const tiltY = (x - centerX) / centerX * 2;

            panel.style.setProperty('--mouse-x', `${x}px`);
            panel.style.setProperty('--mouse-y', `${y}px`);
            panel.style.setProperty('--tilt-x', `${tiltX}deg`);
            panel.style.setProperty('--tilt-y', `${tiltY}deg`);
        });

        // Reset tilt on mouse leave
        panel.addEventListener('mouseleave', () => {
            panel.style.setProperty('--tilt-x', `0deg`);
            panel.style.setProperty('--tilt-y', `0deg`);
        });
    });
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
