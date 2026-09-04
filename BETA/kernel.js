/**
 * kernel.js
 * High-Precision Relativistic Dirac Radial Integrator & Visualizer
 * Complete 118-Element Periodic Table Integration
 */

let canvas, engine, scene, camera;
let activeMeshes = [];
let currentOpacity = 0.35;
let visibilityState = {};
let userHasCustomInit = false;

let initialTarget = new BABYLON.Vector3(0, 0, 0);
let initialRadius = 25;
let initialAlpha = -Math.PI / 3;
let initialBeta = Math.PI / 2.5;

const FINE_ALPHA = 1.0 / 137.035999139;
const HARTREE_TO_EV = 27.211386245988;

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

let selectedElementSymbol = 'C';

window.addEventListener('DOMContentLoaded', () => {
    initBabylonEngine();
    renderPeriodicTableGrid();
    selectElementBySymbol('C');
});

/**
 * Automatically computes Madelung suborbital filling for any Atomic Number Z
 */
function getElectronConfigForZ(Z) {
    const suborbitOrder = [
        { label: "1s1/2", cap: 2, n: 1 },
        { label: "2s1/2", cap: 2, n: 2 },
        { label: "2p1/2", cap: 2, n: 2 },
        { label: "2p3/2", cap: 4, n: 2 },
        { label: "3s1/2", cap: 2, n: 3 },
        { label: "3p1/2", cap: 2, n: 3 },
        { label: "3p3/2", cap: 4, n: 3 },
        { label: "4s1/2", cap: 2, n: 4 },
        { label: "3d3/2", cap: 4, n: 3 },
        { label: "3d5/2", cap: 6, n: 3 },
        { label: "4p1/2", cap: 2, n: 4 },
        { label: "4p3/2", cap: 4, n: 4 },
        { label: "5s1/2", cap: 2, n: 5 },
        { label: "4d3/2", cap: 4, n: 4 },
        { label: "4d5/2", cap: 6, n: 4 },
        { label: "5p1/2", cap: 2, n: 5 },
        { label: "5p3/2", cap: 4, n: 5 },
        { label: "6s1/2", cap: 2, n: 6 },
        { label: "4f5/2", cap: 6, n: 4 },
        { label: "4f7/2", cap: 8, n: 4 },
        { label: "5d3/2", cap: 4, n: 5 },
        { label: "5d5/2", cap: 6, n: 5 },
        { label: "6p1/2", cap: 2, n: 6 },
        { label: "6p3/2", cap: 4, n: 6 },
        { label: "7s1/2", cap: 2, n: 7 },
        { label: "5f5/2", cap: 6, n: 5 },
        { label: "5f7/2", cap: 8, n: 5 },
        { label: "6d3/2", cap: 4, n: 6 },
        { label: "6d5/2", cap: 6, n: 6 },
        { label: "7p1/2", cap: 2, n: 7 },
        { label: "7p3/2", cap: 4, n: 7 }
    ];

    let remaining = Z;
    let config = {};
    let maxN = 1;

    for (let sub of suborbitOrder) {
        if (remaining <= 0) break;
        let fill = Math.min(remaining, sub.cap);
        config[sub.label] = fill;
        remaining -= fill;
        if (sub.n > maxN) maxN = sub.n;
    }

    return { subConfig: config, maxN: maxN };
}

/**
 * Builds standard 18-column Periodic Table with Lanthanides & Actinides
 */
function renderPeriodicTableGrid() {
    const container = document.getElementById('ptGridContainer');
    if (!container) return;

    container.innerHTML = '';

    // Row 0: Group numbers header (1 - 18)
    const emptyTopCorner = document.createElement('div');
    emptyTopCorner.className = 'pt-header-cell';
    emptyTopCorner.innerText = '';
    container.appendChild(emptyTopCorner);

    for (let g = 1; g <= 18; g++) {
        const groupHeader = document.createElement('div');
        groupHeader.className = 'pt-header-cell';
        groupHeader.innerText = g;
        container.appendChild(groupHeader);
    }

    // Grid placement map for 118 elements
    ELEMENTS_DATA.forEach(elem => {
        let gridRow = elem.period;
        let gridCol = elem.group;

        // Position Lanthanides (57-71) and Actinides (89-103) in f-block below main table
        if (elem.Z >= 57 && elem.Z <= 71) {
            gridRow = 9;
            gridCol = elem.Z - 57 + 4;
        } else if (elem.Z >= 89 && elem.Z <= 103) {
            gridRow = 10;
            gridCol = elem.Z - 89 + 4;
        }

        elem._gridRow = gridRow;
        elem._gridCol = gridCol;
    });

    // Populate periods 1 to 7
    for (let p = 1; p <= 7; p++) {
        // Period header cell (left column)
        const periodHeader = document.createElement('div');
        periodHeader.className = 'pt-period-cell';
        periodHeader.innerText = p;
        periodHeader.style.gridRow = p + 1;
        periodHeader.style.gridColumn = 1;
        container.appendChild(periodHeader);

        const periodElems = ELEMENTS_DATA.filter(e => e._gridRow === p);
        periodElems.forEach(elem => {
            const card = createPeriodicCard(elem);
            card.style.gridRow = p + 1;
            card.style.gridColumn = elem._gridCol + 1;
            container.appendChild(card);
        });
    }

    // Row 8: Gap spacer for Lanthanides/Actinides
    const gapSpacer = document.createElement('div');
    gapSpacer.style.gridRow = 9;
    gapSpacer.style.gridColumn = '1 / span 19';
    gapSpacer.style.height = '12px';
    container.appendChild(gapSpacer);

    // Lanthanides & Actinides row labels
    const laLabel = document.createElement('div');
    laLabel.className = 'pt-period-cell';
    laLabel.innerText = '57-71';
    laLabel.style.gridRow = 10;
    laLabel.style.gridColumn = 1;
    laLabel.style.fontSize = '8px';
    container.appendChild(laLabel);

    const acLabel = document.createElement('div');
    acLabel.className = 'pt-period-cell';
    acLabel.innerText = '89-103';
    acLabel.style.gridRow = 11;
    acLabel.style.gridColumn = 1;
    acLabel.style.fontSize = '8px';
    container.appendChild(acLabel);

    // Populate Lanthanides & Actinides elements
    const fBlockElems = ELEMENTS_DATA.filter(e => e._gridRow === 9 || e._gridRow === 10);
    fBlockElems.forEach(elem => {
        const card = createPeriodicCard(elem);
        card.style.gridRow = elem._gridRow === 9 ? 10 : 11;
        card.style.gridColumn = elem._gridCol + 1;
        container.appendChild(card);
    });
}

function createPeriodicCard(elem) {
    const card = document.createElement('div');
    card.className = `pt-element-card ${elem.sym === selectedElementSymbol ? 'active' : ''}`;
    card.id = `pt_card_${elem.sym}`;
    card.dataset.cat = elem.cat;
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

    selectedElementSymbol = symbol;

    document.querySelectorAll('.pt-element-card').forEach(c => c.classList.remove('active'));
    const activeCard = document.getElementById(`pt_card_${symbol}`);
    if (activeCard) activeCard.classList.add('active');

    const configData = getElectronConfigForZ(elem.Z);

    document.getElementById('inputZ').value = elem.Z;
    document.getElementById('inputMaxN').value = configData.maxN;

    generateOrbitsBuilder();

    // Populate electrons
    document.querySelectorAll('.orbit-row').forEach(row => {
        const label = row.querySelector('.orbit-label').innerText;
        if (configData.subConfig[label] !== undefined) {
            row.querySelector('.e-input').value = configData.subConfig[label];
        }
    });

    const tag = document.getElementById('selectedElementTag');
    if (tag) tag.innerText = `[Z = ${elem.Z} ${elem.name}]`;

    rebuildQuantumModel();
}

/* Modal Open / Close Handler */
function openPeriodicTableModal() {
    const backdrop = document.getElementById('ptModalBackdrop');
    if (backdrop) {
        backdrop.classList.add('open');
        document.body.classList.add('modal-open');
    }
}

function closePeriodicTableModal() {
    const backdrop = document.getElementById('ptModalBackdrop');
    if (backdrop) {
        backdrop.classList.remove('open');
        document.body.classList.remove('modal-open');
    }
}

function handleBackdropClick(e) {
    if (e.target.id === 'ptModalBackdrop') {
        closePeriodicTableModal();
    }
}

/* Dirac Core Integrator Functions */
function getOrbitalLabel(n, l, j) {
    const symbols = ['s', 'p', 'd', 'f', 'g', 'h', 'i', 'k', 'l', 'm', 'n', 'o'];
    let name = (l < symbols.length) ? `${n}${symbols[l]}` : `${n}[${l + 1}]`;
    
    if (j === 0.5) name += '1/2';
    else if (j === 1.5) name += '3/2';
    else if (j === 2.5) name += '5/2';
    else if (j === 3.5) name += '7/2';
    else if (j === 4.5) name += '9/2';
    else if (j === 5.5) name += '11/2';
    else name += `${Math.round(j * 2)}/2`;

    return name;
}

function getSuborbitCapacity(l, j) {
    return Math.round(2 * j + 1);
}

function generateOrbitsBuilder() {
    const maxN = parseInt(document.getElementById('inputMaxN').value) || 1;
    const container = document.getElementById('orbitsBuilderContainer');
    
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

            let S = cumElec * 0.85;
            let zEff = Math.max(0.1, Z - S);

            let energy = solveDiracExactEnergy(effectiveN, l, j, zEff);
            suborbitEnergies.push(`${row.querySelector('.orbit-label').innerText}: ${energy.toFixed(1)}eV`);
            cumElec += eCount;
        }
    });

    document.getElementById('inputEn').value = suborbitEnergies.join(', ');
}

function solveDiracRadialExpectationRK4(n, l, j, zEff) {
    const kappa = (j > l) ? -(l + 1) : l;
    const absKappa = Math.abs(kappa);
    const zAlpha = Math.min(zEff * FINE_ALPHA, absKappa - 1e-5);

    const gamma = (absKappa * absKappa > zAlpha * zAlpha) ? Math.sqrt(absKappa * absKappa - zAlpha * zAlpha) : absKappa;
    const N = Math.sqrt(n * n - 2 * (n - absKappa) * (absKappa - gamma));

    return (0.5291772109 / (2.0 * zEff)) * (3.0 * N * N - kappa * (kappa + 1.0));
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
    if (!container) return;
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
