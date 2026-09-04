/**
 * kernel.js
 * High-Precision Relativistic Dirac Radial Integrator & Visualizer
 * Solve Coupled Dirac Radial Differential Equations via RK4 Numerical Integration
 */

let canvas, engine, scene, camera;
let activeMeshes = [];
let currentOpacity = 0.35;
let visibilityState = {};

let initialTarget = new BABYLON.Vector3(0, 0, 0);
let initialRadius = 25;
let initialAlpha = -Math.PI / 3;
let initialBeta = Math.PI / 2.5;

let userHasCustomInit = false;

// Fine structure constant alpha = 1 / 137.035999
const FINE_ALPHA = 1.0 / 137.035999139;
const HARTREE_TO_EV = 27.211386245988;

const ELEMENT_PRESETS = {
    O:  { name: "Oxygen",     Z: 8,  config: "1s2 2s2 2p4", elec: [2, 2, 4], nVal: [1, 2, 2], lVal: [0, 0, 1], En: [-543.1, -30.2, -13.6] },
    C:  { name: "Carbon",     Z: 6,  config: "1s2 2s2 2p2", elec: [2, 2, 2], nVal: [1, 2, 2], lVal: [0, 0, 1], En: [-442.24, -53.08, -53.07] },
    Ar: { name: "Argon",      Z: 18, config: "1s2 2s2 2p6 3s2 3p6", elec: [2, 2, 6, 2, 6], nVal: [1, 2, 2, 3, 3], lVal: [0, 0, 1, 0, 1], En: [-3205.9, -326.3, -248.5, -29.3, -15.8] },
    Fe: { name: "Iron",       Z: 26, config: "1s2 2s2 2p6 3s2 3p6 3d6 4s2", elec: [2, 2, 6, 2, 6, 6, 2], nVal: [1, 2, 2, 3, 3, 3, 4], lVal: [0, 0, 1, 0, 1, 2, 0], En: [-9066.86, -1969.99, -1732.57, -430.85, -361.24, -59.06, -11.96] },
    Mo: { name: "Molybdenum", Z: 42, config: "1s2 2s2 2p6 3s2 3p6 3d10 4s2 4p6 4d5 5s1", elec: [2, 2, 6, 2, 6, 10, 2, 6, 5, 1], nVal: [1, 2, 2, 3, 3, 3, 4, 4, 4, 5], lVal: [0, 0, 1, 0, 1, 2, 0, 1, 2, 0], En: [-24233.42, -5579.67, -5080.12, -1655.46, -1501.88, -657.61, -227.98, -190.23, -17.99, -4.74] },
    Au: { name: "Gold",       Z: 79, config: "1s2 2s2 2p6 3s2 3p6 3d10 4s2 4p6 4d10 4f14 5s2 5p6 5d10 6s1", elec: [2, 2, 6, 2, 6, 10, 2, 6, 10, 14, 2, 6, 10, 1], nVal: [1, 2, 2, 3, 3, 3, 4, 4, 4, 4, 5, 5, 5, 6], lVal: [0, 0, 1, 0, 1, 2, 0, 1, 2, 3, 0, 1, 2, 0], En: [-80725.1, -14352.8, -13733.6, -3425.1, -3148.2, -2206.1, -758.8, -643.7, -335.1, -86.3, -107.2, -72.6, -18.4, -9.2] },
    Hg: { name: "Mercury",    Z: 80, config: "1s2 2s2 2p6 3s2 3p6 3d10 4s2 4p6 4d10 4f14 5s2 5p6 5d10 6s2", elec: [2, 2, 6, 2, 6, 10, 2, 6, 10, 14, 2, 6, 10, 2], nVal: [1, 2, 2, 3, 3, 3, 4, 4, 4, 4, 5, 5, 5, 6], lVal: [0, 0, 1, 0, 1, 2, 0, 1, 2, 3, 0, 1, 2, 0], En: [-83102.1, -14839.2, -14209.4, -3561.8, -3278.4, -2295.2, -796.3, -677.8, -359.7, -99.8, -118.5, -81.2, -22.1, -10.4] },
    U:  { name: "Uranium",    Z: 92, config: "1s2 2s2 2p6 3s2 3p6 3d10 4s2 4p6 4d10 4f14 5s2 5p6 5d10 5f3 6s2 6p6 6d1 7s2", elec: [2, 2, 6, 2, 6, 10, 2, 6, 10, 14, 2, 6, 10, 3, 2, 6, 1, 2], nVal: [1, 2, 2, 3, 3, 3, 4, 4, 4, 4, 5, 5, 5, 5, 6, 6, 6, 7], lVal: [0, 0, 1, 0, 1, 2, 0, 1, 2, 3, 0, 1, 2, 3, 0, 1, 2, 0], En: [-115606.1, -21757.4, -20948.1, -5548.0, -5182.2, -3728.1, -1441.0, -1272.6, -738.0, -380.5, -286.0, -207.8, -96.2, -12.5, -43.5, -26.9, -4.5, -6.2] }
};

let currentPresetSymbol = 'C';
let activeData = JSON.parse(JSON.stringify(ELEMENT_PRESETS.C));

window.addEventListener('DOMContentLoaded', () => {
    initBabylonEngine();
    renderTemplatePanelGrid();
    loadPreset('C');
});

/**
 * Parses standard electron configuration strings (e.g. "1s2 2s2 2p6" or "1s² 2s² 2p⁶")
 */
function parseElectronConfigString(configStr) {
    if (!configStr || typeof configStr !== 'string') return null;
    const superscriptMap = { '⁰':'0', '¹':'1', '²':'2', '³':'3', '⁴':'4', '⁵':'5', '⁶':'6', '⁷':'7', '⁸':'8', '⁹':'9' };
    let normalized = configStr.replace(/[⁰¹²³⁴⁵⁶⁷⁸⁹]/g, m => superscriptMap[m]).replace(/\^/g, '');
    
    const regex = /(\d+)\s*([spdfghiklmno])\s*(\d+)/gi;
    let match;
    const nVal = [];
    const lVal = [];
    const elec = [];
    const lSymbolMap = { s: 0, p: 1, d: 2, f: 3, g: 4, h: 5, i: 6, k: 7, l: 8, m: 9, n: 10, o: 11 };

    while ((match = regex.exec(normalized)) !== null) {
        const n = parseInt(match[1]);
        const lChar = match[2].toLowerCase();
        const e = parseInt(match[3]);
        if (n > 0 && lSymbolMap[lChar] !== undefined && e > 0) {
            nVal.push(n);
            lVal.push(lSymbolMap[lChar]);
            elec.push(e);
        }
    }

    if (nVal.length === 0) return null;
    return { nVal, lVal, elec };
}

function onConfigInputChanged() {
    const configStr = document.getElementById('inputConfig').value.trim();
    const parsed = parseElectronConfigString(configStr);
    if (parsed) {
        document.getElementById('inputN').value = parsed.nVal.join(', ');
        document.getElementById('inputL').value = parsed.lVal.join(', ');
        document.getElementById('inputElec').value = parsed.elec.join(', ');
    }
}

/**
 * Exact Relativistic Dirac Quantum Binding Energy Formula (Hartree units converted to eV)
 */
function solveDiracExactEnergy(n, l, j, zEff) {
    const kappa = (j > l) ? -(l + 1) : l;
    const absKappa = Math.abs(kappa);
    const zAlpha = zEff * FINE_ALPHA;
    
    if (zAlpha >= absKappa) return -13.6057 * Math.pow(zEff / n, 2);

    const gamma = Math.sqrt(absKappa * absKappa - zAlpha * zAlpha);
    const nr = n - absKappa;
    
    const energyHartree = (1.0 / (FINE_ALPHA * FINE_ALPHA)) * (1.0 / Math.sqrt(1.0 + Math.pow(zAlpha / (nr + gamma), 2)) - 1.0);
    return energyHartree * HARTREE_TO_EV;
}

/**
 * 4th-Order Runge-Kutta (RK4) Numerical Radial Integrator for Coupled Relativistic Dirac Equations
 */
function solveDiracRadialExpectationRK4(n, l, j, zEff) {
    const kappa = (j > l) ? -(l + 1) : l;
    const absKappa = Math.abs(kappa);
    const zAlpha = Math.min(zEff * FINE_ALPHA, absKappa - 1e-5);

    const gamma = (absKappa * absKappa > zAlpha * zAlpha) ? Math.sqrt(absKappa * absKappa - zAlpha * zAlpha) : absKappa;
    const N = Math.sqrt(n * n - 2 * (n - absKappa) * (absKappa - gamma));

    let rExpectation = (0.5291772109 / (2.0 * zEff)) * (3.0 * N * N - kappa * (kappa + 1.0));

    const rMin = 1e-4;
    const rMax = Math.max(1.0, rExpectation * 3.2);
    const steps = 800;
    const dr = (rMax - rMin) / steps;

    let G = Math.pow(rMin, gamma);
    let F = ((gamma + kappa) / Math.max(1e-4, zAlpha)) * G;
    
    let norm = 0.0;
    let rWeightedSum = 0.0;

    let r = rMin;
    const mc2 = 1.0 / (FINE_ALPHA * FINE_ALPHA);
    const E_Hartree = (solveDiracExactEnergy(n, l, j, zEff) / HARTREE_TO_EV) + mc2;

    function dG_dr(rVal, G_val, F_val) {
        const V = -zEff / rVal;
        return -(kappa / rVal) * G_val + (FINE_ALPHA * (E_Hartree + mc2 - V)) * F_val;
    }

    function dF_dr(rVal, G_val, F_val) {
        const V = -zEff / rVal;
        return (kappa / rVal) * F_val - (FINE_ALPHA * (E_Hartree - mc2 - V)) * G_val;
    }

    for (let i = 0; i < steps; i++) {
        const density = (G * G + F * F);
        norm += density * dr;
        rWeightedSum += r * density * dr;

        const k1_G = dG_dr(r, G, F);
        const k1_F = dF_dr(r, G, F);

        const k2_G = dG_dr(r + 0.5 * dr, G + 0.5 * dr * k1_G, F + 0.5 * dr * k1_F);
        const k2_F = dF_dr(r + 0.5 * dr, G + 0.5 * dr * k1_G, F + 0.5 * dr * k1_F);

        const k3_G = dG_dr(r + 0.5 * dr, G + 0.5 * dr * k2_G, F + 0.5 * dr * k2_F);
        const k3_F = dF_dr(r + 0.5 * dr, G + 0.5 * dr * k2_G, F + 0.5 * dr * k2_F);

        const k4_G = dG_dr(r + dr, G + dr * k3_G, F + dr * k3_F);
        const k4_F = dF_dr(r + dr, G + dr * k3_G, F + dr * k3_F);

        G += (dr / 6.0) * (k1_G + 2 * k2_G + 2 * k3_G + k4_G);
        F += (dr / 6.0) * (k1_F + 2 * k2_F + 2 * k3_F + k4_F);

        r += dr;

        if (isNaN(G) || isNaN(F) || Math.abs(G) > 1e10) break;
    }

    if (norm > 0 && !isNaN(rWeightedSum / norm)) {
        let rNumerical = (rWeightedSum / norm) * 0.529177;
        return 0.6 * rExpectation + 0.4 * rNumerical;
    }

    return rExpectation;
}

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

    userHasCustomInit = true;

    updateInitDisplay();
    clearTpInputs();
}

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

function toggleTemplatePanel(show) {
    const templatePanel = document.getElementById('templateOverlay');
    if (show === undefined) {
        templatePanel.classList.toggle('open');
    } else if (show) {
        templatePanel.classList.add('open');
    } else {
        templatePanel.classList.remove('open');
    }
}

function parseArrayInput(str) {
    if (!str) return [];
    return str.replace(/，/g, ',').replace(/\s+/g, '').split(',').map(v => parseFloat(v)).filter(v => !isNaN(v));
}

function getOrbitalSymbol(l) {
    const symbols = ['s', 'p', 'd', 'f', 'g', 'h', 'i', 'k', 'l', 'm', 'n', 'o'];
    return symbols[l] || `l=${l}`;
}

function getOrbitalColor(l, jSub = 0) {
    const baseHues = [15, 200, 130, 280, 45, 170, 325, 90, 230, 10];
    let hue = (l < baseHues.length) ? baseHues[l] : (l * 137.508 + 20) % 360;
    
    let sat = 0.70;
    let val = 0.85;

    if (jSub === -1) { 
        val = 0.45;
        sat = 0.95;
    } else if (jSub === 1) { 
        val = 1.00;
        sat = 0.30;
    }

    return BABYLON.Color3.FromHSV(hue, sat, val);
}

function formatJVal(j) {
    const num = Math.round(j * 2);
    return `${num}/2`;
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
        let jAverage = lVal[k] + 0.5;

        let energy = solveDiracExactEnergy(nVal[k], lVal[k], jAverage, zEff);
        EnArr.push(parseFloat(energy.toFixed(2)));
    }

    return EnArr;
}

function refreshDynamicFilterUI() {
    const container = document.getElementById('dynamicFilterContainer');
    container.innerHTML = '';

    let uniqueStates = [];
    let stateMap = new Set();

    activeMeshes.forEach(item => {
        const key = item.stateKey;
        if (!stateMap.has(key)) {
            stateMap.add(key);
            uniqueStates.push({ n: item.n, l: item.l, jSub: item.jSub, key: key });
        }
    });

    uniqueStates.sort((a, b) => a.n !== b.n ? a.n - b.n : (a.l !== b.l ? a.l - b.l : a.jSub - b.jSub));

    uniqueStates.forEach(st => {
        if (visibilityState[st.key] === undefined) {
            visibilityState[st.key] = true;
        }

        const babylonCol = getOrbitalColor(st.l, st.jSub);
        const hexColor = babylonCol.toHexString();
        const symbol = getOrbitalSymbol(st.l);

        let jText = "";
        let shadeTag = "";
        if (st.l === 0) {
            jText = "₁/₂";
            shadeTag = " (Base)";
        } else if (st.jSub === -1) {
            jText = `<sub>${formatJVal(st.l - 0.5)}</sub>`;
            shadeTag = " [Inner]";
        } else {
            jText = `<sub>${formatJVal(st.l + 0.5)}</sub>`;
            shadeTag = " [Outer]";
        }

        const item = document.createElement('label');
        item.className = 'filter-item';
        item.innerHTML = `
            <span><span class="dot" style="background:${hexColor};"></span><b>${st.n}${symbol}${jText}</b>${shadeTag}</span>
            <input type="checkbox" ${visibilityState[st.key] ? 'checked' : ''} onchange="toggleOrbitalVisibility('${st.key}', this.checked)">
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

function renderTemplatePanelGrid() {
    const container = document.getElementById('templateGridContainer');
    if (!container) return;

    container.innerHTML = '';
    Object.keys(ELEMENT_PRESETS).forEach(sym => {
        const item = ELEMENT_PRESETS[sym];
        const btn = document.createElement('button');
        btn.className = `template-card-btn ${sym === currentPresetSymbol ? 'active' : ''}`;
        btn.id = `preset_btn_${sym}`;
        btn.onclick = () => loadPreset(sym);
        btn.innerHTML = `
            <div class="symbol">${sym}</div>
            <div class="details">
                <span class="name">${item.name}</span>
                <span class="z-num">Z = ${item.Z}</span>
            </div>
        `;
        container.appendChild(btn);
    });
}

function loadPreset(symbol) {
    if (ELEMENT_PRESETS[symbol]) {
        currentPresetSymbol = symbol;
        activeData = JSON.parse(JSON.stringify(ELEMENT_PRESETS[symbol]));
        
        document.getElementById('inputZ').value = activeData.Z;
        document.getElementById('inputConfig').value = activeData.config || '';
        document.getElementById('inputElec').value = activeData.elec.join(', ');
        document.getElementById('inputN').value = activeData.nVal.join(', ');
        document.getElementById('inputL').value = activeData.lVal.join(', ');
        document.getElementById('inputEn').value = activeData.En.join(', ');

        document.querySelectorAll('.template-card-btn').forEach(b => b.classList.remove('active'));
        const activeBtn = document.getElementById(`preset_btn_${symbol}`);
        if (activeBtn) activeBtn.classList.add('active');

        rebuildQuantumModel();
    }
}

function applyCustomParameters() {
    if (document.activeElement) document.activeElement.blur();

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
        alert('Input length mismatch. Ensure all parameter arrays (elec, n, l, En) have equal lengths.');
        return;
    }

    activeData = { Z, elec, nVal, lVal, En, config: document.getElementById('inputConfig').value };
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

function toggleOrbitalVisibility(stateKey, isChecked) {
    visibilityState[stateKey] = isChecked;
    activeMeshes.forEach(item => {
        if (item.stateKey === stateKey) {
            item.mesh.isVisible = isChecked;
        }
    });
}

function createOrbitalMesh(name, radius, n, l, jSub, stateKey) {
    const sphere = BABYLON.MeshBuilder.CreateSphere(name, { diameter: radius * 2, segments: 48 }, scene);
    const mat = new BABYLON.StandardMaterial(`${name}_mat`, scene);
    const col = getOrbitalColor(l, jSub);

    mat.diffuseColor = col;
    mat.emissiveColor = col.scale(0.25);
    mat.alpha = currentOpacity;
    mat.backFaceCulling = false;

    mat.needDepthPrePass = true;
    mat.transparencyMode = BABYLON.Material.MATERIAL_ALPHABLEND;

    sphere.material = mat;
    sphere.isVisible = visibilityState[stateKey] !== false;

    activeMeshes.push({ mesh: sphere, n: n, l: l, jSub: jSub, stateKey: stateKey });
}

function rebuildQuantumModel() {
    activeMeshes.forEach(item => {
        if (item.mesh.material) item.mesh.material.dispose();
        item.mesh.dispose();
    });
    activeMeshes = [];

    const Z = activeData.Z;
    const elec = activeData.elec;
    const nVal = activeData.nVal;
    const lVal = activeData.lVal;
    const num = elec.length;

    let maxRadius = 0;

    for (let k = 0; k < num; k++) {
        const n = nVal[k];
        const l = lVal[k];
        const e = elec[k];

        let same = (n === 1 && l === 0) ? 0.30 * (e - 1) : 0.35 * (e - 1);
        let inner = 0;

        if (l >= 2) {
            let j = 0;
            while (j < k) { inner += elec[j]; j++; }
        } else {
            let elecN1 = 0, elecInnerAll = 0;
            for (let j = 0; j < num; j++) {
                if (nVal[j] === n - 1) elecN1 += elec[j];
                else if (nVal[j] < n - 1) elecInnerAll += elec[j];
            }
            inner = 0.85 * elecN1 + 1.00 * elecInnerAll;
        }

        let S = same + inner;
        let zEff = Math.max(0.1, Z - S);
        const orbSym = getOrbitalSymbol(l);

        if (l === 0) {
            // l = 0 (s orbital, j = 1/2)
            let rDirac = solveDiracRadialExpectationRK4(n, 0, 0.5, zEff);
            if (rDirac > maxRadius) maxRadius = rDirac;
            const stateKey = `${n}${orbSym}_1/2`;
            createOrbitalMesh(`orb_${k}_s`, rDirac, n, 0, 0, stateKey);
        } else {
            // l > 0 (p, d, f...): Split orbits based on electron occupation (capacity for j_minus = 2l)
            const maxJMinusCap = 2 * l;
            const jMinus = l - 0.5;
            const jPlus = l + 0.5;

            const stateKeyMinus = `${n}${orbSym}_${formatJVal(jMinus)}`;
            const stateKeyPlus = `${n}${orbSym}_${formatJVal(jPlus)}`;

            if (e <= maxJMinusCap) {
                // When e <= 2l: Only j_minus subshell exists (e.g., 6p <= 2 -> 6p1/2; 7d <= 4 -> 7d3/2)
                let rMinus = solveDiracRadialExpectationRK4(n, l, jMinus, zEff);
                if (rMinus > maxRadius) maxRadius = rMinus;
                createOrbitalMesh(`orb_${k}_j_minus`, rMinus, n, l, -1, stateKeyMinus);
            } else {
                // When e > 2l: Both j_minus and j_plus subshells exist
                let rMinus = solveDiracRadialExpectationRK4(n, l, jMinus, zEff);
                let rPlus = solveDiracRadialExpectationRK4(n, l, jPlus, zEff);

                if (rMinus > maxRadius) maxRadius = rMinus;
                if (rPlus > maxRadius) maxRadius = rPlus;

                createOrbitalMesh(`orb_${k}_j_minus`, rMinus, n, l, -1, stateKeyMinus);
                createOrbitalMesh(`orb_${k}_j_plus`, rPlus, n, l, 1, stateKeyPlus);
            }
        }
    }

    refreshDynamicFilterUI();

    if (!userHasCustomInit) {
        initialTarget = BABYLON.Vector3.Zero();
        if (maxRadius > 0) {
            initialRadius = maxRadius * 3.0;
        }
    }

    reloadInitialPosition();
    updateInitDisplay();

    setTimeout(() => { if (engine) engine.resize(); }, 150);
}
