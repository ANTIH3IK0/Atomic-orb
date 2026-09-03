/**
 * kernel.js - core logic
 * Babylon.js Infinite Quantum Engine Core
 * Dynamic Teleportation (GOTO), Minecraft ~ Relative Syntax & Camera Initial Position Memory
 */

let canvas, engine, scene, camera;
let activeMeshes = [];
let currentOpacity = 0.35;
let visibilityState = {};

// Initial Camera Memory State
let initialTarget = new BABYLON.Vector3(0, 0, 0);
let initialRadius = 25;
let initialAlpha = -Math.PI / 3;
let initialBeta = Math.PI / 2.5;

// Flag to track whether the user manually locked the initial position
let userHasCustomInit = false;

const ELEMENT_PRESETS = {
    C:  { Z: 6,  elec: [2, 4], nVal: [1, 2], lVal: [0, 1], En: [-284.2, -15.4] },
    Fe: { Z: 26, elec: [2, 8, 8, 6, 2], nVal: [1, 2, 3, 3, 4], lVal: [0, 1, 1, 2, 0], En: [-7112.0, -846.1, -100.7, -56.8, -7.9] },
    Mo: { Z: 42, elec: [2, 8, 8, 10, 8, 5, 1], nVal: [1, 2, 3, 3, 4, 4, 5], lVal: [0, 1, 1, 2, 1, 2, 0], En: [-23658.82, -4872.96, -1429.45, -657.19, -201.81, -21.03, -7.4] }
};

let activeData = JSON.parse(JSON.stringify(ELEMENT_PRESETS.Mo));

window.addEventListener('DOMContentLoaded', () => {
    initBabylonEngine();
    loadPreset('Mo');
});

/**
 * Slater's Effective Principal Quantum Number (Supports n up to 12 dynamically)
 */
const getNEffSlater = (n) => {
    const slaterMap = [1.0, 2.0, 3.0, 3.7, 4.0, 4.2];
    if (n >= 1 && n <= 6) return slaterMap[n - 1];
    return parseFloat((4.2 + (n - 6) * 0.4).toFixed(1));
};

/**
 * Parses coordinate input supporting Minecraft-style relative `~` positioning
 */
function parseCoordinate(inputVal, currentVal) {
    if (!inputVal) return currentVal;
    let str = inputVal.trim().replace(/，/g, ',');
    if (str.startsWith('~')) {
        const offsetStr = str.slice(1);
        if (offsetStr === '' || offsetStr === '+') return currentVal;
        const offset = parseFloat(offsetStr);
        return isNaN(offset) ? currentVal : currentVal + offset;
    } else {
        const val = parseFloat(str);
        return isNaN(val) ? currentVal : val;
    }
}

/**
 * GOTO command: Teleport camera target instantly
 */
function teleportCamera() {
    if (!camera) return;
    if (document.activeElement) document.activeElement.blur();

    const currentTarget = camera.target;
    const inputX = document.getElementById('tpX').value;
    const inputY = document.getElementById('tpY').value;
    const inputZ = document.getElementById('tpZ').value;

    const newX = parseCoordinate(inputX, currentTarget.x);
    const newY = parseCoordinate(inputY, currentTarget.y);
    const newZ = parseCoordinate(inputZ, currentTarget.z);

    camera.setTarget(new BABYLON.Vector3(newX, newY, newZ));
    clearTpInputs();
}

/**
 * Manually set and lock the initial camera coordinates and viewing distance
 */
function setInitialPosition() {
    if (!camera) return;
    if (document.activeElement) document.activeElement.blur();

    const currentTarget = camera.target;
    const inputX = document.getElementById('tpX').value;
    const inputY = document.getElementById('tpY').value;
    const inputZ = document.getElementById('tpZ').value;

    const newX = parseCoordinate(inputX, currentTarget.x);
    const newY = parseCoordinate(inputY, currentTarget.y);
    const newZ = parseCoordinate(inputZ, currentTarget.z);

    initialTarget = new BABYLON.Vector3(newX, newY, newZ);
    initialRadius = camera.radius;
    initialAlpha = camera.alpha;
    initialBeta = camera.beta;

    // Lock custom state to prevent overwriting when switching elements
    userHasCustomInit = true;

    updateInitDisplay();
    clearTpInputs();
}

/**
 * Resets camera back to initial position and framing
 */
function reloadInitialPosition() {
    if (!camera) return;
    if (document.activeElement) document.activeElement.blur();

    camera.setTarget(initialTarget.clone());
    camera.radius = initialRadius;
    camera.alpha = initialAlpha;
    camera.beta = initialBeta;
}

function clearTpInputs() {
    document.getElementById('tpX').value = '';
    document.getElementById('tpY').value = '';
    document.getElementById('tpZ').value = '';
}

function updateInitDisplay() {
    const display = document.getElementById('initCoordsDisplay');
    if (display && initialTarget) {
        const statusText = userHasCustomInit ? " [LOCKED]" : " [AUTO]";
        display.innerText = `INIT: X:${initialTarget.x.toFixed(1)}|Y:${initialTarget.y.toFixed(1)}|Z:${initialTarget.z.toFixed(1)} R:${initialRadius.toFixed(1)}${statusText}`;
    }
}

/**
 * Left Panel Collapse Toggle
 */
function togglePanel(collapse) {
    const panel = document.getElementById('uiOverlay');
    const restoreBtn = document.getElementById('restoreBtn');
    if (collapse) {
        panel.classList.add('collapsed');
        setTimeout(() => { restoreBtn.style.display = 'flex'; }, 200);
    } else {
        panel.classList.remove('collapsed');
        restoreBtn.style.display = 'none';
    }
    setTimeout(() => { if (engine) engine.resize(); }, 300);
}

/**
 * Top-Right Panel Collapse Toggle
 */
function toggleTpPanel(collapse) {
    const panel = document.getElementById('tpOverlay');
    const restoreBtn = document.getElementById('tpRestoreBtn');
    if (collapse) {
        panel.classList.add('collapsed');
        setTimeout(() => { restoreBtn.style.display = 'flex'; }, 200);
    } else {
        panel.classList.remove('collapsed');
        restoreBtn.style.display = 'none';
    }
    setTimeout(() => { if (engine) engine.resize(); }, 300);
}

function parseArrayInput(str) {
    if (!str) return [];
    return str.replace(/，/g, ',').replace(/\s+/g, '').split(',').map(v => parseFloat(v)).filter(v => !isNaN(v));
}

function getOrbitalColor(l) {
    const baseHues = [0, 210, 42, 270];
    let hue = (l < baseHues.length) ? baseHues[l] : (l * 137.508) % 360;
    return BABYLON.Color3.FromHSV(hue, 0.65, 0.85);
}

function getOrbitalSymbol(l) {
    const symbols = ['s', 'p', 'd', 'f', 'g', 'h', 'i', 'k'];
    return symbols[l] || `l=${l}`;
}

function initBabylonEngine() {
    canvas = document.getElementById("renderCanvas");
    engine = new BABYLON.Engine(canvas, true, { preserveDrawingBuffer: true, stencil: true });
    
    scene = new BABYLON.Scene(engine);
    scene.clearColor = new BABYLON.Color4(0.02, 0.03, 0.04, 1.0);

    camera = new BABYLON.ArcRotateCamera("Camera", initialAlpha, initialBeta, initialRadius, initialTarget.clone(), scene);
    camera.attachControl(canvas, true);
    camera.lowerRadiusLimit = 0.01;
    camera.upperRadiusLimit = 10000;
    camera.wheelPrecision = 15;
    camera.minZ = 0.001;
    camera.maxZ = 20000;

    const hemiLight = new BABYLON.HemisphericLight("hemiLight", new BABYLON.Vector3(1, 1, 0), scene);
    hemiLight.intensity = 0.8;

    const pointLight = new BABYLON.PointLight("pointLight", new BABYLON.Vector3(0, 10, 0), scene);
    pointLight.intensity = 0.5;

    scene.registerBeforeRender(() => {
        if (camera && camera.target) {
            const display = document.getElementById('cameraCoordsDisplay');
            if (display) {
                display.innerText = `CUR: X: ${camera.target.x.toFixed(2)} | Y: ${camera.target.y.toFixed(2)} | Z: ${camera.target.z.toFixed(2)}`;
            }
        }
    });

    engine.runRenderLoop(() => { scene.render(); });
    window.addEventListener("resize", () => engine.resize());
}

function computeStandardBindingEnergies(Z, elec, nVal, lVal) {
    const R_inf = 13.6057;
    const num = elec.length;
    let EnArr = [];

    for (let k = 0; k < num; k++) {
        let same = (nVal[k] === 1 && lVal[k] === 0) ? 0.30 * (elec[k] - 1) : 0.35 * (elec[k] - 1);
        let inner = 0;

        if (lVal[k] >= 2) {
            let j = 0;
            while (j < k) { inner += elec[j]; j++; }
        } else {
            let elecN1 = 0, elecInnerAll = 0;
            for (let j = 0; j < num; j++) {
                if (nVal[j] === nVal[k] - 1) elecN1 += elec[j];
                else if (nVal[j] < nVal[k] - 1) elecInnerAll += elec[j];
            }
            inner = 0.85 * elecN1 + 1.00 * elecInnerAll;
        }

        let S = same + inner;
        let zEff = Math.max(0.1, Z - S);
        let nStar = getNEffSlater(nVal[k]);

        let energy = -R_inf * Math.pow(zEff / nStar, 2);
        EnArr.push(parseFloat(energy.toFixed(2)));
    }

    return EnArr;
}

function refreshDynamicFilterUI() {
    const container = document.getElementById('dynamicFilterContainer');
    container.innerHTML = '';

    const uniqueL = [...new Set(activeData.lVal)].sort((a, b) => a - b);

    uniqueL.forEach(l => {
        if (visibilityState[l] === undefined) {
            visibilityState[l] = true;
        }

        const babylonCol = getOrbitalColor(l);
        const hexColor = babylonCol.toHexString();
        const symbol = getOrbitalSymbol(l);

        const item = document.createElement('label');
        item.className = 'filter-item';
        item.innerHTML = `
            <span><span class="dot" style="background:${hexColor};"></span>${symbol.toUpperCase()} Orbital (l=${l})</span>
            <input type="checkbox" ${visibilityState[l] ? 'checked' : ''} onchange="toggleOrbitalVisibility(${l}, this.checked)">
        `;
        container.appendChild(item);
    });
}

function autoCalculateEnUI() {
    const Z = parseInt(document.getElementById('inputZ').value);
    const elec = parseArrayInput(document.getElementById('inputElec').value);
    const nVal = parseArrayInput(document.getElementById('inputN').value);
    const lVal = parseArrayInput(document.getElementById('inputL').value);

    if (!Z || elec.length === 0 || nVal.length === 0 || lVal.length === 0) {
        alert('Please enter valid numerical parameters for Z, elec, n, and l.');
        return;
    }

    const computedEn = computeStandardBindingEnergies(Z, elec, nVal, lVal);
    document.getElementById('inputEn').value = computedEn.join(', ');
}

function loadPreset(symbol) {
    if (ELEMENT_PRESETS[symbol]) {
        activeData = JSON.parse(JSON.stringify(ELEMENT_PRESETS[symbol]));
        document.getElementById('inputZ').value = activeData.Z;
        document.getElementById('inputElec').value = activeData.elec.join(', ');
        document.getElementById('inputN').value = activeData.nVal.join(', ');
        document.getElementById('inputL').value = activeData.lVal.join(', ');
        document.getElementById('inputEn').value = activeData.En.join(', ');
        rebuildQuantumModel();
    }
}

function applyCustomParameters() {
    if (document.activeElement) {
        document.activeElement.blur();
    }

    const Z = parseInt(document.getElementById('inputZ').value);
    const elec = parseArrayInput(document.getElementById('inputElec').value);
    const nVal = parseArrayInput(document.getElementById('inputN').value);
    const lVal = parseArrayInput(document.getElementById('inputL').value);

    let enText = document.getElementById('inputEn').value.trim();
    let En = parseArrayInput(enText);

    if (En.length === 0) {
        En = computeStandardBindingEnergies(Z, elec, nVal, lVal);
        document.getElementById('inputEn').value = En.join(', ');
    }

    const expectedLen = elec.length;
    if (!Z || expectedLen === 0 || nVal.length !== expectedLen || lVal.length !== expectedLen || En.length !== expectedLen) {
        alert('Input length mismatch. Ensure all parameter arrays have equal lengths.');
        return;
    }

    activeData = { Z, elec, nVal, lVal, En };
    rebuildQuantumModel();
}

function updateOpacity(val) {
    currentOpacity = parseFloat(val);
    document.getElementById('opacityVal').innerText = Math.round(currentOpacity * 100) + '%';
    
    activeMeshes.forEach(item => {
        if (item.mesh && item.mesh.material) {
            item.mesh.material.alpha = currentOpacity;
        }
    });
}

function toggleOrbitalVisibility(lType, isChecked) {
    visibilityState[lType] = isChecked;
    activeMeshes.forEach(item => {
        if (item.l === lType) {
            item.mesh.isVisible = isChecked;
        }
    });
}

function rebuildQuantumModel() {
    activeMeshes.forEach(item => {
        if (item.mesh.material) item.mesh.material.dispose();
        item.mesh.dispose();
    });
    activeMeshes = [];

    refreshDynamicFilterUI();

    const Z = activeData.Z;
    const elec = activeData.elec;
    const nVal = activeData.nVal;
    const lVal = activeData.lVal;
    const En = activeData.En;
    const num = elec.length;

    const alpha = 1 / 137.036;
    const R_inf = 13.6057;

    let maxRadius = 0;

    for (let k = 0; k < num; k++) {
        let same = (nVal[k] === 1 && lVal[k] === 0) ? 0.30 * (elec[k] - 1) : 0.35 * (elec[k] - 1);
        let inner = 0;

        if (lVal[k] >= 2) {
            let j = 0;
            while (j < k) { inner += elec[j]; j++; }
        } else {
            let elecN1 = 0, elecInnerAll = 0;
            for (let j = 0; j < num; j++) {
                if (nVal[j] === nVal[k] - 1) elecN1 += elec[j];
                else if (nVal[j] < nVal[k] - 1) elecInnerAll += elec[j];
            }
            inner = 0.85 * elecN1 + 1.00 * elecInnerAll;
        }

        let S = same + inner;
        let zEff = Math.max(0.1, Z - S);
        let absEn = Math.abs(En[k]) || 1.0;
        let nEff = Math.sqrt((R_inf * Math.pow(zEff, 2)) / absEn);
        let beta = (zEff * alpha) / nEff;

        let relFactor = (lVal[k] >= 2) ? (1 + 0.5 * Math.pow(beta, 2)) : Math.sqrt(Math.max(0.01, 1 - Math.pow(beta, 2)));
        let qmFactor = 1 + 0.5 * (1 - (lVal[k] * (lVal[k] + 1)) / Math.pow(nEff, 2));

        let rQM = (Math.pow(nEff, 2) / zEff * 0.529) * qmFactor * relFactor;

        if (rQM > maxRadius) maxRadius = rQM;

        const sphere = BABYLON.MeshBuilder.CreateSphere(`orb_${k}`, { diameter: rQM * 2, segments: 48 }, scene);
        const mat = new BABYLON.StandardMaterial(`mat_${k}`, scene);
        const col = getOrbitalColor(lVal[k]);

        mat.diffuseColor = col;
        mat.emissiveColor = col.scale(0.25);
        mat.alpha = currentOpacity;
        mat.backFaceCulling = false;

        mat.needDepthPrePass = true;
        mat.transparencyMode = BABYLON.Material.MATERIAL_ALPHABLEND;

        sphere.material = mat;
        sphere.isVisible = visibilityState[lVal[k]] !== false;

        activeMeshes.push({ mesh: sphere, l: lVal[k] });
    }

    // Only auto-adjust camera position if the user has NOT set a custom initial position
    if (!userHasCustomInit) {
        initialTarget = BABYLON.Vector3.Zero();
        if (maxRadius > 0) {
            initialRadius = maxRadius * 3.0;
        }
    }

    // Reload camera to the initial position (either locked or auto-calculated)
    reloadInitialPosition();
    updateInitDisplay();

    setTimeout(() => { if (engine) engine.resize(); }, 150);
}
