#include <emscripten/bind.h>
#include <cmath>
#include <vector>
#include <algorithm>

// Fundamental Physical Constants (Atomic Units)
constexpr double SPEED_OF_LIGHT = 137.035999139;
constexpr double FINE_STRUCTURE_ALPHA = 1.0 / SPEED_OF_LIGHT;
constexpr double HARTREE_TO_EV = 27.211386245988;
constexpr double BOHR_TO_ANGSTROM = 0.5291772109;
constexpr double ELECTRON_MASS_COMPTON_RAD = 1.0 / SPEED_OF_LIGHT; // Compton wavelength in a.u.
constexpr double NUCLEAR_MAGNETON_AU = 2.723085e-4; // Nuclear magneton in atomic units

struct DiracState {
    double G; // Large component
    double F; // Small component
};

/**
 * QED Vacuum Polarization: Short-range Uehling Potential V_Ueh(r)
 * Corrects inner-shell electron energy levels (1s Lamb shift contribution) for heavy Z.
 */
double computeUehlingPotential(double r, double zEff) {
    if (r <= 1e-10) r = 1e-10;
    
    double lambda_c = ELECTRON_MASS_COMPTON_RAD; // Compton radius
    double x = r / lambda_c;
    
    // Short-range analytical approximation of the Uehling integral kernel
    if (x < 1.0) {
        double euler_gamma = 0.5772156649;
        return -(2.0 * FINE_STRUCTURE_ALPHA * zEff) / (3.0 * M_PI * r) * 
               (std::log(1.0 / x) - euler_gamma - (5.0 / 6.0));
    } else {
        // Exponential decay tail for long-range cutoff
        return -(2.0 * FINE_STRUCTURE_ALPHA * zEff) / (3.0 * M_PI * r) * 
               (std::sqrt(M_PI) / 4.0) * (std::exp(-2.0 * x) / std::pow(x, 1.5));
    }
}

/**
 * Slater Local Exchange & Hund's Rule Spin-Polarization Potential
 * V_x(r) = -(3/pi * rho)^(1/3) + V_Hund multiplet splitting bias.
 */
double computeSlaterExchangePotential(double density, double totalSpinS) {
    if (density <= 1e-15) return 0.0;
    
    // Slater local exchange (Hartree-Fock-Slater approximation)
    double v_exchange = -std::pow(3.0 * density / M_PI, 1.0 / 3.0);
    
    // Hund's rule spin polarization correction factor (open-shell multiplet shift)
    double spin_polarization = 1.0 + 0.1 * totalSpinS;
    return v_exchange * spin_polarization;
}

/**
 * Exact LDA Correlation Potential V_c(r_s) via Functional Derivative
 */
double computeDynamicCorrelationPotential(double density) {
    if (density <= 1e-15) return 0.0;
    double rs = std::pow(3.0 / (4.0 * M_PI * density), 1.0 / 3.0);
    
    if (rs >= 1.0) {
        double gamma = -0.1423, beta1 = 1.0529, beta2 = 0.3334;
        double denom = 1.0 + beta1 * std::sqrt(rs) + beta2 * rs;
        double eps_c = gamma / denom;
        double d_denom = (0.5 * beta1 / std::sqrt(rs)) + beta2;
        double d_eps = -gamma * d_denom / (denom * denom);
        return eps_c - (rs / 3.0) * d_eps;
    } else {
        double A = 0.0311, B = -0.048, C = 0.0020, D = -0.0116;
        double eps_c = A * std::log(rs) + B + C * rs * std::log(rs) + D * rs;
        double d_eps = (A / rs) + C * (std::log(rs) + 1.0) + D;
        return eps_c - (rs / 3.0) * d_eps;
    }
}

/**
 * Comprehensive Multi-Physical Effective Potential V_eff(r)
 */
double computeEffectivePotential(double r, double zEff, int totalElectrons, double totalSpinS) {
    if (r <= 1e-12) r = 1e-12;
    
    // 1. Direct Nuclear Coulomb
    double vNuclear = -zEff / r;
    
    // 2. Hartree Screening
    double screeningRadius = 0.8853 * std::pow(zEff, -1.0 / 3.0);
    double vScreening = ((totalElectrons - 1.0) / r) * (1.0 - std::exp(-r / screeningRadius));
    
    // 3. Dynamic Density & Exchange-Correlation (Slater + LDA)
    double localDensity = (totalElectrons / (4.0 * M_PI * std::pow(screeningRadius, 3.0))) * std::exp(-r / screeningRadius);
    double vCorrelation = computeDynamicCorrelationPotential(localDensity);
    double vExchange = computeSlaterExchangePotential(localDensity, totalSpinS);
    
    // 4. QED Vacuum Polarization (Uehling Correction)
    double vQED = computeUehlingPotential(r, zEff);

    return vNuclear + vScreening + vCorrelation + vExchange + vQED;
}

DiracState diracDerivatives(double r, const DiracState& state, double kappa, double E, double zEff, int totalElectrons, double totalSpinS) {
    double V = computeEffectivePotential(r, zEff, totalElectrons, totalSpinS);
    double c = SPEED_OF_LIGHT;
    
    double dG = -(kappa / r) * state.G + ((E - V) / c + 2.0 * c) * state.F;
    double dF =  (kappa / r) * state.F - ((E - V) / c) * state.G;
    
    return { dG, dF };
}

double shootDirac(double E, double kappa, double zEff, int totalElectrons, double totalSpinS, double rMax, int numSteps) {
    double r = 1e-5;
    double stepSize = (rMax - r) / numSteps;
    double powerFactor = std::pow(r, std::abs(kappa));
    DiracState state = { powerFactor, powerFactor * (zEff / (2.0 * SPEED_OF_LIGHT)) };

    for (int i = 0; i < numSteps; ++i) {
        DiracState k1 = diracDerivatives(r, state, kappa, E, zEff, totalElectrons, totalSpinS);
        DiracState s2 = { state.G + 0.5 * stepSize * k1.G, state.F + 0.5 * stepSize * k1.F };
        DiracState k2 = diracDerivatives(r + 0.5 * stepSize, s2, kappa, E, zEff, totalElectrons, totalSpinS);
        DiracState s3 = { state.G + 0.5 * stepSize * k2.G, state.F + 0.5 * stepSize * k2.F };
        DiracState k3 = diracDerivatives(r + 0.5 * stepSize, s3, kappa, E, zEff, totalElectrons, totalSpinS);
        DiracState s4 = { state.G + stepSize * k3.G, state.F + stepSize * k3.F };
        DiracState k4 = diracDerivatives(r + stepSize, s4, kappa, E, zEff, totalElectrons, totalSpinS);

        state.G += (stepSize / 6.0) * (k1.G + 2.0 * k2.G + 2.0 * k3.G + k4.G);
        state.F += (stepSize / 6.0) * (k1.F + 2.0 * k2.F + 2.0 * k3.F + k4.F);
        r += stepSize;

        if (std::abs(state.G) > 1e8) return state.G;
    }
    return state.G;
}

/**
 * Solves Dirac Energy with Bisection search considering Hund's spin and QED corrections.
 */
double solveDiracExactEnergy(int n, int l, double j, double zEff, double totalSpinS) {
    double kappa = (j > l) ? -(l + 1.0) : l;
    int totalElectrons = static_cast<int>(std::round(zEff));
    
    double rMax = std::max(20.0, 12.0 * (n * n) / zEff);
    int numSteps = 4000;

    double eLow = -1.5 * (zEff * zEff) / (2.0 * n * n);
    double eHigh = -0.05 * (zEff * zEff) / (2.0 * n * n);

    double G_low = shootDirac(eLow, kappa, zEff, totalElectrons, totalSpinS, rMax, numSteps);

    double E = 0.5 * (eLow + eHigh);
    for (int iter = 0; iter < 60; ++iter) {
        E = 0.5 * (eLow + eHigh);
        if (std::abs(eHigh - eLow) < 1e-8) break;

        double G_mid = shootDirac(E, kappa, zEff, totalElectrons, totalSpinS, rMax, numSteps);

        if ((G_low > 0 && G_mid > 0) || (G_low < 0 && G_mid < 0)) {
            eLow = E;
            G_low = G_mid;
        } else {
            eHigh = E;
        }
    }

    return E * HARTREE_TO_EV;
}

/**
 * Hyperfine Splitting Integrator (A_HFS Constant in MHz)
 * Computes magnetic dipole coupling integral over small and large spinor cross terms:
 * A_HFS ~ Integral( (G(r)*F(r)) / r^2 dr )
 */
double computeHyperfineSplittingConstant(int n, int l, double j, double zEff, double gI) {
    double kappa = (j > l) ? -(l + 1.0) : l;
    int totalElectrons = static_cast<int>(std::round(zEff));
    double E = solveDiracExactEnergy(n, l, j, zEff, 0.5) / HARTREE_TO_EV;

    double rMax = std::max(20.0, 12.0 * (n * n) / zEff);
    int numSteps = 4000;
    double r = 1e-5;
    double stepSize = (rMax - r) / numSteps;

    double powerFactor = std::pow(r, std::abs(kappa));
    DiracState state = { powerFactor, powerFactor * (zEff / (2.0 * SPEED_OF_LIGHT)) };

    double norm = 0.0;
    double hfsIntegral = 0.0;

    for (int i = 0; i < numSteps; ++i) {
        DiracState k1 = diracDerivatives(r, state, kappa, E, zEff, totalElectrons, 0.5);
        DiracState s2 = { state.G + 0.5 * stepSize * k1.G, state.F + 0.5 * stepSize * k1.F };
        DiracState k2 = diracDerivatives(r + 0.5 * stepSize, s2, kappa, E, zEff, totalElectrons, 0.5);
        DiracState s3 = { state.G + 0.5 * stepSize * k2.G, state.F + 0.5 * stepSize * k2.F };
        DiracState k3 = diracDerivatives(r + 0.5 * stepSize, s3, kappa, E, zEff, totalElectrons, 0.5);
        DiracState s4 = { state.G + stepSize * k3.G, state.F + stepSize * k3.F };
        DiracState k4 = diracDerivatives(r + stepSize, s4, kappa, E, zEff, totalElectrons, 0.5);

        state.G += (stepSize / 6.0) * (k1.G + 2.0 * k2.G + 2.0 * k3.G + k4.G);
        state.F += (stepSize / 6.0) * (k1.F + 2.0 * k2.F + 2.0 * k3.F + k4.F);
        r += stepSize;

        double density = (state.G * state.G + state.F * state.F);
        if (density > 1e6) break;

        norm += density * stepSize;
        hfsIntegral += (state.G * state.F / (r * r)) * stepSize;
    }

    if (norm <= 1e-12) return 0.0;
    
    // Normalize wavefunctions and calculate A_HFS coupling factor
    hfsIntegral /= norm;
    double a_hfs_au = (2.0 * gI * NUCLEAR_MAGNETON_AU * kappa) / (j * (j + 1.0)) * hfsIntegral;
    
    // Convert atomic units to Megahertz (MHz)
    return a_hfs_au * 6.579683920729e9;
}

/**
 * Second-Order Stark Shift Evaluator
 * Evaluates electric polarizability shift Delta E_Stark = -0.5 * alpha_d * E_field^2
 */
double computeStarkShift(int n, int l, double j, double zEff, double electricFieldVperM) {
    // Convert V/m to atomic unit of electric field (1 a.u. = 5.1422067e11 V/m)
    double eFieldAU = electricFieldVperM / 5.142206714e11;
    
    // Estimate dipole polarizability alpha_d ~ n^7 / Z_eff^4
    double polarizabilityAU = (n * n * n * n * n * n * n) / (zEff * zEff * zEff * zEff);
    
    double starkEnergyAU = -0.5 * polarizabilityAU * eFieldAU * eFieldAU;
    return starkEnergyAU * HARTREE_TO_EV;
}

EMSCRIPTEN_BINDINGS(dirac_kernel_module) {
    emscripten::function("solveDiracExactEnergy", &solveDiracExactEnergy);
    emscripten::function("computeHyperfineSplittingConstant", &computeHyperfineSplittingConstant);
    emscripten::function("computeStarkShift", &computeStarkShift);
}