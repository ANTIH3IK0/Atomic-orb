/**
 * Advanced Obsidian Liquid Engine & Photonic Diffusion
 */
document.addEventListener('DOMContentLoaded', () => {
    initLiquidCanvas();
    initSpecularLighting();
});

function initLiquidCanvas() {
    const bgCanvas = document.createElement('canvas');
    bgCanvas.id = 'quicksilverBgCanvas';
    Object.assign(bgCanvas.style, {
        position: 'fixed',
        top: '0',
        left: '0',
        width: '100vw',
        height: '100vh',
        pointerEvents: 'none',
        zIndex: '1',
        opacity: '0.6',
        mixBlendMode: 'screen'
    });
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
        t += 0.006;

        // Dynamic Quicksilver Fluid Waves
        const grad = ctx.createRadialGradient(
            width * 0.5 + Math.sin(t) * 150,
            height * 0.4 + Math.cos(t * 0.8) * 100,
            50,
            width * 0.5,
            height * 0.5,
            Math.max(width, height) * 0.75
        );

        grad.addColorStop(0, 'rgba(56, 189, 248, 0.08)');
        grad.addColorStop(0.35, 'rgba(14, 165, 233, 0.04)');
        grad.addColorStop(0.7, 'rgba(3, 7, 18, 0)');

        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, width, height);

        requestAnimationFrame(renderFrame);
    }
    renderFrame();
}

function initSpecularLighting() {
    const targets = document.querySelectorAll('.ui-overlay, .tp-overlay, .pt-modal-window');
    
    document.addEventListener('mousemove', (e) => {
        targets.forEach(el => {
            const rect = el.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            el.style.setProperty('--mouse-x', `${x}px`);
            el.style.setProperty('--mouse-y', `${y}px`);
        });
    });
}
