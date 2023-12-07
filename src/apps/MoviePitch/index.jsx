import './App.scss';

import { useState } from 'react';
import OpenAI from "openai";

import movieboss from '@assets/images/movieboss.png';
import logoMovie from '@assets/images/logo-movie.png';
import sendBtnIcon from '@assets/images/send-btn-icon.png';
import loading from '@assets/images/loading.svg';

import { process } from '@root/env';
import { wait } from '@root/src/helper/utils';

export default function App() {
    const openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
        dangerouslyAllowBrowser: true,
    });

    const greetings = "Give me a one-sentence concept and I'll give you an eye-catching title, a synopsis the studios will love, a movie poster...AND choose the cast!";

    const [hasError, setHasError] = useState(false);
    const [userInput, setUserInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState(greetings);

    const [output, setOutput] = useState({
        title: '',
        stars: '',
        text: '',
    });

    // Prepare Result
    async function prepareResult() {
        reset();
        setIsLoading(true);

        try {
            await fetchBodyReplay(userInput);
            await fetchSynopsis(userInput);
            setIsLoading(false);
        } catch (error) {
            console.log({ error });

            setHasError(true)
            setIsLoading(false);
        }
    }

    // Fetch Body Replay
    async function fetchBodyReplay(outline) {
        if (!outline) {
            return;
        }
        setMessage('Ok, just wait a second while my digital brain digests that...');

        // const prompt = `Generate a short message to enthusiastically say "${outline}" sounds interesting and that you need some minutes to think about it. Mention one aspect of the sentence.`;

        const prompt = `Generate a short message to enthusiastically say an outline sounds interesting and that you need some minutes to think about it.
        ###
        outline: Two dogs fall in love and move to Hawaii to learn to surf.
        message: I'll need to think about that. But your idea is amazing! I love the bit about Hawaii!
        ###
        outline: A plane crashes in the jungle and the passengers have to walk 1000km to safety.
        message: I'll spend a few moments considering that. But I love your idea!! A disaster movie in the jungle!
        ###
        outline: A group of corrupt lawyers try to send an innocent woman to jail.
        message: Wow that is awesome! Corrupt lawyers, huh? Give me a few moments to think!
        ###
        outline: ${outline}
        message: `;

        const response = await openai.completions.create({
            model: "gpt-3.5-turbo-instruct",
            prompt,
            max_tokens: 60,
            // temperature: 1,
            // top_p: 1,
            // frequency_penalty: 0,
            // presence_penalty: 0,
        });

        console.log('fetchBodyReplay', { response });

        setMessage(response.choices[0].text.trim());
    }

    // Fetch Synopsis
    async function fetchSynopsis(outline) {
        // const prompt = `Generate an engaging, professional and marketable movie synopsis based on the following idea: ${outline}`;
        const prompt = `Generate an engaging, professional and marketable movie synopsis based on an outline
        The synopsis should include actors names in brackets after each character. Choose actors that would be ideal for this role. 
        ###
        outline: A big-headed daredevil fighter pilot goes back to school only to be sent on a deadly mission.
        synopsis: The Top Gun Naval Fighter Weapons School is where the best of the best train to refine their elite flying skills. When hotshot fighter pilot Maverick (Tom Cruise) is sent to the school, his reckless attitude and cocky demeanor put him at odds with the other pilots, especially the cool and collected Iceman (Val Kilmer). But Maverick isn't only competing to be the top fighter pilot, he's also fighting for the attention of his beautiful flight instructor, Charlotte Blackwood (Kelly McGillis). Maverick gradually earns the respect of his instructors and peers - and also the love of Charlotte, but struggles to balance his personal and professional life. As the pilots prepare for a mission against a foreign enemy, Maverick must confront his own demons and overcome the tragedies rooted deep in his past to become the best fighter pilot and return from the mission triumphant.
        ###
        outline: ${outline}
        synopsis: 
      
        `;

        const response = await openai.completions.create({
            model: "gpt-3.5-turbo-instruct",
            prompt,
            max_tokens: 700,
        });

        console.log('fetchSynopsis', { response });

        const synopsis = response.choices[0].text.trim();
        const title = await fetchTitle(synopsis);

        await wait( 5 );

        const stars = await fetchStars(synopsis);

        setOutput({
            ...output,
            title,
            stars,
            text: synopsis,
        });
    }

    // Fetch Title
    async function fetchTitle(synopsis) {
        const prompt = `Generate a catchy movie title for this synopsis: ${synopsis}`;

        const response = await openai.completions.create({
            model: "gpt-3.5-turbo-instruct",
            prompt,
            max_tokens: 25,
            temperature: 0.7,
        });

        console.log('fetchTitle', { response });

        return response.choices[0].text.trim();
    }

    // Fetch Stars
    async function fetchStars(synopsis) {
        const prompt = `Extract the names in brackets from the synopsis.
        ###
        synopsis: The Top Gun Naval Fighter Weapons School is where the best of the best train to refine their elite flying skills. When hotshot fighter pilot Maverick (Tom Cruise) is sent to the school, his reckless attitude and cocky demeanor put him at odds with the other pilots, especially the cool and collected Iceman (Val Kilmer). But Maverick isn't only competing to be the top fighter pilot, he's also fighting for the attention of his beautiful flight instructor, Charlotte Blackwood (Kelly McGillis). Maverick gradually earns the respect of his instructors and peers - and also the love of Charlotte, but struggles to balance his personal and professional life. As the pilots prepare for a mission against a foreign enemy, Maverick must confront his own demons and overcome the tragedies rooted deep in his past to become the best fighter pilot and return from the mission triumphant.
        names: Tom Cruise, Val Kilmer, Kelly McGillis
        ###
        synopsis: ${synopsis}
        names: 
        `;

        const response = await openai.completions.create({
            model: "gpt-3.5-turbo-instruct",
            prompt,
            max_tokens: 30,
        });

        console.log('fetchStars', { response });

        return response.choices[0].text.trim();
    }

    function reset() {
        setHasError(false);
        setUserInput('');
        setMessage(greetings);
        setOutput({
            title: '',
            stars: '',
            text: '',
        });
    }

    return (
        <div className='box-container'>
            <div className="box page-container">
                <header>
                    <img src={logoMovie} alt="MoviePitch" />
                    <a href="/"><span>Movie</span>Pitch</a>
                </header>

                <div className='page-container-content'>
                    <main>
                        {
                            !hasError && (
                                <>
                                    <section id="setup-container">
                                        <div className="setup-inner">
                                            <img src={movieboss} />
                                            <div className="speech-bubble-ai" id="speech-bubble-ai">
                                                <p id="movie-boss-text">{message}</p>
                                            </div>
                                        </div>

                                        <div className="setup-inner setup-input-container" id="setup-input-container">
                                            {
                                                isLoading
                                                    ? (
                                                        <img src={loading} className="loading" id="loading" />)
                                                    : (
                                                        <>
                                                            <textarea
                                                                id="setup-textarea"
                                                                placeholder="An evil genius wants to take over the world using AI."
                                                                value={userInput}
                                                                onChange={e => setUserInput(e.target.value)}
                                                            >
                                                            </textarea>
                                                            <button className="send-btn" id="send-btn" aria-label="send" onClick={prepareResult}>
                                                                <img src={sendBtnIcon} alt="send" />
                                                            </button>
                                                        </>
                                                    )
                                            }


                                        </div>
                                    </section>

                                    {
                                        output.text && (
                                            <section className="output-container" id="output-container">
                                                <div id="output-img-container" className="output-img-container"></div>
                                                <h1 id="output-title">{output.title}</h1>
                                                <h2 id="output-stars">{output.stars}</h2>
                                                <p id="output-text">{output.text}</p>
                                            </section>
                                        )
                                    }
                                </>
                            )
                        }

                        {
                            hasError && (
                                <section className='text-center'>
                                    <h2>Something went wrong, please try again</h2>
                                    <button type='button' className='btn' aria-label="reset" onClick={reset}>
                                        Try Again
                                    </button>
                                </section>
                            )
                        }

                    </main>
                </div>

                <footer>
                    &copy; 2023 MoviePitch All rights reserved
                </footer>
            </div>
        </div>
    );
}