
'use strict';

const express = require('express');
const bodyParser = require("body-parser");
const path = require('path');
const englishArr = require('./English');

const app = express();
const NOF_CELLS_IN_ROW = 5;
const NOF_ROWS_IN_TABLE = 6;

const GRAY = 0;
const YELLOW = 1;
const GREEN = 2;

app.use(bodyParser.json());






/*
 * This function recieves that cells information from the client side meaning all the input celles letters and values
 * and convert them into BM and masks that will be used to find matching words 
 */
function ConvertCellsArrayIntoWordSearchValues(cellArray) {

    let searchWord = {
        errorMessage : [], //the error message if there is one
        badLetters : 0, //bm of letters that were found gray
        goodLetters : 0, //bm of letters that are green or yellow
        wordLetters : 0, // Each 5 bits represent an expected letter  e.g a=0, b=1 , c=2 ..... z =25 so the if we  have a???z (green letters that we know of and the position then) wordLetters = (26 << 20) | (a<<0)
        wordLettersMask : 0, //Mask that match wordLetters so for the prev example the mask will be wordLettersMask= 31<<30 | 31<<0
        yellowLetters : [0,0,0,0,0], //each array member is a BM of that positon of all the yellow letters that were found on that postion
        greenLetters : ["#","#","#","#","#"]//used for output found green words 
    }

    //verification variable
    let double_green_same_col = [];//check if we have more than one green latter on the column
    let good_word_counter = 0; //count the NOF good words, shouldn't be more than 5

    let cellIndex = 0;
    for (var row = 0; row < NOF_ROWS_IN_TABLE; row++) {
        for (var col = 0; col < NOF_CELLS_IN_ROW; col++) {
            const {CellVal , CellColor } = cellArray[cellIndex];
            if(CellVal != '') {
                let diff = CellVal.charCodeAt(0) - "a".charCodeAt(0);
                let diffShift = (1 << diff);
                if(CellColor == GRAY) {
                    if ((searchWord.goodLetters & diffShift) == 0) {
                        searchWord.badLetters |= diffShift;
                    }
                } else {
                    //A new letter was found, add to count so we won't go over 5
                    if((searchWord.goodLetters & diffShift ) ===  0) {
                        good_word_counter++;
                    }
                    searchWord.badLetters  &= ~diffShift;
                    searchWord.goodLetters |= diffShift;
                    if(CellColor == YELLOW) {
                        searchWord.yellowLetters[col] |= diffShift;
                    } else { //Green
                        let wordOffset = col*5;
                        let new_mask_part = (31 << wordOffset);
                        //In case this col was already masked and a different latter was found add an error
                        if(((new_mask_part & searchWord.wordLettersMask) == new_mask_part) && (searchWord.greenLetters[col] !== CellVal))
                        {
                            double_green_same_col.push(col);
                        }
                        else 
                        {
                            searchWord.greenLetters[col] = CellVal;
                            searchWord.wordLetters |= (diff << wordOffset);
                            searchWord.wordLettersMask |= new_mask_part;
                        }
                        
                    }
                }
            }
            cellIndex++;
        }
    }

    if(double_green_same_col.length > 0) {
        double_green_same_col.forEach( value => {
            let colNum = value + 1;
            searchWord.errorMessage.push("column " + colNum + " has more than one option for a green letter.");
        })
    }

    if(good_word_counter > 5) {
        searchWord.errorMessage.push("You have more than 5 latters (" + good_word_counter + ") paint in yellow or green");
    }

    return searchWord;
}

app.post("/api",function(req,res){

    console.log(req.body);
    //botner add this section to the input verification
    if(req.body.cells[0].CellVal != '') {
        console.log(req.body.cells[0].CellVal.charCodeAt(0));
    } else {
        console.log("empty");
    }

    let searchWord = ConvertCellsArrayIntoWordSearchValues(req.body.cells);
    console.log("req.body.unusedOnly " + req.body.unusedOnly);

    let foundMatchWord = [];


    if(searchWord.errorMessage.length === 0) {
        /*
        * The user can request only unused words for alimination mostly 
        */
        if (req.body.unusedOnly) {
            let englishLetterFullMask = 67108863;//this is 0x3FFFFFF, meaning 26 letters full mask to start with (NOF english letters)
            let mask = englishLetterFullMask & (~(searchWord.goodLetters+englishLetterFullMask+1)) & (~searchWord.badLetters);
            englishArr.forEach((value) => {
                if( (value.bitmap & mask) == value.bitmap)
                {
                    foundMatchWord.push(value.word);
                }
        
            });
        } else {
            englishArr.forEach((value) => {
                if((searchWord.badLetters & value.bitmap) == 0 && (searchWord.goodLetters & value.bitmap) == searchWord.goodLetters && (searchWord.wordLettersMask & value.wordLetters) == searchWord.wordLetters && 
                (searchWord.yellowLetters[0] & value.yellowLeters[0]) == 0 && (searchWord.yellowLetters[1] & value.yellowLeters[1]) == 0 && (searchWord.yellowLetters[2] & value.yellowLeters[2]) == 0 && (searchWord.yellowLetters[3] & value.yellowLeters[3]) == 0 && (searchWord.yellowLetters[4] & value.yellowLeters[4]) == 0 )
                {
                    foundMatchWord.push(value.word);
                }
        
            });
        }

        if(foundMatchWord.length === 0) {
            searchWord.errorMessage.push("No matching words were found.")
        }
    }
    console.log("searchWord.errorMessage " + searchWord.errorMessage);
    const MyData = {
        errorMessage : searchWord.errorMessage,
        greenLetters : searchWord.greenLetters,
        goodLetters : searchWord.goodLetters,
        words : foundMatchWord
    }

    res.send(JSON.stringify(MyData));
})

if (process.env.NODE_ENV === "production") {
   app.use(express.static(path.resolve(path.join(__dirname, '/../build'))));

   app.get('/', (req, res) => {
        res.sendFile('index.html');
    });
} else {
  
    app.use(express.static(path.resolve(path.join(__dirname, '/../build'))));

    app.get('/', (req, res) => {
         res.sendFile('index.html');
     });
}

// Start the server
const PORT = parseInt(process.env.PORT) || 8081;
app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
  console.log('Press Ctrl+C to quit.');
});


module.exports = app;