import './Popup.css';
import React from "react";


function Popup(props) {
return (props.trigger) ? (
    <popup className="popup">
        <div className="popup-inner">
            <button className="close-btn" onClick={() => props.setTrigger(false)}>X</button>
            <h1>Wordle Solver</h1>
            <p className="popupel">Help you find five letters words that match you current Wordle progress</p>
            <h2>How to use</h2>
            <p className="popupel">Start by typing all the words that you've tried so far and click on the cells to match the colors that you got.</p>
            <img className="popupel" src='assets/FirstStep2.jpg' ></img>
            <p className="popupel">Press the "Search" button to get some five letter words suggestions (by checking "only unused letters" the suggestions that you'll get will be composed of letters that you didn't used so far, good for letters elimination).</p>
            <img className="popupel" src='assets/SecondStep.jpg' ></img>
            <p className="popupel">Click on any five letter words suggestion and try it out, then update the colors again according to the last try and go aging.  </p>
            <img className="popupel" src='assets/theirdStep.jpg' ></img>
            <h1>Good Luck !!!</h1>
        </div>
    </popup>
    ) : "" ;
}

export default Popup;