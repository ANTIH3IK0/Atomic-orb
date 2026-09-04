/**
 * Dark Liquid Glass & Dynamic Lighting Effects Engine
 */
document.addEventListener('DOMContentLoaded', () => {
    initLiquidGlassInteractivity();
});

function initLiquidGlassInteractivity() {
    const glassPanels = document.querySelectorAll('.ui-overlay, .tp-overlay, .template-overlay');

    glassPanels.forEach(panel => {
        // Dynamic liquid reflection on cursor move
        panel.addEventListener('mousemove', (e) => {
            const rect = panel.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            panel.style.setProperty('--mouse-x', `${x}px`);
            panel.style.setProperty('--mouse-y', `${y}px`);
        });

        // Soft 3D tilt on hover
        panel.addEventListener('mousemove', (e) => {
            const rect = panel.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;
            const rotateX = ((e.clientY - centerY) / (rect.height / 2)) * -2.5;
            const rotateY = ((e.clientX - centerX) / (rect.width / 2)) * 2.5;

            panel.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
        });

        panel.addEventListener('mouseleave', () => {
            panel.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg)';
        });
    });
}
