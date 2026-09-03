// kernel.js - core logic
/**
 * Babylon.js Infinite Quantum Engine Core
 * Dynamic Color Algorithm, Dynamic UI Filtering & Safari WebGL Viewport Fixes
 */

let canvas, engine, scene, camera;
let activeMeshes = [];
let currentOpacity = 0.35;
let visibilityState = {};

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
 * Toggle Side Control Panel Visibility
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

function parseArrayInput(str) {
    if (!str) return [];
    return str
        .replace(/，/g, ',')
        .replace(/\s+/g, '')
        .split(',')
        .map(v => parseFloat(v))
        .filter(v => !isNaN(v));
}

/**
 * Infinite HSL Orbital Color Distribution Generator
 */
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

    camera = new BABYLON.ArcRotateCamera("Camera", -Math.PI / 3, Math.PI / 2.5, 25, BABYLON.Vector3.Zero(), scene);
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

    engine.runRenderLoop(() => { scene.render(); });
    window.addEventListener("resize", () => engine.resize());
}

function computeStandardBindingEnergies(Z, elec, nVal, lVal) {
    const R_inf = 13.6057;
    const num = elec.length;
    let EnArr = [];

    const getNEffSlater = (n) => {
        if (n === 1) return 1.0;
        if (n === 2) return 2.0;
        if (n === 3) return 3.0;
        if (n === 4) return 3.7;
        if (n === 5) return 4.0;
        if (n === 6) return 4.2;
        return n;
    };

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

/**
 * Regenerates filter UI options dynamically matching present l-quantum numbers
 */
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

        // Safari Depth Pass & Alpha Blend Override
        mat.needDepthPrePass = true;
        mat.transparencyMode = BABYLON.Material.MATERIAL_ALPHABLEND;

        sphere.material = mat;
        sphere.isVisible = visibilityState[lVal[k]] !== false;

        activeMeshes.push({ mesh: sphere, l: lVal[k] });
    }

    // Auto-frame view camera radius dynamically
    camera.setTarget(BABYLON.Vector3.Zero());
    if (maxRadius > 0) {
        camera.radius = maxRadius * 3.0;
    }

    setTimeout(() => { if (engine) engine.resize(); }, 150);
}
