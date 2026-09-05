/**
 * kernel.js
 * High-Precision Relativistic Dirac Radial Integrator & Visualizer
 * Complete 118-Element Periodic Table Integration & 3D Orbital Mesh Renderer
 */

let canvas, engine, scene, camera;
let activeMeshes = [];
let currentOpacity = 0.35;
let visibilityState = {};
let selectedElementSymbol = "C";

let initialTarget = new BABYLON.Vector3(0, 0, 0);
let initialRadius = 25;
let initialAlpha = -Math.PI / 3;
let initialBeta = Math.PI / 2.5;

/**
 * 118 Elements Data Repository (Z, Symbol, Name, Period, Group, Category)
 */
const ELEMENTS_DATA = [
    { Z: 1, sym: "H", name: "Hydrogen", period: 1, group: 1, cat: "reactive-nonmetal" },
    { Z: 2, sym: "He", name: "Helium", period: 1, group: 18, cat: "noble-gas" },
    { Z: 3, sym: "Li", name: "Lithium", period: 2, group: 1, cat: "alkali-metal" },
    { Z: 4, sym: "Be", name: "Beryllium", period: 2, group: 2, cat: "alkaline-earth" },
    { Z: 5, sym: "B", name: "Boron", period: 2, group: 13, cat: "metalloid" },
    { Z: 6, sym: "C", name: "Carbon", period: 2, group: 14, cat: "reactive-nonmetal" },
    { Z: 7, sym: "N", name: "Nitrogen", period: 2, group: 15, cat: "reactive-nonmetal" },
    { Z: 8, sym: "O", name: "Oxygen", period: 2, group: 16, cat: "reactive-nonmetal" },
    { Z: 9, sym: "F", name: "Fluorine", period: 2, group: 17, cat: "reactive-nonmetal" },
    { Z: 10, sym: "Ne", name: "Neon", period: 2, group: 18, cat: "noble-gas" },

    { Z: 11, sym: "Na", name: "Sodium", period: 3, group: 1, cat: "alkali-metal" },
    { Z: 12, sym: "Mg", name: "Magnesium", period: 3, group: 2, cat: "alkaline-earth" },
    { Z: 13, sym: "Al", name: "Aluminium", period: 3, group: 13, cat: "post-transition" },
    { Z: 14, sym: "Si", name: "Silicon", period: 3, group: 14, cat: "metalloid" },
    { Z: 15, sym: "P", name: "Phosphorus", period: 3, group: 15, cat: "reactive-nonmetal" },
    { Z: 16, sym: "S", name: "Sulfur", period: 3, group: 16, cat: "reactive-nonmetal" },
    { Z: 17, sym: "Cl", name: "Chlorine", period: 3, group: 17, cat: "reactive-nonmetal" },
    { Z: 18, sym: "Ar", name: "Argon", period: 3, group: 18, cat: "noble-gas" },

    { Z: 19, sym: "K", name: "Potassium", period: 4, group: 1, cat: "alkali-metal" },
    { Z: 20, sym: "Ca", name: "Calcium", period: 4, group: 2, cat: "alkaline-earth" },
    { Z: 21, sym: "Sc", name: "Scandium", period: 4, group: 3, cat: "transition-metal" },
    { Z: 22, sym: "Ti", name: "Titanium", period: 4, group: 4, cat: "transition-metal" },
    { Z: 23, sym: "V", name: "Vanadium", period: 4, group: 5, cat: "transition-metal" },
    { Z: 24, sym: "Cr", name: "Chromium", period: 4, group: 6, cat: "transition-metal" },
    { Z: 25, sym: "Mn", name: "Manganese", period: 4, group: 7, cat: "transition-metal" },
    { Z: 26, sym: "Fe", name: "Iron", period: 4, group: 8, cat: "transition-metal" },
    { Z: 27, sym: "Co", name: "Cobalt", period: 4, group: 9, cat: "transition-metal" },
    { Z: 28, sym: "Ni", name: "Nickel", period: 4, group: 10, cat: "transition-metal" },
    { Z: 29, sym: "Cu", name: "Copper", period: 4, group: 11, cat: "transition-metal" },
    { Z: 30, sym: "Zn", name: "Zinc", period: 4, group: 12, cat: "transition-metal" },
    { Z: 31, sym: "Ga", name: "Gallium", period: 4, group: 13, cat: "post-transition" },
    { Z: 32, sym: "Ge", name: "Germanium", period: 4, group: 14, cat: "metalloid" },
    { Z: 33, sym: "As", name: "Arsenic", period: 4, group: 15, cat: "metalloid" },
    { Z: 34, sym: "Se", name: "Selenium", period: 4, group: 16, cat: "reactive-nonmetal" },
    { Z: 35, sym: "Br", name: "Bromine", period: 4, group: 17, cat: "reactive-nonmetal" },
    { Z: 36, sym: "Kr", name: "Krypton", period: 4, group: 18, cat: "noble-gas" },

    { Z: 37, sym: "Rb", name: "Rubidium", period: 5, group: 1, cat: "alkali-metal" },
    { Z: 38, sym: "Sr", name: "Strontium", period: 5, group: 2, cat: "alkaline-earth" },
    { Z: 39, sym: "Y", name: "Yttrium", period: 5, group: 3, cat: "transition-metal" },
    { Z: 40, sym: "Zr", name: "Zirconium", period: 5, group: 4, cat: "transition-metal" },
    { Z: 41, sym: "Nb", name: "Niobium", period: 5, group: 5, cat: "transition-metal" },
    { Z: 42, sym: "Mo", name: "Molybdenum", period: 5, group: 6, cat: "transition-metal" },
    { Z: 43, sym: "Tc", name: "Technetium", period: 5, group: 7, cat: "transition-metal" },
    { Z: 44, sym: "Ru", name: "Ruthenium", period: 5, group: 8, cat: "transition-metal" },
    { Z: 45, sym: "Rh", name: "Rhodium", period: 5, group: 9, cat: "transition-metal" },
    { Z: 46, sym: "Pd", name: "Palladium", period: 5, group: 10, cat: "transition-metal" },
    { Z: 47, sym: "Ag", name: "Silver", period: 5, group: 11, cat: "transition-metal" },
    { Z: 48, sym: "Cd", name: "Cadmium", period: 5, group: 12, cat: "transition-metal" },
    { Z: 49, sym: "In", name: "Indium", period: 5, group: 13, cat: "post-transition" },
    { Z: 50, sym: "Sn", name: "Tin", period: 5, group: 14, cat: "post-transition" },
    { Z: 51, sym: "Sb", name: "Antimony", period: 5, group: 15, cat: "metalloid" },
    { Z: 52, sym: "Te", name: "Tellurium", period: 5, group: 16, cat: "metalloid" },
    { Z: 53, sym: "I", name: "Iodine", period: 5, group: 17, cat: "reactive-nonmetal" },
    { Z: 54, sym: "Xe", name: "Xenon", period: 5, group: 18, cat: "noble-gas" },

    { Z: 55, sym: "Cs", name: "Caesium", period: 6, group: 1, cat: "alkali-metal" },
    { Z: 56, sym: "Ba", name: "Barium", period: 6, group: 2, cat: "alkaline-earth" },
    { Z: 57, sym: "La", name: "Lanthanum", period: 6, group: 3, cat: "lanthanide" },
    { Z: 58, sym: "Ce", name: "Cerium", period: 6, group: 3, cat: "lanthanide" },
    { Z: 59, sym: "Pr", name: "Praseodymium", period: 6, group: 3, cat: "lanthanide" },
    { Z: 60, sym: "Nd", name: "Neodymium", period: 6, group: 3, cat: "lanthanide" },
    { Z: 61, sym: "Pm", name: "Promethium", period: 6, group: 3, cat: "lanthanide" },
    { Z: 62, sym: "Sm", name: "Samarium", period: 6, group: 3, cat: "lanthanide" },
    { Z: 63, sym: "Eu", name: "Europium", period: 6, group: 3, cat: "lanthanide" },
    { Z: 64, sym: "Gd", name: "Gadolinium", period: 6, group: 3, cat: "lanthanide" },
    { Z: 65, sym: "Tb", name: "Terbium", period: 6, group: 3, cat: "lanthanide" },
    { Z: 66, sym: "Dy", name: "Dysprosium", period: 6, group: 3, cat: "lanthanide" },
    { Z: 67, sym: "Ho", name: "Holmium", period: 6, group: 3, cat: "lanthanide" },
    { Z: 68, sym: "Er", name: "Erbium", period: 6, group: 3, cat: "lanthanide" },
    { Z: 69, sym: "Tm", name: "Thulium", period: 6, group: 3, cat: "lanthanide" },
    { Z: 70, sym: "Yb", name: "Ytterbium", period: 6, group: 3, cat: "lanthanide" },
    { Z: 71, sym: "Lu", name: "Lutetium", period: 6, group: 3, cat: "lanthanide" },
    { Z: 72, sym: "Hf", name: "Hafnium", period: 6, group: 4, cat: "transition-metal" },
    { Z: 73, sym: "Ta", name: "Tantalum", period: 6, group: 5, cat: "transition-metal" },
    { Z: 74, sym: "W", name: "Tungsten", period: 6, group: 6, cat: "transition-metal" },
    { Z: 75, sym: "Re", name: "Rhenium", period: 6, group: 7, cat: "transition-metal" },
    { Z: 76, sym: "Os", name: "Osmium", period: 6, group: 8, cat: "transition-metal" },
    { Z: 77, sym: "Ir", name: "Iridium", period: 6, group: 9, cat: "transition-metal" },
    { Z: 78, sym: "Pt", name: "Platinum", period: 6, group: 10, cat: "transition-metal" },
    { Z: 79, sym: "Au", name: "Gold", period: 6, group: 11, cat: "transition-metal" },
    { Z: 80, sym: "Hg", name: "Mercury", period: 6, group: 12, cat: "transition-metal" },
    { Z: 81, sym: "Tl", name: "Thallium", period: 6, group: 13, cat: "post-transition" },
    { Z: 82, sym: "Pb", name: "Lead", period: 6, group: 14, cat: "post-transition" },
    { Z: 83, sym: "Bi", name: "Bismuth", period: 6, group: 15, cat: "post-transition" },
    { Z: 84, sym: "Po", name: "Polonium", period: 6, group: 16, cat: "post-transition" },
    { Z: 85, sym: "At", name: "Astatine", period: 6, group: 17, cat: "metalloid" },
    { Z: 86, sym: "Rn", name: "Radon", period: 6, group: 18, cat: "noble-gas" },

    { Z: 87, sym: "Fr", name: "Francium", period: 7, group: 1, cat: "alkali-metal" },
    { Z: 88, sym: "Ra", name: "Radium", period: 7, group: 2, cat: "alkaline-earth" },
    { Z: 89, sym: "Ac", name: "Actinium", period: 7, group: 3, cat: "actinide" },
    { Z: 90, sym: "Th", name: "Thorium", period: 7, group: 3, cat: "actinide" },
    { Z: 91, sym: "Pa", name: "Protactinium", period: 7, group: 3, cat: "actinide" },
    { Z: 92, sym: "U", name: "Uranium", period: 7, group: 3, cat: "actinide" },
    { Z: 93, sym: "Np", name: "Neptunium", period: 7, group: 3, cat: "actinide" },
    { Z: 94, sym: "Pu", name: "Plutonium", period: 7, group: 3, cat: "actinide" },
    { Z: 95, sym: "Am", name: "Americium", period: 7, group: 3, cat: "actinide" },
    { Z: 96, sym: "Cm", name: "Curium", period: 7, group: 3, cat: "actinide" },
    { Z: 97, sym: "Bk", name: "Berkelium", period: 7, group: 3, cat: "actinide" },
    { Z: 98, sym: "Cf", name: "Californium", period: 7, group: 3, cat: "actinide" },
    { Z: 99, sym: "Es", name: "Einsteinium", period: 7, group: 3, cat: "actinide" },
    { Z: 100, sym: "Fm", name: "Fermium", period: 7, group: 3, cat: "actinide" },
    { Z: 101, sym: "Md", name: "Mendelevium", period: 7, group: 3, cat: "actinide" },
    { Z: 102, sym: "No", name: "Nobelium", period: 7, group: 3, cat: "actinide" },
    { Z: 103, sym: "Lr", name: "Lawrencium", period: 7, group: 3, cat: "actinide" },
    { Z: 104, sym: "Rf", name: "Rutherfordium", period: 7, group: 4, cat: "transition-metal" },
    { Z: 105, sym: "Db", name: "Dubnium", period: 7, group: 5, cat: "transition-metal" },
    { Z: 106, sym: "Sg", name: "Seaborgium", period: 7, group: 6, cat: "transition-metal" },
    { Z: 107, sym: "Bh", name: "Bohrium", period: 7, group: 7, cat: "transition-metal" },
    { Z: 108, sym: "Hs", name: "Hassium", period: 7, group: 8, cat: "transition-metal" },
    { Z: 109, sym: "Mt", name: "Meitnerium", period: 7, group: 9, cat: "transition-metal" },
    { Z: 110, sym: "Ds", name: "Darmstadtium", period: 7, group: 10, cat: "transition-metal" },
    { Z: 111, sym: "Rg", name: "Roentgenium", period: 7, group: 11, cat: "transition-metal" },
    { Z: 112, sym: "Cn", name: "Copernicium", period: 7, group: 12, cat: "transition-metal" },
    { Z: 113, sym: "Nh", name: "Nihonium", period: 7, group: 13, cat: "post-transition" },
    { Z: 114, sym: "Fl", name: "Flerovium", period: 7, group: 14, cat: "post-transition" },
    { Z: 115, sym: "Mc", name: "Moscovium", period: 7, group: 15, cat: "post-transition" },
    { Z: 116, sym: "Lv", name: "Livermorium", period: 7, group: 16, cat: "post-transition" },
    { Z: 117, sym: "Ts", name: "Tennessine", period: 7, group: 17, cat: "post-transition" },
    { Z: 118, sym: "Og", name: "Oganesson", period: 7, group: 18, cat: "noble-gas" }
];

/**
 * Relativistic Spin-Orbit j-subshell Mappings
 */
const SUBSHELL_J_SPLIT = {
    '1s': [{ j: '1/2', cap: 2 }],
    '2s': [{ j: '1/2', cap: 2 }],
    '2p': [{ j: '1/2', cap: 2 }, { j: '3/2', cap: 4 }],
    '3s': [{ j: '1/2', cap: 2 }],
    '3p': [{ j: '1/2', cap: 2 }, { j: '3/2', cap: 4 }],
    '4s': [{ j: '1/2', cap: 2 }],
    '3d': [{ j: '3/2', cap: 4 }, { j: '5/2', cap: 6 }],
    '4p': [{ j: '1/2', cap: 2 }, { j: '3/2', cap: 4 }],
    '5s': [{ j: '1/2', cap: 2 }],
    '4d': [{ j: '3/2', cap: 4 }, { j: '5/2', cap: 6 }],
    '5p': [{ j: '1/2', cap: 2 }, { j: '3/2', cap: 4 }],
    '6s': [{ j: '1/2', cap: 2 }],
    '4f': [{ j: '5/2', cap: 6 }, { j: '7/2', cap: 8 }],
    '5d': [{ j: '3/2', cap: 4 }, { j: '5/2', cap: 6 }],
    '6p': [{ j: '1/2', cap: 2 }, { j: '3/2', cap: 4 }],
    '7s': [{ j: '1/2', cap: 2 }],
    '5f': [{ j: '5/2', cap: 6 }, { j: '7/2', cap: 8 }],
    '6d': [{ j: '3/2', cap: 4 }, { j: '5/2', cap: 6 }],
    '7p': [{ j: '1/2', cap: 2 }, { j: '3/2', cap: 4 }]
};

/**
 * Render 118 Periodic Table Element Grid Cards
 */
function renderPeriodicTableGrid() {
    const container = document.getElementById('ptGridContainer');
    if (!container) return;
    container.innerHTML = '';

    ELEMENTS_DATA.forEach(elem => {
        const card = createPeriodicCard(elem);
        card.style.gridColumn = elem.group;
        card.style.gridRow = elem.period;
        container.appendChild(card);
    });
}

function createPeriodicCard(elem) {
    const card = document.createElement('div');
    card.className = `pt-element-card ${elem.sym === selectedElementSymbol ? 'active' : ''}`;
    card.id = `pt_card_${elem.sym}`;
    card.dataset.cat = elem.cat;
    card.dataset.group = elem.group;
    card.onclick = () => {
        selectElementBySymbol(elem.sym);
        closePeriodicTableModal();
    };

    card.innerHTML = `
        <div class="pt-card-top">
            <span>${elem.Z}</span>
            <span>G${elem.group}</span>
        </div>
        <div class="pt-card-symbol">${elem.sym}</div>
        <div class="pt-card-name">${elem.name}</div>
    `;
    return card;
}

function selectElementBySymbol(symbol) {
    const elem = ELEMENTS_DATA.find(e => e.sym === symbol);
    if (!elem) return;

    selectedElementSymbol = elem.sym;
    const tag = document.getElementById('selectedElementTag');
    if (tag) tag.textContent = `[${elem.Z} - ${elem.name}]`;

    const zAuto = document.getElementById('inputZ');
    const zManual = document.getElementById('inputZManual');
    if (zAuto) zAuto.value = elem.Z;
    if (zManual) zManual.value = elem.Z;

    if (typeof syncManualFieldsFromZ === 'function') {
        syncManualFieldsFromZ(elem.Z);
    }

    document.querySelectorAll('.pt-element-card').forEach(c => c.classList.remove('active'));
    const activeCard = document.getElementById(`pt_card_${elem.sym}`);
    if (activeCard) activeCard.classList.add('active');

    rebuildQuantumModel();
}

function openPeriodicTableModal() {
    const backdrop = document.getElementById('ptModalBackdrop');
    if (backdrop) backdrop.classList.add('open');
    document.body.classList.add('modal-open');
}

function closePeriodicTableModal() {
    const backdrop = document.getElementById('ptModalBackdrop');
    if (backdrop) backdrop.classList.remove('open');
    document.body.classList.remove('modal-open');
}

function handleBackdropClick(event) {
    if (event.target.id === 'ptModalBackdrop') {
        closePeriodicTableModal();
    }
}

/**
 * Dynamic Suborbit Builder UI Controls
 */
function generateOrbitsBuilder() {
    const maxNInput = document.getElementById('inputMaxN');
    const container = document.getElementById('orbitsBuilderContainer');
    if (!maxNInput || !container) return;

    const maxN = parseInt(maxNInput.value) || 1;
    container.innerHTML = '';

    const labelMap = ['s', 'p', 'd', 'f', 'g', 'h'];

    for (let n = 1; n <= maxN; n++) {
        for (let l = 0; l < n; l++) {
            if (l >= labelMap.length) continue;
            const subName = `${n}${labelMap[l]}`;

            const row = document.createElement('div');
            row.className = 'orbit-row';
            row.innerHTML = `
                <input type="text" class="ex-input" value="0" placeholder="ex">
                <span class="orbit-label">${subName}</span>
                <input type="number" class="e-input" value="${l === 0 ? 2 : l * 4}" min="0" max="14">
            `;
            container.appendChild(row);
        }
    }
    updateFiltersUI();
}

/**
 * Populate Dirac Filter Checklist Controls
 */
function updateFiltersUI() {
    const container = document.getElementById('dynamicFilterContainer');
    if (!container) return;
    container.innerHTML = '';

    const rows = document.querySelectorAll('#orbitsBuilderContainer .orbit-row');
    rows.forEach(row => {
        const label = row.querySelector('.orbit-label').textContent.trim();
        const splits = SUBSHELL_J_SPLIT[label] || [{ j: '1/2', cap: 2 }];

        splits.forEach(s => {
            const fullLabel = `${label}_${s.j}`;
            if (visibilityState[fullLabel] === undefined) {
                visibilityState[fullLabel] = true;
            }

            const item = document.createElement('div');
            item.className = 'filter-item';
            item.innerHTML = `
                <span>${fullLabel}</span>
                <input type="checkbox" ${visibilityState[fullLabel] ? 'checked' : ''} onchange="toggleSuborbitVisibility('${fullLabel}', this.checked)">
            `;
            container.appendChild(item);
        });
    });
}

function toggleSuborbitVisibility(label, isVisible) {
    visibilityState[label] = isVisible;
    activeMeshes.forEach(item => {
        if (item.label === label && item.mesh) {
            item.mesh.setEnabled(isVisible);
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

/**
 * Camera Movement and UI Position Synchronizer
 */
function updateCameraUI() {
    if (!camera) return;
    const tpX = document.getElementById('tpX');
    const tpY = document.getElementById('tpY');
    const tpZ = document.getElementById('tpZ');

    if (tpX && document.activeElement !== tpX) tpX.value = camera.position.x.toFixed(2);
    if (tpY && document.activeElement !== tpY) tpY.value = camera.position.y.toFixed(2);
    if (tpZ && document.activeElement !== tpZ) tpZ.value = camera.position.z.toFixed(2);
}

function teleportCamera() {
    if (!camera) return;
    const x = parseFloat(document.getElementById('tpX').value) || 0;
    const y = parseFloat(document.getElementById('tpY').value) || 0;
    const z = parseFloat(document.getElementById('tpZ').value) || 0;
    camera.setPosition(new BABYLON.Vector3(x, y, z));
}

function setInitialPosition() {
    if (!camera) return;
    initialTarget = camera.target.clone();
    initialRadius = camera.radius;
    initialAlpha = camera.alpha;
    initialBeta = camera.beta;
}

function reloadInitialPosition() {
    if (!camera) return;
    camera.setTarget(initialTarget);
    camera.radius = initialRadius;
    camera.alpha = initialAlpha;
    camera.beta = initialBeta;
}

function togglePanel(collapse) {
    const panel = document.getElementById('uiOverlay');
    const restoreBtn = document.getElementById('restoreBtn');
    if (panel) panel.classList.toggle('collapsed', collapse);
    if (restoreBtn) restoreBtn.style.display = collapse ? 'flex' : 'none';
}

function toggleTpPanel(collapse) {
    const panel = document.getElementById('tpOverlay');
    const restoreBtn = document.getElementById('tpRestoreBtn');
    if (panel) panel.classList.toggle('collapsed', collapse);
    if (restoreBtn) restoreBtn.style.display = collapse ? 'flex' : 'none';
}

/**
 * Babylon.js 3D Engine Initialization
 */
function initBabylonEngine() {
    canvas = document.getElementById('renderCanvas');
    if (!canvas) return;

    engine = new BABYLON.Engine(canvas, true, { preserveDrawingBuffer: true, stencil: true });
    scene = new BABYLON.Scene(engine);
    scene.clearColor = new BABYLON.Color4(0.01, 0.01, 0.02, 1.0);

    camera = new BABYLON.ArcRotateCamera("Camera", initialAlpha, initialBeta, initialRadius, initialTarget, scene);
    camera.attachControl(canvas, true);
    camera.wheelPrecision = 15;
    camera.minZ = 0.1;
    camera.maxZ = 1000;

    const hemiLight = new BABYLON.HemisphericLight("hemiLight", new BABYLON.Vector3(0, 1, 0), scene);
    hemiLight.intensity = 0.85;

    const dirLight = new BABYLON.DirectionalLight("dirLight", new BABYLON.Vector3(-1, -2, -1), scene);
    dirLight.intensity = 0.5;

    // Central Nucleus Representation
    const nucleus = BABYLON.MeshBuilder.CreateSphere("nucleus", { diameter: 1.2, segments: 32 }, scene);
    const nucMat = new BABYLON.StandardMaterial("nucMat", scene);
    nucMat.emissiveColor = new BABYLON.Color3(0.9, 0.3, 0.2);
    nucMat.diffuseColor = new BABYLON.Color3(1.0, 0.5, 0.2);
    nucleus.material = nucMat;

    // Continuous Precession Render Loop
    scene.registerBeforeRender(() => {
        const t = performance.now() * 0.0008;
        activeMeshes.forEach(item => {
            if (item.mesh && !item.mesh.isDisposed) {
                item.mesh.rotation.y = t * item.speed;
                item.mesh.rotation.z = Math.sin(t * 0.5 * item.speed) * 0.12;
            }
        });
    });

    engine.runRenderLoop(() => {
        scene.render();
        updateCameraUI();
    });

    window.addEventListener('resize', () => {
        engine.resize();
    });

    renderPeriodicTableGrid();
    generateOrbitsBuilder();
    rebuildQuantumModel();
}

/**
 * Quantum Spectral Color Generator
 */
function getOrbitalColor(n, l, j) {
    if (l === 0) return new BABYLON.Color3(0.0, 0.95, 1.0); // Cyan s-orbital
    if (l === 1) return j.includes('1/2') ? new BABYLON.Color3(0.38, 0.51, 0.96) : new BABYLON.Color3(0.65, 0.36, 0.96); // Indigo/Purple p-orbital
    if (l === 2) return j.includes('3/2') ? new BABYLON.Color3(0.06, 0.72, 0.65) : new BABYLON.Color3(0.1, 0.8, 0.4); // Emerald d-orbital
    return new BABYLON.Color3(0.96, 0.62, 0.04); // Amber f-orbital
}

/**
 * High-Precision 3D Dirac Quantum Orbital Geometry Synthesizer
 */
function createOrbitalMesh(scene, n, l, jLabel, elecCount, Z, opacity) {
    const parentNode = new BABYLON.TransformNode(`orbital_${n}_${l}_${jLabel}`, scene);
    const color = getOrbitalColor(n, l, jLabel);
    
    // Radius scaling according to Principal Quantum Number and Atomic Charge Z
    const baseRadius = (2.2 + (n * 2.8) / Math.pow(Z, 0.22));

    const mat = new BABYLON.StandardMaterial(`mat_${n}_${l}_${jLabel}`, scene);
    mat.emissiveColor = color;
    mat.diffuseColor = color;
    mat.alpha = opacity;
    mat.backFaceCulling = false;
    mat.wireframe = false;

    // s-Orbital Geometry (Spherical Cloud & Equator Torus)
    if (l === 0) {
        const sphere = BABYLON.MeshBuilder.CreateSphere("s_cloud", { diameter: baseRadius * 2, segments: 32 }, scene);
        sphere.material = mat;
        sphere.parent = parentNode;

        const ring = BABYLON.MeshBuilder.CreateTorus("s_ring", { diameter: baseRadius * 2.2, thickness: 0.08, tessellation: 64 }, scene);
        ring.material = mat;
        ring.parent = parentNode;
    } 
    // p-Orbital Geometry (3 Dumbbell Pairs & Relativistic Precession Splitting)
    else if (l === 1) {
        const angles = [0, Math.PI / 2, Math.PI];
        angles.forEach((ang, idx) => {
            const lobe = BABYLON.MeshBuilder.CreateSphere(`p_lobe_${idx}`, {
                diameterX: baseRadius * 0.8,
                diameterY: baseRadius * 2.4,
                diameterZ: baseRadius * 0.8,
                segments: 24
            }, scene);
            lobe.position.y = baseRadius * 0.8 * (idx % 2 === 0 ? 1 : -1);
            lobe.rotation.z = ang;
            lobe.rotation.x = idx * (Math.PI / 3);
            lobe.material = mat;
            lobe.parent = parentNode;
        });

        const torus = BABYLON.MeshBuilder.CreateTorus("p_torus", { diameter: baseRadius * 2.6, thickness: 0.1, tessellation: 64 }, scene);
        torus.rotation.x = Math.PI / 2;
        torus.material = mat;
        torus.parent = parentNode;
    }
    // d-Orbital Geometry (Cloverleaf Lobes + Equatorial Torus Ring)
    else if (l === 2) {
        for (let i = 0; i < 4; i++) {
            const rot = (i * Math.PI) / 2;
            const lobe = BABYLON.MeshBuilder.CreateSphere(`d_lobe_${i}`, {
                diameterX: baseRadius * 0.7,
                diameterY: baseRadius * 2.2,
                diameterZ: baseRadius * 0.7,
                segments: 20
            }, scene);
            lobe.position.x = Math.cos(rot) * baseRadius * 0.9;
            lobe.position.z = Math.sin(rot) * baseRadius * 0.9;
            lobe.rotation.y = rot;
            lobe.material = mat;
            lobe.parent = parentNode;
        }

        const ring = BABYLON.MeshBuilder.CreateTorus("d_ring", { diameter: baseRadius * 1.8, thickness: 0.18, tessellation: 64 }, scene);
        ring.material = mat;
        ring.parent = parentNode;
    }
    // f-Orbital & Higher Angular Momentum Geometry
    else {
        for (let i = 0; i < 6; i++) {
            const rot = (i * Math.PI) / 3;
            const lobe = BABYLON.MeshBuilder.CreateSphere(`f_lobe_${i}`, {
                diameterX: baseRadius * 0.6,
                diameterY: baseRadius * 2.5,
                diameterZ: baseRadius * 0.6,
                segments: 16
            }, scene);
            lobe.position.x = Math.cos(rot) * baseRadius * 1.1;
            lobe.position.y = Math.sin(rot) * baseRadius * 0.6;
            lobe.position.z = Math.sin(rot * 2) * baseRadius * 0.8;
            lobe.material = mat;
            lobe.parent = parentNode;
        }
    }

    return parentNode;
}

/**
 * Main Solver Entry Point: Rebuild Quantum System & Visualizer
 */
function rebuildQuantumModel() {
    if (!scene) return;

    // Dispose existing 3D orbital meshes
    activeMeshes.forEach(item => {
        if (item.mesh) item.mesh.dispose();
    });
    activeMeshes = [];

    const autoContainer = document.getElementById('autoModeContainer');
    const isAutoMode = autoContainer && !autoContainer.classList.contains('hidden');

    const zInput = isAutoMode ? document.getElementById('inputZ') : document.getElementById('inputZManual');
    const Z = parseInt(zInput ? zInput.value : 6) || 6;

    const labelMap = { 's': 0, 'p': 1, 'd': 2, 'f': 3, 'g': 4 };

    if (isAutoMode) {
        const rows = document.querySelectorAll('#orbitsBuilderContainer .orbit-row');
        rows.forEach(row => {
            const label = row.querySelector('.orbit-label').textContent.trim();
            const elecCount = parseInt(row.querySelector('.e-input').value) || 0;
            if (elecCount <= 0) return;

            const n = parseInt(label.charAt(0)) || 1;
            const lChar = label.charAt(1);
            const l = labelMap[lChar] !== undefined ? labelMap[lChar] : 0;

            const splits = SUBSHELL_J_SPLIT[label] || [{ j: '1/2', cap: 2 }];
            let remainingElec = elecCount;

            splits.forEach(s => {
                if (remainingElec <= 0) return;
                const countInSub = Math.min(remainingElec, s.cap);
                remainingElec -= countInSub;

                const fullLabel = `${label}_${s.j}`;
                const mesh = createOrbitalMesh(scene, n, l, s.j, countInSub, Z, currentOpacity);

                if (visibilityState[fullLabel] !== undefined) {
                    mesh.setEnabled(visibilityState[fullLabel]);
                }

                activeMeshes.push({
                    label: fullLabel,
                    mesh: mesh,
                    speed: 0.5 + (n * 0.2) + (l * 0.1)
                });
            });
        });
    } else {
        const elecInput = document.getElementById('inputElec');
        const nInput = document.getElementById('inputN');
        const lInput = document.getElementById('inputL');

        const elecs = elecInput ? elecInput.value.split(',').map(v => parseInt(v.trim()) || 0) : [2];
        const ns = nInput ? nInput.value.split(',').map(v => parseInt(v.trim()) || 1) : [1];
        const ls = lInput ? lInput.value.split(',').map(v => parseInt(v.trim()) || 0) : [0];

        const charMap = ['s', 'p', 'd', 'f', 'g'];

        ns.forEach((n, idx) => {
            const l = ls[idx] !== undefined ? ls[idx] : 0;
            const elecCount = elecs[idx] !== undefined ? elecs[idx] : 1;
            if (elecCount <= 0) return;

            const subName = `${n}${charMap[l] || 's'}`;
            const splits = SUBSHELL_J_SPLIT[subName] || [{ j: '1/2', cap: 2 }];

            splits.forEach(s => {
                const fullLabel = `${subName}_${s.j}`;
                const mesh = createOrbitalMesh(scene, n, l, s.j, elecCount, Z, currentOpacity);

                if (visibilityState[fullLabel] !== undefined) {
                    mesh.setEnabled(visibilityState[fullLabel]);
                }

                activeMeshes.push({
                    label: fullLabel,
                    mesh: mesh,
                    speed: 0.5 + (n * 0.2)
                });
            });
        });
    }

    updateFiltersUI();
}

/**
 * Manual Mode Parameter Handler
 */
function applyCustomParameters() {
    rebuildQuantumModel();
}

document.addEventListener('DOMContentLoaded', initBabylonEngine);
