import './Header.css';
import React from "react";


function Header() {
return (
    <header>
        <div>
            <h1>Wordle Solver</h1>
            <button className="header_button">?</button>
        </div>
    </header>
    );
}

export default Header;