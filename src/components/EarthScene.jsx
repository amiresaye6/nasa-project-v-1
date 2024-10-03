import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import earthImg from './textures/earth.jpg';

const OrbitingObjects = () => {
  const mountRef = useRef(null);
  const EARTH_DIAMETER_KM = 12742; // Earth diameter in km
  const SCALE_FACTOR = 0.001; // Scale to use in the Three.js scene (1 unit = 1000 km)

  useEffect(() => {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer();

    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000); // Black background

    if (mountRef.current) {
      mountRef.current.appendChild(renderer.domElement);
    }

    // Create Earth sphere with real size scaled down
    const earthGeometry = new THREE.SphereGeometry(EARTH_DIAMETER_KM * SCALE_FACTOR / 2, 32, 32); // Earth's radius
    const earthTexture = new THREE.TextureLoader().load(earthImg);
    const earthMaterial = new THREE.MeshBasicMaterial({ map: earthTexture });
    const earth = new THREE.Mesh(earthGeometry, earthMaterial);
    scene.add(earth);

    // Orbit controls for free movement
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.screenSpacePanning = false;
    controls.minDistance = 1;
    controls.maxDistance = 1000;

    // Function to draw orbits
    const drawOrbit = (semiMajorAxis, eccentricity, inclination) => {
      const curve = new THREE.EllipseCurve(
        0, 0, // center x, y
        semiMajorAxis, semiMajorAxis * (1 - eccentricity), // x radius, y radius (flattened by eccentricity)
        0, 2 * Math.PI, // startAngle, endAngle
        false, 0 // clockwise, rotation
      );

      const points = curve.getPoints(100);
      const geometry = new THREE.BufferGeometry().setFromPoints(points);
      const material = new THREE.LineBasicMaterial({ color: 0x808080, opacity: 0.5, transparent: true }); // Gray color for orbits
      const orbit = new THREE.Line(geometry, material);
      orbit.rotation.x = inclination; // Tilt the orbit based on inclination

      return orbit;
    };

    // Load near-Earth objects
    const loadData = async () => {
      try {
        const response = await fetch('https://data.nasa.gov/resource/b67r-rgxc.json');
        const data = await response.json();

        data.forEach((obj) => {
          const {
            i_deg,   // inclination
            w_deg,   // argument of periapsis
            node_deg,// longitude of ascending node
            q_au_1,  // periapsis distance (in AU)
            e,       // eccentricity
            object_name,
          } = obj;

          // Convert degrees to radians
          const i = THREE.MathUtils.degToRad(i_deg);
          const w = THREE.MathUtils.degToRad(w_deg);
          const node = THREE.MathUtils.degToRad(node_deg);

          // Convert periapsis distance from AU to km and then to scale
          const q = parseFloat(q_au_1) * 149597870.7; // 1 AU in km
          const scaledQ = q * SCALE_FACTOR; // Scaled periapsis distance

          // Create and add orbit (using semi-major axis and eccentricity)
          const semiMajorAxis = scaledQ; // Use the scaled periapsis distance
          const orbit = drawOrbit(semiMajorAxis, parseFloat(e), i);
          scene.add(orbit);

          // Create near-Earth object with a size relative to Earth
          const objectGeometry = new THREE.SphereGeometry(EARTH_DIAMETER_KM * SCALE_FACTOR / 10, 16, 16); // Smaller size
          const objectMaterial = new THREE.MeshBasicMaterial({ color: 0x808080 }); // Gray color for objects
          const orbitingObject = new THREE.Mesh(objectGeometry, objectMaterial);

          // Set the initial position of the object based on its distance from Earth
          orbitingObject.position.set(scaledQ, 0, 0); // Position it on the x-axis

          // Add to scene
          scene.add(orbitingObject);
        });
      } catch (error) {
        console.error('Error loading near-Earth objects data:', error);
      }
    };

    loadData();

    // Set camera position
    camera.position.z = 5;

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      controls.update(); // Update orbit controls
      renderer.render(scene, camera);
    };

    animate();

    // Clean up
    return () => {
      if (mountRef.current) {
        mountRef.current.removeChild(renderer.domElement); // Ensure it's still mounted before removing
      }
    };
  }, []);

  return <div ref={mountRef} />;
};

export default OrbitingObjects;
