import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

const SphereScene = () => {
    const mountRef = useRef(null);
    const spheres = useRef([]);
    const speeds = useRef([]);

    useEffect(() => {
        // Scene setup
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        const renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        mountRef.current.appendChild(renderer.domElement);

        // Create OrbitControls
        const controls = new OrbitControls(camera, renderer.domElement);

        // Create spheres and add them to the scene
        for (let i = 0; i < 5; i++) {
            const geometry = new THREE.SphereGeometry(0.5, 32, 32);
            const material = new THREE.MeshBasicMaterial({ color: Math.random() * 0xffffff });
            const sphere = new THREE.Mesh(geometry, material);

            // Random position
            sphere.position.set(
                (Math.random() - 0.5) * 10,
                (Math.random() - 0.5) * 10,
                (Math.random() - 0.5) * 10
            );

            // Store the sphere and its speed
            spheres.current.push(sphere);
            speeds.current.push(Math.random() * 0.02); // Random speed for each sphere

            // Add click event to the sphere
            sphere.userData = { id: i }; // Store an ID for the sphere
            sphere.callback = () => focusOnObject(sphere);
            scene.add(sphere);
        }

        // Function to focus on an object
        const focusOnObject = (object) => {
            camera.position.set(object.position.x + 3, object.position.y + 3, object.position.z + 3);
            controls.target.copy(object.position);
            controls.update();
        };

        // Handle click events
        const handleMouseClick = (event) => {
            const mouse = new THREE.Vector2();
            const raycaster = new THREE.Raycaster();

            // Calculate mouse position in normalized device coordinates
            mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
            mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;

            // Update the picking ray with the camera and mouse position
            raycaster.setFromCamera(mouse, camera);

            // Calculate objects intersecting the picking ray
            const intersects = raycaster.intersectObjects(spheres.current);

            if (intersects.length > 0) {
                const firstIntersected = intersects[0].object;
                firstIntersected.callback(); // Call the focus function on the clicked sphere
            }
        };

        // Add event listener for mouse clicks
        window.addEventListener('click', handleMouseClick);

        // Initial camera position
        camera.position.z = 5;

        // Animation loop
        const animate = () => {
            requestAnimationFrame(animate);

            // Update sphere positions
            spheres.current.forEach((sphere, index) => {
                sphere.position.x += Math.sin(Date.now() * 0.001 + index) * speeds.current[index];
                sphere.position.z += Math.cos(Date.now() * 0.001 + index) * speeds.current[index];
            });

            controls.update();
            renderer.render(scene, camera);
        };

        animate();

        // Cleanup on component unmount
        return () => {
            window.removeEventListener('click', handleMouseClick);
            if (mountRef.current) {
                mountRef.current.removeChild(renderer.domElement);
            }
            renderer.dispose();
        };
    }, []);

    return <div ref={mountRef} />;
};

export default SphereScene;
