import React from 'react';
import './css/Drawer.css';

const Drawer = ({ isOpen, onClose, planet }) => {
    if (!planet) {
        return null; // If no planet is selected, return nothing
    }

    return (
        <div className={`drawer ${isOpen ? 'open' : ''}`}>
            <div className="drawer-header">
                {/* <h2>{planet.name}</h2> */}
                <button className="close-btn" onClick={onClose}>
                    &times;
                </button>
            </div>
            
            <div className="drawer-content">
                <div className="drawer-title">
                    <h2>{planet.name}</h2>
                    <small>{planet.type}</small>
                </div>

                
                <p>{planet.description}
                    </p>
                <br />

                <div className="planet-details">
                    <div className="detail-item">
                        <div className="label">Year Length</div>
                        <hr />
                        <h3>{planet.yearLength}</h3>
                    </div>
                    <div className="detail-item">
                        <div className="label">Distance from Sun</div>
                        <hr />
                        <h3>{planet.distanceFromSun}</h3>
                    </div>
                    <div className="detail-item">
                        <div className="label">Namesake</div>
                        <hr />
                        <h3>{planet.namesake}</h3>
                    </div>
                    <div className="detail-item">
                        <div className="label">Moons</div>
                        <hr />
                        <h3>{planet.moons}</h3>
                    </div>
                </div>

                <p class="legend">AU: Astronomical Unit, the distance between the Earth and the Sun.</p>

            </div>
        </div>
    );
};

export default Drawer;
 