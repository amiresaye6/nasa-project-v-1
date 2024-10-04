import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import earthImg from './textures/earth.jpg';

const Earth = () => {
  const mountRef = useRef(null);
  const [error, setError] = useState(null);
  const earthRadius = 1; // Scale for Earth
  const neoScale = 0.05; // Increased size for visibility
  const neoOffset = 7; // Increased offset for better visibility
  const TIME_STEP = 0.001; // Step to simulate time in orbits

  useEffect(() => {
    if (!mountRef.current) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75,
      mountRef.current.clientWidth / mountRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.z = 5;

    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    mountRef.current.appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0xffffff, 1);
    pointLight.position.set(10, 10, 10);
    scene.add(pointLight);

    const earthGeometry = new THREE.SphereGeometry(earthRadius, 32, 32);
    const textureLoader = new THREE.TextureLoader();
    const earthTexture = textureLoader.load(earthImg);
    const earthMaterial = new THREE.MeshStandardMaterial({ map: earthTexture });
    const earthMesh = new THREE.Mesh(earthGeometry, earthMaterial);
    scene.add(earthMesh);

    const objects = [];

    // Fetch and add NEO and PHO data
    fetch("https://data.nasa.gov/resource/b67r-rgxc.json")
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => {
        data.slice(0, 100).forEach(item => { // Limit to 100 objects for performance
          const { e, i_deg, node_deg, w_deg, q_au_1, moid_au } = item;

          const iRad = THREE.MathUtils.degToRad(parseFloat(i_deg));
          const nodeRad = THREE.MathUtils.degToRad(parseFloat(node_deg));
          const periRad = THREE.MathUtils.degToRad(parseFloat(w_deg));

          const rates = {
            a_rate: Math.random() * 0.001 - 0.0005,
            e_rate: Math.random() * 0.0002 - 0.0001,
            i_rate: Math.random() * 0.001 - 0.0005,
            node_rate: Math.random() * 0.001 - 0.0005,
            peri_rate: Math.random() * 0.001 - 0.0005
          };

          const objectGeometry = new THREE.SphereGeometry(neoScale, 16, 16);
          const isPHO = parseFloat(moid_au) < 0.05;
          const objectMaterial = new THREE.MeshStandardMaterial({ 
            color: isPHO ? 0xff0000 : 0x808080,
            emissive: isPHO ? 0xff0000 : 0x808080,
            emissiveIntensity: 0.5
          });

          const objectMesh = new THREE.Mesh(objectGeometry, objectMaterial);
          scene.add(objectMesh);

          // Assign a random starting angle for each object
          const startAngle = Math.random() * 2 * Math.PI;

          objects.push({
            mesh: objectMesh,
            params: { a: parseFloat(q_au_1), e: parseFloat(e), i: iRad, node: nodeRad, peri: periRad },
            rates: rates,
            startAngle: startAngle // Starting angle for orbital motion
          });
        });
      })
      .catch(error => {
        console.error('Error fetching data:', error);
        setError('Failed to load NEO and PHO data. Please try again later.');
      });

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = 3;
    controls.maxDistance = 20;

    const animate = () => {
      requestAnimationFrame(animate);
      
      objects.forEach(obj => {
        const { mesh, params, rates, startAngle } = obj;
        
        // Update orbital elements
        params.a += rates.a_rate;
        params.e += rates.e_rate;
        params.i += rates.i_rate;
        params.node += rates.node_rate;
        params.peri += rates.peri_rate;

        // Calculate new position using a time-based angle
        const theta = (Date.now() * TIME_STEP + startAngle) % (2 * Math.PI); // Time-based angle
        const r = (params.a * (1 - Math.pow(params.e, 2))) / (1 + params.e * Math.cos(theta));
        
        const x = r * Math.cos(theta);
        const y = r * Math.sin(theta) * Math.cos(params.i);
        const z = r * Math.sin(theta) * Math.sin(params.i);

        // Apply rotation based on ascending node and argument of periapsis
        const rotatedX = x * Math.cos(params.node) - y * Math.sin(params.node);
        const rotatedY = x * Math.sin(params.node) + y * Math.cos(params.node);
        const rotatedZ = z;

        // Scale and offset the position
        mesh.position.set(
          rotatedX * neoOffset,
          rotatedY * neoOffset,
          rotatedZ * neoOffset
        );
      });

      controls.update();
      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!mountRef.current) return;
      const width = mountRef.current.clientWidth;
      const height = mountRef.current.clientHeight;
      renderer.setSize(width, height);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    };
    window.addEventListener('resize', handleResize);

    return () => {
      if (mountRef.current) {
        mountRef.current.removeChild(renderer.domElement);
      }
      window.removeEventListener('resize', handleResize);
      controls.dispose();
    };
  }, []);

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div
      ref={mountRef}
      style={{ width: '100%', height: '100vh' }}
    />
  );
};

export default Earth;
