import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import sunImg from "./textures/sun.jpg";
import venusImg from "./textures/venus.jpg";
import earthImg from "./textures/earth.jpg";
import saturnImg from "./textures/saturn.jpg";
import marsImg from "./textures/mars.jpg";
import jupiterImg from "./textures/jupiter.jpg";
import uranusImg from "./textures/uranus.jpg";
import neptuneImg from "./textures/neptune.jpg";
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

// Keplerian element calculations for planet positions
const calculatePlanetPosition = (a, e, I, L, longPeri, longNode, epoch, rates) => {
    const T = (epoch - 2451545.0) / 36525; // Centuries past J2000.0

    // Update the orbital elements using the rates of change
    const updatedL = L + T * rates.L_rate; // Mean longitude
    const updatedA = a + T * rates.a_rate; // Semi-major axis
    const updatedE = e + T * rates.e_rate; // Eccentricity
    const updatedI = I + T * rates.I_rate; // Inclination
    const updatedPeri = longPeri + T * rates.longPeri_rate; // Longitude of perihelion
    const updatedNode = longNode + T * rates.longNode_rate; // Longitude of ascending node

    // Calculate mean anomaly
    let M = updatedL - updatedPeri;
    M = M % (2 * Math.PI); // Normalize to 0-2π

    // Initial guess for eccentric anomaly
    let E = M;

    // Solve Kepler's equation iteratively for E
    for (let i = 0; i < 10; i++) {
        E = M + updatedE * Math.sin(E);
    }

    // Heliocentric coordinates in the orbital plane
    const x = updatedA * (Math.cos(E) - updatedE);
    const y = updatedA * Math.sqrt(1 - updatedE * updatedE) * Math.sin(E);

    // Convert to 3D space using inclination and node
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
    const [rotationSpeed, setRotationSpeed] = useState(0.1);
    const [cameraTarget, setCameraTarget] = useState(null); // State to track the focused planet

    useEffect(() => {
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.051, 3000);
        const renderer = new THREE.WebGLRenderer();
        renderer.setSize(window.innerWidth, window.innerHeight);
        mountRef.current.appendChild(renderer.domElement);

        const controls = new OrbitControls(camera, renderer.domElement);
        camera.position.z = 100; // Initial camera position
        controls.enableDamping = true; // Smooth movement
        controls.dampingFactor = 0.25;

        // Add Sun
        // const sunGeometry = new THREE.SphereGeometry(5, 32, 32);
        // const sunMaterial = new THREE.MeshBasicMaterial({ color: 0xffff00 });
        // const sunMesh = new THREE.Mesh(sunGeometry, sunMaterial);
        // scene.add(sunMesh);
        // Load Sun texture
        const textureLoader = new THREE.TextureLoader();
        const sunTexture = textureLoader.load(sunImg); // Update with your texture path

        // Add Sun with texture
        const sunGeometry = new THREE.SphereGeometry(5, 32, 32);
        const sunMaterial = new THREE.MeshBasicMaterial({ map: sunTexture }); // Use texture for the Sun
        const sunMesh = new THREE.Mesh(sunGeometry, sunMaterial);
        scene.add(sunMesh);

        // Create planets and orbit paths
        const planets = [
            { name: 'Mercury', mesh: sunImg, elements: mercuryElements, rates: mercuryRates, color: 0xaaaaaa, scale: 0.5 },
            { name: 'Venus', mesh: venusImg, elements: venusElements, rates: venusRates, color: 0xffcc33, scale: 1 },
            { name: 'Earth', mesh: earthImg, elements: earthElements, rates: earthRates, color: 0x0000ff, scale: 1 },
            { name: 'Mars', mesh: marsImg, elements: marsElements, rates: marsRates, color: 0xff0000, scale: 0.75 },
            { name: 'Jupiter', mesh: jupiterImg, elements: jupiterElements, rates: jupiterRates, color: 0xffcc00, scale: 1.5 },
            { name: 'Saturn', mesh: saturnImg, elements: saturnElements, rates: saturnRates, color: 0xffcc99, scale: 1.2 },
            { name: 'Uranus', mesh: uranusImg, elements: uranusElements, rates: uranusRates, color: 0x66ccff, scale: 1 },
            { name: 'Neptune', mesh: neptuneImg, elements: neptuneElements, rates: neptuneRates, color: 0x0000cc, scale: 1 },
        ];

        const planetMeshes = [];
        planets.forEach(planet => {
            const geometry = new THREE.SphereGeometry(planet.scale, 32, 32);
            const textureLoaderPlanet = new THREE.TextureLoader();
            const texteur = textureLoaderPlanet.load(planet.mesh); // Update with your texture path
            // const material = new THREE.MeshBasicMaterial({ color: planet.color });
            const material = new THREE.MeshBasicMaterial({ map: texteur }); // Use texture for the Sun
            const planetMesh = new THREE.Mesh(geometry, material);
            planetMeshes.push(planetMesh);
            scene.add(planetMesh);


            // Create orbit line
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
                    2451545.0, // Base epoch (replace this with real-time logic later)
                    planet.rates
                );
                orbitPoints.push(new THREE.Vector3(position.x * 50, position.y * 50, position.z * 50));
            }

            const orbitGeometry = new THREE.BufferGeometry().setFromPoints(orbitPoints);
            const orbitMaterial = new THREE.LineBasicMaterial({ color: 0x888888 });
            const orbitLine = new THREE.Line(orbitGeometry, orbitMaterial);
            scene.add(orbitLine);
        });

        const pointLight = new THREE.PointLight(0xffffff, 1, 1000);
        pointLight.position.set(0, 0, 0);
        scene.add(pointLight);

        // Animation loop
        let epoch = 2451545.0; // Starting epoch
        const animate = () => {
            requestAnimationFrame(animate);

            // Increment epoch to simulate time passing, controlled by rotationSpeed
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

            // If a camera target is set, move the camera towards it
            if (cameraTarget !== null) {
                const targetPosition = planetMeshes[cameraTarget].position.clone();
                camera.position.copy(targetPosition).add(new THREE.Vector3(0, 0, 20)); // Adjust distance as needed
                controls.target.copy(targetPosition); // Update control target to the focused planet
                controls.update(); // Update controls after modifying the target
            }

            controls.update();
            renderer.render(scene, camera);
        };

        animate();

        return () => {
            const mountElement = mountRef.current;
            if (mountElement) {
                mountElement.removeChild(renderer.domElement);
            }
        };
    }, [rotationSpeed, cameraTarget]); // Depend on rotationSpeed and cameraTarget

    return (
        <div ref={mountRef}>
            <div style={{ position: 'absolute', top: '10px', left: '10px', zIndex: 1000, color: 'white' }}>
                Speed:
                <input
                    type="range"
                    min="0"
                    max="2"
                    step="0.01"
                    value={rotationSpeed}
                    onChange={(e) => setRotationSpeed(parseFloat(e.target.value))}
                    style={{ marginLeft: '10px', verticalAlign: 'middle' }}
                />
            </div>
            <div style={{ position: 'absolute', top: '50px', left: '10px', zIndex: 1000, color: 'white' }}>
                {['Mercury', 'Venus', 'Earth', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune'].map((planet, index) => (
                    <button
                        key={planet}
                        onClick={() => setCameraTarget(index)} // Focus on the clicked planet
                        style={{
                            margin: '5px',
                            padding: '10px',
                            backgroundColor: 'rgba(255, 255, 255, 0.2)',
                            border: 'none',
                            borderRadius: '5px',
                            cursor: 'pointer',
                            color: 'white',
                            transition: '0.3s',
                            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.5)',
                        }}
                        onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.5)'}
                        onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.2)'}
                    >
                        {planet}
                    </button>
                ))}
                <button
                    onClick={() => setCameraTarget(null)} // Return to normal mode
                    style={{
                        margin: '5px',
                        padding: '10px',
                        backgroundColor: 'rgba(255, 255, 255, 0.2)',
                        border: 'none',
                        borderRadius: '5px',
                        cursor: 'pointer',
                        color: 'white',
                        transition: '0.3s',
                        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.5)',
                    }}
                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.5)'}
                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.2)'}
                >
                    Normal Mode
                </button>
            </div>
            {/* <img src={sunImg} alt="" /> */}
        </div>
    );
};

export default SolarSystem;
