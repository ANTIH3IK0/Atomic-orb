/**
 * effects.js
 * Dark Refractive Liquid Optics & Interactivity Controls
 */
document.addEventListener('DOMContentLoaded', () => {
    initGroupAttributesObserver();
    initLiquidGLEffects();
    initGSAPAnimations();
    initGlassInteractivity();
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
 * Initialize Dark Smoked Optics via LiquidGL
 */
function initLiquidGLEffects() {
    if (typeof LiquidGL === 'undefined') return;

    // Attach dark liquid WebGL shaders to main overlays
    const glassPanels = document.querySelectorAll('.ui-overlay, .tp-overlay, .pt-modal-window');
    glassPanels.forEach(panel => {
        new LiquidGL(panel, {
            refraction: 0.045,      // Controlled refractive index for dark lens distortion
            reflection: 0.18,       // Muted specular edge highlights
            liquidColor: '#050811',
            glassColor: 'rgba(10, 14, 22, 0.72)',
            dispersion: 0.0,        // Zero rainbow chromatic dispersion
            interactive: true,
            intensity: 0.35,        // Smooth liquid ripple response on pointer hover
            viscosity: 0.88         // Heavy liquid feel
        });
    });

    // Attach subtle liquid feedback to interactive buttons
    const liquidButtons = document.querySelectorAll('button.apply-btn, button.secondary-btn, .close-btn');
    liquidButtons.forEach(btn => {
        new LiquidGL(btn, {
            refraction: 0.02,
            reflection: 0.1,
            liquidColor: '#090d18',
            dispersion: 0.0,
            interactive: true,
            intensity: 0.2
        });
    });
}

/**
 * GSAP Micro-Interactions
 */
function initGSAPAnimations() {
    if (typeof gsap === 'undefined') return;

    // Smooth UI Panel Entrance Sequence
    gsap.from('#uiOverlay', {
        x: -40,
        opacity: 0,
        duration: 0.6,
        ease: 'power3.out',
        delay: 0.15
    });

    gsap.from('#tpOverlay', {
        x: 40,
        opacity: 0,
        duration: 0.6,
        ease: 'power3.out',
        delay: 0.25
    });

    // Button Hover Spring Micro-Animations
    const buttons = document.querySelectorAll('button');
    buttons.forEach(btn => {
        btn.addEventListener('mouseenter', () => {
            gsap.to(btn, {
                scale: 1.02,
                duration: 0.18,
                ease: 'power1.out'
            });
        });

        btn.addEventListener('mouseleave', () => {
            gsap.to(btn, {
                scale: 1.0,
                duration: 0.18,
                ease: 'power1.out'
            });
        });

        btn.addEventListener('mousedown', () => {
            gsap.to(btn, {
                scale: 0.97,
                duration: 0.08,
                ease: 'power1.inOut'
            });
        });
    });
}

/**
 * Cursor Tracking & Subtle Tilt
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
                const rotateX = ((e.clientY - centerY) / (rect.height / 2)) * -2.0;
                const rotateY = ((e.clientX - centerX) / (rect.width / 2)) * 2.0;

                gsap.to(panel, {
                    rotateX: rotateX,
                    rotateY: rotateY,
                    transformPerspective: 1000,
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
