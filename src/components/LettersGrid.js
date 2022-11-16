import './LettersGrid.css';
import Bank from "./Bank" 
import React,{useState, useRef} from "react";
import 'bootstrap/dist/css/bootstrap.min.css'

const NOF_CELLS_IN_ROW = 5;
const NOF_ROWS_IN_TABLE = 6;
const ACTION_STOP = "stop";
const ACTION_BACK = "back";
const ACTION_FORWARD = "forward";

const COLOR_YELLOW="#c9b458";
const COLOR_GREEN="#6aaa64";
const COLOR_GRAY="#787c7e";

function LettersGrid() {

    const bankRef = useRef();

    // This state is the state that the keyDown is passing to the "change state", if the key is leagle then an action will be done and nothing otherwise
    let pressState = ACTION_STOP;
    // This is each cell color state, the Cell BG color is hooked on this state
    const [cellColorState,setCellColorState] = useState(Array(NOF_CELLS_IN_ROW * NOF_ROWS_IN_TABLE).fill(COLOR_GRAY));
    //this hold the checkbox value that indicate if only unused letters should be used
    const [onlyUnusedLetters,setonlyUnusedLetters] = useState(false);



    function onlyUnusedLettersCheckChanged() {

        console.log("onlyUnusedLettersCheckChanged");
        setonlyUnusedLetters(!onlyUnusedLetters);
    }

    /* The cell content change in case, act according to the action */
    function change(event) {
        console.log("event");
        //Check if a legal action was called
        if(pressState !== ACTION_STOP) {
            let serialNumber = cellIdToNumber(event.target.id);
            moveFocus(serialNumber,pressState);
        }

    }

    function UpdateSelectedWordFromBank(wordAndColors) {
        console.log("UpdateSelectedWordFromBank " + wordAndColors.word + " state " + wordAndColors.colorArray);
        //find first free
        let firstFree = -1;
        for (var row = 0; row < NOF_ROWS_IN_TABLE && firstFree === -1; row++) {
            for (var col = 0; col < NOF_CELLS_IN_ROW && firstFree === -1; col++) {
                let cellIndex = row*NOF_CELLS_IN_ROW +col;
                
                if(document.getElementById(cellIdFromNumber(cellIndex)).value === "") {
                    firstFree = row*NOF_CELLS_IN_ROW;
                }
            }
        }

        if(firstFree !== -1) {
            for(let index = 0; index < 5; index++) {
                document.getElementById(cellIdFromNumber(firstFree + index)).value = wordAndColors.word.charAt(index);
            }
            UpdateCellStates(firstFree,wordAndColors.colorArray);
        }
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

        console.log("blop " + index + " state " + newState);
        let updatedArray = [...cellColorState];
        updatedArray[index] = newState;
        setCellColorState(updatedArray);
        
    }

    /** Update the cell color state
     * The Cell has three options for the color which he moved around them
     * This is the way that I think that an array of state can be updated
     */
    function UpdateCellStates(startIndex,newStateArray)
    {
        newStateArray.forEach(state => {
            cellColorState[startIndex++] = state;
        })
        setCellColorState([...cellColorState]);

    }

    /*
    The cell was clicked so change its color to one of the option depending on the prev option 
    */
    function cellClick(event) {
        console.log("cellClick");
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
        console.log("handleKeyDown");
        /* If the backspace was pressed delete the input and ask the "onchange" to move to the prev cell */
        if(event.key === 'Backspace')
        {
            
            let cellIndex = cellIdToNumber(event.target.id);
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
        console.log("onlyUnusedLetters " + onlyUnusedLetters);
        const MyData = {
            unusedOnly : onlyUnusedLetters,
            cells : cellsVals
        }

        fetch("http://localhost:8081/api", {
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
    /** Create a cell ID from a cell sirial number  */
    function cellIdFromNumber(num) {
        let row = Math.floor(num / NOF_CELLS_IN_ROW);
        let col = num % NOF_CELLS_IN_ROW;
        return "row_" + row + "_cell_" + col; 
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
        <letters_grid>
            <div className="divgridup" >
                <table>
                    <tbody>
                        {getTds()}
                    </tbody>
                </table>
                <div className="controlItems">
                    <button class="btn btn-success mb-7" onClick={SendDataToServer}>Submit</button>
                    <input class="form-check-input" type="checkbox" value="" id="defaultCheck1" checked={onlyUnusedLetters}  onChange={onlyUnusedLettersCheckChanged}/>
                    <label class="form-check-label" for="flexCheckCheckedDisabled"> Only unused letters</label>
                </div>
            </div>
        <div className="divgriddown" >
                <Bank ref={bankRef} updateWord={UpdateSelectedWordFromBank}/>
            </div>
        </letters_grid>
    );
}

export default LettersGrid;