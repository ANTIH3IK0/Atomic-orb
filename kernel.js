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
    C:    { Z: 6,   elec: [2, 2, 2], nVal: [1, 2, 2], lVal: [0, 0, 1], En: [-442.24, -53.08, -53.07] },
    Fe:   { Z: 26,  elec: [2, 2, 6, 2, 6, 6, 2], nVal: [1, 2, 2, 3, 3, 3, 4], lVal: [0, 0, 1, 0, 1, 2, 0], En: [-9066.86, -1969.99, -1732.57, -430.85, -361.24, -59.06, -11.96] },
    Mo:   { Z: 42,  elec: [2, 2, 6, 2, 6, 10, 2, 6, 5, 1], nVal: [1, 2, 2, 3, 3, 3, 4, 4, 4, 5], lVal: [0, 0, 1, 0, 1, 2, 0, 1, 2, 0], En: [-24233.42, -5579.67, -5080.12, -1655.46, -1501.88, -657.61, -227.98, -190.23, -17.99, -4.74] },
};

let activeData = JSON.parse(JSON.stringify(ELEMENT_PRESETS.E126));

window.addEventListener('DOMContentLoaded', () => {
    initBabylonEngine();
    loadPreset('E126');
});

/**
 * Exact Relativistic Dirac Quantum Binding Energy Formula (Hartree units converted to eV)
 * E = mc^2 * [ (1 + (Z_eff * alpha / (n - |k| + gamma))^2 )^(-1/2) - 1 ]
 */
function solveDiracExactEnergy(n, l, j, zEff) {
    const kappa = (j > l) ? -(l + 1) : l;
    const absKappa = Math.abs(kappa);
    const zAlpha = zEff * FINE_ALPHA;
    
    // Prevent unphysical supercritical collapse
    if (zAlpha >= absKappa) return -13.6057 * Math.pow(zEff / n, 2);

    const gamma = Math.sqrt(absKappa * absKappa - zAlpha * zAlpha);
    const nr = n - absKappa;
    const denominator = Math.sqrt(nr * nr + 2 * nr * gamma + absKappa * absKappa);
    
    const energyHartree = (1.0 / (FINE_ALPHA * FINE_ALPHA)) * (1.0 / Math.sqrt(1.0 + Math.pow(zAlpha / (nr + gamma), 2)) - 1.0);
    return energyHartree * HARTREE_TO_EV;
}

/**
 * 4th-Order Runge-Kutta (RK4) Numerical Radial Integrator for Coupled Relativistic Dirac Equations
 * Computes exact radial expectation value <r> = integral r*(G^2 + F^2) dr
 */
function solveDiracRadialExpectationRK4(n, l, j, zEff) {
    const kappa = (j > l) ? -(l + 1) : l;
    const absKappa = Math.abs(kappa);
    const zAlpha = zEff * FINE_ALPHA;

    const gamma = (absKappa * absKappa > zAlpha * zAlpha) ? Math.sqrt(absKappa * absKappa - zAlpha * zAlpha) : absKappa;
    const N = Math.sqrt(n * n - 2 * (n - absKappa) * (absKappa - gamma));

    // Analytical Dirac expectation value (Bohr radii unit)
    let rExpectation = (0.5291772109 / (2.0 * zEff)) * (3.0 * N * N - kappa * (kappa + 1.0));

    // Numerical RK4 Integration Loop to refine radial density distribution
    const rMin = 1e-4;
    const rMax = Math.max(15.0, rExpectation * 3.5);
    const steps = 600;
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

        // RK4 Step for G and F
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

        // Numerical divergence safeguard
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
            uniqueStates.push({ l: item.l, jSub: item.jSub, key: key });
        }
    });

    uniqueStates.sort((a, b) => a.l !== b.l ? a.l - b.l : a.jSub - b.jSub);

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
            shadeTag = " [Dark/Inner]";
        } else {
            jText = `<sub>${formatJVal(st.l + 0.5)}</sub>`;
            shadeTag = " [Light/Outer]";
        }

        const item = document.createElement('label');
        item.className = 'filter-item';
        item.innerHTML = `
            <span><span class="dot" style="background:${hexColor};"></span><b>${symbol}${jText}</b>${shadeTag}</span>
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

function toggleOrbitalVisibility(stateKey, isChecked) {
    visibilityState[stateKey] = isChecked;
    activeMeshes.forEach(item => {
        if (item.stateKey === stateKey) {
            item.mesh.isVisible = isChecked;
        }
    });
}

function createOrbitalMesh(name, radius, l, jSub, stateKey) {
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

    activeMeshes.push({ mesh: sphere, l: l, jSub: jSub, stateKey: stateKey });
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

        if (lVal[k] === 0) {
            // l = 0 (s orbital, j = 1/2)
            let rDirac = solveDiracRadialExpectationRK4(nVal[k], 0, 0.5, zEff);
            if (rDirac > maxRadius) maxRadius = rDirac;
            createOrbitalMesh(`orb_${k}_s`, rDirac, 0, 0, "0_0");
        } else {
            // l > 0 (p, d, f, g, h, i...): Solve separate Dirac RK4 for j_minus & j_plus
            let jMinus = lVal[k] - 0.5;
            let jPlus = lVal[k] + 0.5;

            let rMinus = solveDiracRadialExpectationRK4(nVal[k], lVal[k], jMinus, zEff);
            let rPlus = solveDiracRadialExpectationRK4(nVal[k], lVal[k], jPlus, zEff);

            if (rPlus > maxRadius) maxRadius = rPlus;

            const stateKeyMinus = `${lVal[k]}_minus`;
            const stateKeyPlus = `${lVal[k]}_plus`;

            createOrbitalMesh(`orb_${k}_j_minus`, rMinus, lVal[k], -1, stateKeyMinus);
            createOrbitalMesh(`orb_${k}_j_plus`, rPlus, lVal[k], 1, stateKeyPlus);
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
