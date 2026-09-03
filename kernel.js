// kernel.js - core logic
/**
 * Modern Dark Quantum Orbital Controller
 * Native JS Control Flow with GeoGebra API Direct Binding
 */

let currentElementKey = 'Mo';
let currentOpacity = 0.35;
let visibilityState = {
    0: true, // s
    1: true, // p
    2: true, // d
    3: true  // f
};

const ELEMENT_PRESETS = {
    Mo: { Z: 42, elec: [2, 8, 8, 10, 8, 5, 1], nVal: [1, 2, 3, 3, 4, 4, 5], lVal: [0, 1, 1, 2, 1, 2, 0], En: [-23658.82, -4872.96, -1429.45, -657.19, -201.81, -21.03, -7.4] },
    Fe: { Z: 26, elec: [2, 8, 8, 6, 2], nVal: [1, 2, 3, 3, 4], lVal: [0, 1, 1, 2, 0], En: [-7112.0, -846.1, -100.7, -56.8, -7.9] },
    C:  { Z: 6,  elec: [2, 2, 2], nVal: [1, 2, 2], lVal: [0, 0, 1], En: [-284.2, -19.4, -11.3] }
};

// 1. Initialization
function ggbOnInit() {
    // Hide axes and set dark background inside 3D viewport
    ggbApplet.evalCommand('SetBackgroundColor(10, 12, 16)');
    ggbApplet.evalCommand('ShowAxes(false)');
    ggbApplet.evalCommand('ShowGrid(false)');
    rebuildQuantumModel();
}

// 2. Element Switcher
function loadElement(symbol) {
    if (ELEMENT_PRESETS[symbol]) {
        currentElementKey = symbol;
        rebuildQuantumModel();
    }
}

// 3. UI Controls
function setOpacityFromUI(val) {
    currentOpacity = parseFloat(val);
    document.getElementById('opacityVal').innerText = Math.round(currentOpacity * 100) + '%';
    updateOpacity();
}

function toggleOrbitalUI(lType, isChecked) {
    visibilityState[lType] = isChecked;
    updateVisibility();
}

// 4. Mathematical Reconstruction
function rebuildQuantumModel() {
    clearPreviousSpheres();

    const data = ELEMENT_PRESETS[currentElementKey];
    const Z = data.Z;
    const elec = data.elec;
    const nVal = data.nVal;
    const lVal = data.lVal;
    const En = data.En;
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

        // Neon Cyber Colors
        let r_col = 0, g_col = 0, b_col = 0;
        switch (lVal[k]) {
            case 0: r_col = 255; g_col = 60; b_col = 60; break;   // s: Neon Red
            case 1: r_col = 0; g_col = 240; b_col = 255; break;  // p: Neon Cyan
            case 2: r_col = 255; g_col = 170; b_col = 0; break;  // d: Neon Amber
            default: r_col = 180; g_col = 80; b_col = 255; break; // f: Neon Purple
        }

        ggbApplet.setColor(sphereName, r_col, g_col, b_col);
        let visKey = lVal[k] >= 3 ? 3 : lVal[k];
        ggbApplet.setVisible(sphereName, visibilityState[visKey]);
        ggbApplet.setFilling(sphereName, currentOpacity);
    }
}

function updateVisibility() {
    const data = ELEMENT_PRESETS[currentElementKey];
    for (let k = 0; k < data.lVal.length; k++) {
        let sphereName = `orbSphere_${k}`;
        let l = data.lVal[k];
        let visKey = l >= 3 ? 3 : l;
        ggbApplet.setVisible(sphereName, visibilityState[visKey]);
    }
}

function updateOpacity() {
    const data = ELEMENT_PRESETS[currentElementKey];
    for (let k = 0; k < data.lVal.length; k++) {
        ggbApplet.setFilling(`orbSphere_${k}`, currentOpacity);
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
