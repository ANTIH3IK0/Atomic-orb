/**
 * effects.js
 * Subtle Dark Interface Controls & Micro-Transitions
 */
document.addEventListener('DOMContentLoaded', () => {
    initGroupAttributesObserver();
    initLiquidGLEffects();
    initGSAPAnimations();
});

/**
 * Automatically attaches data-group attributes to elements created by kernel.js
 */
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
 * Minimal Dark Optics Setup (Disables fake shine and high dispersion)
 */
function initLiquidGLEffects() {
    if (typeof LiquidGL === 'undefined') return;

    const glassPanels = document.querySelectorAll('.ui-overlay, .tp-overlay, .pt-modal-window');
    glassPanels.forEach(panel => {
        new LiquidGL(panel, {
            refraction: 0.01,
            reflection: 0.02,
            liquidColor: '#020305',
            glassColor: 'rgba(6, 9, 15, 0.88)',
            dispersion: 0.0,
            interactive: false,
            intensity: 0.0
        });
    });
}

/**
 * Clean Fade In/Out Transitions Without Shiny Animations
 */
function initGSAPAnimations() {
    if (typeof gsap === 'undefined') return;

    gsap.from('#uiOverlay', {
        opacity: 0,
        y: 10,
        duration: 0.3,
        ease: 'power2.out'
    });

    gsap.from('#tpOverlay', {
        opacity: 0,
        y: 10,
        duration: 0.3,
        ease: 'power2.out',
        delay: 0.1
    });
}
