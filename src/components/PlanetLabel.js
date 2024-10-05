import React, { useEffect, useState } from 'react';
import * as THREE from 'three';


const PlanetLabel = ({ name, position, camera }) => {
  const [screenPosition, setScreenPosition] = useState({ x: 0, y: 0, visible: false });

  useEffect(() => {
    if (position && camera) {
        const vector = new THREE.Vector3(position.x, position.y, position.z);
        vector.project(camera);

        const x = (vector.x * 0.5 + 0.5) * window.innerWidth;
        let y = -(vector.y * 0.5 - 0.5) * window.innerHeight; // Use 'let' here

        const labelOffset = 20; // Adjust this value to move label higher
        y -= labelOffset; // Shift the label upwards

        setScreenPosition({ 
            x, 
            y, 
            visible: vector.z < 1 && x > 0 && x < window.innerWidth && y > 0 && y < window.innerHeight 
        });
    }
}, [position, camera]);


  if (!screenPosition.visible) return null;

  return (
      <div style={{
          position: 'absolute',
          left: `${screenPosition.x}px`,
          top: `${screenPosition.y}px`,
          transform: 'translate(-50%, -50%)',
          color: 'white',
          padding: '5px',
          // backgroundColor: 'rgba(0, 0, 0, 0.5)',
          borderRadius: '3px',
          pointerEvents: 'none',
          fontSize: '12px'
      }}>
          {name}
      </div>
  );
};

export default PlanetLabel;
