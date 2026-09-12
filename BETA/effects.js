// effects.js

document.addEventListener('DOMContentLoaded', () => {
    initGroupAttributesObserver();
    initModalVisibilityHandler();
    initGSAPAnimations();
    initSuborbitNotationObserver();
    initQuicksilverGlassEngine();
    initIdleRedFilter();
});

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

/* Quicksilver Glass Engine: Touch Spotlight, Surface Compression & Edge Light */
function initQuicksilverGlassEngine() {
    const panels = document.querySelectorAll('.ui-overlay, .tp-overlay, .pt-modal-window');
    const PROXIMITY_THRESHOLD = 90; // Pixel distance threshold from edge

    panels.forEach(panel => {
        let currentX = 0, currentY = 0;
        let targetX = 0, targetY = 0;
        let pointerX = 0, pointerY = 0;
        let opacity = 0;
        let distOpacity = 0;
        let glowOpacity = 0;
        let intensityX = 0, intensityY = 0;
        let isHovered = false;
        let animFrame = null;

        function getNearestEdgePoint(mouseX, mouseY, width, height) {
            const leftDist = mouseX;
            const rightDist = width - mouseX;
            const topDist = mouseY;
            const bottomDist = height - mouseY;
            const minDist = Math.min(leftDist, rightDist, topDist, bottomDist);

            let edgeX = mouseX;
            let edgeY = mouseY;

            if (minDist === leftDist) edgeX = 0;
            else if (minDist === rightDist) edgeX = width;
            else if (minDist === topDist) edgeY = 0;
            else if (minDist === bottomDist) edgeY = height;

            return { x: edgeX, y: edgeY, leftDist, rightDist, topDist, bottomDist };
        }

        function update() {
            currentX += (targetX - currentX) * 0.12;
            currentY += (targetY - currentY) * 0.12;

            const dist = Math.hypot(targetX - currentX, targetY - currentY);
            
            if (isHovered) {
                const targetEdgeOpacity = dist > 1.5 ? Math.min(1, dist / 25) : 0;
                opacity += (targetEdgeOpacity - opacity) * 0.12;
                glowOpacity += (1.0 - glowOpacity) * 0.15; // Smooth touch light fade-in
            } else {
                opacity += (0 - opacity) * 0.15;
                distOpacity += (0 - distOpacity) * 0.15;
                glowOpacity += (0 - glowOpacity) * 0.15; // Smooth touch light fade-out
            }

            panel.style.setProperty('--mouse-x', `${currentX.toFixed(2)}px`);
            panel.style.setProperty('--mouse-y', `${currentY.toFixed(2)}px`);
            panel.style.setProperty('--pointer-x', `${pointerX.toFixed(2)}px`);
            panel.style.setProperty('--pointer-y', `${pointerY.toFixed(2)}px`);
            panel.style.setProperty('--edge-opacity', opacity.toFixed(3));
            panel.style.setProperty('--distortion-opacity', distOpacity.toFixed(3));
            panel.style.setProperty('--glow-opacity', glowOpacity.toFixed(3));
            panel.style.setProperty('--press-intensity-x', intensityX.toFixed(3));
            panel.style.setProperty('--press-intensity-y', intensityY.toFixed(3));

            if (opacity > 0.005 || distOpacity > 0.005 || glowOpacity > 0.005 || isHovered) {
                animFrame = requestAnimationFrame(update);
            } else {
                panel.style.setProperty('--edge-opacity', '0');
                panel.style.setProperty('--distortion-opacity', '0');
                panel.style.setProperty('--glow-opacity', '0');
                animFrame = null;
            }
        }

        function handlePointerMove(clientX, clientY) {
            const rect = panel.getBoundingClientRect();
            pointerX = clientX - rect.left;
            pointerY = clientY - rect.top;

            const edgeData = getNearestEdgePoint(pointerX, pointerY, rect.width, rect.height);
            targetX = edgeData.x;
            targetY = edgeData.y;

            // Proximity intensity calculation (0 at center, 1 at edge)
            const minX = Math.min(edgeData.leftDist, edgeData.rightDist);
            const minY = Math.min(edgeData.topDist, edgeData.bottomDist);

            const targetIntX = Math.max(0, (PROXIMITY_THRESHOLD - minX) / PROXIMITY_THRESHOLD);
            const targetIntY = Math.max(0, (PROXIMITY_THRESHOLD - minY) / PROXIMITY_THRESHOLD);

            intensityX += (targetIntX - intensityX) * 0.2;
            intensityY += (targetIntY - intensityY) * 0.2;

            distOpacity = Math.max(intensityX, intensityY);

            // Dynamic 3D tilt calculation
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            const tiltX = (pointerY - centerY) / centerY * -2;
            const tiltY = (pointerX - centerX) / centerX * 2;

            panel.style.setProperty('--tilt-x', `${tiltX}deg`);
            panel.style.setProperty('--tilt-y', `${tiltY}deg`);

            if (!animFrame) animFrame = requestAnimationFrame(update);
        }

        panel.addEventListener('mouseenter', (e) => {
            isHovered = true;
            handlePointerMove(e.clientX, e.clientY);
        });

        panel.addEventListener('mousemove', (e) => {
            handlePointerMove(e.clientX, e.clientY);
        });

        // Touch input listeners
        panel.addEventListener('touchstart', (e) => {
            isHovered = true;
            if (e.touches[0]) handlePointerMove(e.touches[0].clientX, e.touches[0].clientY);
        }, { passive: true });

        panel.addEventListener('touchmove', (e) => {
            if (e.touches[0]) handlePointerMove(e.touches[0].clientX, e.touches[0].clientY);
        }, { passive: true });

        panel.addEventListener('mouseleave', () => {
            isHovered = false;
            panel.style.setProperty('--tilt-x', `0deg`);
            panel.style.setProperty('--tilt-y', `0deg`);
            if (!animFrame) animFrame = requestAnimationFrame(update);
        });

        panel.addEventListener('touchend', () => {
            isHovered = false;
            if (!animFrame) animFrame = requestAnimationFrame(update);
        });
    });
}

/* Idle Dark Neon Red Filter Overlay */
function initIdleRedFilter() {
    const IDLE_TIMEOUT_MS = 10000; // 10 seconds
    let idleTimer = null;

    // Inject dark neon red filter element dynamically into DOM
    const overlay = document.createElement('div');
    overlay.id = 'idleNeonOverlay';
    Object.assign(overlay.style, {
        position: 'fixed',
        inset: '0',
        width: '100vw',
        height: '100vh',
        pointerEvents: 'none',
        zIndex: '999999',
        opacity: '0',
        transition: 'opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1)',
        background: 'radial-gradient(circle at 50% 50%, rgba(255, 0, 50, 0.12) 0%, rgba(30, 0, 10, 0.65) 60%, rgba(5, 0, 2, 0.92) 100%)',
        boxShadow: 'inset 0 0 120px rgba(255, 0, 60, 0.55)',
        backdropFilter: 'saturate(200%) contrast(115%) brightness(0.75)',
        mixBlendMode: 'screen'
    });
    document.body.appendChild(overlay);

    function showIdleEffect() {
        overlay.style.opacity = '1';
    }

    function resetIdleTimer() {
        if (overlay.style.opacity !== '0') {
            overlay.style.opacity = '0';
        }
        if (idleTimer) clearTimeout(idleTimer);
        idleTimer = setTimeout(showIdleEffect, IDLE_TIMEOUT_MS);
    }

    // Interaction triggers to reset inactivity timer
    const activityEvents = [
        'mousemove', 
        'mousedown', 
        'keydown', 
        'touchstart', 
        'touchmove', 
        'wheel', 
        'pointermove'
    ];

    activityEvents.forEach(evt => {
        window.addEventListener(evt, resetIdleTimer, { passive: true });
    });

    // Initialize timer on load
    resetIdleTimer();
}
