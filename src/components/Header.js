import './Header.css';
import React from "react";


function Header(props) {
return (
    <header>
        <div>
            <h1>Wordle Solver</h1>
            <button className="header_button" onClick={() => props.setTrigger(true)}>?</button>
        </div>
    </header>
    );
}

export default Header;