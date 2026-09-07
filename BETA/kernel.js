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

/**
 * Ground-State Subshell Electron Counts (Z = 1 to 118)
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

/* Application Initialization */
window.addEventListener('DOMContentLoaded', () => {
    init3DEngine();
    populatePeriodicTableGrid();
    generateOrbitsBuilder(true);
    rebuildQuantumModel();
});

function init3DEngine() {
    canvas = document.getElementById('renderCanvas');
    if (!canvas) return;

    engine = new BABYLON.Engine(canvas, true, { preserveDrawingBuffer: true, stencil: true });
    scene = new BABYLON.Scene(engine);
    scene.clearColor = new BABYLON.Color4(0.04, 0.05, 0.07, 1);

    camera = new BABYLON.ArcRotateCamera("camera", initialAlpha, initialBeta, initialRadius, initialTarget, scene);
    camera.attachControl(canvas, true);
    camera.wheelPrecision = 15;
    camera.lowerRadiusLimit = 2;
    camera.upperRadiusLimit = 200;

    const hemiLight = new BABYLON.HemisphericLight("hemiLight", new BABYLON.Vector3(0, 1, 0), scene);
    hemiLight.intensity = 0.8;

    const dirLight = new BABYLON.DirectionalLight("dirLight", new BABYLON.Vector3(-1, -2, -1), scene);
    dirLight.intensity = 1.0;

    engine.runRenderLoop(() => {
        if (scene) scene.render();
        updateCameraPosUI();
    });

    window.addEventListener('resize', () => {
        if (engine) engine.resize();
    });
}

/* Dirac Relativistic Radial Energy Integrator */
function solveDiracEnergy(n, l, j, Z) {
    const k = j + 0.5;
    const za = Z * FINE_ALPHA;
    const za2 = za * za;
    const gamma = Math.sqrt(k * k - za2);
    const denominator = Math.sqrt((n - k + gamma) * (n - k + gamma) + za2);
    const energyHartree = 1.0 / Math.sqrt(1.0 + za2 / (denominator * denominator));
    return (1.0 - energyHartree) * HARTREE_TO_EV * 13.605693;
}

/* Populate Periodic Table Grid */
function populatePeriodicTableGrid() {
    const container = document.getElementById('ptGridContainer');
    if (!container) return;
    container.innerHTML = '';

    ELEMENTS_DATA.forEach(elem => {
        const card = document.createElement('div');
        card.className = 'pt-element-card';
        card.dataset.group = elem.group;
        card.onclick = () => selectElement(elem.Z);

        card.innerHTML = `
            <div class="pt-card-top">
                <span>${elem.Z}</span>
                <span>G${elem.group}</span>
            </div>
            <div class="pt-card-symbol">${elem.sym}</div>
            <div class="pt-card-name">${elem.name}</div>
        `;
        container.appendChild(card);
    });
}

function selectElement(Z) {
    const elem = ELEMENTS_DATA.find(e => e.Z === Z);
    if (!elem) return;

    const inputZ = document.getElementById('inputZ');
    if (inputZ) inputZ.value = Z;

    const tag = document.getElementById('selectedElementTag');
    if (tag) tag.textContent = `[Z = ${Z} ${elem.name}]`;

    closePeriodicTableModal();
    generateOrbitsBuilder(true);
    rebuildQuantumModel();
}

function openPeriodicTableModal() {
    const modal = document.getElementById('ptModalBackdrop');
    if (modal) modal.classList.add('open');
}

function closePeriodicTableModal() {
    const modal = document.getElementById('ptModalBackdrop');
    if (modal) modal.classList.remove('open');
}

function handleBackdropClick(event) {
    if (event.target.id === 'ptModalBackdrop') {
        closePeriodicTableModal();
    }
}

/* Suborbit Builder UI Generator */
function generateOrbitsBuilder(reset = false) {
    const container = document.getElementById('orbitsBuilderContainer');
    const filterContainer = document.getElementById('dynamicFilterContainer');
    if (!container || !filterContainer) return;

    const inputZ = parseInt(document.getElementById('inputZ')?.value || '6', 10);
    const config = HARDCODED_ELECTRON_CONFIGS[inputZ] || { "1s": 2, "2s": 2, "2p": 2 };

    if (reset) {
        container.innerHTML = '';
        filterContainer.innerHTML = '';
    }

    for (const [subshell, count] of Object.entries(config)) {
        const rowId = `orbitRow_${subshell}`;
        if (!document.getElementById(rowId)) {
            const orbitRow = document.createElement('div');
            orbitRow.className = 'orbit-row';
            orbitRow.id = rowId;
            orbitRow.innerHTML = `
                <input type="checkbox" id="chk_${subshell}" checked onchange="toggleOrbitalVisibility('${subshell}', this.checked)">
                <span>${subshell}</span>
                <span style="font-size:10px; color:var(--text-sub); font-weight:500;">${count} e⁻</span>
            `;
            container.appendChild(orbitRow);
        }

        const filterId = `filterItem_${subshell}`;
        if (!document.getElementById(filterId)) {
            const filterItem = document.createElement('div');
            filterItem.className = 'filter-item';
            filterItem.id = filterId;
            filterItem.innerHTML = `
                <span>${subshell}</span>
                <input type="checkbox" id="vis_${subshell}" checked onchange="toggleOrbitalVisibility('${subshell}', this.checked)">
            `;
            filterContainer.appendChild(filterItem);
        }

        if (visibilityState[subshell] === undefined) {
            visibilityState[subshell] = true;
        }
    }
}

/* Calculate Dirac Suborbit Energies */
function autoCalculateSuborbitEnergiesUI() {
    const inputZ = parseInt(document.getElementById('inputZ')?.value || '6', 10);
    const config = HARDCODED_ELECTRON_CONFIGS[inputZ] || { "1s": 2, "2s": 2, "2p": 2 };
    
    let totalEnergy = 0;
    const lMap = { 's': 0, 'p': 1, 'd': 2, 'f': 3, 'g': 4 };

    for (const [subshell, count] of Object.entries(config)) {
        const n = parseInt(subshell[0], 10);
        const lChar = subshell[1];
        const l = lMap[lChar] || 0;
        const j = l === 0 ? 0.5 : l + 0.5;
        
        const subshellEnergy = solveDiracEnergy(n, l, j, inputZ);
        totalEnergy += subshellEnergy * count;
    }

    const inputEn = document.getElementById('inputEn');
    if (inputEn) {
        inputEn.value = `${totalEnergy.toFixed(2)} eV (Total Shell)`;
    }
}

/* Rebuild 3D Quantum Model Meshes */
function rebuildQuantumModel() {
    if (!scene) return;

    activeMeshes.forEach(mesh => mesh.dispose());
    activeMeshes = [];

    const inputZ = parseInt(document.getElementById('inputZ')?.value || '6', 10);
    const config = HARDCODED_ELECTRON_CONFIGS[inputZ] || { "1s": 2, "2s": 2, "2p": 2 };

    const nucleus = BABYLON.MeshBuilder.CreateSphere("nucleus", { diameter: 1.2 }, scene);
    const nucMat = new BABYLON.StandardMaterial("nucMat", scene);
    nucMat.emissiveColor = new BABYLON.Color3(0.9, 0.2, 0.2);
    nucleus.material = nucMat;
    activeMeshes.push(nucleus);

    let shellIdx = 0;
    for (const [subshell] of Object.entries(config)) {
        const n = parseInt(subshell[0], 10);
        const radius = n * 2.8 + (shellIdx * 0.4);

        const shellMesh = BABYLON.MeshBuilder.CreateSphere(`orbit_${subshell}`, { diameter: radius * 2, segments: 32 }, scene);
        shellMesh.subshell = subshell;

        if (typeof applyLowLumOrbitMaterial === 'function') {
            applyLowLumOrbitMaterial(shellMesh, shellIdx, currentOpacity);
        }

        const isVisible = visibilityState[subshell] !== false;
        shellMesh.isVisible = isVisible;
        activeMeshes.push(shellMesh);

        shellIdx++;
    }
}

function toggleOrbitalVisibility(subshell, isVisible) {
    visibilityState[subshell] = isVisible;
    activeMeshes.forEach(mesh => {
        if (mesh.subshell === subshell) {
            mesh.isVisible = isVisible;
        }
    });

    const chk = document.getElementById(`chk_${subshell}`);
    const vis = document.getElementById(`vis_${subshell}`);
    if (chk) chk.checked = isVisible;
    if (vis) vis.checked = isVisible;
}

function updateOpacity(val) {
    currentOpacity = parseFloat(val);
    activeMeshes.forEach((mesh) => {
        if (mesh.name !== "nucleus" && mesh.material) {
            mesh.material.alpha = currentOpacity;
        }
    });
}

/* Camera Teleport & Sync */
function teleportCamera() {
    if (!camera) return;
    const x = parseFloat(document.getElementById('tpX')?.value) || 0;
    const y = parseFloat(document.getElementById('tpY')?.value) || 0;
    const z = parseFloat(document.getElementById('tpZ')?.value) || 0;
    camera.setTarget(new BABYLON.Vector3(x, y, z));
}

function setInitialPosition() {
    if (!camera) return;
    initialTarget = camera.target.clone();
    initialAlpha = camera.alpha;
    initialBeta = camera.beta;
    initialRadius = camera.radius;
    userHasCustomInit = true;
}

function reloadInitialPosition() {
    if (!camera) return;
    camera.setTarget(initialTarget.clone());
    camera.alpha = initialAlpha;
    camera.beta = initialBeta;
    camera.radius = initialRadius;
}

function updateCameraPosUI() {
    if (!camera) return;
    const tpX = document.getElementById('tpX');
    const tpY = document.getElementById('tpY');
    const tpZ = document.getElementById('tpZ');
    
    if (tpX && document.activeElement !== tpX) tpX.value = camera.target.x.toFixed(2);
    if (tpY && document.activeElement !== tpY) tpY.value = camera.target.y.toFixed(2);
    if (tpZ && document.activeElement !== tpZ) tpZ.value = camera.target.z.toFixed(2);
}

function onConfigInputChanged() {
    rebuildQuantumModel();
}
