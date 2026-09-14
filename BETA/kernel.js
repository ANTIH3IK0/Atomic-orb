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
const DEFAULT_GI = 0.0;

/**
 * 118 Elements Data Repository (Z, Symbol, Name, Period, Group, Category, Mass A, Nuclear g-factor gI)
 */
const ELEMENTS_DATA = [
    { Z: 1, sym: "H", name: "Hydrogen", period: 1, group: 1, cat: "reactive-nonmetal", A: 1, gI: 5.5857 },
    { Z: 2, sym: "He", name: "Helium", period: 1, group: 18, cat: "noble-gas", A: 4, gI: 0.0 },
    
    { Z: 3, sym: "Li", name: "Lithium", period: 2, group: 1, cat: "alkali-metal", A: 7, gI: 2.1709 },
    { Z: 4, sym: "Be", name: "Beryllium", period: 2, group: 2, cat: "alkaline-earth", A: 9, gI: -0.5428 },
    { Z: 5, sym: "B", name: "Boron", period: 2, group: 13, cat: "metalloid", A: 11, gI: 1.7924 },
    { Z: 6, sym: "C", name: "Carbon", period: 2, group: 14, cat: "reactive-nonmetal", A: 12, gI: 0.0 },
    { Z: 7, sym: "N", name: "Nitrogen", period: 2, group: 15, cat: "reactive-nonmetal", A: 14, gI: 0.4037 },
    { Z: 8, sym: "O", name: "Oxygen", period: 2, group: 16, cat: "reactive-nonmetal", A: 16, gI: 0.0 },
    { Z: 9, sym: "F", name: "Fluorine", period: 2, group: 17, cat: "reactive-nonmetal", A: 19, gI: 5.2577 },
    { Z: 10, sym: "Ne", name: "Neon", period: 2, group: 18, cat: "noble-gas", A: 20, gI: 0.0 },

    { Z: 11, sym: "Na", name: "Sodium", period: 3, group: 1, cat: "alkali-metal", A: 23, gI: 1.4784 },
    { Z: 12, sym: "Mg", name: "Magnesium", period: 3, group: 2, cat: "alkaline-earth", A: 24, gI: 0.0 },
    { Z: 13, sym: "Al", name: "Aluminium", period: 3, group: 13, cat: "post-transition", A: 27, gI: 1.4566 },
    { Z: 14, sym: "Si", name: "Silicon", period: 3, group: 14, cat: "metalloid", A: 28, gI: 0.0 },
    { Z: 15, sym: "P", name: "Phosphorus", period: 3, group: 15, cat: "reactive-nonmetal", A: 31, gI: 2.2632 },
    { Z: 16, sym: "S", name: "Sulfur", period: 3, group: 16, cat: "reactive-nonmetal", A: 32, gI: 0.0 },
    { Z: 17, sym: "Cl", name: "Chlorine", period: 3, group: 17, cat: "reactive-nonmetal", A: 35, gI: 0.5479 },
    { Z: 18, sym: "Ar", name: "Argon", period: 3, group: 18, cat: "noble-gas", A: 40, gI: 0.0 },

    { Z: 19, sym: "K", name: "Potassium", period: 4, group: 1, cat: "alkali-metal", A: 39, gI: 0.2610 },
    { Z: 20, sym: "Ca", name: "Calcium", period: 4, group: 2, cat: "alkaline-earth", A: 40, gI: 0.0 },
    { Z: 21, sym: "Sc", name: "Scandium", period: 4, group: 3, cat: "transition-metal", A: 45, gI: 1.3590 },
    { Z: 22, sym: "Ti", name: "Titanium", period: 4, group: 4, cat: "transition-metal", A: 48, gI: 0.0 },
    { Z: 23, sym: "V", name: "Vanadium", period: 4, group: 5, cat: "transition-metal", A: 51, gI: 1.4711 },
    { Z: 24, sym: "Cr", name: "Chromium", period: 4, group: 6, cat: "transition-metal", A: 52, gI: 0.0 },
    { Z: 25, sym: "Mn", name: "Manganese", period: 4, group: 7, cat: "transition-metal", A: 55, gI: 1.3822 },
    { Z: 26, sym: "Fe", name: "Iron", period: 4, group: 8, cat: "transition-metal", A: 56, gI: 0.0 },
    { Z: 27, sym: "Co", name: "Cobalt", period: 4, group: 9, cat: "transition-metal", A: 59, gI: 1.3220 },
    { Z: 28, sym: "Ni", name: "Nickel", period: 4, group: 10, cat: "transition-metal", A: 59, gI: 0.0 },
    { Z: 29, sym: "Cu", name: "Copper", period: 4, group: 11, cat: "transition-metal", A: 63, gI: 1.4840 },
    { Z: 30, sym: "Zn", name: "Zinc", period: 4, group: 12, cat: "transition-metal", A: 65, gI: 0.0 },
    { Z: 31, sym: "Ga", name: "Gallium", period: 4, group: 13, cat: "post-transition", A: 69, gI: 1.3444 },
    { Z: 32, sym: "Ge", name: "Germanium", period: 4, group: 14, cat: "metalloid", A: 73, gI: -0.1920 },
    { Z: 33, sym: "As", name: "Arsenic", period: 4, group: 15, cat: "metalloid", A: 75, gI: 0.9596 },
    { Z: 34, sym: "Se", name: "Selenium", period: 4, group: 16, cat: "reactive-nonmetal", A: 79, gI: 0.0 },
    { Z: 35, sym: "Br", name: "Bromine", period: 4, group: 17, cat: "reactive-nonmetal", A: 80, gI: 1.3538 },
    { Z: 36, sym: "Kr", name: "Krypton", period: 4, group: 18, cat: "noble-gas", A: 84, gI: 0.0 },

    { Z: 37, sym: "Rb", name: "Rubidium", period: 5, group: 1, cat: "alkali-metal", A: 85, gI: 0.5412 },
    { Z: 38, sym: "Sr", name: "Strontium", period: 5, group: 2, cat: "alkaline-earth", A: 88, gI: 0.0 },
    { Z: 39, sym: "Y", name: "Yttrium", period: 5, group: 3, cat: "transition-metal", A: 89, gI: -0.2748 },
    { Z: 40, sym: "Zr", name: "Zirconium", period: 5, group: 4, cat: "transition-metal", A: 91, gI: -0.5210 },
    { Z: 41, sym: "Nb", name: "Niobium", period: 5, group: 5, cat: "transition-metal", A: 93, gI: 1.3707 },
    { Z: 42, sym: "Mo", name: "Molybdenum", period: 5, group: 6, cat: "transition-metal", A: 96, gI: 0.0 },
    { Z: 43, sym: "Tc", name: "Technetium", period: 5, group: 7, cat: "transition-metal", A: 98, gI: 1.2800 },
    { Z: 44, sym: "Ru", name: "Ruthenium", period: 5, group: 8, cat: "transition-metal", A: 101, gI: -0.2100 },
    { Z: 45, sym: "Rh", name: "Rhodium", period: 5, group: 9, cat: "transition-metal", A: 103, gI: -0.1768 },
    { Z: 46, sym: "Pd", name: "Palladium", period: 5, group: 10, cat: "transition-metal", A: 106, gI: 0.0 },
    { Z: 47, sym: "Ag", name: "Silver", period: 5, group: 11, cat: "transition-metal", A: 108, gI: -0.2270 },
    { Z: 48, sym: "Cd", name: "Cadmium", period: 5, group: 12, cat: "transition-metal", A: 112, gI: 0.0 },
    { Z: 49, sym: "In", name: "Indium", period: 5, group: 13, cat: "post-transition", A: 115, gI: 1.2370 },
    { Z: 50, sym: "Sn", name: "Tin", period: 5, group: 14, cat: "post-transition", A: 119, gI: -1.0490 },
    { Z: 51, sym: "Sb", name: "Antimony", period: 5, group: 15, cat: "metalloid", A: 122, gI: 0.8920 },
    { Z: 52, sym: "Te", name: "Tellurium", period: 5, group: 16, cat: "metalloid", A: 128, gI: 0.0 },
    { Z: 53, sym: "I", name: "Iodine", period: 5, group: 17, cat: "reactive-nonmetal", A: 127, gI: 1.1230 },
    { Z: 54, sym: "Xe", name: "Xenon", period: 5, group: 18, cat: "noble-gas", A: 131, gI: 0.6918 },

    { Z: 55, sym: "Cs", name: "Caesium", period: 6, group: 1, cat: "alkali-metal", A: 133, gI: 0.7377 },
    { Z: 56, sym: "Ba", name: "Barium", period: 6, group: 2, cat: "alkaline-earth", A: 137, gI: 0.6220 },
    { Z: 57, sym: "La", name: "Lanthanum", period: 6, group: 3, cat: "lanthanide", A: 139, gI: 0.7950 },
    { Z: 58, sym: "Ce", name: "Cerium", period: 6, group: 3, cat: "lanthanide", A: 140, gI: 0.0 },
    { Z: 59, sym: "Pr", name: "Praseodymium", period: 6, group: 3, cat: "lanthanide", A: 141, gI: 1.7160 },
    { Z: 60, sym: "Nd", name: "Neodymium", period: 6, group: 3, cat: "lanthanide", A: 144, gI: 0.0 },
    { Z: 61, sym: "Pm", name: "Promethium", period: 6, group: 3, cat: "lanthanide", A: 145, gI: 0.8900 },
    { Z: 62, sym: "Sm", name: "Samarium", period: 6, group: 3, cat: "lanthanide", A: 150, gI: 0.0 },
    { Z: 63, sym: "Eu", name: "Europium", period: 6, group: 3, cat: "lanthanide", A: 152, gI: 1.3880 },
    { Z: 64, sym: "Gd", name: "Gadolinium", period: 6, group: 3, cat: "lanthanide", A: 157, gI: -0.2260 },
    { Z: 65, sym: "Tb", name: "Terbium", period: 6, group: 3, cat: "lanthanide", A: 159, gI: 1.3320 },
    { Z: 66, sym: "Dy", name: "Dysprosium", period: 6, group: 3, cat: "lanthanide", A: 163, gI: -0.1900 },
    { Z: 67, sym: "Ho", name: "Holmium", period: 6, group: 3, cat: "lanthanide", A: 165, gI: 1.1850 },
    { Z: 68, sym: "Er", name: "Erbium", period: 6, group: 3, cat: "lanthanide", A: 167, gI: -0.1618 },
    { Z: 69, sym: "Tm", name: "Thulium", period: 6, group: 3, cat: "lanthanide", A: 169, gI: -0.4620 },
    { Z: 70, sym: "Yb", name: "Ytterbium", period: 6, group: 3, cat: "lanthanide", A: 173, gI: -0.3154 },
    { Z: 71, sym: "Lu", name: "Lutetium", period: 6, group: 3, cat: "lanthanide", A: 175, gI: 0.6380 },
    { Z: 72, sym: "Hf", name: "Hafnium", period: 6, group: 4, cat: "transition-metal", A: 178, gI: 0.0 },
    { Z: 73, sym: "Ta", name: "Tantalum", period: 6, group: 5, cat: "transition-metal", A: 181, gI: 0.6770 },
    { Z: 74, sym: "W", name: "Tungsten", period: 6, group: 6, cat: "transition-metal", A: 184, gI: 0.0 },
    { Z: 75, sym: "Re", name: "Rhenium", period: 6, group: 7, cat: "transition-metal", A: 186, gI: 1.2750 },
    { Z: 76, sym: "Os", name: "Osmium", period: 6, group: 8, cat: "transition-metal", A: 190, gI: 0.0 },
    { Z: 77, sym: "Ir", name: "Iridium", period: 6, group: 9, cat: "transition-metal", A: 192, gI: 0.1060 },
    { Z: 78, sym: "Pt", name: "Platinum", period: 6, group: 10, cat: "transition-metal", A: 195, gI: 1.2190 },
    { Z: 79, sym: "Au", name: "Gold", period: 6, group: 11, cat: "transition-metal", A: 197, gI: 0.0971 },
    { Z: 80, sym: "Hg", name: "Mercury", period: 6, group: 12, cat: "transition-metal", A: 201, gI: -0.5602 },
    { Z: 81, sym: "Tl", name: "Thallium", period: 6, group: 13, cat: "post-transition", A: 204, gI: 3.2430 },
    { Z: 82, sym: "Pb", name: "Lead", period: 6, group: 14, cat: "post-transition", A: 207, gI: 1.1718 },
    { Z: 83, sym: "Bi", name: "Bismuth", period: 6, group: 15, cat: "post-transition", A: 209, gI: 0.9135 },
    { Z: 84, sym: "Po", name: "Polonium", period: 6, group: 16, cat: "post-transition", A: 209, gI: 0.0 },
    { Z: 85, sym: "At", name: "Astatine", period: 6, group: 17, cat: "metalloid", A: 210, gI: 0.0 },
    { Z: 86, sym: "Rn", name: "Radon", period: 6, group: 18, cat: "noble-gas", A: 222, gI: 0.0 },

    { Z: 87, sym: "Fr", name: "Francium", period: 7, group: 1, cat: "alkali-metal", A: 223, gI: 0.8000 },
    { Z: 88, sym: "Ra", name: "Radium", period: 7, group: 2, cat: "alkaline-earth", A: 226, gI: 0.0 },
    { Z: 89, sym: "Ac", name: "Actinium", period: 7, group: 3, cat: "actinide", A: 227, gI: 1.1100 },
    { Z: 90, sym: "Th", name: "Thorium", period: 7, group: 3, cat: "actinide", A: 232, gI: 0.0 },
    { Z: 91, sym: "Pa", name: "Protactinium", period: 7, group: 3, cat: "actinide", A: 231, gI: 1.3400 },
    { Z: 92, sym: "U", name: "Uranium", period: 7, group: 3, cat: "actinide", A: 238, gI: 0.0 },
    { Z: 93, sym: "Np", name: "Neptunium", period: 7, group: 3, cat: "actinide", A: 237, gI: 1.2500 },
    { Z: 94, sym: "Pu", name: "Plutonium", period: 7, group: 3, cat: "actinide", A: 244, gI: 0.0 },
    { Z: 95, sym: "Am", name: "Americium", period: 7, group: 3, cat: "actinide", A: 243, gI: 0.6100 },
    { Z: 96, sym: "Cm", name: "Curium", period: 7, group: 3, cat: "actinide", A: 247, gI: 0.0 },
    { Z: 97, sym: "Bk", name: "Berkelium", period: 7, group: 3, cat: "actinide", A: 247, gI: 0.9800 },
    { Z: 98, sym: "Cf", name: "Californium", period: 7, group: 3, cat: "actinide", A: 251, gI: -0.3500 },
    { Z: 99, sym: "Es", name: "Einsteinium", period: 7, group: 3, cat: "actinide", A: 252, gI: 1.2000 },
    { Z: 100, sym: "Fm", name: "Fermium", period: 7, group: 3, cat: "actinide", A: 257, gI: 0.0 },
    { Z: 101, sym: "Md", name: "Mendelevium", period: 7, group: 3, cat: "actinide", A: 258, gI: 0.0 },
    { Z: 102, sym: "No", name: "Nobelium", period: 7, group: 3, cat: "actinide", A: 259, gI: 0.0 },
    { Z: 103, sym: "Lr", name: "Lawrencium", period: 7, group: 3, cat: "actinide", A: 266, gI: 0.0 },
    { Z: 104, sym: "Rf", name: "Rutherfordium", period: 7, group: 4, cat: "transition-metal", A: 267, gI: 0.0 },
    { Z: 105, sym: "Db", name: "Dubnium", period: 7, group: 5, cat: "transition-metal", A: 268, gI: 0.0 },
    { Z: 106, sym: "Sg", name: "Seaborgium", period: 7, group: 6, cat: "transition-metal", A: 269, gI: 0.0 },
    { Z: 107, sym: "Bh", name: "Bohrium", period: 7, group: 7, cat: "transition-metal", A: 270, gI: 0.0 },
    { Z: 108, sym: "Hs", name: "Hassium", period: 7, group: 8, cat: "transition-metal", A: 277, gI: 0.0 },
    { Z: 109, sym: "Mt", name: "Meitnerium", period: 7, group: 9, cat: "transition-metal", A: 278, gI: 0.0 },
    { Z: 110, sym: "Ds", name: "Darmstadtium", period: 7, group: 10, cat: "transition-metal", A: 281, gI: 0.0 },
    { Z: 111, sym: "Rg", name: "Roentgenium", period: 7, group: 11, cat: "transition-metal", A: 282, gI: 0.0 },
    { Z: 112, sym: "Cn", name: "Copernicium", period: 7, group: 12, cat: "transition-metal", A: 285, gI: 0.0 },
    { Z: 113, sym: "Nh", name: "Nihonium", period: 7, group: 13, cat: "post-transition", A: 286, gI: 0.0 },
    { Z: 114, sym: "Fl", name: "Flerovium", period: 7, group: 14, cat: "post-transition", A: 289, gI: 0.0 },
    { Z: 115, sym: "Mc", name: "Moscovium", period: 7, group: 15, cat: "post-transition", A: 290, gI: 0.0 },
    { Z: 116, sym: "Lv", name: "Livermorium", period: 7, group: 16, cat: "post-transition", A: 293, gI: 0.0 },
    { Z: 117, sym: "Ts", name: "Tennessine", period: 7, group: 17, cat: "post-transition", A: 294, gI: 0.0 },
    { Z: 118, sym: "Og", name: "Oganesson", period: 7, group: 18, cat: "noble-gas", A: 294, gI: 0.0 }
];

/**
 * Gets element metadata by atomic number Z; defaults gI to DEFAULT_GI for Z > 118 or unknown elements.
 */
function getElementData(Z) {
    if (Z > 118 || Z < 1) {
        return { Z: Z, sym: "Unk", name: "Unknown", period: 0, group: 0, cat: "unknown", A: 0, gI: DEFAULT_GI };
    }
    const elem = ELEMENTS_DATA.find(e => e.Z === Z);
    return elem || { Z: Z, sym: "Unk", name: "Unknown", period: 0, group: 0, cat: "unknown", A: 0, gI: DEFAULT_GI };
}

/**
 * Calculates total electron spin quantum number S based on ground-state subshell occupations (Hund's Rule).
 */
function calculateTotalSpinS(Z) {
    const config = HARDCODED_ELECTRON_CONFIGS[Z] || HARDCODED_ELECTRON_CONFIGS[1];
    const subCapacities = { s: 2, p: 6, d: 10, f: 14 };
    let totalS = 0;

    for (const [subshell, count] of Object.entries(config)) {
        const type = subshell[1];
        const capacity = subCapacities[type] || 2;
        const halfCap = capacity / 2;

        const unpaired = (count <= halfCap) ? count : (capacity - count);
        totalS += unpaired * 0.5;
    }

    return totalS;
}

/**
 * Calculates internal radial electric field (in V/m) at radius r (in Angstroms) using effective nuclear charge Z_eff.
 */
function calculateElectricFieldVperM(Z, rAngstrom) {
    if (rAngstrom <= 0) return 0;

    const elem = getElementData(Z);
    const configData = getElectronConfigForZ(elem.Z);

    let totalElec = 0;
    for (const count of Object.values(configData.subConfig)) {
        totalElec += count;
    }

    const shieldingS = Math.max(0, totalElec - 1) * 0.85;
    const zEff = Math.max(1.0, elem.Z - shieldingS);

    const rMeters = rAngstrom * 1e-10;
    const coulombConst = 8.9875517923e9;
    const elemCharge = 1.602176634e-19;

    return (coulombConst * zEff * elemCharge) / (rMeters * rMeters);
}

/**
 * Hardcoded Ground-State Subshell Electron Counts (Z = 1 to 118)
 */
const HARDCODED_ELECTRON_CONFIGS = {
    1:  { "1s": 1 },
    2:  { "1s": 2 },
    3:  { "1s": 2, "2s": 1 },
    4:  { "1s": 2, "2s": 2 },
    5:  { "1s": 2, "2s": 2, "2p": 1 },
    6:  { "1s": 2, "2s": 2, "2p": 2 },
    7:  { "1s": 2, "2s": 2, "2p": 3 },
    8:  { "1s": 2, "2s": 2, "2p": 4 },
    9:  { "1s": 2, "2s": 2, "2p": 5 },
    10: { "1s": 2, "2s": 2, "2p": 6 },

    11: { "1s": 2, "2s": 2, "2p": 6, "3s": 1 },
    12: { "1s": 2, "2s": 2, "2p": 6, "3s": 2 },
    13: { "1s": 2, "2s": 2, "2p": 6, "3s": 2, "3p": 1 },
    14: { "1s": 2, "2s": 2, "2p": 6, "3s": 2, "3p": 2 },
    15: { "1s": 2, "2s": 2, "2p": 6, "3s": 2, "3p": 3 },
    16: { "1s": 2, "2s": 2, "2p": 6, "3s": 2, "3p": 4 },
    17: { "1s": 2, "2s": 2, "2p": 6, "3s": 2, "3p": 5 },
    18: { "1s": 2, "2s": 2, "2p": 6, "3s": 2, "3p": 6 },

    19: { "1s": 2, "2s": 2, "2p": 6, "3s": 2, "3p": 6, "4s": 1 },
    20: { "1s": 2, "2s": 2, "2p": 6, "3s": 2, "3p": 6, "4s": 2 },
    21: { "1s": 2, "2s": 2, "2p": 6, "3s": 2, "3p": 6, "3d": 1, "4s": 2 },
    22: { "1s": 2, "2s": 2, "2p": 6, "3s": 2, "3p": 6, "3d": 2, "4s": 2 },
    23: { "1s": 2, "2s": 2, "2p": 6, "3s": 2, "3p": 6, "3d": 3, "4s": 2 },
    24: { "1s": 2, "2s": 2, "2p": 6, "3s": 2, "3p": 6, "3d": 5, "4s": 1 },
    25: { "1s": 2, "2s": 2, "2p": 6, "3s": 2, "3p": 6, "3d": 5, "4s": 2 },
    26: { "1s": 2, "2s": 2, "2p": 6, "3s": 2, "3p": 6, "3d": 6, "4s": 2 },
    27: { "1s": 2, "2s": 2, "2p": 6, "3s": 2, "3p": 6, "3d": 7, "4s": 2 },
    28: { "1s": 2, "2s": 2, "2p": 6, "3s": 2, "3p": 6, "3d": 8, "4s": 2 },
    29: { "1s": 2, "2s": 2, "2p": 6, "3s": 2, "3p": 6, "3d": 10, "4s": 1 },
    30: { "1s": 2, "2s": 2, "2p": 6, "3s": 2, "3p": 6, "3d": 10, "4s": 2 },
    31: { "1s": 2, "2s": 2, "2p": 6, "3s": 2, "3p": 6, "3d": 10, "4s": 2, "4p": 1 },
    32: { "1s": 2, "2s": 2, "2p": 6, "3s": 2, "3p": 6, "3d": 10, "4s": 2, "4p": 2 },
    33: { "1s": 2, "2s": 2, "2p": 6, "3s": 2, "3p": 6, "3d": 10, "4s": 2, "4p": 3 },
    34: { "1s": 2, "2s": 2, "2p": 6, "3s": 2, "3p": 6, "3d": 10, "4s": 2, "4p": 4 },
    35: { "1s": 2, "2s": 2, "2p": 6, "3s": 2, "3p": 6, "3d": 10, "4s": 2, "4p": 5 },
    36: { "1s": 2, "2s": 2, "2p": 6, "3s": 2, "3p": 6, "3d": 10, "4s": 2, "4p": 6 },

    37: { "1s": 2, "2s": 2, "2p": 6, "3s": 2, "3p": 6, "3d": 10, "4s": 2, "4p": 6, "5s": 1 },
    38: { "1s": 2, "2s": 2, "2p": 6, "3s": 2, "3p": 6, "3d": 10, "4s": 2, "4p": 6, "5s": 2 },
    39: { "1s": 2, "2s": 2, "2p": 6, "3s": 2, "3p": 6, "3d": 10, "4s": 2, "4p": 6, "4d": 1, "5s": 2 },
    40: { "1s": 2, "2s": 2, "2p": 6, "3s": 2, "3p": 6, "3d": 10, "4s": 2, "4p": 6, "4d": 2, "5s": 2 },
    41: { "1s": 2, "2s": 2, "2p": 6, "3s": 2, "3p": 6, "3d": 10, "4s": 2, "4p": 6, "4d": 4, "5s": 1 },
    42: { "1s": 2, "2s": 2, "2p": 6, "3s": 2, "3p": 6, "3d": 10, "4s": 2, "4p": 6, "4d": 5, "5s": 1 },
    43: { "1s": 2, "2s": 2, "2p": 6, "3s": 2, "3p": 6, "3d": 10, "4s": 2, "4p": 6, "4d": 5, "5s": 2 },
    44: { "1s": 2, "2s": 2, "2p": 6, "3s": 2, "3p": 6, "3d": 10, "4s": 2, "4p": 6, "4d": 7, "5s": 1 },
    45: { "1s": 2, "2s": 2, "2p": 6, "3s": 2, "3p": 6, "3d": 10, "4s": 2, "4p": 6, "4d": 8, "5s": 1 },
    46: { "1s": 2, "2s": 2, "2p": 6, "3s": 2, "3p": 6, "3d": 10, "4s": 2, "4p": 6, "4d": 10 },
    47: { "1s": 2, "2s": 2, "2p": 6, "3s": 2, "3p": 6, "3d": 10, "4s": 2, "4p": 6, "4d": 10, "5s": 1 },
    48: { "1s": 2, "2s": 2, "2p": 6, "3s": 2, "3p": 6, "3d": 10, "4s": 2, "4p": 6, "4d": 10, "5s": 2 },
    49: { "1s": 2, "2s": 2, "2p": 6, "3s": 2, "3p": 6, "3d": 10, "4s": 2, "4p": 6, "4d": 10, "5s": 2, "5p": 1 },
    50: { "1s": 2, "2s": 2, "2p": 6, "3s": 2, "3p": 6, "3d": 10, "4s": 2, "4p": 6, "4d": 10, "5s": 2, "5p": 2 },
    51: { "1s": 2, "2s": 2, "2p": 6, "3s": 2, "3p": 6, "3d": 10, "4s": 2, "4p": 6, "4d": 10, "5s": 2, "5p": 3 },
    52: { "1s": 2, "2s": 2, "2p": 6, "3s": 2, "3p": 6, "3d": 10, "4s": 2, "4p": 6, "4d": 10, "5s": 2, "5p": 4 },
    53: { "1s": 2, "2s": 2, "2p": 6, "3s": 2, "3p": 6, "3d": 10, "4s": 2, "4p": 6, "4d": 10, "5s": 2, "5p": 5 },
    54: { "1s": 2, "2s": 2, "2p": 6, "3s": 2, "3p": 6, "3d": 10, "4s": 2, "4p": 6, "4d": 10, "5s": 2, "5p": 6 },

    55: { "1s": 2, "2s": 2, "2p": 6, "3s": 2, "3p": 6, "3d": 10, "4s": 2, "4p": 6, "4d": 10, "5s": 2, "5p": 6, "6s": 1 },
    56: { "1s": 2, "2s": 2, "2p": 6, "3s": 2, "3p": 6, "3d": 10, "4s": 2, "4p": 6, "4d": 10, "5s": 2, "5p": 6, "6s": 2 },
    57: { "1s": 2, "2s": 2, "2p": 6, "3s": 2, "3p": 6, "3d": 10, "4s": 2, "4p": 6, "4d": 10, "5s": 2, "5p": 6, "5d": 1, "6s": 2 },
    58: { "1s": 2, "2s": 2, "2p": 6, "3s": 2, "3p": 6, "3d": 10, "4s": 2, "4p": 6, "4d": 10, "4f": 1, "5s": 2, "5p": 6, "5d": 1, "6s": 2 },
    59: { "1s": 2, "2s": 2, "2p": 6, "3s": 2, "3p": 6, "3d": 10, "4s": 2, "4p": 6, "4d": 10, "4f": 3, "5s": 2, "5p": 6, "6s": 2 },
    60: { "1s": 2, "2s": 2, "2p": 6, "3s": 2, "3p": 6, "3d": 10, "4s": 2, "4p": 6, "4d": 10, "4f": 4, "5s": 2, "5p": 6, "6s": 2 },
    61: { "1s": 2, "2s": 2, "2p": 6, "3s": 2, "3p": 6, "3d": 10, "4s": 2, "4p": 6, "4d": 10, "4f": 5, "5s": 2, "5p": 6, "6s": 2 },
    62: { "1s": 2, "2s": 2, "2p": 6, "3s": 2, "3p": 6, "3d": 10, "4s": 2, "4p": 6, "4d": 10, "4f": 6, "5s": 2, "5p": 6, "6s": 2 },
    63: { "1s": 2, "2s": 2, "2p": 6, "3s": 2, "3p": 6, "3d": 10, "4s": 2, "4p": 6, "4d": 10, "4f": 7, "5s": 2, "5p": 6, "6s": 2 },
    64: { "1s": 2, "2s": 2, "2p": 6, "3s": 2, "3p": 6, "3d": 10, "4s": 2, "4p": 6, "4d": 10, "4f": 7, "5s": 2, "5p": 6, "5d": 1, "6s": 2 },
    65: { "1s": 2, "2s": 2, "2p": 6, "3s": 2, "3p": 6, "3d": 10, "4s": 2, "4p": 6, "4d": 10, "4f": 9, "5s": 2, "5p": 6, "6s": 2 },
    66: { "1s": 2, "2s": 2, "2p": 6, "3s": 2, "3p": 6, "3d": 10, "4s": 2, "4p": 6, "4d": 10, "4f": 10, "5s": 2, "5p": 6, "6s": 2 },
    67: { "1s": 2, "2s": 2, "2p": 6, "3s": 2, "3p": 6, "3d": 10, "4s": 2, "4p": 6, "4d": 10, "4f": 11, "5s": 2, "5p": 6, "6s": 2 },
    68: { "1s": 2, "2s": 2, "2p": 6, "3s": 2, "3p": 6, "3d": 10, "4s": 2, "4p": 6, "4d": 10, "4f": 12, "5s": 2, "5p": 6, "6s": 2 },
    69: { "1s": 2, "2s": 2, "2p": 6, "3s": 2, "3p": 6, "3d": 10, "4s": 2, "4p": 6, "4d": 10, "4f": 13, "5s": 2, "5p": 6, "6s": 2 },
    70: { "1s": 2, "2s": 2, "2p": 6, "3s": 2, "3p": 6, "3d": 10, "4s": 2, "4p": 6, "4d": 10, "4f": 14, "5s": 2, "5p": 6, "6s": 2 },
    71: { "1s": 2, "2s": 2, "2p": 6, "3s": 2, "3p": 6, "3d": 10, "4s": 2, "4p": 6, "4d": 10, "4f": 14, "5s": 2, "5p": 6, "5d": 1, "6s": 2 },
    72: { "1s": 2, "2s": 2, "2p": 6, "3s": 2, "3p": 6, "3d": 10, "4s": 2, "4p": 6, "4d": 10, "4f": 14, "5s": 2, "5p": 6, "5d": 2, "6s": 2 },
    73: { "1s": 2, "2s": 2, "2p": 6, "3s": 2, "3p": 6, "3d": 10, "4s": 2, "4p": 6, "4d": 10, "4f": 14, "5s": 2, "5p": 6, "5d": 3, "6s": 2 },
    74: { "1s": 2, "2s": 2, "2p": 6, "3s": 2, "3p": 6, "3d": 10, "4s": 2, "4p": 6, "4d": 10, "4f": 14, "5s": 2, "5p": 6, "5d": 4, "6s": 2 },
    75: { "1s": 2, "2s": 2, "2p": 6, "3s": 2, "3p": 6, "3d": 10, "4s": 2, "4p": 6, "4d": 10, "4f": 14, "5s": 2, "5p": 6, "5d": 5, "6s": 2 },
    76: { "1s": 2, "2s": 2, "2p": 6, "3s": 2, "3p": 6, "3d": 10, "4s": 2, "4p": 6, "4d": 10, "4f": 14, "5s": 2, "5p": 6, "5d": 6, "6s": 2 },
    77: { "1s": 2, "2s": 2, "2p": 6, "3s": 2, "3p": 6, "3d": 10, "4s": 2, "4p": 6, "4d": 10, "4f": 14, "5s": 2, "5p": 6, "5d": 7, "6s": 2 },
    78: { "1s": 2, "2s": 2, "2p": 6, "3s": 2, "3p": 6, "3d": 10, "4s": 2, "4p": 6, "4d": 10, "4f": 14, "5s": 2, "5p": 6, "5d": 9, "6s": 1 },
    79: { "1s": 2, "2s": 2, "2p": 6, "3s": 2, "3p": 6, "3d": 10, "4s": 2, "4p": 6, "4d": 10, "4f": 14, "5s": 2, "5p": 6, "5d": 10, "6s": 1 },
    80: { "1s": 2, "2s": 2, "2p": 6, "3s": 2, "3p": 6, "3d": 10, "4s": 2, "4p": 6, "4d": 10, "4f": 14, "5s": 2, "5p": 6, "5d": 10, "6s": 2 },
    81: { "1s": 2, "2s": 2, "2p": 6, "3s": 2, "3p": 6, "3d": 10, "4s": 2, "4p": 6, "4d": 10, "4f": 14, "5s": 2, "5p": 6, "5d": 10, "6s": 2, "6p": 1 },
    82: { "1s": 2, "2s": 2, "2p": 6, "3s": 2, "3p": 6, "3d": 10, "4s": 2, "4p": 6, "4d": 10, "4f": 14, "5s": 2, "5p": 6, "5d": 10, "6s": 2, "6p": 2 },
    83: { "1s": 2, "2s": 2, "2p": 6, "3s": 2, "3p": 6, "3d": 10, "4s": 2, "4p": 6, "4d": 10, "4f": 14, "5s": 2, "5p": 6, "5d": 10, "6s": 2, "6p": 3 },
    84: { "1s": 2, "2s": 2, "2p": 6, "3s": 2, "3p": 6, "3d": 10, "4s": 2, "4p": 6, "4d": 10, "4f": 14, "5s": 2, "5p": 6, "5d": 10, "6s": 2, "6p": 4 },
    85: { "1s": 2, "2s": 2, "2p": 6, "3s": 2, "3p": 6, "3d": 10, "4s": 2, "4p": 6, "4d": 10, "4f": 14, "5s": 2, "5p": 6, "5d": 10, "6s": 2, "6p": 5 },
    86: { "1s": 2, "2s": 2, "2p": 6, "3s": 2, "3p": 6, "3d": 10, "4s": 2, "4p": 6, "4d": 10, "4f": 14, "5s": 2, "5p": 6, "5d": 10, "6s": 2, "6p": 6 },

    87: { "1s": 2, "2s": 2, "2p": 6, "3s": 2, "3p": 6, "3d": 10, "4s": 2, "4p": 6, "4d": 10, "4f": 14, "5s": 2, "5p": 6, "5d": 10, "6s": 2, "6p": 6, "7s": 1 },
    88: { "1s": 2, "2s": 2, "2p": 6, "3s": 2, "3p": 6, "3d": 10, "4s": 2, "4p": 6, "4d": 10, "4f": 14, "5s": 2, "5p": 6, "5d": 10, "6s": 2, "6p": 6, "7s": 2 },
    89: { "1s": 2, "2s": 2, "2p": 6, "3s": 2, "3p": 6, "3d": 10, "4s": 2, "4p": 6, "4d": 10, "4f": 14, "5s": 2, "5p": 6, "5d": 10, "6s": 2, "6p": 6, "6d": 1, "7s": 2 },
    90: { "1s": 2, "2s": 2, "2p": 6, "3s": 2, "3p": 6, "3d": 10, "4s": 2, "4p": 6, "4d": 10, "4f": 14, "5s": 2, "5p": 6, "5d": 10, "6s": 2, "6p": 6, "6d": 2, "7s": 2 },
    91: { "1s": 2, "2s": 2, "2p": 6, "3s": 2, "3p": 6, "3d": 10, "4s": 2, "4p": 6, "4d": 10, "4f": 14, "5s": 2, "5p": 6, "5d": 10, "5f": 2, "6s": 2, "6p": 6, "6d": 1, "7s": 2 },
    92: { "1s": 2, "2s": 2, "2p": 6, "3s": 2, "3p": 6, "3d": 10, "4s": 2, "4p": 6, "4d": 10, "4f": 14, "5s": 2, "5p": 6, "5d": 10, "5f": 3, "6s": 2, "6p": 6, "6d": 1, "7s": 2 },
    93: { "1s": 2, "2s": 2, "2p": 6, "3s": 2, "3p": 6, "3d": 10, "4s": 2, "4p": 6, "4d": 10, "4f": 14, "5s": 2, "5p": 6, "5d": 10, "5f": 4, "6s": 2, "6p": 6, "6d": 1, "7s": 2 },
    94: { "1s": 2, "2s": 2, "2p": 6, "3s": 2, "3p": 6, "3d": 10, "4s": 2, "4p": 6, "4d": 10, "4f": 14, "5s": 2, "5p": 6, "5d": 10, "5f": 6, "6s": 2, "6p": 6, "7s": 2 },
    95: { "1s": 2, "2s": 2, "2p": 6, "3s": 2, "3p": 6, "3d": 10, "4s": 2, "4p": 6, "4d": 10, "4f": 14, "5s": 2, "5p": 6, "5d": 10, "5f": 7, "6s": 2, "6p": 6, "7s": 2 },
    96: { "1s": 2, "2s": 2, "2p": 6, "3s": 2, "3p": 6, "3d": 10, "4s": 2, "4p": 6, "4d": 10, "4f": 14, "5s": 2, "5p": 6, "5d": 10, "5f": 7, "6s": 2, "6p": 6, "6d": 1, "7s": 2 },
    97: { "1s": 2, "2s": 2, "2p": 6, "3s": 2, "3p": 6, "3d": 10, "4s": 2, "4p": 6, "4d": 10, "4f": 14, "5s": 2, "5p": 6, "5d": 10, "5f": 9, "6s": 2, "6p": 6, "7s": 2 },
    98: { "1s": 2, "2s": 2, "2p": 6, "3s": 2, "3p": 6, "3d": 10, "4s": 2, "4p": 6, "4d": 10, "4f": 14, "5s": 2, "5p": 6, "5d": 10, "5f": 10, "6s": 2, "6p": 6, "7s": 2 },
    99: { "1s": 2, "2s": 2, "2p": 6, "3s": 2, "3p": 6, "3d": 10, "4s": 2, "4p": 6, "4d": 10, "4f": 14, "5s": 2, "5p": 6, "5d": 10, "5f": 11, "6s": 2, "6p": 6, "7s": 2 },
    100:{ "1s": 2, "2s": 2, "2p": 6, "3s": 2, "3p": 6, "3d": 10, "4s": 2, "4p": 6, "4d": 10, "4f": 14, "5s": 2, "5p": 6, "5d": 10, "5f": 12, "6s": 2, "6p": 6, "7s": 2 },
    101:{ "1s": 2, "2s": 2, "2p": 6, "3s": 2, "3p": 6, "3d": 10, "4s": 2, "4p": 6, "4d": 10, "4f": 14, "5s": 2, "5p": 6, "5d": 10, "5f": 13, "6s": 2, "6p": 6, "7s": 2 },
    102:{ "1s": 2, "2s": 2, "2p": 6, "3s": 2, "3p": 6, "3d": 10, "4s": 2, "4p": 6, "4d": 10, "4f": 14, "5s": 2, "5p": 6, "5d": 10, "5f": 14, "6s": 2, "6p": 6, "7s": 2 },
    103:{ "1s": 2, "2s": 2, "2p": 6, "3s": 2, "3p": 6, "3d": 10, "4s": 2, "4p": 6, "4d": 10, "4f": 14, "5s": 2, "5p": 6, "5d": 10, "5f": 14, "6s": 2, "6p": 6, "7s": 2, "7p": 1 },
    104:{ "1s": 2, "2s": 2, "2p": 6, "3s": 2, "3p": 6, "3d": 10, "4s": 2, "4p": 6, "4d": 10, "4f": 14, "5s": 2, "5p": 6, "5d": 10, "5f": 14, "6s": 2, "6p": 6, "6d": 2, "7s": 2 },
    105:{ "1s": 2, "2s": 2, "2p": 6, "3s": 2, "3p": 6, "3d": 10, "4s": 2, "4p": 6, "4d": 10, "4f": 14, "5s": 2, "5p": 6, "5d": 10, "5f": 14, "6s": 2, "6p": 6, "6d": 3, "7s": 2 },
    106:{ "1s": 2, "2s": 2, "2p": 6, "3s": 2, "3p": 6, "3d": 10, "4s": 2, "4p": 6, "4d": 10, "4f": 14, "5s": 2, "5p": 6, "5d": 10, "5f": 14, "6s": 2, "6p": 6, "6d": 4, "7s": 2 },
    107:{ "1s": 2, "2s": 2, "2p": 6, "3s": 2, "3p": 6, "3d": 10, "4s": 2, "4p": 6, "4d": 10, "4f": 14, "5s": 2, "5p": 6, "5d": 10, "5f": 14, "6s": 2, "6p": 6, "6d": 5, "7s": 2 },
    108:{ "1s": 2, "2s": 2, "2p": 6, "3s": 2, "3p": 6, "3d": 10, "4s": 2, "4p": 6, "4d": 10, "4f": 14, "5s": 2, "5p": 6, "5d": 10, "5f": 14, "6s": 2, "6p": 6, "6d": 6, "7s": 2 },
    109:{ "1s": 2, "2s": 2, "2p": 6, "3s": 2, "3p": 6, "3d": 10, "4s": 2, "4p": 6, "4d": 10, "4f": 14, "5s": 2, "5p": 6, "5d": 10, "5f": 14, "6s": 2, "6p": 6, "6d": 7, "7s": 2 },
    110:{ "1s": 2, "2s": 2, "2p": 6, "3s": 2, "3p": 6, "3d": 10, "4s": 2, "4p": 6, "4d": 10, "4f": 14, "5s": 2, "5p": 6, "5d": 10, "5f": 14, "6s": 2, "6p": 6, "6d": 8, "7s": 2 },
    111:{ "1s": 2, "2s": 2, "2p": 6, "3s": 2, "3p": 6, "3d": 10, "4s": 2, "4p": 6, "4d": 10, "4f": 14, "5s": 2, "5p": 6, "5d": 10, "5f": 14, "6s": 2, "6p": 6, "6d": 9, "7s": 2 },
    112:{ "1s": 2, "2s": 2, "2p": 6, "3s": 2, "3p": 6, "3d": 10, "4s": 2, "4p": 6, "4d": 10, "4f": 14, "5s": 2, "5p": 6, "5d": 10, "5f": 14, "6s": 2, "6p": 6, "6d": 10, "7s": 2 },
    113:{ "1s": 2, "2s": 2, "2p": 6, "3s": 2, "3p": 6, "3d": 10, "4s": 2, "4p": 6, "4d": 10, "4f": 14, "5s": 2, "5p": 6, "5d": 10, "5f": 14, "6s": 2, "6p": 6, "6d": 10, "7s": 2, "7p": 1 },
    114:{ "1s": 2, "2s": 2, "2p": 6, "3s": 2, "3p": 6, "3d": 10, "4s": 2, "4p": 6, "4d": 10, "4f": 14, "5s": 2, "5p": 6, "5d": 10, "5f": 14, "6s": 2, "6p": 6, "6d": 10, "7s": 2, "7p": 2 },
    115:{ "1s": 2, "2s": 2, "2p": 6, "3s": 2, "3p": 6, "3d": 10, "4s": 2, "4p": 6, "4d": 10, "4f": 14, "5s": 2, "5p": 6, "5d": 10, "5f": 14, "6s": 2, "6p": 6, "6d": 10, "7s": 2, "7p": 3 },
    116:{ "1s": 2, "2s": 2, "2p": 6, "3s": 2, "3p": 6, "3d": 10, "4s": 2, "4p": 6, "4d": 10, "4f": 14, "5s": 2, "5p": 6, "5d": 10, "5f": 14, "6s": 2, "6p": 6, "6d": 10, "7s": 2, "7p": 4 },
    117:{ "1s": 2, "2s": 2, "2p": 6, "3s": 2, "3p": 6, "3d": 10, "4s": 2, "4p": 6, "4d": 10, "4f": 14, "5s": 2, "5p": 6, "5d": 10, "5f": 14, "6s": 2, "6p": 6, "6d": 10, "7s": 2, "7p": 5 },
    118:{ "1s": 2, "2s": 2, "2p": 6, "3s": 2, "3p": 6, "3d": 10, "4s": 2, "4p": 6, "4d": 10, "4f": 14, "5s": 2, "5p": 6, "5d": 10, "5f": 14, "6s": 2, "6p": 6, "6d": 10, "7s": 2, "7p": 6 }
};

let selectedElementSymbol = 'Ne';

window.addEventListener('DOMContentLoaded', () => {
    initBabylonEngine();
    renderPeriodicTableGrid();
    selectElementBySymbol('Ne');
});

/**
 * Maps subshell ground state electron occupations to relativistic Dirac j-suborbitals.
 */
function getElectronConfigForZ(Z) {
    const counts = HARDCODED_ELECTRON_CONFIGS[Z] || HARDCODED_ELECTRON_CONFIGS[1];
    const subConfig = {};
    let maxN = 1;

    for (const [subshell, count] of Object.entries(counts)) {
        if (!count || count <= 0) continue;
        const n = parseInt(subshell[0]);
        const type = subshell[1];
        if (n > maxN) maxN = n;

        if (type === 's') {
            subConfig[`${n}s1/2`] = count;
        } else if (type === 'p') {
            subConfig[`${n}p1/2`] = Math.min(count, 2);
            if (count > 2) subConfig[`${n}p3/2`] = count - 2;
        } else if (type === 'd') {
            subConfig[`${n}d3/2`] = Math.min(count, 4);
            if (count > 4) subConfig[`${n}d5/2`] = count - 4;
        } else if (type === 'f') {
            subConfig[`${n}f5/2`] = Math.min(count, 6);
            if (count > 6) subConfig[`${n}f7/2`] = count - 6;
        }
    }

    return { subConfig, maxN };
}

/**
 * Builds standard 18-column Periodic Table with Lanthanides & Actinides
 */
function renderPeriodicTableGrid() {
    const container = document.getElementById('ptGridContainer');
    if (!container) return;

    container.innerHTML = '';

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

    ELEMENTS_DATA.forEach(elem => {
        let gridRow = elem.period;
        let gridCol = elem.group;

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

    for (let p = 1; p <= 7; p++) {
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

    const gapSpacer = document.createElement('div');
    gapSpacer.style.gridRow = 9;
    gapSpacer.style.gridColumn = '1 / span 19';
    gapSpacer.style.height = '12px';
    container.appendChild(gapSpacer);

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

/**
 * Cleanly switches elements and purges residual orbital input states.
 */
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

    generateOrbitsBuilder(false);

    document.querySelectorAll('.orbit-row').forEach(row => {
        const label = row.querySelector('.orbit-label').innerText;
        const eInput = row.querySelector('.e-input');
        const exInput = row.querySelector('.ex-input');

        exInput.value = '0';
        if (configData.subConfig[label] !== undefined) {
            eInput.value = configData.subConfig[label];
        } else {
            eInput.value = '';
        }
    });

    const tag = document.getElementById('selectedElementTag');
    if (tag) tag.innerText = `[Z = ${elem.Z} ${elem.name}]`;

    visibilityState = {};

    rebuildQuantumModel();
}

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

/**
 * Generates quantum orbit UI elements.
 */
function generateOrbitsBuilder(preserveExisting = true) {
    const maxN = parseInt(document.getElementById('inputMaxN').value) || 1;
    const container = document.getElementById('orbitsBuilderContainer');
    
    const existingElec = {};
    const existingEx = {};

    if (preserveExisting) {
        document.querySelectorAll('.orbit-row').forEach(row => {
            const key = row.dataset.key;
            existingElec[key] = row.querySelector('.e-input').value;
            existingEx[key] = row.querySelector('.ex-input').value;
        });
    }

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

                const exVal = (preserveExisting && existingEx[key] !== undefined) ? existingEx[key] : '0';
                const elecVal = (preserveExisting && existingElec[key] !== undefined) ? existingElec[key] : '';

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
    if (typeof DiracModule !== 'undefined' && typeof DiracModule._solveDiracExactEnergy === 'function') {
        return DiracModule._solveDiracExactEnergy(n, l, j, zEff);
    }

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
            let zEff = Math.max(1.0, Z - S);

            let energy = solveDiracExactEnergy(effectiveN, l, j, zEff);
            suborbitEnergies.push(`${row.querySelector('.orbit-label').innerText}: ${energy.toFixed(1)}eV`);
            cumElec += eCount;
        }
    });

    document.getElementById('inputEn').value = suborbitEnergies.join(', ');
}

function solveDiracRadialExpectationRK4(n, l, j, zEff) {
    if (typeof DiracModule !== 'undefined' && typeof DiracModule._solveDiracRadialExpectationRK4 === 'function') {
        return DiracModule._solveDiracRadialExpectationRK4(n, l, j, zEff);
    }

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
    let sat = 0.22;
    let val = (j > l) ? 0.95 : 0.70;
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
            let zEff = Math.max(1.0, Z - S);

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
    const segs = Math.min(14, 8 + n * 2);
    const sphere = BABYLON.MeshBuilder.CreateSphere(name, { diameter: radius * 2, segments: segs }, scene);
    const mat = new BABYLON.StandardMaterial(`${name}_mat`, scene);
    const col = getOrbitalColor(l, j);

    mat.pointsCloud = true;
    mat.pointSize = 6.0;
    mat.diffuseColor = col;
    mat.emissiveColor = col.scale(0.85);
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

    setupIndividualParticleFade();

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

/**
 * Stochastic Particle Fade System with Enhanced Luminance.
 * Applies boosted brightness and elevated white baseline to vertices during fade cycles.
 * [Synchronized with effects.js Idle Mode Theme Toggles]
 */
function setupIndividualParticleFade() {
    if (!scene) return;

    function initMeshAlphaColors() {
        activeMeshes.forEach(item => {
            const mesh = item.mesh;
            if (!mesh || mesh._vertexFadeData) return;

            if (mesh.material) {
                mesh.material.useVertexColors = true;
                mesh.material.hasVertexAlpha = true;
                mesh.material.transparencyMode = BABYLON.Material.MATERIAL_ALPHABLEND;
            }

            const positionData = mesh.getVerticesData(BABYLON.VertexBuffer.PositionKind);
            if (!positionData) return;

            const vertexCount = positionData.length / 3;
            const baseCol = mesh.material.diffuseColor || new BABYLON.Color3(1, 1, 1);

            let targetR, targetG, targetB, dimFactor;

            // =====================================================================
            // CONNECTS DYNAMIC THEME STATES TO VERTEX BUFFER COLOR INTERPOLATION
            // =====================================================================
            if (window.isRedFilterActive) {
                // 1. Idle Red Filter Mode: Override to deep, low-key crimson quantum cloud
                targetR = 0.0275;
                targetG = 0.0;
                targetB = 0.0085;
                dimFactor = 10.25;
            } else {
                // 2. Interactive Neutral Mode: Restore uniform stark white mix 
                const whiteBlendRatio = 0.8;
                targetR = baseCol.r * (1 - whiteBlendRatio) + 1.0 * whiteBlendRatio;
                targetG = baseCol.g * (1 - whiteBlendRatio) + 1.0 * whiteBlendRatio;
                targetB = baseCol.b * (1 - whiteBlendRatio) + 1.0 * whiteBlendRatio;
                dimFactor = 0.465; // Original design dim factor rendering as high-end dark gray
            }

            const colors = new Float32Array(vertexCount * 4);
            const fadeStates = new Uint8Array(vertexCount);
            const holdTimers = new Int32Array(vertexCount);

            for (let i = 0; i < vertexCount; i++) {
                colors[i * 4] = Math.min(1.0, targetR * dimFactor);     // Red Channel
                colors[i * 4 + 1] = Math.min(1.0, targetG * dimFactor); // Green Channel
                colors[i * 4 + 2] = Math.min(1.0, targetB * dimFactor); // Blue Channel
                colors[i * 4 + 3] = 1.0;                                // Alpha Channel
            }

            mesh.setVerticesData(BABYLON.VertexBuffer.ColorKind, colors, true);

            mesh._vertexFadeData = {
                vertexCount,
                colors,
                fadeStates,
                holdTimers
            };
        });
    }

    initMeshAlphaColors();

    scene.onBeforeRenderObservable.add(() => {
        initMeshAlphaColors();

        activeMeshes.forEach(item => {
            const mesh = item.mesh;
            const data = mesh ? mesh._vertexFadeData : null;
            if (!mesh || !mesh.isVisible || !data) return;

            let bufferNeedsUpdate = false;

            // Low probability trigger to initiate fade out
            if (Math.random() < 0.35) {
                const count = Math.floor(Math.random() * 2) + 1;
                for (let k = 0; k < count; k++) {
                    const targetIdx = Math.floor(Math.random() * data.vertexCount);
                    if (data.fadeStates[targetIdx] === 0) {
                        data.fadeStates[targetIdx] = 1; // Start fade-out
                    }
                }
            }

            const fadeStep = 0.08; // Fade transition speed

            for (let i = 0; i < data.vertexCount; i++) {
                const state = data.fadeStates[i];

                if (state === 1) { // Fading out
                    data.colors[i * 4 + 3] -= fadeStep;
                    bufferNeedsUpdate = true;
                    if (data.colors[i * 4 + 3] <= 0.0) {
                        data.colors[i * 4 + 3] = 0.0;
                        data.fadeStates[i] = 2; // Hold invisible
                        data.holdTimers[i] = Math.floor(Math.random() * 10) + 5;
                    }
                } else if (state === 2) { // Holding invisible
                    if (data.holdTimers[i] > 0) {
                        data.holdTimers[i]--;
                    } else {
                        data.fadeStates[i] = 3; // Start fade-in
                    }
                } else if (state === 3) { // Fading in
                    data.colors[i * 4 + 3] += fadeStep;
                    bufferNeedsUpdate = true;
                    if (data.colors[i * 4 + 3] >= 1.0) {
                        data.colors[i * 4 + 3] = 1.0;
                        data.fadeStates[i] = 0; // Return to baseline
                    }
                }
            }

            if (bufferNeedsUpdate) {
                mesh.updateVerticesData(BABYLON.VertexBuffer.ColorKind, data.colors);
            }
        });
    });
}
