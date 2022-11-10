// Copyright 2017 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

'use strict';

// [START gae_node_request_example]
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

app.use(express.static(path.resolve(path.join(__dirname, '/../build'))));

app.get('/', (req, res) => {
    res.sendFile(path.resolve(path.join(__dirname, '/../build', 'index.html')));
});

//botner
function ConvertCellsArrayIntoWordSearchValues(cellArray) {

    let searchWord = {
        badLetters : 0, //bm of letters that were found gray
        goodLetters : 0, //bm of letters that are green or yellow
        wordLetters : 0, // Each 5 bits represent an expected letter  e.g a=0, b=1 , c=2 ..... z =25 so the if we  have a???z (green letters that we know of and the position then) wordLetters = (26 << 20) | (a<<0)
        wordLettersMask : 0, //Mask that match wordLetters so for the prev example the mask will be wordLettersMask= 31<<30 | 31<<0
        yellowLetters : [0,0,0,0,0], //each array member is a BM of that positon of all the yellow letters that were found on that postion
        greenLetters : ["#","#","#","#","#"]//used for output found green words 
    }

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
                    searchWord.badLetters  &= ~diffShift;
                    searchWord.goodLetters |= diffShift;
                    if(CellColor == YELLOW) {
                        searchWord.yellowLetters[col] |= diffShift;
                    } else { //Green
                        let wordOffset = col*5;
                        searchWord.greenLetters[col] = CellVal;
                        searchWord.wordLetters |= (diff << wordOffset);
                        searchWord.wordLettersMask |= (31 << wordOffset);
                    }
                }
            }
            cellIndex++;
        }
    }

    return searchWord;
}

app.post("/api",function(req,res){

    console.log("ffffffffffffff");
    console.log(req.body);
    console.log("zzzzzzzzzzzzzzzzzzzzzzzzzzzzz");
    if(req.body.cells[0].CellVal != '') {
        console.log(req.body.cells[0].CellVal.charCodeAt(0));
    } else {
        console.log("empty");
    }
    
    let searchWord = ConvertCellsArrayIntoWordSearchValues(req.body.cells);
    console.log(searchWord);

    let foundMatchWord = [];
    englishArr.forEach((value) => {
        if((searchWord.badLetters & value.bitmap) == 0 && (searchWord.goodLetters & value.bitmap) == searchWord.goodLetters && (searchWord.wordLettersMask & value.wordLetters) == searchWord.wordLetters && 
           (searchWord.yellowLetters[0] & value.yellowLeters[0]) == 0 && (searchWord.yellowLetters[1] & value.yellowLeters[1]) == 0 && (searchWord.yellowLetters[2] & value.yellowLeters[2]) == 0 && (searchWord.yellowLetters[3] & value.yellowLeters[3]) == 0 && (searchWord.yellowLetters[4] & value.yellowLeters[4]) == 0 )
        {
            foundMatchWord.push(value.word);
        }

    });

    const MyData = {
        message : "sup sup sup",
        greenLetters : searchWord.greenLetters,
        goodLetters : searchWord.goodLetters,
        words : foundMatchWord
    }

    res.send(JSON.stringify(MyData));
})







if (process.env.NODE_ENV === "production") {
    app.use(express.static())
}

// Start the server
const PORT = parseInt(process.env.PORT) || 8080;
app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
  console.log('Press Ctrl+C to quit.');
});
// [END gae_node_request_example]

module.exports = app;