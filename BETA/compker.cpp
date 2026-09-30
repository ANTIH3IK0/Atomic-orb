#include <emscripten/bind.h>
#include <cmath>
#include <vector>
#include <algorithm>

#ifndef M_PI
#define M_PI 3.14159265358979323846
#endif

// Fundamental Physical Constants (Atomic Units)
constexpr double SPEED_OF_LIGHT = 137.035999139;
constexpr double FINE_STRUCTURE_ALPHA = 1.0 / SPEED_OF_LIGHT;
constexpr double HARTREE_TO_EV = 27.211386245988;
constexpr double BOHR_TO_ANGSTROM = 0.5291772109;
constexpr double ELECTRON_MASS_COMPTON_RAD = 1.0 / SPEED_OF_LIGHT;
constexpr double NUCLEAR_MAGNETON_AU = 2.723085e-4;

struct DiracState {
    std::vector<double> G; // Large component trajectory
    std::vector<double> F; // Small component trajectory

    void resize(size_t n) {
        G.resize(n);
        F.resize(n);
    }
};

struct DiracGridSoA {
    std::vector<double> r;     // Radial position grid
    std::vector<double> inv_r; // Reversible inverse radius (1/r)
    std::vector<double> V;     // Multi-physical effective potential V_eff(r)
};

inline double computeUehlingPotential(double r, double zEff) {
    if (r <= 1e-10) r = 1e-10;
    
    constexpr double inv_lambda_c = SPEED_OF_LIGHT;
    double x = r * inv_lambda_c;
    
    constexpr double factor = -(2.0 * FINE_STRUCTURE_ALPHA) / (3.0 * M_PI);
    double base = (factor * zEff) / r;
    
    if (x < 1.0) {
        constexpr double euler_gamma = 0.5772156649;
        constexpr double const_term = euler_gamma + (5.0 / 6.0);
        return base * (-std::log(x) - const_term);
    } else {
        constexpr double sqrt_pi_4 = 0.44311346272637897;
        double x_1p5 = x * std::sqrt(x);
        return base * sqrt_pi_4 * (std::exp(-2.0 * x) / x_1p5);
    }
}

inline double computeSlaterExchangePotential(double density, double totalSpinS) {
    if (density <= 1e-15) return 0.0;
    
    constexpr double factor = 3.0 / M_PI;
    double v_exchange = -std::cbrt(factor * density);
    double spin_polarization = 1.0 + 0.1 * totalSpinS;
    return v_exchange * spin_polarization;
}

inline double computeDynamicCorrelationPotential(double density) {
    if (density <= 1e-15) return 0.0;
    
    constexpr double factor = 3.0 / (4.0 * M_PI);
    double rs = std::cbrt(factor / density);
    
    if (rs >= 1.0) {
        constexpr double gamma = -0.1423, beta1 = 1.0529, beta2 = 0.3334;
        double sqrt_rs = std::sqrt(rs);
        double denom = 1.0 + beta1 * sqrt_rs + beta2 * rs;
        double eps_c = gamma / denom;
        double d_denom = (0.5 * beta1 / sqrt_rs) + beta2;
        double d_eps = -gamma * d_denom / (denom * denom);
        return eps_c - (rs * (1.0 / 3.0)) * d_eps;
    } else {
        constexpr double A = 0.0311, B = -0.048, C = 0.0020, D = -0.0116;
        double log_rs = std::log(rs);
        double eps_c = A * log_rs + B + C * rs * log_rs + D * rs;
        double d_eps = (A / rs) + C * (log_rs + 1.0) + D;
        return eps_c - (rs * (1.0 / 3.0)) * d_eps;
    }
}

inline double computeEffectivePotential(double r, double zEff, int totalElectrons, double totalSpinS) {
    if (r <= 1e-12) r = 1e-12;
    
    double inv_r = 1.0 / r;
    double vNuclear = -zEff * inv_r;
    
    double screeningRadius = 0.8853 / std::cbrt(zEff);
    double inv_screeningRadius = 1.0 / screeningRadius;
    double exp_screening = std::exp(-r * inv_screeningRadius);
    
    double vScreening = ((totalElectrons - 1.0) * inv_r) * (1.0 - exp_screening);
    
    double sr3 = screeningRadius * screeningRadius * screeningRadius;
    constexpr double inv_4pi = 1.0 / (4.0 * M_PI);
    double localDensity = (totalElectrons * inv_4pi / sr3) * exp_screening;
    
    double vCorrelation = computeDynamicCorrelationPotential(localDensity);
    double vExchange = computeSlaterExchangePotential(localDensity, totalSpinS);
    double vQED = computeUehlingPotential(r, zEff);

    return vNuclear + vScreening + vCorrelation + vExchange + vQED;
}

DiracGridSoA buildDiracGrid(double rMin, double rMax, int numSteps, double zEff, int totalElectrons, double totalSpinS) {
    int totalPoints = 2 * numSteps + 1;
    DiracGridSoA grid;
    grid.r.resize(totalPoints);
    grid.inv_r.resize(totalPoints);
    grid.V.resize(totalPoints);

    double h_sub = (rMax - rMin) / (2.0 * numSteps);
    
    double* __restrict__ r_ptr = grid.r.data();
    double* __restrict__ inv_r_ptr = grid.inv_r.data();
    double* __restrict__ V_ptr = grid.V.data();

    for (int i = 0; i < totalPoints; ++i) {
        double r = rMin + i * h_sub;
        if (r <= 1e-12) r = 1e-12;
        r_ptr[i] = r;
        inv_r_ptr[i] = 1.0 / r;
        V_ptr[i] = computeEffectivePotential(r, zEff, totalElectrons, totalSpinS);
    }
    return grid;
}

/**
 * Fast Shooting Integrator with Restricted Pointer Extraction
 */
double shootDirac(double E, double kappa, double zEff, double stepSize, int numSteps, const DiracGridSoA& grid) {
    constexpr double inv_c = 1.0 / SPEED_OF_LIGHT;
    constexpr double two_c = 2.0 * SPEED_OF_LIGHT;
    
    // Extract raw continuous pointers with strict no-alias guarantee
    const double* __restrict__ inv_r = grid.inv_r.data();
    const double* __restrict__ V = grid.V.data();

    double r0 = grid.r[0];
    double powerFactor = std::pow(r0, std::abs(kappa));
    
    double G = powerFactor;
    double F = powerFactor * (zEff * (0.5 * inv_c));

    const double h = stepSize;
    const double h_half = 0.5 * h;
    const double h_sixth = h * (1.0 / 6.0);

    for (int i = 0; i < numSteps; ++i) {
        int idx1 = 2 * i;
        int idx2 = 2 * i + 1;
        int idx3 = 2 * i + 2;

        // Stage 1 (k1)
        double kr1 = kappa * inv_r[idx1];
        double ev1 = (E - V[idx1]) * inv_c;
        double k1_G = -kr1 * G + (ev1 + two_c) * F;
        double k1_F =  kr1 * F - ev1 * G;

        // Stage 2 (k2)
        double G_m1 = G + h_half * k1_G;
        double F_m1 = F + h_half * k1_F;
        double kr2 = kappa * inv_r[idx2];
        double ev2 = (E - V[idx2]) * inv_c;
        double k2_G = -kr2 * G_m1 + (ev2 + two_c) * F_m1;
        double k2_F =  kr2 * F_m1 - ev2 * G_m1;

        // Stage 3 (k3)
        double G_m2 = G + h_half * k2_G;
        double F_m2 = F + h_half * k2_F;
        double k3_G = -kr2 * G_m2 + (ev2 + two_c) * F_m2;
        double k3_F =  kr2 * F_m2 - ev2 * G_m2;

        // Stage 4 (k4)
        double G_e = G + h * k3_G;
        double F_e = F + h * k3_F;
        double kr3 = kappa * inv_r[idx3];
        double ev3 = (E - V[idx3]) * inv_c;
        double k4_G = -kr3 * G_e + (ev3 + two_c) * F_e;
        double k4_F =  kr3 * F_e - ev3 * G_e;

        // RK4 state update
        G += h_sixth * (k1_G + 2.0 * k2_G + 2.0 * k3_G + k4_G);
        F += h_sixth * (k1_F + 2.0 * k2_F + 2.0 * k3_F + k4_F);

        if (std::abs(G) > 1e8) return G;
    }
    return G;
}

double solveDiracEnergyInternal(double kappa, double zEff, double stepSize, int numSteps, int n, const DiracGridSoA& grid) {
    double eLow = -1.5 * (zEff * zEff) / (2.0 * n * n);
    double eHigh = -0.05 * (zEff * zEff) / (2.0 * n * n);

    double G_low = shootDirac(eLow, kappa, zEff, stepSize, numSteps, grid);

    double E = 0.5 * (eLow + eHigh);
    for (int iter = 0; iter < 60; ++iter) {
        E = 0.5 * (eLow + eHigh);
        if (std::abs(eHigh - eLow) < 1e-8) break;

        double G_mid = shootDirac(E, kappa, zEff, stepSize, numSteps, grid);

        if ((G_low > 0 && G_mid > 0) || (G_low < 0 && G_mid < 0)) {
            eLow = E;
            G_low = G_mid;
        } else {
            eHigh = E;
        }
    }
    return E;
}

void integrateDiracSoA(double E, double kappa, double zEff, double stepSize, int numSteps, const DiracGridSoA& grid, DiracState& state) {
    constexpr double inv_c = 1.0 / SPEED_OF_LIGHT;
    constexpr double two_c = 2.0 * SPEED_OF_LIGHT;

    state.resize(numSteps + 1);

    const double* __restrict__ inv_r = grid.inv_r.data();
    const double* __restrict__ V = grid.V.data();
    double* __restrict__ G_out = state.G.data();
    double* __restrict__ F_out = state.F.data();

    double r0 = grid.r[0];
    double powerFactor = std::pow(r0, std::abs(kappa));
    
    double G = powerFactor;
    double F = powerFactor * (zEff * (0.5 * inv_c));

    G_out[0] = G;
    F_out[0] = F;

    const double h = stepSize;
    const double h_half = 0.5 * h;
    const double h_sixth = h * (1.0 / 6.0);

    for (int i = 0; i < numSteps; ++i) {
        int idx1 = 2 * i;
        int idx2 = 2 * i + 1;
        int idx3 = 2 * i + 2;

        double kr1 = kappa * inv_r[idx1];
        double ev1 = (E - V[idx1]) * inv_c;
        double k1_G = -kr1 * G + (ev1 + two_c) * F;
        double k1_F =  kr1 * F - ev1 * G;

        double G_m1 = G + h_half * k1_G;
        double F_m1 = F + h_half * k1_F;
        double kr2 = kappa * inv_r[idx2];
        double ev2 = (E - V[idx2]) * inv_c;
        double k2_G = -kr2 * G_m1 + (ev2 + two_c) * F_m1;
        double k2_F =  kr2 * F_m1 - ev2 * G_m1;

        double G_m2 = G + h_half * k2_G;
        double F_m2 = F + h_half * k2_F;
        double k3_G = -kr2 * G_m2 + (ev2 + two_c) * F_m2;
        double k3_F =  kr2 * F_m2 - ev2 * G_m2;

        double G_e = G + h * k3_G;
        double F_e = F + h * k3_F;
        double kr3 = kappa * inv_r[idx3];
        double ev3 = (E - V[idx3]) * inv_c;
        double k4_G = -kr3 * G_e + (ev3 + two_c) * F_e;
        double k4_F =  kr3 * F_e - ev3 * G_e;

        G += h_sixth * (k1_G + 2.0 * k2_G + 2.0 * k3_G + k4_G);
        F += h_sixth * (k1_F + 2.0 * k2_F + 2.0 * k3_F + k4_F);

        G_out[i + 1] = G;
        F_out[i + 1] = F;
    }
}

double solveDiracExactEnergy(int n, int l, double j, double zEff, double totalSpinS) {
    double kappa = (j > l) ? -(l + 1.0) : l;
    int totalElectrons = static_cast<int>(std::round(zEff));
    
    double rMin = 1e-5;
    double rMax = std::max(20.0, 12.0 * (n * n) / zEff);
    int numSteps = 4000;
    double stepSize = (rMax - rMin) / numSteps;

    DiracGridSoA grid = buildDiracGrid(rMin, rMax, numSteps, zEff, totalElectrons, totalSpinS);
    double E = solveDiracEnergyInternal(kappa, zEff, stepSize, numSteps, n, grid);

    return E * HARTREE_TO_EV;
}

double computeHyperfineSplittingConstant(int n, int l, double j, double zEff, double gI) {
    double kappa = (j > l) ? -(l + 1.0) : l;
    int totalElectrons = static_cast<int>(std::round(zEff));
    
    double rMin = 1e-5;
    double rMax = std::max(20.0, 12.0 * (n * n) / zEff);
    int numSteps = 4000;
    double stepSize = (rMax - rMin) / numSteps;

    DiracGridSoA grid = buildDiracGrid(rMin, rMax, numSteps, zEff, totalElectrons, 0.5);
    double E = solveDiracEnergyInternal(kappa, zEff, stepSize, numSteps, n, grid);

    DiracState state;
    integrateDiracSoA(E, kappa, zEff, stepSize, numSteps, grid, state);

    double norm = 0.0;
    double hfsIntegral = 0.0;

    const double* __restrict__ G_ptr = state.G.data();
    const double* __restrict__ F_ptr = state.F.data();
    const double* __restrict__ inv_r_ptr = grid.inv_r.data();

    for (int i = 0; i < numSteps; ++i) {
        double g_val = G_ptr[i];
        double f_val = F_ptr[i];
        double density = g_val * g_val + f_val * f_val;
        if (density > 1e6) break;

        double inv_r_val = inv_r_ptr[2 * i];
        norm += density * stepSize;
        hfsIntegral += (g_val * f_val * (inv_r_val * inv_r_val)) * stepSize;
    }

    if (norm <= 1e-12) return 0.0;
    
    hfsIntegral /= norm;
    double a_hfs_au = (2.0 * gI * NUCLEAR_MAGNETON_AU * kappa) / (j * (j + 1.0)) * hfsIntegral;
    
    return a_hfs_au * 6.579683920729e9;
}

double computeStarkShift(int n, int l, double j, double zEff, double electricFieldVperM) {
    constexpr double INV_EFIELD_AU = 1.0 / 5.142206714e11;
    double eFieldAU = electricFieldVperM * INV_EFIELD_AU;
    
    double n2 = static_cast<double>(n) * n;
    double n4 = n2 * n2;
    double n7 = n4 * n2 * n;

    double z2 = zEff * zEff;
    double z4 = z2 * z2;
    
    double polarizabilityAU = n7 / z4;
    double starkEnergyAU = -0.5 * polarizabilityAU * eFieldAU * eFieldAU;
    
    return starkEnergyAU * HARTREE_TO_EV;
}

#include <emscripten/val.h>
#include <cstring>

constexpr double AVOGADRO = 6.02214076e23;
constexpr double BOHR_RADIUS_CM = 5.29177210903e-9;

#pragma pack(push, 1)
struct PhysicalProperties {
    uint8_t  r;                      // RGB Red (0-255)
    uint8_t  g;                      // RGB Green (0-255)
    uint8_t  b;                      // RGB Blue (0-255)
    uint8_t  crystalStructure;       // 0: Gas/Liquid, 1: FCC, 2: BCC, 3: HCP, 4: Diamond, 5: Hexagonal
    uint8_t  stateAt298K;            // 0: Solid, 1: Liquid, 2: Gas
    uint8_t  isMetal;               // 0: Non-metal, 1: Metalloid, 2: Metal
    float    density;                // g/cm^3
    float    electricalConductivity; // S/m
    float    thermalConductivity;    // W/(m·K)
    float    meltingPoint;           // Kelvin
    float    boilingPoint;           // Kelvin
};
#pragma pack(pop)

emscripten::val generatePhysicalPropertiesBuffer(int Z, double atomicMass, int sCount, int pCount, int dCount, int fCount, int gCount = 0, double tempK = 298.15) {
    static PhysicalProperties props;
    std::memset(&props, 0, sizeof(PhysicalProperties));

    // 1. Relativistic Dirac contraction factor gamma = sqrt(1 - (Z*alpha)^2)
    // Regularized for superheavy elements Z > 137 to prevent imaginary roots
    double zAlpha = std::min(0.99, Z * FINE_STRUCTURE_ALPHA);
    double gamma = std::sqrt(1.0 - zAlpha * zAlpha);

    // 2. Quantum shell screening & effective nuclear charge (Z_eff)
    int totalElectrons = sCount + pCount + dCount + fCount + gCount;
    int valenceElectrons = std::max(1, sCount + pCount + dCount + fCount + gCount);
    int n_max = 1 + (Z > 2) + (Z > 10) + (Z > 18) + (Z > 36) + (Z > 54) + (Z > 86) + (Z > 118);
    
    double shielding = (totalElectrons - (sCount + pCount)) * 0.85 + (sCount + pCount - 1) * 0.35;
    double zEff = std::max(1.0, Z - shielding);

    // 3. Relativistic orbital radius contraction/expansion (cm)
    // s/p1/2 contract by gamma; d/f/g expand due to inner-shell shielding
    double orbitalWeight = ((sCount + pCount) * gamma + (dCount + fCount + gCount) / gamma) / valenceElectrons;
    double radius_cm = BOHR_RADIUS_CM * (std::pow(n_max, 2.0) / zEff) * orbitalWeight;
    
    // Molar volume & Goldhammer-Herzfeld metallicity index (R_V / V_m)
    double atomicVolume_cm3_mol = (4.0 / 3.0) * M_PI * std::pow(radius_cm, 3.0) * AVOGADRO / 0.68;
    double molarPolarizability = (4.0 / 3.0) * M_PI * std::pow(radius_cm, 3.0) * AVOGADRO;
    double metallicityIndex = molarPolarizability / atomicVolume_cm3_mol;

    // 4. Classification via electronic polarization
    if (metallicityIndex >= 0.82 || (dCount > 0 && zEff > 2.0)) {
        props.isMetal = 2; // Metal
    } else if (metallicityIndex >= 0.58) {
        props.isMetal = 1; // Metalloid
    } else {
        props.isMetal = 0; // Non-metal
    }

    // 5. Cohesive Energy & Phase Change Dynamics (Melting & Boiling Points)
    bool isClosedShell = (pCount == 6 && sCount == 2) || (Z == 2);
    double cohesiveFactor = isClosedShell ? 0.03 : (1.0 + 0.12 * dCount + 0.04 * fCount);
    double cohesiveEnergy = (zEff * zEff * valenceElectrons * cohesiveFactor) / (radius_cm * 1e8);
    
    props.meltingPoint = static_cast<float>(std::max(0.5, cohesiveEnergy * 19.2 * gamma));
    props.boilingPoint = static_cast<float>(props.meltingPoint * (1.45 + 0.35 / orbitalWeight));

    // 6. State of Matter & Density Calculation
    if (tempK < props.meltingPoint) props.stateAt298K = 0;      // Solid
    else if (tempK < props.boilingPoint) props.stateAt298K = 1; // Liquid
    else props.stateAt298K = 2;                                 // Gas

    props.density = static_cast<float>(props.stateAt298K == 2 
        ? (atomicMass / 22414.0) * (273.15 / tempK) 
        : atomicMass / atomicVolume_cm3_mol);

    // 7. Crystal Structure Heuristic
    if (props.stateAt298K != 0) {
        props.crystalStructure = 0;
    } else if (props.isMetal == 2) {
        if (dCount >= 1 && dCount <= 8) props.crystalStructure = 1;      // FCC
        else if (sCount == 1 || dCount > 8) props.crystalStructure = 2;  // BCC
        else props.crystalStructure = 3;                                  // HCP
    } else {
        props.crystalStructure = (props.isMetal == 1 || pCount == 2) ? 4 : 5; // Diamond / Hexagonal
    }

    // 8. Electrical & Thermal Conductivity (Drude / Wiedemann-Franz Transport)
    if (props.isMetal == 2) {
        double electronDensity = (valenceElectrons * AVOGADRO) / atomicVolume_cm3_mol;
        double tau = 1e-14 * gamma / (1.0 + 0.00385 * (tempK - 298.15));
        double sigma = (electronDensity * 2.566e-38 * tau) / 9.109e-31;
        props.electricalConductivity = static_cast<float>(sigma * 1e-2);
        props.thermalConductivity = static_cast<float>(2.44e-8 * tempK * props.electricalConductivity);
    } else if (props.isMetal == 1) {
        props.electricalConductivity = static_cast<float>(120.0 * std::exp(-0.4 / (8.617e-5 * tempK)));
        props.thermalConductivity = 12.0f;
    } else {
        props.electricalConductivity = 1e-12f;
        props.thermalConductivity = 0.15f;
    }

    // 9. Optical Absorption & Relativistic Color Shift
    if (props.stateAt298K == 2) {
        props.r = 240; props.g = 248; props.b = 255; // Translucent Gas
    } else if (props.isMetal == 2) {
        double plasmaGap_eV = (3.6 / gamma) - (dCount * 0.14);
        if (plasmaGap_eV < 2.3) { // Relativistic shift lowers s-d gap into visible spectra (Gold/Copper effect)
            props.r = static_cast<uint8_t>(std::min(255.0, 200.0 + 55.0 / gamma));
            props.g = static_cast<uint8_t>(std::clamp(120.0 * plasmaGap_eV, 30.0, 180.0));
            props.b = static_cast<uint8_t>(std::clamp(35.0 * (plasmaGap_eV - 1.0), 5.0, 90.0));
        } else {
            props.r = 192; props.g = 192; props.b = 192; // Metallic Silver
        }
    } else {
        double electronegativity = (zEff / radius_cm) * 1e-8;
        props.r = static_cast<uint8_t>(std::clamp(255.0 - electronegativity * 28.0, 40.0, 255.0));
        props.g = static_cast<uint8_t>(std::clamp(190.0 - electronegativity * 18.0, 20.0, 220.0));
        props.b = static_cast<uint8_t>(std::clamp(90.0 + electronegativity * 14.0, 10.0, 255.0));
    }

    uint8_t* bytePtr = reinterpret_cast<uint8_t*>(&props);
    return emscripten::val(emscripten::typed_memory_view(sizeof(PhysicalProperties), bytePtr));
}

EMSCRIPTEN_BINDINGS(dirac_kernel_module) {
    emscripten::function("solveDiracExactEnergy", &solveDiracExactEnergy);
    emscripten::function("computeHyperfineSplittingConstant", &computeHyperfineSplittingConstant);
    emscripten::function("computeStarkShift", &computeStarkShift);
    emscripten::function("generatePhysicalPropertiesBuffer", &generatePhysicalPropertiesBuffer);
}