import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
// import Drawer from '@mui/material/Drawer';
import Drawer from './Drawer';


import sunImg from "./textures/sun.jpg";
import mercuryImg from "./textures/mercury.jpg";
import venusImg from "./textures/venus.jpg";
import earthImg from "./textures/earth.jpg";
import saturnImg from "./textures/saturn.jpg";
import marsImg from "./textures/mars.jpg";
import jupiterImg from "./textures/jupiter.jpg";
import uranusImg from "./textures/uranus.jpg";
import neptuneImg from "./textures/neptune.jpg";
import moonImg from "./textures/moon.jpg";
import starfieldImg from "./textures/starfield.jpg";
import { MERCURY, VENUS, EARTH, MARS, JUPITER, SATURN, URANUS, NEPTUNE } from './Data/PlanetsDetails';
import {
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
} from './PlanetsData';

// Define your planet descriptions
// const planetDescriptions = {
//     Mercury: "Mercury is the closest planet to the Sun...",
//     Venus: "Venus is the second planet from the Sun...",
//     Earth: "Earth is our home planet...",
//     Mars: "Mars is the fourth planet from the Sun...",
//     Jupiter: "Jupiter is the largest planet in our solar system...",
//     Saturn: "Saturn is known for its ring system...",
//     Uranus: "Uranus is an ice giant...",
//     Neptune: "Neptune is the farthest planet from the Sun...",
// };

// Keplerian element calculations for planet positions
const calculatePlanetPosition = (a, e, I, L, longPeri, longNode, epoch, rates) => {
    const T = (epoch - 2451545.0) / 36525; // Centuries past J2000.0

    const updatedL = L + T * rates.L_rate; // Mean longitude
    const updatedA = a + T * rates.a_rate; // Semi-major axis
    const updatedE = e + T * rates.e_rate; // Eccentricity
    const updatedI = I + T * rates.I_rate; // Inclination
    const updatedPeri = longPeri + T * rates.longPeri_rate; // Longitude of perihelion
    const updatedNode = longNode + T * rates.longNode_rate; // Longitude of ascending node

    let M = updatedL - updatedPeri;
    M = M % (2 * Math.PI); // Normalize to 0-2π

    let E = M;
    for (let i = 0; i < 10; i++) {
        E = M + updatedE * Math.sin(E);
    }

    const x = updatedA * (Math.cos(E) - updatedE);
    const y = updatedA * Math.sqrt(1 - updatedE * updatedE) * Math.sin(E);

    const cosI = Math.cos(updatedI);
    const sinI = Math.sin(updatedI);
    const cosNode = Math.cos(updatedNode);
    const sinNode = Math.sin(updatedNode);
    const cosPeri = Math.cos(updatedPeri);
    const sinPeri = Math.sin(updatedPeri);

    const xPos = x * (cosNode * cosPeri - sinNode * sinPeri * cosI) - y * (sinNode * cosPeri + cosNode * sinPeri * cosI);
    const yPos = x * (sinNode * cosPeri + cosNode * sinPeri * cosI) + y * (cosNode * cosPeri - sinNode * sinPeri * cosI);
    const zPos = y * sinI * Math.sin(E);

    return { x: xPos, y: yPos, z: zPos };
};

const SolarSystem = () => {
    const mountRef = useRef(null);

    const controlsRef = useRef(null);

    const [rotationSpeed, setRotationSpeed] = useState(0.0);
    const [focuseState, setFocuseState] = useState(false);
    const [cameraTarget, setCameraTarget] = useState(null);
    const [drawerOpen, setDrawerOpen] = useState(false);  // State for drawer visibility
    const [selectedPlanet, setSelectedPlanet] = useState(null); // State for selected planet
    const [hoveredPlanetIndex, setHoveredPlanetIndex] = useState(null); // State for hovered planet

    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();


    useEffect(() => {
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.051, 2000);
        const renderer = new THREE.WebGLRenderer();
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(window.devicePixelRatio);


        const currentMount = mountRef.current;
        currentMount.appendChild(renderer.domElement);

        const controls = new OrbitControls(camera, renderer.domElement);
        controlsRef.current = controls;
        // camera.position.z = 100;
        camera.position.set(-10, -120, 60);
        // camera.position.set(0, 0, 100);  // Start with a position that works
        controls.enableDamping = true;
        controls.dampingFactor = 0.05;  // amir comment >> this value makes the motion smooth بالعربي بتخلي لما تحرك بالموس و تسيب مش بيقف مره واحده

        const textureLoader = new THREE.TextureLoader();
        const sunTexture = textureLoader.load(sunImg);

        const sunGeometry = new THREE.SphereGeometry(5, 32, 32);
        const sunMaterial = new THREE.MeshBasicMaterial({ map: sunTexture });
        const sunMesh = new THREE.Mesh(sunGeometry, sunMaterial);
        scene.add(sunMesh);

        // ----------------------
        const starCount = 1000;
        const starGeometry = new THREE.BufferGeometry();
        const starSizes = new Float32Array(starCount);
        const starColors = new Float32Array(starCount * 3);

        // Increase sizes of stars
        for (let i = 0; i < starCount; i++) {
            // Modify the size ranges to make the stars larger
            const randomSizeFactor = Math.random();
            if (randomSizeFactor < 0.7) {
                // 70% of stars are small, but larger than before
                starSizes[i] = Math.random() * 0.5 + 0.2; // Small stars (larger base)
            } else if (randomSizeFactor < 0.9) {
                // 20% are medium-sized, with larger sizes
                starSizes[i] = Math.random() * 0.7 + 0.3; // Medium stars
            } else {
                // 10% of stars are larger
                starSizes[i] = Math.random() * 0.9 + 0.5; // Large stars
            }

            // Colors - keep some variation for realism
            starColors[i * 3] = Math.random() * 0.4 + 0.6;   // R
            starColors[i * 3 + 1] = Math.random() * 0.4 + 0.6; // G
            starColors[i * 3 + 2] = Math.random() * 0.5 + 0.5; // B
        }

        starGeometry.setAttribute('size', new THREE.BufferAttribute(starSizes, 1));
        starGeometry.setAttribute('color', new THREE.BufferAttribute(starColors, 3));

        const starMaterial = new THREE.PointsMaterial({
            vertexColors: true,
            sizeAttenuation: true,  // Sizes change with distance
            transparent: true,
            opacity: 0.8,  // Keep the glow effect
            depthWrite: false,
            blending: THREE.AdditiveBlending // Additive blending for glowing stars
        });

        // Star positions - keep them far away
        const starVertices = [];
        for (let i = 0; i < starCount; i++) {
            const distance = (Math.random() * 2000) + 1000; // Stars are far away
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.random() * Math.PI;

            const x = distance * Math.sin(phi) * Math.cos(theta);
            const y = distance * Math.sin(phi) * Math.sin(theta);
            const z = distance * Math.cos(phi);

            starVertices.push(x, y, z);
        }

        starGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starVertices, 3));

        // Create star field and add it to the scene
        const starField = new THREE.Points(starGeometry, starMaterial);
        scene.add(starField);



        // --------------


        // const starGeomety = new THREE.SphereGeometry(3000, 64, 64);
        // const starTexture = textureLoader.load(starfieldImg);
        // const starMaterial = new THREE.MeshBasicMaterial({ map: starTexture, side: THREE.BackSide });
        // const starMesh = new THREE.Mesh(starGeomety, starMaterial);
        // scene.add(starMesh);

        const planets = [
            { name: 'Mercury', details: MERCURY, mesh: mercuryImg, elements: mercuryElements, rates: mercuryRates, color: 0xaaaaaa, scale: 0.5 },
            { name: 'Venus', details: VENUS, mesh: venusImg, elements: venusElements, rates: venusRates, color: 0xffcc33, scale: 1 },
            { name: 'Earth', details: EARTH, mesh: earthImg, elements: earthElements, rates: earthRates, color: 0x0000ff, scale: 1 },
            { name: 'Mars', details: MARS, mesh: marsImg, elements: marsElements, rates: marsRates, color: 0xff0000, scale: 0.75 },
            { name: 'Jupiter', details: JUPITER, mesh: jupiterImg, elements: jupiterElements, rates: jupiterRates, color: 0xffcc00, scale: 1.5 },
            { name: 'Saturn', details: SATURN, mesh: saturnImg, elements: saturnElements, rates: saturnRates, color: 0xffcc99, scale: 1.2 },
            { name: 'Uranus', details: URANUS, mesh: uranusImg, elements: uranusElements, rates: uranusRates, color: 0x66ccff, scale: 1 },
            { name: 'Neptune', details: NEPTUNE, mesh: neptuneImg, elements: neptuneElements, rates: neptuneRates, color: 0x0000cc, scale: 1 },
        ];
        
        

        const planetMeshes = [];
        planets.forEach((planet, index) => {
            const geometry = new THREE.SphereGeometry(planet.scale, 32, 32);
            const textureLoaderPlanet = new THREE.TextureLoader();
            const planetTexture = textureLoaderPlanet.load(planet.mesh);
            const material = new THREE.MeshBasicMaterial({ map: planetTexture });
            const planetMesh = new THREE.Mesh(geometry, material);
            planetMesh.name = planet.name;
            planetMesh.description = planet.description;
            planetMesh.index = index;
        
            // planet details
            planetMesh.name = planet.details.name;
            planetMesh.description = planet.details.description;
            planetMesh.index = index;
            planetMesh.type = planet.details.type;
            planetMesh.yearLength = planet.details.year_length;
            planetMesh.distanceFromSun = planet.details.distance_from_sun;
            planetMesh.namesake = planet.details.namesake;
            planetMesh.moons = planet.details.moons;
            planetMesh.note = planet.details.note;
        
            planetMeshes.push(planetMesh);
            scene.add(planetMesh);
        
            // Check if the current planet is Earth and create a moon
            if (planet.name === 'Earth') {
                const moonGeometry = new THREE.SphereGeometry(0.27, 32, 32); // Moon's radius is about 27% of Earth's
                const moonTexture = textureLoaderPlanet.load(moonImg); // You'll need to add a moon texture
                const moonMaterial = new THREE.MeshBasicMaterial({ map: moonTexture });
                const moonMesh = new THREE.Mesh(moonGeometry, moonMaterial);
                
                // Position the moon relative to Earth
                moonMesh.position.set(2, 0, 0); // Adjust these values to set the moon's distance from Earth
                
                // Create a pivot point for the moon's orbit
                const moonPivot = new THREE.Object3D();
                moonPivot.add(moonMesh);
                planetMesh.add(moonPivot);
            }
        
            const orbitPoints = [];
            for (let i = 0; i <= 360; i++) {
                const theta = (i * Math.PI) / 180;
                const position = calculatePlanetPosition(
                    planet.elements.a,
                    planet.elements.e,
                    planet.elements.I,
                    planet.elements.L + theta,
                    planet.elements.longPeri,
                    planet.elements.longNode,
                    2451545.0,
                    planet.rates
                );
                orbitPoints.push(new THREE.Vector3(position.x * 50, position.y * 50, position.z * 50));
            }
        
            const orbitGeometry = new THREE.BufferGeometry().setFromPoints(orbitPoints);
            const orbitMaterial = new THREE.LineBasicMaterial({ color: 0x282828, });
            const orbitLine = new THREE.Line(orbitGeometry, orbitMaterial);
            scene.add(orbitLine);
        });

        const pointLight = new THREE.PointLight(0xffffff, 1, 1000);
        pointLight.position.set(0, 0, 0);
        scene.add(pointLight);

        let epoch = 2451545.0;
        const animate = () => {
            requestAnimationFrame(animate);

            epoch += rotationSpeed;
            planets.forEach((planet, idx) => {
                const position = calculatePlanetPosition(
                    planet.elements.a,
                    planet.elements.e,
                    planet.elements.I,
                    planet.elements.L,
                    planet.elements.longPeri,
                    planet.elements.longNode,
                    epoch,
                    planet.rates
                );
                planetMeshes[idx].position.set(position.x * 50, position.y * 50, position.z * 50);
            });


            // camer stuff ///////////////////////////////////////////////////////////////////////////

            // if (cameraTarget !== null) {
            //     // Clone the target planet's position
            //     const targetPosition = planetMeshes[cameraTarget].position.clone();

            //     // Adjust offsets for the camera position
            //     const distanceOffset = 50; // Distance from the planet to see the surrounding objects
            //     const heightOffset = 15;    // Height above the target planet
            //     const lateralOffset = -90;   // Move the camera to the side of the planet

            //     // Set the camera position using the offsets
            //     camera.position.copy(targetPosition)
            //         .add(new THREE.Vector3(lateralOffset, heightOffset, distanceOffset));

            //     // Update controls target to the target planet's position
            //     controls.target.copy(targetPosition);
            //     controls.update();
            // }

            // if (cameraTarget !== null) {
            //     const targetPlanet = planetMeshes[cameraTarget];
            //     if (targetPlanet) {
            //         const targetPosition = targetPlanet.position.clone().add(new THREE.Vector3(10, 10,20)); // Adjust camera position offset
            //         camera.position.lerp(targetPosition, 0.1); // Smoothly move the camera
            //         camera.lookAt(targetPlanet.position);
            //     }
            // }


            if (cameraTarget !== null) {
                const targetPlanet = planetMeshes[cameraTarget];
                if (targetPlanet) {
                    const targetPosition = targetPlanet.position.clone().add(new THREE.Vector3(10, 10, 10)); // Offset camera
                    camera.position.lerp(targetPosition, 0.1); // Smooth camera movement
                    controls.target.lerp(targetPlanet.position, 0.1); // Smooth controls target

                    controls.update(); // Keep OrbitControls active
                }
            }



            renderer.render(scene, camera);
        };

        animate();

        const handleMouseClick = (event) => {
            // Update mouse vector with normalized screen coordinates
            mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
            mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

            // Set up the raycaster to intersect objects
            raycaster.setFromCamera(mouse, camera);


            const intersects = raycaster.intersectObjects(planetMeshes);
            if (intersects.length > 0) {
                const clickedPlanet = intersects[0].object;
                setSelectedPlanet(clickedPlanet);
                setDrawerOpen(true); // Open the drawer
                // console.log("hi iam hossam");
                // //////////////////////////////////////////////
                setRotationSpeed(0.0)
                setCameraTarget(clickedPlanet.index)
            }
            if(selectedPlanet) {
                setFocuseState(true)
            } else {
                setFocuseState(false)
            }
        };


        window.addEventListener('click', handleMouseClick);

        return () => {
            window.removeEventListener('click', handleMouseClick);

            currentMount.removeChild(renderer.domElement);
            renderer.dispose();
            scene.remove(starField);

        };
    }, [rotationSpeed, cameraTarget]);

return (
    <div ref={mountRef}>
        {/* Backdrop */}
        {drawerOpen && (
            <div
                className="backdrop"
                style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Dim effect
                    zIndex: 999, // Make sure it's above everything else
                }}
                onClick={() => setDrawerOpen(false)} // Close when clicking outside drawer
            />
        )}

        {/* Speed Controller at the Bottom Center */}
        <div style={{ position: 'absolute', bottom: '20px', left: '50%', transform: 'translateX(-50%)', zIndex: 1000, color: 'white', textAlign: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" style={{ fill: 'white', marginRight: '10px' }}>
                    <path d="M15.41 7l-5.41 5.41L15.41 18l1.41-1.41L12.83 12l3.99-3.99z" />
                </svg>
                <input
                    type="range"
                    
                    min="-2" // Min value for the slider
                    max="2" // Max value for the slider
                    step="0.01"
                    value={rotationSpeed} // Current value for the slider
                    onChange={(e) => {
                        setRotationSpeed(parseFloat(e.target.value));
                        console.log("Speed of rotation: ", parseFloat(e.target.value));
                    }}
                    style={{
                        margin: '0 10px', // Space around the slider
                        verticalAlign: 'middle',
                        appearance: 'none',
                        width: '200px', // Width of the slider
                        background: 'rgba(255, 255, 255, 0.3)', // Background of the slider
                        borderRadius: '5px',
                        height: '10px',
                    }}
                />
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" style={{ fill: 'white', marginLeft: '10px' }}>
                    <path d="M8.59 16l5.41-5.41L8.59 5l-1.41 1.41L11.17 12l-4.99 4.99z" />
                </svg>
            </div>
        </div>

        {/* Normal Mode Button on Left Side Centered Vertically */}
        <div style={{ position: 'absolute', top: '50%', left: '10px', transform: 'translateY(-50%)', zIndex: 1000, color: 'white' }}>
            {focuseState && !drawerOpen && cameraTarget &&(
                <button
                    onClick={() => setCameraTarget(null)}
                    style={{
                        ...buttonStyle,
                        display: 'flex',
                        alignItems: 'center',
                    }}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" style={{ fill: 'white', marginRight: '5px' }}>
                        <path d="M15.41 7l-5.41 5.41L15.41 18l1.41-1.41L12.83 12l3.99-3.99z" />
                    </svg>
                </button>
            )}
        </div>

            {/* Drawer for planet details */}
            <Drawer 
                isOpen={drawerOpen} 
                onClose={() => setDrawerOpen(false)}
                planet={selectedPlanet}
            />
                {/* <button
                    onClick={() => setRotationSpeed(0.2)} // amir comment, when clicked, it return from the stat position to the rotate  position
                    style={buttonStyle}
                >
                    return
                </button>
            </div> */}

            {/* Drawer for planet details */}

            {/* <img src={sunImg} alt="" /> */}
        </div>
    );
};


// function createStarfield(scene) {
//     const starCount = 10000; // Number of stars
//     const starsGeometry = new THREE.BufferGeometry();
//     const starPositions = new Float32Array(starCount * 3); // Each star needs an x, y, z position
//     const starColors = new Float32Array(starCount * 3); // RGB values for each star

//     // Create a simple star texture
//     const starTexture = new THREE.TextureLoader().load('starfield.jpg'); // Use a small circular white texture

//     // Loop through and set random positions and color variations
//     for (let i = 0; i < starCount; i++) {
//         const x = (Math.random() - 0.5) * 2000; // Random position within a cube of size 2000
//         const y = (Math.random() - 0.5) * 2000;
//         const z = (Math.random() - 0.5) * 2000;

//         starPositions[i * 3] = x;
//         starPositions[i * 3 + 1] = y;
//         starPositions[i * 3 + 2] = z;

//         // Color variation: blueish, yellowish, reddish tones
//         const colorOffset = Math.random() * 0.2;
//         starColors[i * 3] = 1.0 - colorOffset; // Red component
//         starColors[i * 3 + 1] = 1.0 - (colorOffset * 2); // Green component
//         starColors[i * 3 + 2] = 1.0; // Blue component
//     }

//     // Assign positions and colors to the geometry
//     starsGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
//     starsGeometry.setAttribute('color', new THREE.BufferAttribute(starColors, 3));

//     // Create the material for the stars
//     const starsMaterial = new THREE.PointsMaterial({
//         size: 1.5, // Size of each star
//         map: starTexture, // Use the star texture
//         transparent: true, // Ensure the stars blend nicely
//         depthWrite: false, // Avoid writing to the depth buffer (makes it appear behind objects)
//         blending: THREE.AdditiveBlending, // Additive blending for glow effect
//         vertexColors: true, // Enable vertex colors for star color variation
//     });

//     // Create the points object for the starfield
//     const starfield = new THREE.Points(starsGeometry, starsMaterial);
//     scene.add(starfield);
// }

const buttonStyle = {
    margin: '5px',
    padding: '10px',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    color: 'white',
    transition: '0.3s',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.5)',
    onMouseOver: (e) => (e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.5)'),
    onMouseOut: (e) => (e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.2)'),
};

export default SolarSystem;