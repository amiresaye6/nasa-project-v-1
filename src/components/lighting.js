import * as THREE from 'three';
// not used yet hossam!

/**
 * Sets up basic lighting for a Three.js scene
 * @param {THREE.Scene} scene - The Three.js scene to add lights to
 * @param {Object} options - Configuration options for the lights
 * @param {number} options.ambientIntensity - Intensity of the ambient light (default: 0.5)
 * @param {number} options.ambientColor - Color of the ambient light (default: 0x404040)
 * @param {number} options.pointIntensity - Intensity of the point light (default: 1)
 * @param {number} options.pointColor - Color of the point light (default: 0xffffff)
 * @param {THREE.Vector3} options.pointPosition - Position of the point light (default: (10, 10, 10))
 * @returns {Object} An object containing the created lights
 */
export function setupLighting(scene, options = {}) {
  const {
    ambientIntensity = 0.5,
    ambientColor = 0x404040,
    pointIntensity = 1,
    pointColor = 0xffffff,
    pointPosition = new THREE.Vector3(10, 10, 10)
  } = options;

  // Create and add ambient light
  const ambientLight = new THREE.AmbientLight(ambientColor, ambientIntensity);
  scene.add(ambientLight);

  // Create and add point light
  const pointLight = new THREE.PointLight(pointColor, pointIntensity);
  pointLight.position.copy(pointPosition);
  scene.add(pointLight);

  return { ambientLight, pointLight };
}