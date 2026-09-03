// kernel.js - core logic
/**
 * Quantum Orbital Model in GeoGebra 3D
 * Pure JavaScript logic using native control flows (for, while, if, switch)
 */

let currentElementKey = 'Mo';

// Preset Element Database (Z, Electron Config, n, l, Binding Energy En in eV)
const ELEMENT_PRESETS = {
    Mo: { // Molybdenum Z=42
        Z: 42,
        elec: [2, 8, 8, 10, 8, 5, 1],
        nVal: [1, 2, 3, 3, 4, 4, 5],
        lVal: [0, 1, 1, 2, 1, 2, 0],
        En: [-23658.82, -4872.96, -1429.45, -657.19, -201.81, -21.03, -7.4]
    },
    Fe: { // Iron Z=26
        Z: 26,
        elec: [2, 8, 8, 6, 2],
        nVal: [1, 2, 3, 3, 4],
        lVal: [0, 1, 1, 2, 0],
        En: [-7112.0, -846.1, -100.7, -56.8, -7.9]
    },
    C: { // Carbon Z=6
        Z: 6,
        elec: [2, 2, 2],
        nVal: [1, 2, 2],
        lVal: [0, 0, 1],
        En: [-284.2, -19.4, -11.3]
    }
};

// 1. Initialization
function ggbOnInit() {
    initAppletUI();
    rebuildQuantumModel();
}

// 2. Build UI Controls (Slider & Checkboxes)
function initAppletUI() {
    // Opacity slider
    ggbApplet.evalCommand("Opacity = Slider(0, 1, 0.05, 1, 150, false, true, false, false)");
    ggbApplet.setValue("Opacity", 0.35);

    // Orbital visibility checkboxes
    const orbitals = ["ShowS", "ShowP", "ShowD", "ShowF"];
    for (let i = 0; i < orbitals.length; i++) {
        ggbApplet.evalCommand(`${orbitals[i]} = Checkbox()`);
        ggbApplet.setValue(orbitals[i], true);
        // Register update listeners for visibility changes
        ggbApplet.registerObjectUpdateListener(orbitals[i], "updateVisibility");
    }
    
    // Register update listener for opacity slider
    ggbApplet.registerObjectUpdateListener("Opacity", "updateOpacity");
}

// 3. Web interface function to load elements
function loadElement(symbol) {
    if (ELEMENT_PRESETS[symbol]) {
        currentElementKey = symbol;
        rebuildQuantumModel();
    }
}

// 4. Calculate physical radii and build 3D spheres using JS algorithms
function rebuildQuantumModel() {
    // Clear existing objects
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

    // Loop through each shell
    for (let k = 0; k < num; k++) {
        
        // A. Same-shell shielding (Same)
        let same = 0;
        if (nVal[k] === 1 && lVal[k] === 0) {
            same = 0.30 * (elec[k] - 1);
        } else {
            same = 0.35 * (elec[k] - 1);
        }

        // B. Inner-shell shielding (Inner)
        let inner = 0;
        if (lVal[k] >= 2) { 
            // d or f orbitals: sum all preceding electrons using a while loop
            let j = 0;
            while (j < k) {
                inner += elec[j];
                j++;
            }
        } else { 
            // s or p orbitals
            let elecN1 = 0;
            let elecInnerAll = 0;
            
            for (let j = 0; j < num; j++) {
                if (nVal[j] === nVal[k] - 1) {
                    elecN1 += elec[j];
                } else if (nVal[j] < nVal[k] - 1) {
                    elecInnerAll += elec[j];
                }
            }
            inner = 0.85 * elecN1 + 1.00 * elecInnerAll;
        }

        // C. Calculate effective charge and effective principal quantum number
        let S = same + inner;
        let zEff = Z - S;
        let nEff = Math.sqrt((R_inf * Math.pow(zEff, 2)) / (-En[k]));
        let beta = (zEff * alpha) / nEff;

        // D. Relativistic correction factor
        let relFactor = 0;
        if (lVal[k] >= 2) {
            relFactor = 1 + 0.5 * Math.pow(beta, 2);
        } else {
            relFactor = Math.sqrt(1 - Math.pow(beta, 2));
        }

        let qmFactor = 1 + 0.5 * (1 - (lVal[k] * (lVal[k] + 1)) / Math.pow(nEff, 2));

        // E. Final quantum mechanical radius
        let rQM = (Math.pow(nEff, 2) / zEff * 0.529) * qmFactor * relFactor;

        // F. GeoGebra object creation
        let sphereName = `orbSphere_${k}`;
        ggbApplet.evalCommand(`${sphereName} = Sphere((0, 0, 0), ${rQM})`);

        // G. Assign orbital colors and visibility using a switch statement
        let r_col = 0, g_col = 0, b_col = 0;
        let isVisible = true;

        switch (lVal[k]) {
            case 0: // s orbital
                r_col = 255; g_col = 51; b_col = 51;
                isVisible = ggbApplet.getValue("ShowS");
                break;
            case 1: // p orbital
                r_col = 51; g_col = 153; b_col = 255;
                isVisible = ggbApplet.getValue("ShowP");
                break;
            case 2: // d orbital
                r_col = 255; g_col = 153; b_col = 0;
                isVisible = ggbApplet.getValue("ShowD");
                break;
            default: // f orbital or higher
                r_col = 178; g_col = 51; b_col = 230;
                isVisible = ggbApplet.getValue("ShowF");
                break;
        }

        // Set visual properties
        ggbApplet.setColor(sphereName, r_col, g_col, b_col);
        ggbApplet.setVisible(sphereName, isVisible);
        ggbApplet.evalCommand(`SetFilling(${sphereName}, Opacity)`);
    }
}

// 5. Helper function: Update visibility
function updateVisibility() {
    const data = ELEMENT_PRESETS[currentElementKey];
    for (let k = 0; k < data.lVal.length; k++) {
        let sphereName = `orbSphere_${k}`;
        let l = data.lVal[k];
        
        if (l === 0) ggbApplet.setVisible(sphereName, ggbApplet.getValue("ShowS"));
        else if (l === 1) ggbApplet.setVisible(sphereName, ggbApplet.getValue("ShowP"));
        else if (l === 2) ggbApplet.setVisible(sphereName, ggbApplet.getValue("ShowD"));
        else ggbApplet.setVisible(sphereName, ggbApplet.getValue("ShowF"));
    }
}

// 6. Helper function: Update opacity
function updateOpacity() {
    const data = ELEMENT_PRESETS[currentElementKey];
    for (let k = 0; k < data.lVal.length; k++) {
        ggbApplet.evalCommand(`SetFilling(orbSphere_${k}, Opacity)`);
    }
}

// 7. Helper function: Clear previous objects
function clearPreviousSpheres() {
    let allObjects = ggbApplet.getAllObjectNames();
    for (let i = 0; i < allObjects.length; i++) {
        if (allObjects[i].startsWith("orbSphere_")) {
            ggbApplet.deleteObject(allObjects[i]);
        }
    }
}
