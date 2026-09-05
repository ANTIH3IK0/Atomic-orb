/**
 * effects.js
 * Dark Actinium Quicksilver Liquid Optics & Micro-Interactivity
 */
document.addEventListener('DOMContentLoaded', () => {
    initGroupAttributesObserver();
    initLiquidGLEffects();
    initGSAPAnimations();
    initGlassInteractivity();
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
        const observer = new MutationObserver(() => {
            applyGroupDataAttributes();
        });
        observer.observe(container, { childList: true, subtree: true });
    }
}

/**
 * Dark Actinium-Quicksilver Refractive Optics via LiquidGL
 */
function initLiquidGLEffects() {
    if (typeof LiquidGL === 'undefined') return;

    const glassPanels = document.querySelectorAll('.ui-overlay, .tp-overlay, .pt-modal-window');
    glassPanels.forEach(panel => {
        new LiquidGL(panel, {
            refraction: 0.05,
            reflection: 0.22,
            liquidColor: '#050a14',
            glassColor: 'rgba(7, 11, 19, 0.78)',
            dispersion: 0.0,
            interactive: true,
            intensity: 0.4,
            viscosity: 0.85
        });
    });

    const liquidButtons = document.querySelectorAll('button.apply-btn, button.secondary-btn, .close-btn');
    liquidButtons.forEach(btn => {
        new LiquidGL(btn, {
            refraction: 0.025,
            reflection: 0.15,
            liquidColor: '#091020',
            dispersion: 0.0,
            interactive: true,
            intensity: 0.25
        });
    });
}

/**
 * Dynamic Light Tracking & Glass Tilt Micro-Interactions
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

            if (typeof gsap !== 'undefined' && !panel.classList.contains('pt-modal-window')) {
                const centerX = rect.left + rect.width / 2;
                const centerY = rect.top + rect.height / 2;
                const rotateX = ((e.clientY - centerY) / (rect.height / 2)) * -2.5;
                const rotateY = ((e.clientX - centerX) / (rect.width / 2)) * 2.5;

                gsap.to(panel, {
                    rotateX: rotateX,
                    rotateY: rotateY,
                    transformPerspective: 1200,
                    duration: 0.3,
                    ease: 'power1.out'
                });
            }
        });

        panel.addEventListener('mouseleave', () => {
            if (typeof gsap !== 'undefined' && !panel.classList.contains('pt-modal-window')) {
                gsap.to(panel, {
                    rotateX: 0,
                    rotateY: 0,
                    duration: 0.5,
                    ease: 'power2.out'
                });
            }
        });
    });
}

/**
 * GSAP Motion Sequences
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
            gsap.to(btn, {
                scale: 1.025,
                duration: 0.2,
                ease: 'power1.out'
            });
        });

        btn.addEventListener('mouseleave', () => {
            gsap.to(btn, {
                scale: 1.0,
                duration: 0.2,
                ease: 'power1.out'
            });
        });

        btn.addEventListener('mousedown', () => {
            gsap.to(btn, {
                scale: 0.96,
                duration: 0.08,
                ease: 'power1.inOut'
            });
        });
    });
}

/**
 * Mode Switching Animation Callback
 */
function switchControlMode(mode) {
    const autoContainer = document.getElementById('autoModeContainer');
    const manualContainer = document.getElementById('manualModeContainer');
    const btnAuto = document.getElementById('btnModeAuto');
    const btnManual = document.getElementById('btnModeManual');

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
        gsap.fromTo(activeContainer, { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: 0.35, ease: 'power2.out' });
    }
}
