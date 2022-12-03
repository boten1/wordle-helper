import React,{useEffect} from 'react';

function AdClass() {

    useEffect(() => {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      });

    return (
        <div className='ad'>
            <ins class="adsbygoogle"
                style={{display:'block'}}
                data-ad-client="ca-pub-2596988822807536"
                data-ad-slot="7698086721"
                data-ad-format="auto"/>
        </div>
      );
    }
    
export default AdClass;