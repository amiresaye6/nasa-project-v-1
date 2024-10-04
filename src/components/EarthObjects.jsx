// SphereVisualization.js
import React, { useEffect } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'; // Import OrbitControls

const data = [
  {
    object: "P/2008 Y1 (Boattini)",
    q_au_1: "1.27197954", // Distance from the Sun in AU
  },
  {
    object: "P/2008 Y12 (SOHO)",
    q_au_1: "0.06541368648",
  },
  {
    object: "P/2009 L2 (Yang-Gao)",
    q_au_1: "1.296125756",
  },
  {
    object: "P/2009 WX51 (Catalina)",
    q_au_1: "0.7999555439",
  },
  {
    object: "C/2010 L5 (WISE)",
    q_au_1: "0.7909008329",
  },
  {
    object: "P/2011 NO1 (Elenin)",
    q_au_1: "1.242925561",
  },
  {
    object: "C/2011 S2 (Kowalski)",
    q_au_1: "1.115118144",
  },
];

const EARTH_DIAMETER_KM = 12742; // Earth's diameter in km
const AU_TO_KM = 149597870.7; // 1 Astronomical Unit in km
const EARTH_RADIUS_SCALE = EARTH_DIAMETER_KM / 2000; // Scale Earth's radius

const SphereVisualization = () => {
  useEffect(() => {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    // Set background color
    scene.background = new THREE.Color(0x222222); // Dark background

    // Create a sphere for the Earth
    const earthGeometry = new THREE.SphereGeometry(EARTH_RADIUS_SCALE, 32, 32); // Earth's scaled size
    const earthMaterial = new THREE.MeshBasicMaterial({ color: 0x0000ff });
    const earth = new THREE.Mesh(earthGeometry, earthMaterial);
    scene.add(earth);

    // Create spheres for each object (asteroid or comet)
    data.forEach((item) => {
      const distanceAU = parseFloat(item.q_au_1); // Distance from the Sun in AU
      const sphereGeometry = new THREE.SphereGeometry(0.1, 32, 32); // Smaller sphere for asteroids
      const sphereMaterial = new THREE.MeshBasicMaterial({ color: Math.random() * 0xffffff });
      const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
      
      // Positioning the sphere at the correct distance from Earth (scaled)
      const scaledDistance = (distanceAU - 1) * 50; // Subtract 1 to make distance relative to Earth's orbit
      sphere.position.set(scaledDistance, 0, 0); // Place along x-axis
      scene.add(sphere);

      console.log(`Added ${item.object} at distance AU: ${distanceAU}, scaled distance: ${scaledDistance}`);
    });

    camera.position.z = 150; // Adjust camera position to see spheres

    // Add OrbitControls for interactivity
    const controls = new OrbitControls(camera, renderer.domElement);

    const animate = () => {
      requestAnimationFrame(animate);
      controls.update(); // Update controls
      renderer.render(scene, camera);
    };

    animate();

    // Clean up on unmount
    return () => {
      document.body.removeChild(renderer.domElement);
    };
  }, []);

  return null; // No UI to render
};

export default SphereVisualization;
