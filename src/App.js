import React,{useState} from "react";
import LettersGrid from "./components/LettersGrid" 
import Popup from "./components/Popup" 
import './App.css';


function App() {

    const [helpPopupState,setHelpPopupState] = useState(true);

  return (
    <div className="App">
      <LettersGrid setTrigger={setHelpPopupState} />
      <Popup trigger={helpPopupState} setTrigger={setHelpPopupState} ></Popup>
    </div>
  );
}

export default App;
