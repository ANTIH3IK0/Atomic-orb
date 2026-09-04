/**
 * effects.js
 * Dark Liquid Glass & GSAP Motion Engine
 * Powered by GSAP 3.12.5 & LiquidGL WebGL Fluid Displacement
 */
document.addEventListener('DOMContentLoaded', () => {
    initLiquidGLEffects();
    initGSAPAnimations();
    initGlassInteractivity();
});

/**
 * Initialize WebGL Fluid Distortion via LiquidGL
 */
function initLiquidGLEffects() {
    if (typeof LiquidGL === 'undefined') return;

    // Attach liquid WebGL shaders to dark glass panels
    const glassPanels = document.querySelectorAll('.ui-overlay, .tp-overlay, .template-overlay');
    glassPanels.forEach(panel => {
        new LiquidGL(panel, {
            refraction: 0.04,
            reflection: 0.15,
            liquidColor: '#0d111a',
            glassColor: 'rgba(13, 17, 26, 0.45)',
            dispersion: 0.02,
            interactive: true,
            intensity: 0.25
        });
    });

    // Attach subtle liquid feedback to interactive buttons
    const liquidButtons = document.querySelectorAll('button.apply-btn, button.secondary-btn, .template-card-btn');
    liquidButtons.forEach(btn => {
        new LiquidGL(btn, {
            refraction: 0.02,
            reflection: 0.1,
            liquidColor: '#121824',
            dispersion: 0.01,
            interactive: true,
            intensity: 0.15
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
    const buttons = document.querySelectorAll('button, .template-card-btn');
    buttons.forEach(btn => {
        btn.addEventListener('mouseenter', () => {
            gsap.to(btn, {
                scale: 1.02,
                duration: 0.25,
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
                scale: 0.97,
                duration: 0.1,
                ease: 'power1.inOut'
            });
        });
    });
}

/**
 * Dynamic Mouse Sheen & Subtle 3D Tilt
 */
function initGlassInteractivity() {
    const glassPanels = document.querySelectorAll('.ui-overlay, .tp-overlay, .template-overlay');

    glassPanels.forEach(panel => {
        panel.addEventListener('mousemove', (e) => {
            const rect = panel.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            panel.style.setProperty('--mouse-x', `${x}px`);
            panel.style.setProperty('--mouse-y', `${y}px`);

            if (typeof gsap !== 'undefined') {
                const centerX = rect.left + rect.width / 2;
                const centerY = rect.top + rect.height / 2;
                const rotateX = ((e.clientY - centerY) / (rect.height / 2)) * -2;
                const rotateY = ((e.clientX - centerX) / (rect.width / 2)) * 2;

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
            if (typeof gsap !== 'undefined') {
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
