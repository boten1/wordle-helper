import './Popup.css';
import React from "react";


function Popup(props) {
return (props.trigger) ? (
    <popup className="popup">
        <div className="popup-inner">
            <button className="close-btn" onClick={() => props.setTrigger(false)}>X</button>
            <h1>Wordle Solver</h1>
            <p className="popup-font">Help you find five letters words that match you current Wordle progress</p>
            <h2>How to use</h2>
            <p>Copy all the words that you already tried in the Wordle</p>
            <p>Change the cells colors by clicking on them to match what you found so far</p>
            <p>Press on the "search" button</p>
            <p>Click on one of the suggested word and test it on the wordle site</p>
            <p>Update the last word colors, and repeat till success</p>
            <h1>Good Luck !!!</h1>
        </div>
    </popup>
    ) : "" ;
}

export default Popup;