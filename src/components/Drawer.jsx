import React from 'react';
import './css/Drawer.css';

const Drawer = ({ isOpen, onClose, planetName, planetDescription }) => {
    return (
        <div className={`drawer ${isOpen ? 'open' : ''}`}>
            <div className="drawer-header">

            <h2>{planetName}</h2>

            <button className="close-btn" onClick={onClose}>
                    &times;
                </button>
            </div>
            <div className="drawer-content">
                
                <p>{planetDescription}</p>
            </div>
        </div>
    );
};

export default Drawer;
