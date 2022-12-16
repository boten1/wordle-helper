import './Header.css';
import React from "react";

const LANG_EN = 0;
const LANG_FR = 1;
const LANG_DE = 2;
const LANG_IT = 3;

function Header(props) {

    function UpdateLanguage(event) {
        const {id} = event.target;
        console.log("UpdateLanguage" + id);
    
        let element = document.getElementById("lang-selecect-ID");
    
        if(element != null) {
            switch(id) {
                case "us-link":
                    props.setLang(LANG_EN);
                    document.getElementById("lang-selecect-ID").style.backgroundImage = "url('./assets/us.svg')";
                    break;
                case "fr-link":
                    props.setLang(LANG_FR);
                    document.getElementById("lang-selecect-ID").style.backgroundImage = "url('./assets/fr.svg')";
                    break;    
                case "de-link":
                    props.setLang(LANG_DE);
                    document.getElementById("lang-selecect-ID").style.backgroundImage = "url('./assets/de.svg')";
                    break;
                case "it-link":
                    props.setLang(LANG_IT);
                    document.getElementById("lang-selecect-ID").style.backgroundImage = "url('./assets/it.svg')";
                    break;   
            }
        }
    }

return (
    <header>
        <div className="header-div">
            <h1>Wordle Solver</h1>
            <div className="language-menu">
                <div className="language-selected" id="lang-selecect-ID">
                    
                </div>
                <ul>                
                    <li>
                        <a class="us" id="us-link" onClick={UpdateLanguage}>English</a>
                    </li>
                    <li>
                        <a class="fr" id="fr-link" onClick={UpdateLanguage}>French</a>
                    </li>
                    <li>
                        <a class="de" id="de-link" onClick={UpdateLanguage}>German</a>
                    </li>
                    <li>
                        <a class="it" id="it-link" onClick={UpdateLanguage}>Italian</a>
                    </li>
                </ul>

            </div> 
            <button className="header_button" onClick={() => props.setTrigger(true)}>?</button>
        </div>
    </header>
    );
}

export default Header;