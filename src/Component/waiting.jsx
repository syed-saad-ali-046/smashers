import React from "react";
import "./style.css"
import { WaitingForPlayers,MainHeading} from "../Constant/Constant";

const Waiting = () => {
    return (
        <>
            <div className="waiting-screen animate__animated animate__fadeIn">
                <h1
                    className="display-2 text-white fw-bold pulsating-light"
                    style={{
                        textShadow: '0 0 20px #00f, 0 0 30px #00f',
                        fontFamily: '"Orbitron", sans-serif'
                    }}
                >
                   {MainHeading}
                </h1>
                <h3 className="text-white mb-5">{WaitingForPlayers}</h3>
                <div className="loading-indicator">
                    <div className="spinner"></div>
                </div>
            </div>
        </>
    );
};

export default Waiting;
