import './Bank.css';
import React, {useState,forwardRef,useImperativeHandle} from "react";
//botner see if we can remove props

const Bank = forwardRef((props, ref) => {
    
    const [words,setWords] = useState([]);

    let serverData;

    function UpdateRowWithWord(event) {
        console.log(event.target.id);
        let {id} = event.target;
        console.log(id);
        let num = Number(id.split('_')[1]);
        console.log(num);
        console.log("dddddd");
        console.log(serverData.words[num]);
        props.updateWord(serverData.words[num]);
    }


    useImperativeHandle(ref, () => ({
        updateWords: (data) => {

            let paragraphs  = [];
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
                
                paragraphs.push(<p onClick={UpdateRowWithWord}>{spans}</p>);
                para_count++;
            });
            setWords(paragraphs);
            serverData = data;
        }
      }));

    return (
        <bank className="Bank">
           <div id="wordBank">
                {words}
           </div> 
        </bank>
    );
});

export default Bank;