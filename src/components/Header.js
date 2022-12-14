import './Header.css';
import React from "react";


function Header(props) {
return (
    <header>
        <div className="header-div">
            <h1>Wordle Solver</h1>
            <div className="language-menu">
                <div className="language-selected">
                    
                </div>
                <ul>                    
                    <li>
                        <a class="us">English</a>
                    </li>
                    <li>
                        <a class="fr">French</a>
                    </li>
                    <li>
                        <a class="de">German</a>
                    </li>
                    <li>
                        <a class="it">Italian</a>
                    </li>
                </ul>

            </div> 
            <button className="header_button" onClick={() => props.setTrigger(true)}>?</button>
        </div>
    </header>
    );
}

export default Header;