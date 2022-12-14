import './LettersGrid.css';
import Bank from "./Bank" 
import Header from "./Header" 
import React,{useState, useRef} from "react";
import 'bootstrap/dist/css/bootstrap.min.css'

const NOF_CELLS_IN_ROW = 5;
const NOF_ROWS_IN_TABLE = 6;

const ACTION_BACK = "back";
const ACTION_FORWARD = "forward";

const COLOR_YELLOW="#c9b458";
const COLOR_GREEN="#6aaa64";
const COLOR_GRAY="#787c7e";


function LettersGrid(props) {

    const bankRef = useRef();

    // This is each cell color state, the Cell BG color is hooked on this state
    const [cellColorState,setCellColorState] = useState(Array(NOF_CELLS_IN_ROW * NOF_ROWS_IN_TABLE).fill(COLOR_GRAY));
    //this hold the checkbox value that indicate if only unused letters should be used
    const [onlyUnusedLetters,setonlyUnusedLetters] = useState(false);

    const [language, setLanguage] = useState()
    /*
     * stors the current cells values, this is used for mobile support, acording to the current cell state and the new cell 
     * state we know what to do.
     * If current state isn't legal use the old value, if delete was pressed and the current cell is empty move back
     */
    const [cellValues,setCellValues] = useState(Array(NOF_CELLS_IN_ROW * NOF_ROWS_IN_TABLE).fill(''));

    function onlyUnusedLettersCheckChanged() {
        setonlyUnusedLetters(!onlyUnusedLetters);
    }

    function UpdateSelectedWordFromBank(wordAndColors) {
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
                let cellIndex = firstFree + index;
                document.getElementById(cellIdFromNumber(cellIndex)).value = wordAndColors.word.charAt(index);
            }
            UpdateCellValues(firstFree,wordAndColors.word);
            UpdateCellStates(firstFree,wordAndColors.colorArray);
        }
    }





   /**Update the focus to the next cell or prev cell according??to the action type, the??serialNumber represent the cell serial number  
    *  serialNumber - the current cell, this function will see if we can move forwared or backwared acording to the action
    */
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

        const {id} = event.target;
        let cellIndex = cellIdToNumber(id);

        if(event.keyCode === 8 && (cellValues[cellIndex].length === 0 || event.target.selectionStart === 0))
        {
            moveFocus(cellIndex,ACTION_BACK);
            UpdateCellState(cellIndex,COLOR_GRAY);
            document.getElementById(cellIdFromNumber(cellIndex)).value = '';
            UpdateCellValues(cellIndex,'');
            event.preventDefault();
        } else if (event.keyCode === 13) {
            SendDataToServer();
            event.preventDefault();
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
                cols.push(<td><input type="text" className='letters_grid_input' id={cellId} style={{background:cellColorState[cellIndex]}} autocomplete="off" size="2" onInput={funcOnInput} onKeyDown={handleKeyDown} onClick={cellClick}/></td>)
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

        const MyData = {
            langaugeType : language , 
            unusedOnly : onlyUnusedLetters,
            cells : cellsVals
        }

        fetch("https://wordhelper-367719.oa.r.appspot.com/api", {
      // fetch("http://localhost:8081/api", {
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

    /*
     * Update the the cell value state array with new value into one of the members
     */
    function UpdateCellValues(index,newState)
    {
        if(newState.length === 0) {
            cellValues[index] = newState;
        } else {
            for (var i = 0; i < newState.length; i++) {
                cellValues[index+i] = newState.charAt(i);
            }
        }
        setCellValues(cellValues);
    }

    /*
     * The input on the cell was changed, see the new input and the old and decide what to do.
     */
    function funcOnInput(event) {

        const {value, id} = event.target;
        let cellIndex = cellIdToNumber(id);

        if(value.length === 0)
        {
            UpdateCellValues(cellIndex,'');
            UpdateCellState(cellIndex,COLOR_GRAY);
            moveFocus(cellIndex,ACTION_BACK);

        } else {

            let legalValue = /^[a-zA-Z]+$/.test(value);
            if(legalValue) {
                if(value.length === 2)
                {
                    if(cellValues[cellIndex] === value.charAt(1))
                    {
                        event.target.value = value.charAt(0);  
                    } else {
                        event.target.value = value.charAt(1);  
                    }
                }
                UpdateCellValues(cellIndex,event.target.value);
                moveFocus(cellIndex,ACTION_FORWARD);
            } else {
                event.target.value = cellValues[cellIndex];
            }
        }

    } 


    return (
        <letters_grid>
            <div className='header-div' >
                <Header setTrigger={props.setTrigger} setLang={setLanguage}/>
            </div>
            <div className="divgridup" >
                <table cursor="pointer">
                    <tbody>
                        {getTds()}
                    </tbody>
                </table>
                <div className="controlItems">
                    <button class="control-btn btn btn-success mb-7" onClick={SendDataToServer}>Search</button>              
                    <input class="control-checkbox form-check-input" type="checkbox" value="" id="checkbox-1" cursor="pointer" checked={onlyUnusedLetters}  onChange={onlyUnusedLettersCheckChanged}/>
                    <label class="control-lbl form-check-label" for="checkbox-1"> Only unused letters</label>
                </div>
            </div>
            <div className="divgriddown" >
                <Bank ref={bankRef} updateWord={UpdateSelectedWordFromBank}/>
            </div>
        </letters_grid>
    );
}

export default LettersGrid;