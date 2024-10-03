const mercuryElements = {
    a: 0.38709927, // Semi-major axis in AU
    e: 0.20563593, // Eccentricity
    I: 7.00497902 * Math.PI / 180, // Inclination in radians
    L: 252.25032350 * Math.PI / 180, // Mean longitude in radians
    longPeri: 77.45779628 * Math.PI / 180, // Longitude of perihelion in radians
    longNode: 48.33076593 * Math.PI / 180, // Longitude of ascending node in radians
};

// Venus
const venusElements = {
    a: 0.72333566,
    e: 0.00677672,
    I: 3.39467605 * Math.PI / 180,
    L: 181.97909950 * Math.PI / 180,
    longPeri: 131.60246718 * Math.PI / 180,
    longNode: 76.67984255 * Math.PI / 180,
};

// Earth
const earthElements = {
    a: 1.00000261,
    e: 0.01671123,
    I: -0.00001531 * Math.PI / 180,
    L: 100.46457166 * Math.PI / 180,
    longPeri: 102.93768193 * Math.PI / 180,
    longNode: 0.0,
};

// Mars
const marsElements = {
    a: 1.52366231,
    e: 0.09341233,
    I: 1.85061151 * Math.PI / 180,
    L: 355.45332 * Math.PI / 180,
    longPeri: 286.53717 * Math.PI / 180,
    longNode: 49.559538 * Math.PI / 180,
};

// Jupiter
const jupiterElements = {
    a: 5.204267,
    e: 0.048775,
    I: 1.303270 * Math.PI / 180,
    L: 34.334791 * Math.PI / 180,
    longPeri: 14.753851 * Math.PI / 180,
    longNode: 100.473909 * Math.PI / 180,
};

// Saturn
const saturnElements = {
    a: 9.582017, // Semi-major axis in AU
    e: 0.056520, // Eccentricity
    I: 2.485240 * Math.PI / 180, // Inclination in radians
    L: 50.077444 * Math.PI / 180, // Mean longitude in radians
    longPeri: 336.013540 * Math.PI / 180, // Longitude of perihelion in radians
    longNode: 113.715047 * Math.PI / 180, // Longitude of ascending node in radians
};

// Uranus
const uranusElements = {
    a: 19.181712, // Semi-major axis in AU
    e: 0.047257, // Eccentricity
    I: 0.773196 * Math.PI / 180, // Inclination in radians
    L: 313.232189 * Math.PI / 180, // Mean longitude in radians
    longPeri: 96.998857 * Math.PI / 180, // Longitude of perihelion in radians
    longNode: 74.016925 * Math.PI / 180, // Longitude of ascending node in radians
};

// Neptune
const neptuneElements = {
    a: 30.058926, // Semi-major axis in AU
    e: 0.008590, // Eccentricity
    I: 1.769952 * Math.PI / 180, // Inclination in radians
    L: 304.880035 * Math.PI / 180, // Mean longitude in radians
    longPeri: 253.181212 * Math.PI / 180, // Longitude of perihelion in radians
    longNode: 131.721686 * Math.PI / 180, // Longitude of ascending node in radians
};

// Rates of change for all planets
const mercuryRates = {
    L_rate: 149472.67411175 * Math.PI / 180,
    a_rate: 0.00000037,
    e_rate: 0.00001906,
    I_rate: -0.00594749 * Math.PI / 180,
    longPeri_rate: 0.16047689 * Math.PI / 180,
    longNode_rate: -0.12534081 * Math.PI / 180,
};

const venusRates = {
    L_rate: 58517.81538729 * Math.PI / 180,
    a_rate: 0.00000390,
    e_rate: -0.00004107,
    I_rate: -0.00078890 * Math.PI / 180,
    longPeri_rate: 0.00268329 * Math.PI / 180,
    longNode_rate: -0.27769418 * Math.PI / 180,
};

const earthRates = {
    L_rate: 360.0 / 365.256363004 * Math.PI / 180, // 360 degrees per year
    a_rate: 0.0,
    e_rate: 0.0,
    I_rate: 0.0,
    longPeri_rate: 0.0,
    longNode_rate: 0.0,
};

const marsRates = {
    L_rate: 19140.29933456 * Math.PI / 180,
    a_rate: 0.00000024,
    e_rate: 0.00007882,
    I_rate: -0.00012880 * Math.PI / 180,
    longPeri_rate: 0.44441088 * Math.PI / 180,
    longNode_rate: -0.27250099 * Math.PI / 180,
};

const jupiterRates = {
    L_rate: 3034.905664 * Math.PI / 180,
    a_rate: 0.00000064,
    e_rate: -0.00001531,
    I_rate: -0.001961 * Math.PI / 180,
    longPeri_rate: 0.055303 * Math.PI / 180,
    longNode_rate: -0.241238 * Math.PI / 180,
};

const saturnRates = {
    L_rate: 1222.114947 * Math.PI / 180, // Mean longitude rate (degrees per year)
    a_rate: 0.00000015, // Change in semi-major axis (AU per year)
    e_rate: -0.00005167, // Change in eccentricity
    I_rate: -0.004469 * Math.PI / 180, // Change in inclination (radians per year)
    longPeri_rate: 0.056900 * Math.PI / 180, // Longitude of perihelion rate (radians per year)
    longNode_rate: -0.099907 * Math.PI / 180, // Longitude of ascending node rate (radians per year)
};

const uranusRates = {
    L_rate: 501.160092 * Math.PI / 180, // Mean longitude rate (degrees per year)
    a_rate: -0.00000012, // Change in semi-major axis (AU per year)
    e_rate: -0.00000511, // Change in eccentricity
    I_rate: -0.001520 * Math.PI / 180, // Change in inclination (radians per year)
    longPeri_rate: -0.080550 * Math.PI / 180, // Longitude of perihelion rate (radians per year)
    longNode_rate: -0.226129 * Math.PI / 180, // Longitude of ascending node rate (radians per year)
};

const neptuneRates = {
    L_rate: 538.076799 * Math.PI / 180, // Mean longitude rate (degrees per year)
    a_rate: 0.00000024, // Change in semi-major axis (AU per year)
    e_rate: 0.00000455, // Change in eccentricity
    I_rate: -0.000530 * Math.PI / 180, // Change in inclination (radians per year)
    longPeri_rate: -0.167181 * Math.PI / 180, // Longitude of perihelion rate (radians per year)
    longNode_rate: 0.059403 * Math.PI / 180, // Longitude of ascending node rate (radians per year)
};

export {
    mercuryElements,
    venusElements,
    earthElements,
    marsElements,
    jupiterElements,
    saturnElements,
    uranusElements,
    neptuneElements,
    mercuryRates,
    venusRates,
    earthRates,
    marsRates,
    jupiterRates,
    saturnRates,
    uranusRates,
    neptuneRates
};