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
import starfieldImg from "./textures/starfield.jpg";
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
const planetDescriptions = {
    Mercury: "Mercury is the closest planet to the Sun...",
    Venus: "Venus is the second planet from the Sun...",
    Earth: "Earth is our home planet...",
    Mars: "Mars is the fourth planet from the Sun...",
    Jupiter: "Jupiter is the largest planet in our solar system...",
    Saturn: "Saturn is known for its ring system...",
    Uranus: "Uranus is an ice giant...",
    Neptune: "Neptune is the farthest planet from the Sun...",
};

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
    const [rotationSpeed, setRotationSpeed] = useState(0.1);
    const [cameraTarget, setCameraTarget] = useState(null);
    const [drawerOpen, setDrawerOpen] = useState(false);  // State for drawer visibility
    const [selectedPlanet, setSelectedPlanet] = useState(null); // State for selected planet
    const [hoveredPlanetIndex, setHoveredPlanetIndex] = useState(null); // State for hovered planet

    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();


    useEffect(() => {
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.051, 3000);
        const renderer = new THREE.WebGLRenderer();
        renderer.setSize(window.innerWidth, window.innerHeight);
        
        const currentMount = mountRef.current;
        currentMount.appendChild(renderer.domElement);

        const controls = new OrbitControls(camera, renderer.domElement);
        // camera.position.z = 100;
        camera.position.set(-10, -120, 60);
        controls.enableDamping = true;
        controls.dampingFactor = 0.25;

        const textureLoader = new THREE.TextureLoader();
        const sunTexture = textureLoader.load(sunImg);

        const sunGeometry = new THREE.SphereGeometry(5, 32, 32);
        const sunMaterial = new THREE.MeshBasicMaterial({ map: sunTexture });
        const sunMesh = new THREE.Mesh(sunGeometry, sunMaterial);
        scene.add(sunMesh);

        // const starGeomety = new THREE.SphereGeometry(3000, 64, 64);
        // const starTexture = textureLoader.load(starfieldImg);
        // const starMaterial = new THREE.MeshBasicMaterial({ map: starTexture, side: THREE.BackSide });
        // const starMesh = new THREE.Mesh(starGeomety, starMaterial);
        // scene.add(starMesh);

        const planets = [
            { name: 'Mercury', description: planetDescriptions.Mercury, mesh: mercuryImg, elements: mercuryElements, rates: mercuryRates, color: 0xaaaaaa, scale: 0.5 },
            { name: 'Venus', description: planetDescriptions.Venus, mesh: venusImg, elements: venusElements, rates: venusRates, color: 0xffcc33, scale: 1 },
            { name: 'Earth', description: planetDescriptions.Earth, mesh: earthImg, elements: earthElements, rates: earthRates, color: 0x0000ff, scale: 1 },
            { name: 'Mars', description: planetDescriptions.Mars, mesh: marsImg, elements: marsElements, rates: marsRates, color: 0xff0000, scale: 0.75 },
            { name: 'Jupiter', description: planetDescriptions.Jupiter, mesh: jupiterImg, elements: jupiterElements, rates: jupiterRates, color: 0xffcc00, scale: 1.5 },
            { name: 'Saturn', description: planetDescriptions.Saturn, mesh: saturnImg, elements: saturnElements, rates: saturnRates, color: 0xffcc99, scale: 1.2 },
            { name: 'Uranus', description: planetDescriptions.Uranus, mesh: uranusImg, elements: uranusElements, rates: uranusRates, color: 0x66ccff, scale: 1 },
            { name: 'Neptune', description: planetDescriptions.Neptune, mesh: neptuneImg, elements: neptuneElements, rates: neptuneRates, color: 0x0000cc, scale: 1 },
        ];

        const planetMeshes = [];
        planets.forEach(planet => {
            const geometry = new THREE.SphereGeometry(planet.scale, 32, 32);
            const textureLoaderPlanet = new THREE.TextureLoader();
            const planetTexture = textureLoaderPlanet.load(planet.mesh);
            const material = new THREE.MeshBasicMaterial({ map: planetTexture });
            const planetMesh = new THREE.Mesh(geometry, material);
            planetMesh.name = planet.name; // Name the mesh
            planetMesh.description = planet.description; // Name the mesh

            planetMeshes.push(planetMesh);
            scene.add(planetMesh);

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

            if (cameraTarget !== null) {
                const targetPosition = planetMeshes[cameraTarget].position.clone();
                camera.position.copy(targetPosition).add(new THREE.Vector3(0, 0, 20));
                controls.target.copy(targetPosition);
                controls.update();
            }

            controls.update();
            renderer.render(scene, camera);
        };

        animate();

        const handleMouseClick = (event) => {
            // Update mouse vector with normalized screen coordinates
            mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
            mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

            // Set up the raycaster to intersect objects
            raycaster.setFromCamera(mouse, camera);
            console.log("hi iam hossam");
            

            const intersects = raycaster.intersectObjects(planetMeshes);
            if (intersects.length > 0) {
                const clickedPlanet = intersects[0].object;
                
                setSelectedPlanet(clickedPlanet);
                setDrawerOpen(true); // Open the drawer
            }
        };

        window.addEventListener('click', handleMouseClick);


        return () => {
            window.removeEventListener('click', handleMouseClick);

            currentMount.removeChild(renderer.domElement);
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
            {/* <div style={{ position: 'absolute', top: '50px', left: '10px', zIndex: 1000, color: 'white' }}>
                {['Mercury', 'Venus', 'Earth', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune'].map((planet, index) => (
                    <button
                        key={planet}
                        onClick={() => setCameraTarget(index)}
                        style={buttonStyle}
                    >
                        {planet}
                    </button>
                ))}
                <button
                    onClick={() => setCameraTarget(null)}
                    style={buttonStyle}
                >
                    Normal Mode
                </button>
            </div> */}

            {/* Drawer for planet details */}
            <Drawer 
                isOpen={drawerOpen} 
                onClose={() => setDrawerOpen(false)}
                planetName={selectedPlanet?.name || ''}
                planetDescription={selectedPlanet?.description || ''}
            />
            {/* <img src={sunImg} alt="" /> */}
        </div>
    );
};

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