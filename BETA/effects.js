/**
 * effects.js
 * High-Definition Liquid Glass Engine & GSAP Interactivity
 */
document.addEventListener('DOMContentLoaded', () => {
    initGroupAttributesObserver();
    initLiquidGLEffects();
    initGSAPAnimations();
    initGlassInteractivity();
});

/**
 * Automatically attaches data-group attributes to elements created by kernel.js
 * maps Group 1 (Pale Bright Orange) through Group 17 (Pale Gray-Blue) & Group 18 (Deep Gray)
 */
function applyGroupDataAttributes() {
    const cards = document.querySelectorAll('.pt-element-card');
    cards.forEach(card => {
        if (card.dataset.group) return;
        const groupSpan = card.querySelector('.pt-card-top span:nth-child(2)');
        if (groupSpan) {
            const groupText = groupSpan.textContent.trim(); // e.g., "G1", "G18"
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
 * Initialize WebGL Fluid Distortion via LiquidGL
 */
function initLiquidGLEffects() {
    if (typeof LiquidGL === 'undefined') return;

    // Attach liquid WebGL shaders to panels
    const glassPanels = document.querySelectorAll('.ui-overlay, .tp-overlay, .pt-modal-window');
    glassPanels.forEach(panel => {
        new LiquidGL(panel, {
            refraction: 0.05,
            reflection: 0.2,
            liquidColor: '#0d111a',
            glassColor: 'rgba(13, 17, 26, 0.55)',
            dispersion: 0.03,
            interactive: true,
            intensity: 0.35
        });
    });

    // Attach subtle liquid feedback to interactive buttons
    const liquidButtons = document.querySelectorAll('button.apply-btn, button.secondary-btn, .close-btn');
    liquidButtons.forEach(btn => {
        new LiquidGL(btn, {
            refraction: 0.03,
            reflection: 0.15,
            liquidColor: '#121824',
            dispersion: 0.02,
            interactive: true,
            intensity: 0.2
        });
    });
}

/**
 * GSAP Entrance Timelines & Micro-Interactions
 */
function initGSAPAnimations() {
    if (typeof gsap === 'undefined') return;

    // Smooth UI Panel Entrance Sequence
    gsap.from('#uiOverlay', {
        x: -50,
        opacity: 0,
        duration: 0.8,
        ease: 'power3.out',
        delay: 0.2
    });

    gsap.from('#tpOverlay', {
        x: 50,
        opacity: 0,
        duration: 0.8,
        ease: 'power3.out',
        delay: 0.3
    });

    // Button Hover Spring Micro-Animations
    const buttons = document.querySelectorAll('button');
    buttons.forEach(btn => {
        btn.addEventListener('mouseenter', () => {
            gsap.to(btn, {
                scale: 1.03,
                duration: 0.2,
                ease: 'back.out(1.7)'
            });
        });

        btn.addEventListener('mouseleave', () => {
            gsap.to(btn, {
                scale: 1.0,
                duration: 0.2,
                ease: 'power2.out'
            });
        });

        btn.addEventListener('mousedown', () => {
            gsap.to(btn, {
                scale: 0.96,
                duration: 0.1,
                ease: 'power1.inOut'
            });
        });
    });
}

/**
 * Dynamic Mouse Sheen & Subtle 3D Tilt for Liquid Glass
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
                    transformPerspective: 1000,
                    duration: 0.4,
                    ease: 'power1.out'
                });
            }
        });

        panel.addEventListener('mouseleave', () => {
            if (typeof gsap !== 'undefined' && !panel.classList.contains('pt-modal-window')) {
                gsap.to(panel, {
                    rotateX: 0,
                    rotateY: 0,
                    duration: 0.6,
                    ease: 'power2.out'
                });
            }
        });
    });
}
