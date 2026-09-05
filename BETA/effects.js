/**
 * effects.js
 * Semi-Transparent Extra-Dark Quicksilver UI Engine
 */
document.addEventListener('DOMContentLoaded', () => {
    initGroupAttributesObserver();
    initGlassInteractivity();
    initGSAPAnimations();
    initModalVisibilityHandler();
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
        const observer = new MutationObserver(applyGroupDataAttributes);
        observer.observe(container, { childList: true, subtree: true });
    }
}

/**
 * Dynamic Mouse-Driven Quicksilver Specular Lighting
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
 * Sync Modal Visibility and Prevent Invisible Click Blocks
 */
function initModalVisibilityHandler() {
    const modalBackdrop = document.querySelector('.pt-modal-backdrop');
    if (!modalBackdrop) return;

    const syncModalDisplay = () => {
        if (modalBackdrop.classList.contains('open')) {
            modalBackdrop.style.display = 'flex';
            modalBackdrop.style.pointerEvents = 'auto';
        } else {
            modalBackdrop.style.display = 'none';
            modalBackdrop.style.pointerEvents = 'none';
        }
    };

    syncModalDisplay();
    const observer = new MutationObserver(syncModalDisplay);
    observer.observe(modalBackdrop, { attributes: true, attributeFilter: ['class'] });
}

/**
 * GSAP Interface Animations
 */
function initGSAPAnimations() {
    if (typeof gsap === 'undefined') return;

    gsap.from('#uiOverlay', {
        x: -50,
        opacity: 0,
        duration: 0.7,
        ease: 'power3.out',
        delay: 0.1
    });

    gsap.from('#tpOverlay', {
        x: 50,
        opacity: 0,
        duration: 0.7,
        ease: 'power3.out',
        delay: 0.2
    });

    const buttons = document.querySelectorAll('button');
    buttons.forEach(btn => {
        btn.addEventListener('mouseenter', () => {
            gsap.to(btn, { scale: 1.02, duration: 0.18, ease: 'power1.out' });
        });

        btn.addEventListener('mouseleave', () => {
            gsap.to(btn, { scale: 1.0, duration: 0.18, ease: 'power1.out' });
        });

        btn.addEventListener('mousedown', () => {
            gsap.to(btn, { scale: 0.96, duration: 0.08, ease: 'power1.inOut' });
        });
    });
}

/**
 * Control Panel Mode Switcher
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
        gsap.fromTo(activeContainer, { opacity: 0, y: 6 }, { opacity: 1, y: 0, duration: 0.35, ease: 'power2.out' });
    }
}
