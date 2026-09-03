// kernel.js - core logic
/**
 * Low-Key Dark Quantum Orbital Model Controller
 * Supports presets and fully customizable quantum parameters
 */

let currentElementKey = 'Mo';
let currentOpacity = 0.35;
let visibilityState = { 0: true, 1: true, 2: true, 3: true };

// Active dataset (Presets or Custom)
let activeData = {
    Z: 42,
    elec: [2, 8, 8, 10, 8, 5, 1],
    nVal: [1, 2, 3, 3, 4, 4, 5],
    lVal: [0, 1, 1, 2, 1, 2, 0],
    En: [-23658.82, -4872.96, -1429.45, -657.19, -201.81, -21.03, -7.4]
};

const ELEMENT_PRESETS = {
    Mo: { Z: 42, elec: [2, 8, 8, 10, 8, 5, 1], nVal: [1, 2, 3, 3, 4, 4, 5], lVal: [0, 1, 1, 2, 1, 2, 0], En: [-23658.82, -4872.96, -1429.45, -657.19, -201.81, -21.03, -7.4] },
    Fe: { Z: 26, elec: [2, 8, 8, 6, 2], nVal: [1, 2, 3, 3, 4], lVal: [0, 1, 1, 2, 0], En: [-7112.0, -846.1, -100.7, -56.8, -7.9] },
    C:  { Z: 6,  elec: [2, 4], nVal: [1, 2], lVal: [0, 1], En: [-284.2, -15.2] }
};

function ggbOnInit() {
    ggbApplet.evalCommand('SetBackgroundColor(8, 10, 15)');
    ggbApplet.evalCommand('ShowAxes(false)');
    ggbApplet.evalCommand('ShowGrid(false)');
    rebuildQuantumModel();
}

// Preset Loader
function loadElement(symbol) {
    if (ELEMENT_PRESETS[symbol]) {
        currentElementKey = symbol;
        activeData = JSON.parse(JSON.stringify(ELEMENT_PRESETS[symbol]));
        syncCustomInputsUI();
        rebuildQuantumModel();
    }
}

// Custom Inputs Parser
function applyCustomParameters() {
    try {
        const zVal = parseInt(document.getElementById('inputZ').value);
        const elecArr = document.getElementById('inputElec').value.split(',').map(Number);
        const nArr = document.getElementById('inputN').value.split(',').map(Number);
        const lArr = document.getElementById('inputL').value.split(',').map(Number);
        const enArr = document.getElementById('inputEn').value.split(',').map(Number);

        if (!zVal || elecArr.some(isNaN) || nArr.some(isNaN) || lArr.some(isNaN) || enArr.some(isNaN)) {
            alert('Please check your parameters syntax (comma separated numbers required).');
            return;
        }

        activeData = { Z: zVal, elec: elecArr, nVal: nArr, lVal: lArr, En: enArr };
        rebuildQuantumModel();
    } catch (e) {
        console.error('Custom parameter error:', e);
    }
}

function syncCustomInputsUI() {
    document.getElementById('inputZ').value = activeData.Z;
    document.getElementById('inputElec').value = activeData.elec.join(', ');
    document.getElementById('inputN').value = activeData.nVal.join(', ');
    document.getElementById('inputL').value = activeData.lVal.join(', ');
    document.getElementById('inputEn').value = activeData.En.join(', ');
}

// UI Controls
function setOpacityFromUI(val) {
    currentOpacity = parseFloat(val);
    document.getElementById('opacityVal').innerText = Math.round(currentOpacity * 100) + '%';
    updateOpacity();
}

function toggleOrbitalUI(lType, isChecked) {
    visibilityState[lType] = isChecked;
    updateVisibility();
}

// Mathematical Physics Engine
function rebuildQuantumModel() {
    clearPreviousSpheres();

    const Z = activeData.Z;
    const elec = activeData.elec;
    const nVal = activeData.nVal;
    const lVal = activeData.lVal;
    const En = activeData.En;
    const num = elec.length;

    const alpha = 1 / 137.036;
    const R_inf = 13.6057;

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
        let zEff = Z - S;
        let nEff = Math.sqrt((R_inf * Math.pow(zEff, 2)) / (-En[k]));
        let beta = (zEff * alpha) / nEff;

        let relFactor = (lVal[k] >= 2) ? (1 + 0.5 * Math.pow(beta, 2)) : Math.sqrt(1 - Math.pow(beta, 2));
        let qmFactor = 1 + 0.5 * (1 - (lVal[k] * (lVal[k] + 1)) / Math.pow(nEff, 2));

        let rQM = (Math.pow(nEff, 2) / zEff * 0.529) * qmFactor * relFactor;

        let sphereName = `orbSphere_${k}`;
        ggbApplet.evalCommand(`${sphereName} = Sphere((0, 0, 0), ${rQM})`);

        // Low-key Subdued Palette
        let r_col = 200, g_col = 200, b_col = 200;
        switch (lVal[k]) {
            case 0: r_col = 201; g_col = 106; b_col = 106; break; // Subdued Coral Red
            case 1: r_col = 104; g_col = 136; b_col = 196; break; // Muted Steel Blue
            case 2: r_col = 217; g_col = 155; b_col = 78;  break; // Soft Amber
            default: r_col = 158; g_col = 130; b_col = 196; break; // Soft Violet
        }

        ggbApplet.setColor(sphereName, r_col, g_col, b_col);
        let visKey = lVal[k] >= 3 ? 3 : lVal[k];
        ggbApplet.setVisible(sphereName, visibilityState[visKey]);
        ggbApplet.evalCommand(`SetFilling(${sphereName}, ${currentOpacity})`);
    }
}

function updateVisibility() {
    for (let k = 0; k < activeData.lVal.length; k++) {
        let sphereName = `orbSphere_${k}`;
        let l = activeData.lVal[k];
        let visKey = l >= 3 ? 3 : l;
        ggbApplet.setVisible(sphereName, visibilityState[visKey]);
    }
}

function updateOpacity() {
    for (let k = 0; k < activeData.lVal.length; k++) {
        let sphereName = `orbSphere_${k}`;
        ggbApplet.evalCommand(`SetFilling(${sphereName}, ${currentOpacity})`);
    }
}

function clearPreviousSpheres() {
    let allObjects = ggbApplet.getAllObjectNames();
    for (let i = 0; i < allObjects.length; i++) {
        if (allObjects[i].startsWith("orbSphere_")) {
            ggbApplet.deleteObject(allObjects[i]);
        }
    }
}
