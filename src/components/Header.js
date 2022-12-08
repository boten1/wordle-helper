import './Header.css';
import React from "react";


function Header(props) {
return (
    <header>
        <div className="header-div">
            <h1>Wordle Solver</h1>
            <div className="language-menu">
                <div className="language-selected">
                    <img className="language-img" src='assets/us.svg' alt="En"></img>
                </div>
                <ul>
                    <il>
                        <img className="language-img" src='assets/fr.svg' alt="Fr"></img>
                    </il>
                    <il>
                        <img className="language-img" src='assets/it.svg' alt="It"></img>
                    </il>
                </ul>

            </div> 
            <button className="header_button" onClick={() => props.setTrigger(true)}>?</button>
        </div>
    </header>
    );
}

export default Header;