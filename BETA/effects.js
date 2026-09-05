/**
 * Dynamic Aero Quicksilver & Actinium Light Engine
 */
document.addEventListener('DOMContentLoaded', () => {
    initQuicksilverCanvas();
    initInteractiveEdgeGlow();
});

function initQuicksilverCanvas() {
    const bgCanvas = document.createElement('canvas');
    bgCanvas.id = 'quicksilverBgCanvas';
    bgCanvas.style.position = 'fixed';
    bgCanvas.style.top = '0';
    bgCanvas.style.left = '0';
    bgCanvas.style.width = '100vw';
    bgCanvas.style.height = '100vh';
    bgCanvas.style.pointerEvents = 'none';
    bgCanvas.style.zIndex = '1';
    bgCanvas.style.opacity = '0.45';
    bgCanvas.style.mixBlendMode = 'screen';
    document.body.appendChild(bgCanvas);

    const ctx = bgCanvas.getContext('2d');
    let width, height, t = 0;

    function resize() {
        width = bgCanvas.width = window.innerWidth;
        height = bgCanvas.height = window.innerHeight;
    }
    window.addEventListener('resize', resize);
    resize();

    function renderFrame() {
        ctx.clearRect(0, 0, width, height);
        t += 0.008;

        // Dynamic Aero Liquid Waves
        const grad = ctx.createLinearGradient(0, 0, width, height);
        const offsetA = Math.sin(t) * 0.2 + 0.3;
        const offsetB = Math.cos(t * 0.8) * 0.2 + 0.7;

        grad.addColorStop(0, 'rgba(10, 15, 26, 0)');
        grad.addColorStop(Math.max(0, offsetA - 0.2), 'rgba(56, 189, 248, 0.03)');
        grad.addColorStop(offsetA, 'rgba(148, 163, 184, 0.08)');
        grad.addColorStop(Math.min(1, offsetB), 'rgba(30, 58, 138, 0.05)');
        grad.addColorStop(1, 'rgba(5, 8, 15, 0)');

        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, width, height);

        requestAnimationFrame(renderFrame);
    }
    renderFrame();
}

function initInteractiveEdgeGlow() {
    const panels = document.querySelectorAll('.ui-overlay, .tp-overlay, .pt-modal-window');
    panels.forEach(panel => {
        panel.addEventListener('mousemove', (e) => {
            const rect = panel.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            panel.style.setProperty('--mouse-x', `${x}px`);
            panel.style.setProperty('--mouse-y', `${y}px`);
        });
    });
}
