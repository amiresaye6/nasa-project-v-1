import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

// Load textures using require
const sunTextureImg = require('./textures/sun.jpg');
const mercuryTextureImg = require('./textures/mercury.jpg');
const venusTextureImg = require('./textures/venus.jpg');
const earthTextureImg = require('./textures/earth.jpg');
const marsTextureImg = require('./textures/mars.jpg');
const jupiterTextureImg = require('./textures/jupiter.jpg');
const saturnTextureImg = require('./textures/saturn.jpg');
const uranusTextureImg = require('./textures/uranus.jpg');
const neptuneTextureImg = require('./textures/neptune.jpg');

const AU = 149597870.7; // Astronomical Unit in kilometers
const scaleDistance = 1 / AU * 50; // Scale factor for distances
const scaleSize = 1 / 10000; // Scale factor for planet sizes

const SolarSystem = () => {
    const mountRef = useRef(null);

    useEffect(() => {
        let width = window.innerWidth;
        let height = window.innerHeight;
        let frameId;

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 10000);
        camera.position.z = 200;

        const renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(width, height);
        mountRef.current.appendChild(renderer.domElement);

        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.3;

        // Add Sun
        const sunTexture = new THREE.TextureLoader().load(sunTextureImg);
        const sunGeometry = new THREE.SphereGeometry(696340 * scaleSize * 0.4, 32, 32); // Scaled radius of the Sun
        const sunMaterial = new THREE.MeshBasicMaterial({ map: sunTexture });
        const sun = new THREE.Mesh(sunGeometry, sunMaterial);
        scene.add(sun);

        // Create a star geometry for instancing
        const starGeometry = new THREE.SphereGeometry(0.1, 8, 8); // Small sphere for stars
        const starMaterial = new THREE.MeshBasicMaterial({
            color: 0xadd8e6,
            emissive: 0xadd8e6, // Emissive color for glowing effect
            transparent: true,
            opacity: 0.8,
        }); // Light blue color

        const starCount = 10000; // Number of stars
        const stars = new THREE.InstancedMesh(starGeometry, starMaterial, starCount);

        // Position the stars randomly in space
        const dummy = new THREE.Object3D();
        for (let i = 0; i < starCount; i++) {
            const x = (Math.random() - 0.5) * 2000; // Random position in x
            const y = (Math.random() - 0.5) * 2000; // Random position in y
            const z = (Math.random() - 0.5) * 2000; // Random position in z

            dummy.position.set(x, y, z);
            dummy.updateMatrix(); // Update the matrix for this instance
            stars.setMatrixAt(i, dummy.matrix); // Set the matrix for the instance
        }
        scene.add(stars); // Add all stars to the scene

        // Add lights
        const sunLight = new THREE.PointLight(0xffffff, 1, 1000); // Light to illuminate the planets
        sunLight.position.set(0, 0, 0);
        scene.add(sunLight);

        const ambientLight = new THREE.AmbientLight(0x404040, 1); // Soft ambient light
        scene.add(ambientLight);

        // Realistic planet data with axial tilts (in degrees)
        const planetsData = [
            { name: 'Mercury', radius: 2439.7, distance: 57910000, angle: 0, tilt: 0.034, texture: mercuryTextureImg },
            { name: 'Venus', radius: 6051.8, distance: 108200000, angle: Math.PI / 2, tilt: 177.4, texture: venusTextureImg },
            { name: 'Earth', radius: 6371, distance: 149600000, angle: Math.PI, tilt: 23.44, texture: sunTextureImg },
            { name: 'Mars', radius: 3389.5, distance: 227900000, angle: (3 * Math.PI) / 2, tilt: 25.19, texture: marsTextureImg },
            { name: 'Jupiter', radius: 69911, distance: 778300000, angle: 0, tilt: 3.13, texture: jupiterTextureImg },
            { name: 'Saturn', radius: 58232, distance: 1427000000, angle: Math.PI / 2, tilt: 26.73, texture: saturnTextureImg },
            { name: 'Uranus', radius: 25362, distance: 2871000000, angle: Math.PI, tilt: 97.77, texture: uranusTextureImg },
            { name: 'Neptune', radius: 24622, distance: 4495000000, angle: (3 * Math.PI) / 2, tilt: 28.32, texture: neptuneTextureImg },
        ];

        const planets = [];
        planetsData.forEach((planetData) => {
            const planetTexture = new THREE.TextureLoader().load(planetData.texture);
            const planetGeometry = new THREE.SphereGeometry(planetData.radius * scaleSize, 32, 32);
            const planetMaterial = new THREE.MeshPhongMaterial({ map: planetTexture });
            const planetMesh = new THREE.Mesh(planetGeometry, planetMaterial);

            // Set initial position based on angle
            planetMesh.position.x = planetData.distance * scaleDistance * Math.cos(planetData.angle);
            planetMesh.position.z = planetData.distance * scaleDistance * Math.sin(planetData.angle);

            // Apply tilt to the planet's orbit
            planetMesh.rotation.y = THREE.MathUtils.degToRad(planetData.tilt);
            scene.add(planetMesh);

            // Add a point light for each planet
            const planetLight = new THREE.PointLight(0xffffff, 0.5, 100); // Adjust intensity and distance as needed
            planetLight.position.copy(planetMesh.position); // Position the light at the planet's location
            scene.add(planetLight);

            // Create orbit line
            const orbitGeometry = new THREE.CircleGeometry(planetData.distance * scaleDistance, 64);
            const orbitMaterial = new THREE.LineBasicMaterial({ color: 0xffffff, opacity: 0.5, transparent: true });
            const orbitLine = new THREE.LineLoop(orbitGeometry, orbitMaterial);
            orbitLine.rotation.x = Math.PI / 2; // Rotate the orbit line to lie flat
            orbitLine.rotation.y = THREE.MathUtils.degToRad(planetData.tilt); // Apply tilt to the orbit
            // scene.add(orbitLine);    

            planets.push({ mesh: planetMesh, distance: planetData.distance * scaleDistance });
        });

        const animate = () => {
            planets.forEach((planet, index) => {
                const angleSpeed = 0.001; // Control the speed of rotation
                const angle = Date.now() * angleSpeed * (index + 1);
                planet.mesh.position.x = planet.distance * Math.cos(angle);
                planet.mesh.position.z = planet.distance * Math.sin(angle);
                planet.mesh.rotation.y += 0.01;

                // Update the position of the planet's light
                const light = scene.children.find(child => child instanceof THREE.PointLight && child.position.equals(planet.mesh.position));
                if (light) {
                    light.position.copy(planet.mesh.position);
                }
            });

            controls.update();
            renderer.render(scene, camera);
            frameId = window.requestAnimationFrame(animate);
        };

        animate();

        const handleResize = () => {
            width = window.innerWidth;
            height = window.innerHeight;
            renderer.setSize(width, height);
            camera.aspect = width / height;
            camera.updateProjectionMatrix();
        };

        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
            window.cancelAnimationFrame(frameId);
            mountRef.current.removeChild(renderer.domElement);
        };
    }, []);

    return <div ref={mountRef} style={{ width: '100%', height: '100vh' }} />;
};

export default SolarSystem;
