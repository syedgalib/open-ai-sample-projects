import './App.scss';

import OpenAI from "openai";
import { useState } from 'react';
import { process } from '@root/env';

import loading from '@assets/images/loading-white.svg';

export default function App() {
    const openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
        dangerouslyAllowBrowser: true,
    });

    const [hasError, setHasError] = useState(false);
    const [userInput, setUserInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [image, setImage] = useState('');

    // Prepare Result
    async function prepareResult() {
        if ( isLoading ) {
            return;
        }

        setHasError(false);
        setImage('');
        setIsLoading(true);

        try {
            await generateImage(userInput);
            setIsLoading(false);
        } catch (error) {
            console.log({ error });

            setHasError(true)
            setIsLoading(false);
        }
    }

    async function generateImage( prompt ) {
        const response = await openai.images.generate({
            model: "dall-e-3",
            prompt,
            n: 1,
            // size: '256x256',
            response_format: 'b64_json'
          });
        
          
        const image_url = response.data[0].b64_json;
        console.log( { response } );

        setImage( image_url );
    }

    function reset() {
        setHasError(false);
        setUserInput('');
        setImage('');
    }

    return (
        <div className="container">
            <h1>ArtMatch 👩‍🎨</h1>

            {
                ! hasError && (
                    <>
                        <div id="output-img" className="frame">
                            {
                                image
                                    ? (
                                        <img src={'data:image/png;base64,' + image}></img>
                                    )
                                    : (
                                        <h2>Describe a famous painting without saying its name or the artist!</h2>
                                    )
                            }
                        </div>
                        <textarea 
                            value={userInput} 
                            onChange={e => setUserInput( e.target.value )} 
                            placeholder="A woman with long brown hair..." 
                            id="instruction"
                        >
                        </textarea>
                        <button type='button' id="submit-btn" onClick={prepareResult}>
                            {
                                isLoading
                                    ? <img height={'100%'} src={loading} className='loading' id='loading' />
                                    : 'Create'
                            }
                        </button>
                    </>
                )
            }

            {
                hasError && (
                    <>
                        <h2>Something went wrong, please try again</h2>
                        <button type='button' id="submit-btn" onClick={reset}>
                            Try Again
                        </button>
                    </>
                )
            }
        </div>
    );
}