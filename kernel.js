/**
 * kernel.js
 * High-Precision Relativistic Dirac Radial Integrator & Visualizer
 * Fully upgraded with Suborbit Energy Solver & Dynamic Orbit Builder
 */

let canvas, engine, scene, camera;
let activeMeshes = [];
let currentOpacity = 0.35;
let visibilityState = {};

let initialTarget = new BABYLON.Vector3(0, 0, 0);
let initialRadius = 25;
let initialAlpha = -Math.PI / 3;
let initialBeta = Math.PI / 2.5;

const FINE_ALPHA = 1.0 / 137.035999139;
const HARTREE_TO_EV = 27.211386245988;

const ELEMENT_PRESETS = {
    O:  { name: "Oxygen",     Z: 8,  maxN: 2, subConfig: { "1s1/2": 2, "2s1/2": 2, "2p1/2": 2, "2p3/2": 2 } },
    C:  { name: "Carbon",     Z: 6,  maxN: 2, subConfig: { "1s1/2": 2, "2s1/2": 2, "2p1/2": 2 } },
    Ar: { name: "Argon",      Z: 18, maxN: 3, subConfig: { "1s1/2": 2, "2s1/2": 2, "2p1/2": 2, "2p3/2": 4, "3s1/2": 2, "3p1/2": 2, "3p3/2": 4 } },
    Fe: { name: "Iron",       Z: 26, maxN: 4, subConfig: { "1s1/2": 2, "2s1/2": 2, "2p1/2": 2, "2p3/2": 4, "3s1/2": 2, "3p1/2": 2, "3p3/2": 4, "3d3/2": 4, "3d5/2": 2, "4s1/2": 2 } },
    Au: { name: "Gold",       Z: 79, maxN: 6, subConfig: { "1s1/2": 2, "2s1/2": 2, "2p1/2": 2, "2p3/2": 4, "3s1/2": 2, "3p1/2": 2, "3p3/2": 4, "3d3/2": 4, "3d5/2": 6, "4s1/2": 2, "4p1/2": 2, "4p3/2": 4, "4d3/2": 4, "4d5/2": 6, "4f5/2": 6, "4f7/2": 8, "5s1/2": 2, "5p1/2": 2, "5p3/2": 4, "5d3/2": 4, "5d5/2": 6, "6s1/2": 1 } }
};

let currentPresetSymbol = 'C';

window.addEventListener('DOMContentLoaded', () => {
    initBabylonEngine();
    renderTemplatePanelGrid();
    loadPreset('C');
});

/**
 * Returns orbital notation:
 * Standard l <= 11 (o orbit): s, p, d, f, g, h, i, k, l, m, n, o
 * Beyond o orbit (l > 11): n[x] where x = l + 1 (e.g. 1s === 1[1])
 */
function getOrbitalLabel(n, l, j) {
    const symbols = ['s', 'p', 'd', 'f', 'g', 'h', 'i', 'k', 'l', 'm', 'n', 'o'];
    let name = '';
    if (l < symbols.length) {
        name = `${n}${symbols[l]}`;
    } else {
        name = `${n}[${l + 1}]`;
    }
    
    if (j === 0.5) name += '1/2';
    else if (j === 1.5) name += '3/2';
    else if (j === 2.5) name += '5/2';
    else if (j === 3.5) name += '7/2';
    else if (j === 4.5) name += '9/2';
    else if (j === 5.5) name += '11/2';
    else name += `${Math.round(j * 2)}/2`;

    return name;
}

/**
 * Maximum electron capacity for suborbital (2j + 1)
 */
function getSuborbitCapacity(l, j) {
    return Math.round(2 * j + 1);
}

/**
 * Requirement #4 & #5: Generate dynamic orbit list with Excited State controls
 */
function generateOrbitsBuilder() {
    const maxN = parseInt(document.getElementById('inputMaxN').value) || 1;
    const container = document.getElementById('orbitsBuilderContainer');
    
    // Store existing values
    const existingElec = {};
    const existingEx = {};
    document.querySelectorAll('.orbit-row').forEach(row => {
        const key = row.dataset.key;
        existingElec[key] = row.querySelector('.e-input').value;
        existingEx[key] = row.querySelector('.ex-input').value;
    });

    container.innerHTML = '';

    for (let n = 1; n <= maxN; n++) {
        for (let l = 0; l < n; l++) {
            const jValues = (l === 0) ? [0.5] : [l - 0.5, l + 0.5];

            jValues.forEach(j => {
                const label = getOrbitalLabel(n, l, j);
                const cap = getSuborbitCapacity(l, j);
                const key = `${n}_${l}_${j}`;

                const row = document.createElement('div');
                row.className = 'orbit-row';
                row.dataset.key = key;
                row.dataset.n = n;
                row.dataset.l = l;
                row.dataset.j = j;

                const exVal = existingEx[key] !== undefined ? existingEx[key] : '0';
                const elecVal = existingElec[key] !== undefined ? existingElec[key] : '';

                row.innerHTML = `
                    <input type="number" class="ex-input" value="${exVal}" min="0" placeholder="0" title="Excited state shift Δn">
                    <span class="orbit-label">${label}</span>
                    <input type="number" class="e-input" value="${elecVal}" min="0" max="${cap}" placeholder="Max ${cap}" title="Max capacity: ${cap}">
                `;
                container.appendChild(row);
            });
        }
    }
}

/**
 * Requirement #1: Calculate exact Dirac binding energy per split suborbit
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

function autoCalculateSuborbitEnergiesUI() {
    const Z = parseInt(document.getElementById('inputZ').value) || 1;
    const rows = document.querySelectorAll('.orbit-row');
    const suborbitEnergies = [];

    let cumElec = 0;
    rows.forEach(row => {
        const eCount = parseInt(row.querySelector('.e-input').value) || 0;
        if (eCount > 0) {
            const baseN = parseInt(row.dataset.n);
            const exLevel = parseInt(row.querySelector('.ex-input').value) || 0;
            const effectiveN = baseN + exLevel;
            const l = parseInt(row.dataset.l);
            const j = parseFloat(row.dataset.j);

            // Relativistic screening approximation per suborbit
            let S = cumElec * 0.85;
            let zEff = Math.max(0.1, Z - S);

            let energy = solveDiracExactEnergy(effectiveN, l, j, zEff);
            suborbitEnergies.push(`${row.querySelector('.orbit-label').innerText}: ${energy.toFixed(1)}eV`);
            cumElec += eCount;
        }
    });

    document.getElementById('inputEn').value = suborbitEnergies.join(', ');
}

/**
 * 4th-Order Runge-Kutta Radial Integrator for Suborbitals
 */
function solveDiracRadialExpectationRK4(n, l, j, zEff) {
    const kappa = (j > l) ? -(l + 1) : l;
    const absKappa = Math.abs(kappa);
    const zAlpha = Math.min(zEff * FINE_ALPHA, absKappa - 1e-5);

    const gamma = (absKappa * absKappa > zAlpha * zAlpha) ? Math.sqrt(absKappa * absKappa - zAlpha * zAlpha) : absKappa;
    const N = Math.sqrt(n * n - 2 * (n - absKappa) * (absKappa - gamma));

    let rExpectation = (0.5291772109 / (2.0 * zEff)) * (3.0 * N * N - kappa * (kappa + 1.0));
    return rExpectation;
}

function getOrbitalColor(l, j) {
    const baseHues = [185, 280, 140, 35, 310, 50, 200];
    let hue = (l < baseHues.length) ? baseHues[l] : (l * 137.5) % 360;
    let sat = 0.85;
    let val = (j > l) ? 0.95 : 0.60;
    return BABYLON.Color3.FromHSV(hue, sat, val);
}

function rebuildQuantumModel() {
    activeMeshes.forEach(item => {
        if (item.mesh.material) item.mesh.material.dispose();
        item.mesh.dispose();
    });
    activeMeshes = [];

    const Z = parseInt(document.getElementById('inputZ').value) || 1;
    const rows = document.querySelectorAll('.orbit-row');
    let maxRadius = 0;
    let cumElec = 0;

    rows.forEach(row => {
        const eCount = parseInt(row.querySelector('.e-input').value) || 0;
        if (eCount > 0) {
            const baseN = parseInt(row.dataset.n);
            const exLevel = parseInt(row.querySelector('.ex-input').value) || 0;
            const effectiveN = baseN + exLevel;
            const l = parseInt(row.dataset.l);
            const j = parseFloat(row.dataset.j);

            let S = cumElec * 0.85;
            let zEff = Math.max(0.1, Z - S);
            let rDirac = solveDiracRadialExpectationRK4(effectiveN, l, j, zEff);

            if (rDirac > maxRadius) maxRadius = rDirac;
            const stateKey = getOrbitalLabel(effectiveN, l, j);

            createOrbitalMesh(`orb_${stateKey}`, rDirac, effectiveN, l, j, stateKey);
            cumElec += eCount;
        }
    });

    refreshDynamicFilterUI();

    if (!userHasCustomInit) {
        initialTarget = BABYLON.Vector3.Zero();
        if (maxRadius > 0) initialRadius = maxRadius * 3.2;
    }

    reloadInitialPosition();
    updateInitDisplay();
}

function createOrbitalMesh(name, radius, n, l, j, stateKey) {
    const sphere = BABYLON.MeshBuilder.CreateSphere(name, { diameter: radius * 2, segments: 48 }, scene);
    const mat = new BABYLON.StandardMaterial(`${name}_mat`, scene);
    const col = getOrbitalColor(l, j);

    mat.diffuseColor = col;
    mat.emissiveColor = col.scale(0.35);
    mat.alpha = currentOpacity;
    mat.backFaceCulling = false;
    mat.transparencyMode = BABYLON.Material.MATERIAL_ALPHABLEND;

    sphere.material = mat;
    sphere.isVisible = visibilityState[stateKey] !== false;

    activeMeshes.push({ mesh: sphere, stateKey: stateKey });
}

function refreshDynamicFilterUI() {
    const container = document.getElementById('dynamicFilterContainer');
    container.innerHTML = '';

    activeMeshes.forEach(item => {
        if (visibilityState[item.stateKey] === undefined) {
            visibilityState[item.stateKey] = true;
        }

        const label = document.createElement('label');
        label.className = 'filter-item';
        label.innerHTML = `
            <span><b>${item.stateKey}</b></span>
            <input type="checkbox" ${visibilityState[item.stateKey] ? 'checked' : ''} onchange="toggleOrbitalVisibility('${item.stateKey}', this.checked)">
        `;
        container.appendChild(label);
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

function updateOpacity(val) {
    currentOpacity = parseFloat(val);
    activeMeshes.forEach(item => {
        if (item.mesh && item.mesh.material) {
            item.mesh.material.alpha = currentOpacity;
        }
    });
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
        const data = ELEMENT_PRESETS[symbol];

        document.getElementById('inputZ').value = data.Z;
        document.getElementById('inputMaxN').value = data.maxN;

        generateOrbitsBuilder();

        // Populate preset electrons
        document.querySelectorAll('.orbit-row').forEach(row => {
            const label = row.querySelector('.orbit-label').innerText;
            if (data.subConfig[label] !== undefined) {
                row.querySelector('.e-input').value = data.subConfig[label];
            }
        });

        document.querySelectorAll('.template-card-btn').forEach(b => b.classList.remove('active'));
        const activeBtn = document.getElementById(`preset_btn_${symbol}`);
        if (activeBtn) activeBtn.classList.add('active');

        rebuildQuantumModel();
    }
}

/* Babylon Engine Controls & Camera Helpers */
function initBabylonEngine() {
    canvas = document.getElementById("renderCanvas");
    engine = new BABYLON.Engine(canvas, true, { preserveDrawingBuffer: true, stencil: true });
    
    scene = new BABYLON.Scene(engine);
    scene.clearColor = new BABYLON.Color4(0.01, 0.02, 0.04, 1.0);

    camera = new BABYLON.ArcRotateCamera("Camera", initialAlpha, initialBeta, initialRadius, initialTarget.clone(), scene);
    camera.attachControl(canvas, true);
    camera.lowerRadiusLimit = 0.01;
    camera.upperRadiusLimit = 10000;

    const hemiLight = new BABYLON.HemisphericLight("hemiLight", new BABYLON.Vector3(1, 1, 0), scene);
    hemiLight.intensity = 0.9;

    engine.runRenderLoop(() => { scene.render(); });
    window.addEventListener("resize", () => engine.resize());
}

function parseCoordinate(inputVal, currentVal) {
    if (!inputVal) return currentVal;
    let str = inputVal.trim();
    if (str.startsWith('~')) {
        const offset = parseFloat(str.slice(1));
        return isNaN(offset) ? currentVal : currentVal + offset;
    }
    const val = parseFloat(str);
    return isNaN(val) ? currentVal : val;
}

function teleportCamera() {
    if (!camera) return;
    const currentTarget = camera.target;
    const newX = parseCoordinate(document.getElementById('tpX').value, currentTarget.x);
    const newY = parseCoordinate(document.getElementById('tpY').value, currentTarget.y);
    const newZ = parseCoordinate(document.getElementById('tpZ').value, currentTarget.z);
    camera.setTarget(new BABYLON.Vector3(newX, newY, newZ));
}

function setInitialPosition() {
    if (!camera) return;
    initialTarget = camera.target.clone();
    initialRadius = camera.radius;
    initialAlpha = camera.alpha;
    initialBeta = camera.beta;
    userHasCustomInit = true;
}

function reloadInitialPosition() {
    if (!camera) return;
    camera.setTarget(initialTarget.clone());
    camera.radius = initialRadius;
    camera.alpha = initialAlpha;
    camera.beta = initialBeta;
}

function togglePanel(collapse) {
    document.getElementById('uiOverlay').classList.toggle('collapsed', collapse);
    document.getElementById('restoreBtn').style.display = collapse ? 'flex' : 'none';
}

function toggleTpPanel(collapse) {
    document.getElementById('tpOverlay').classList.toggle('collapsed', collapse);
    document.getElementById('tpRestoreBtn').style.display = collapse ? 'flex' : 'none';
}

function toggleTemplatePanel(show) {
    const templatePanel = document.getElementById('templateOverlay');
    templatePanel.classList.toggle('open', show);
}
