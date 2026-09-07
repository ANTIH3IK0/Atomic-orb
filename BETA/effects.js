// effects.js

document.addEventListener('DOMContentLoaded', () => {
    initGroupAttributesObserver();
    initModalVisibilityHandler();
    initGSAPAnimations();
    initSuborbitNotationObserver();
    initQuicksilverGlassEngine();
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

/* Quicksilver Glass Engine */
function initQuicksilverGlassEngine() {
    const panels = document.querySelectorAll('.ui-overlay, .tp-overlay, .pt-modal-window');
    const PROXIMITY_THRESHOLD = 90;

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
                glowOpacity += (1.0 - glowOpacity) * 0.15;
            } else {
                opacity += (0 - opacity) * 0.15;
                distOpacity += (0 - distOpacity) * 0.15;
                glowOpacity += (0 - glowOpacity) * 0.15;
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

            const minX = Math.min(edgeData.leftDist, edgeData.rightDist);
            const minY = Math.min(edgeData.topDist, edgeData.bottomDist);

            const targetIntX = Math.max(0, (PROXIMITY_THRESHOLD - minX) / PROXIMITY_THRESHOLD);
            const targetIntY = Math.max(0, (PROXIMITY_THRESHOLD - minY) / PROXIMITY_THRESHOLD);

            intensityX += (targetIntX - intensityX) * 0.2;
            intensityY += (targetIntY - intensityY) * 0.2;

            distOpacity = Math.max(intensityX, intensityY);

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

/* Animated Panel Minimize / Restore */
function togglePanel(minimize) {
    const overlay = document.getElementById('uiOverlay');
    const restoreBtn = document.getElementById('restoreBtn');
    if (!overlay || !restoreBtn) return;

    if (minimize) {
        if (typeof gsap !== 'undefined') {
            gsap.to(overlay, {
                opacity: 0, scale: 0.94, y: -10, duration: 0.28, ease: 'power2.in',
                onComplete: () => {
                    overlay.classList.add('collapsed');
                    restoreBtn.style.display = 'flex';
                    gsap.fromTo(restoreBtn, { opacity: 0, scale: 0.8 }, { opacity: 1, scale: 1, duration: 0.2 });
                }
            });
        } else {
            overlay.classList.add('collapsed');
            restoreBtn.style.display = 'flex';
        }
    } else {
        restoreBtn.style.display = 'none';
        overlay.classList.remove('collapsed');
        if (typeof gsap !== 'undefined') {
            gsap.fromTo(overlay, 
                { opacity: 0, scale: 0.94, y: -10 },
                { opacity: 1, scale: 1, y: 0, duration: 0.35, ease: 'power2.out' }
            );
        }
    }
}

function toggleTpPanel(minimize) {
    const overlay = document.getElementById('tpOverlay');
    const restoreBtn = document.getElementById('tpRestoreBtn');
    if (!overlay || !restoreBtn) return;

    if (minimize) {
        if (typeof gsap !== 'undefined') {
            gsap.to(overlay, {
                opacity: 0, scale: 0.94, y: -10, duration: 0.28, ease: 'power2.in',
                onComplete: () => {
                    overlay.classList.add('collapsed');
                    restoreBtn.style.display = 'flex';
                    gsap.fromTo(restoreBtn, { opacity: 0, scale: 0.8 }, { opacity: 1, scale: 1, duration: 0.2 });
                }
            });
        } else {
            overlay.classList.add('collapsed');
            restoreBtn.style.display = 'flex';
        }
    } else {
        restoreBtn.style.display = 'none';
        overlay.classList.remove('collapsed');
        if (typeof gsap !== 'undefined') {
            gsap.fromTo(overlay, 
                { opacity: 0, scale: 0.94, y: -10 },
                { opacity: 1, scale: 1, y: 0, duration: 0.35, ease: 'power2.out' }
            );
        }
    }
}

/* Accordion Subpage Transitions */
function toggleSection(targetId, btn) {
    const target = document.getElementById(targetId);
    if (!target) return;

    const autoContainer = document.getElementById('autoModeContainer');
    const allContents = autoContainer ? autoContainer.querySelectorAll('.collapsible-content') : [];
    const allBtns = autoContainer ? autoContainer.querySelectorAll('.collapse-btn') : [];

    const isCollapsed = target.classList.contains('collapsed');

    allContents.forEach(content => {
        if (!content.classList.contains('collapsed')) {
            if (typeof gsap !== 'undefined') {
                gsap.to(content, {
                    height: 0, opacity: 0, duration: 0.22, ease: 'power2.in',
                    onComplete: () => {
                        content.classList.add('collapsed');
                        gsap.set(content, { clearProps: 'all' });
                    }
                });
            } else {
                content.classList.add('collapsed');
            }
        }
    });
    allBtns.forEach(b => b.textContent = '+');

    if (isCollapsed) {
        target.classList.remove('collapsed');
        if (btn) btn.textContent = '−';
        
        if (typeof gsap !== 'undefined') {
            gsap.fromTo(target, 
                { height: 0, opacity: 0, overflow: 'hidden' },
                { height: 'auto', opacity: 1, duration: 0.3, ease: 'power2.out', onComplete: () => gsap.set(target, { clearProps: 'overflow' }) }
            );
        }
    }
}

/* Modern PBR Quicksilver Palette */
const MODERN_LOW_LUM_PALETTE = [
    { albedo: [0.06, 0.08, 0.12], metallic: 0.85, roughness: 0.35 },
    { albedo: [0.05, 0.09, 0.08], metallic: 0.75, roughness: 0.40 },
    { albedo: [0.08, 0.06, 0.10], metallic: 0.80, roughness: 0.30 },
    { albedo: [0.09, 0.08, 0.05], metallic: 0.90, roughness: 0.25 },
    { albedo: [0.07, 0.08, 0.09], metallic: 0.70, roughness: 0.45 }
];

function applyLowLumOrbitMaterial(mesh, shellIndex, opacityMultiplier = 0.25) {
    if (typeof BABYLON === 'undefined' || !mesh || !mesh.getScene()) return;
    const sceneInstance = mesh.getScene();
    const style = MODERN_LOW_LUM_PALETTE[shellIndex % MODERN_LOW_LUM_PALETTE.length];
    
    const pbr = new BABYLON.PBRMaterial(`pbrOrbit_${shellIndex}_${Date.now()}`, sceneInstance);
    pbr.albedoColor = new BABYLON.Color3(...style.albedo);
    pbr.metallic = style.metallic;
    pbr.roughness = style.roughness;
    pbr.emissiveColor = new BABYLON.Color3(0.005, 0.005, 0.01);
    
    const opacityBase = typeof currentOpacity !== 'undefined' ? currentOpacity : 0.35;
    pbr.alpha = opacityBase * opacityMultiplier;
    pbr.clearCoat.isEnabled = true;
    pbr.clearCoat.intensity = 0.5;
    pbr.clearCoat.roughness = 0.1;
    
    pbr.backFaceCulling = false;
    mesh.material = pbr;
}
