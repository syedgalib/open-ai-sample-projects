import './App.scss';

import { useState } from 'react';
import OpenAI from 'openai';
import loading from '@assets/images/loading-white.svg';

import { process } from '@root/env';

export default function App() {
    const openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
        dangerouslyAllowBrowser: true,
    });

    const [product, setProduct] = useState({
        name: '',
        description: '',
        target: '',
    });

    const [result, setResult] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // Prepare Result
    async function prepareResult() {
        setResult('');
        setIsLoading(true);

        await fetchResult(product);

        setIsLoading(false);
    }

    // Fetch Body Replay
    async function fetchResult(product) {
        if (!product.name || !product.description || !product.description) {
            return;
        }

        // Example Product
        // Vegan Fish Cream
        // Fish flavoured vegan ice cream
        // kids under 12

        // const prompt = `Create 50 words of advertising copy for ${product.name}, which can be described as ${product.description} aimed at ${product.target}.`;
        const prompt = `Use a product name, a product description and a target market to create advertising copy for a product.
        ###
        product name: Flask Tie
        product description: A tie with a pouch to hold liquids and a straw to drink through
        product traget market: office workers
        advertising copy: Are you tired of having to worry about how much to drink throughout the day? With the Flask Tie, you can stay hydrated on-the-go! Our unique tie features a pouch that enables you to securely hold and sip your favorite drinks with the built-in straw! The water cooler is history! Long live Flask Tie!
        ###
        product name: SolarSwim
        product description: Swimming costumes for all genders with solar cells to charge your devices while you sunbathe.
        product traget market: Aimed at young adults
        advertising copy: Don't miss a beat while you're having fun in the sun! SolarSwim is the perfect choice for the tech-savvy, on-the-go millennial. Our innovative swimming costumes come with integrated solar cells that allow you to charge and access your devices while you're at the beach or pool. Enjoy your summer break with SolarSwim!
        ###
        product name: ${product.name}
        product description: ${product.description}
        product traget market: ${product.target}
        advertising copy: 

        `;
        
        const response = await openai.completions.create({
            model: 'gpt-3.5-turbo-instruct',
            prompt,
            max_tokens: 100,
        });

        console.log('fetchResult', { response });

        setResult(response.choices[0].text.trim());
    }

    function handleUpdateInput( e ) {
        const name = e.target.name;
        const value = e.target.value;

        setProduct({
            ...product,
            [name]: value
        });
    }

    function reset() {
        setProduct({
            name: '',
            description: '',
            target: '',
        });

        setResult('');
    }

    return (
        <div className='box-container'>
            <div className='box'>
                <main>
                    <section className='intro'>
                        <h1>Advertify</h1>
                        <h2>Get promotional <strong>copy</strong> for your products <strong>fast</strong></h2>
                        <p>Powered by AI🤖</p>
                    </section>

                    {
                        ! result
                            ? (
                                <section className='ad-input' id='ad-input'>
                                    <label htmlFor='name'>Product Name</label>
                                    <input type='text' placeholder='Vegan Fish Cream' name='name' id='name' value={product.name} onChange={handleUpdateInput} />
                                    
                                    <label htmlFor='description'>Description</label>
                                    <textarea placeholder='Fish flavoured vegan ice cream' name='description' id='description' value={product.description} onChange={handleUpdateInput}></textarea>
                                    
                                    <label htmlFor='target'>Target market</label>
                                    <input type='text' placeholder='kids under 12' name='target' id='target' value={product.target} onChange={handleUpdateInput} />
                                    
                                    <button id='submit-btn' onClick={prepareResult}>
                                        {
                                            isLoading
                                                ? <img src={loading} className='loading' id='loading' />
                                                : 'Generate Copy'
                                        }
                                    </button>
                                </section>
                            )
                            : (
                                <section className='ad-output' id='ad-output'>
                                    <h4>Your Copy!</h4>

                                    <div className='ad-output-result'>
                                        {result}
                                    </div>

                                    <button id='submit-btn' onClick={reset}>
                                        Reset
                                    </button>
                                </section>
                            )
                    }
                </main>
            </div>
        </div>
    );
}