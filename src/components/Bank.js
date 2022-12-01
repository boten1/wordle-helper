import './Bank.css';
import React, {useState,forwardRef,useImperativeHandle} from "react";


const COLOR_YELLOW="#c9b458";
const COLOR_GREEN="#6aaa64";
const COLOR_GRAY="#787c7e";

const Bank = forwardRef((props, ref) => {
    
    const [words,setWords] = useState([]);

    let serverData;

    function UpdateRowWithWord(event) {
      //  event.preventDefault();
        let {id} = event.target;
        let num = Number(id.split('_')[1]);

        
        let colorArray = [];
        for(let index = 0; index < 5;index++) {
            let c = serverData.words[num].charAt(index);
            let diff = 1 << (c.charCodeAt(0) - "a".charCodeAt(0));
            if(c === serverData.greenLetters[index] ) {
                colorArray.push(COLOR_GREEN);
            } else if((serverData.goodLetters & diff) !== 0) {
                colorArray.push(COLOR_YELLOW);
            } else {
                colorArray.push(COLOR_GRAY);
            }
        }

        let retVal = {
            word : serverData.words[num],
            colorArray : colorArray
        }
        props.updateWord(retVal);
    }


    useImperativeHandle(ref, () => ({
        updateWords: (data) => {

            let paragraphs  = [];
            console.log("data.errorMessage " + data.errorMessage);
            if (data.errorMessage.length === 0) {
                let para_count = 0;
                data.words.forEach(element => {
                    let spans = [];
                    for(let index = 0; index < 5;index++) {
                        let c = element.charAt(index);
                        let paraId = "para_" + para_count + "_" + index;
                        let diff = 1 << (c.charCodeAt(0) - "a".charCodeAt(0));
                        if(c === data.greenLetters[index] ) {
                            spans.push(<span id={paraId} className='letterGreen'>{c}</span>)
                        } else if((data.goodLetters & diff) !== 0) {
                            spans.push(<span id={paraId} className='letterYellow'>{c}</span>)
                        } else {
                            spans.push(<span id={paraId} className='letterGray'>{c}</span>)
                        }
                    }
                    paragraphs.push(<p className='wordBankParagraph' onClick={UpdateRowWithWord}>{spans}</p>);
                    para_count++;
                });
            } else {
                data.errorMessage.forEach( item => {
                    paragraphs.push(<p className='errorMessageParagraph'>{item}</p>);
                })
            }

            setWords(paragraphs);
            serverData = data;
        }
      }));

    return (
           <div id="wordBank" className="Bank-div">
                {words}
           </div> 
    );
});

export default Bank;