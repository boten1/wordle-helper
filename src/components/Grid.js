import './Grid.css';
import Bank from "./Bank" 
import React,{useState, useRef} from "react";


const NOF_CELLS_IN_ROW = 5;
const NOF_ROWS_IN_TABLE = 6;
const ACTION_STOP = "stop";
const ACTION_BACK = "back";
const ACTION_FORWARD = "forward";

const COLOR_YELLOW="#c9b458";
const COLOR_GREEN="#6aaa64";
const COLOR_GRAY="#787c7e";

function Grid() {

    const bankRef = useRef();

    // This state is the state that the keyDown is passing to the "change state", if the key is leagle then an action will be done and nothing otherwise
    let pressState = ACTION_STOP;
    // This is each cell color state, the Cell BG color is hooked on this state
    const [cellColorState,setCellColorState] = useState(Array(NOF_CELLS_IN_ROW * NOF_ROWS_IN_TABLE).fill(COLOR_GRAY));
    /* The cell content change in case, act according to the action */
    function change(event) {
        //Check if a legal action was called
        if(pressState !== ACTION_STOP) {
            let serialNumber = cellIdToNumber(event.target.id);
            moveFocus(serialNumber,pressState);
        }

    }

    function UpdateSelectedWordFromBank(wordAndColors) {
        console.log(`UpdateSelectedWordFromBank${wordAndColors}`);
    }

    /**Update the focus to the next cell or prev cell according to the action type, the serialNumber represent the cell serial number  */
    function moveFocus(serialNumber,action)
    {
    
        const lastCell = NOF_CELLS_IN_ROW * NOF_ROWS_IN_TABLE - 1;
        const firstCell = 0;

        if(action === ACTION_BACK && serialNumber > firstCell )
        {
            serialNumber--;
        } else if(action === ACTION_FORWARD && serialNumber < lastCell) {
            serialNumber++;
        }

        document.getElementById(cellIdFromNumber(serialNumber)).focus();
    }

    /** Update the cell color state
     * The Cell has three options for the color which he moved around them
     * This is the way that I think that an array of state can be updated
     */
    function UpdateCellState(index,newState)
    {
        let updatedArray = [...cellColorState];
        updatedArray[index] = newState;
        setCellColorState(updatedArray);
    }

    /*
    The cell was clicked so change its color to one of the option depending on the prev option 
    */
    function cellClick(event) {

        const {value, id} = event.target;

        if(value !== "") {
            let cellIndex = cellIdToNumber(id);
            let newColor = COLOR_GRAY;
            if (cellColorState[cellIndex] === COLOR_GRAY)
            {
                newColor = COLOR_YELLOW;
            } else if (cellColorState[cellIndex] === COLOR_YELLOW) {
                newColor = COLOR_GREEN;
            }
            UpdateCellState(cellIndex,newColor);
        }
    }

    /*
    * The key is down, check if the input is legal, if it does let the "onChange" event handle it
    */
    function handleKeyDown(event) {

        /* If the backspace was pressed delete the input and ask the "onchange" to move to the prev cell */
        if(event.key === 'Backspace')
        {
            
            let cellIndex = cellIdToNumber(event.target.id);
            console.log("back Cell index " + cellIndex + " value " + event.target.value);
            UpdateCellState(cellIndex,COLOR_GRAY);
            //as the input value is empty the onChange won't happen
            if(event.target.value === "")
            {
                moveFocus(cellIndex,ACTION_BACK);
                pressState = ACTION_STOP;
            }
            else 
            {
                event.target.value = "";
                moveFocus(cellIndex,ACTION_BACK);

                pressState = ACTION_BACK;
            }
            

        /* check if the keys are A-Z */
        } else if(event.keyCode >= 65 && event.keyCode <= 90) {
            event.target.value = "";
            pressState = ACTION_FORWARD;
        } else {
            /* No legal input was detected, cancel the event */
            event.preventDefault();
            pressState = ACTION_STOP;
        }
        
        console.log(event.target.id + ">" + event.key);
    }

    /** Build the table by creating the cells called on init */
    function getTds()
    {
        
        let inputs = [];
        for (var row = 0; row < NOF_ROWS_IN_TABLE; row++) {
            let cols = [];
            for (var col = 0; col < NOF_CELLS_IN_ROW; col++) {
                let cellIndex = row*NOF_CELLS_IN_ROW +col;
                let cellId = cellIdFromNumber(cellIndex); 
                cols.push(<td><input type="text" id={cellId} style={{background:cellColorState[cellIndex]}} maxLength="1" size="2" onKeyDown={handleKeyDown}  onChange={change} onClick={cellClick}/></td>)
            }
            inputs.push(<tr>{cols}</tr>)
        }
        return inputs;
    }

    /** Create a cell ID from a cell sirial number  */
    function cellIdFromNumber(num) {
        let row = Math.floor(num / NOF_CELLS_IN_ROW);
        let col = num % NOF_CELLS_IN_ROW;
        return "row_" + row + "_cell_" + col; 
    }

    /** Go over all the cells to collect the data and send it to the server to get back the possible words */
    const SendDataToServer = async() => {

        let cellsVals = [];

        for (var cellIndex = 0; cellIndex < NOF_ROWS_IN_TABLE*NOF_CELLS_IN_ROW; cellIndex++) {

            let CC = cellColorState[cellIndex] === COLOR_GREEN ? 2 : (cellColorState[cellIndex] === COLOR_YELLOW ? 1 : 0);

            let cellContent = {
                CellVal : document.getElementById(cellIdFromNumber(cellIndex)).value.toLowerCase(),
                CellColor : CC
            }

            cellsVals.push(cellContent);
        }

        const MyData = {
            cells : cellsVals
        }

        fetch("http://localhost:8080/api", {
            method: 'POST',
            headers : {
                'Content-Type' : 'application/json'
            },
            body : JSON.stringify(MyData)
        }).then((res) => res.json()).then((data) => {
            console.log(data);
            bankRef.current.updateWords(data);
        } );

    }

    /** Create a  cell sirial number from a cell ID  */
    function cellIdToNumber(cellId)
    {
        const words = cellId.split('_');
        let row = Number(words[1]);
        let col = Number(words[3]);
        return row*NOF_CELLS_IN_ROW  + col;
    }

    return (
        <grid>
            <div className="divgridup" >
                <table>
                    <tbody>
                        {getTds()}
                    </tbody>
                </table>
                <button onClick={SendDataToServer}>Submit</button>
            </div>
        <div className="divgriddown" >
                <Bank ref={bankRef} updateWord={UpdateSelectedWordFromBank}/>
            </div>
        </grid>
    );
}

export default Grid;