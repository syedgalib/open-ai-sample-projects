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
    const debugMode = true;

    const openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
        dangerouslyAllowBrowser: true,
    });

    const greetings = "Give me a one-sentence concept and I'll give you an eye-catching title, a synopsis the studios will love, a movie poster...AND choose the cast!";

    const [hasError, setHasError] = useState(false);
    const [userInput, setUserInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState(greetings);
    const [output, setOutput] = useState(null);
    const [showOutput, setShowOutput] = useState(false);

    // Prepare Result
    async function prepareResult() {
        if (isLoading) {
            return;
        }

        reset();
        setIsLoading(true);

        try {
            await fetchBodyReplay(userInput);
            await wait(5);
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

        const message = await fetchCompletion({ prompt, max_tokens: 60 }, 'fetchBodyReplay');
        setMessage(message);
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

        const synopsis = await fetchCompletion({ prompt, max_tokens: 700 }, 'fetchSynopsis');
        const title = await fetchTitle(synopsis);

        await wait(15);

        const stars = await fetchStars(synopsis);

        await wait(15);

        const image = await fetchImage(title, synopsis);

        setMessage(`This idea is so good I'm jealous! It's gonna make you rich for sure! Remember, I want 10% 💰`);

        setOutput({
            ...output,
            title,
            stars,
            text: synopsis,
            image,
        });
    }

    // Fetch Title
    async function fetchTitle(synopsis) {
        const config = {
            prompt: `Generate a catchy movie title for this synopsis: ${synopsis}`,
            max_tokens: 25,
            temperature: 0.7,
        };

        return await fetchCompletion(config, 'fetchTitle');
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

        return await fetchCompletion({ prompt, max_tokens: 30 }, 'fetchStars');
    }

    async function fetchImage(title, synopsis) {
        const prompt = await fetchImagePrompt(title, synopsis);
        const image = await generateImage({ prompt: `${prompt} . There should be no text in this image.` });
        return image;
    }

    // Fetch Image Prompt
    async function fetchImagePrompt(title, synopsis) {
        const prompt = `Give a short description of an image which could be used to advertise a movie based on a title and synopsis. The description should be rich in visual detail but contain no names.
        ###
        title: Love's Time Warp
        synopsis: When scientist and time traveller Wendy (Emma Watson) is sent back to the 1920s to assassinate a future dictator, she never expected to fall in love with them. As Wendy infiltrates the dictator's inner circle, she soon finds herself torn between her mission and her growing feelings for the leader (Brie Larson). With the help of a mysterious stranger from the future (Josh Brolin), Wendy must decide whether to carry out her mission or follow her heart. But the choices she makes in the 1920s will have far-reaching consequences that reverberate through the ages.
        image description: A silhouetted figure stands in the shadows of a 1920s speakeasy, her face turned away from the camera. In the background, two people are dancing in the dim light, one wearing a flapper-style dress and the other wearing a dapper suit. A semi-transparent image of war is super-imposed over the scene.
        ###
        title: zero Earth
        synopsis: When bodyguard Kob (Daniel Radcliffe) is recruited by the United Nations to save planet Earth from the sinister Simm (John Malkovich), an alien lord with a plan to take over the world, he reluctantly accepts the challenge. With the help of his loyal sidekick, a brave and resourceful hamster named Gizmo (Gaten Matarazzo), Kob embarks on a perilous mission to destroy Simm. Along the way, he discovers a newfound courage and strength as he battles Simm's merciless forces. With the fate of the world in his hands, Kob must find a way to defeat the alien lord and save the planet.
        image description: A tired and bloodied bodyguard and hamster standing atop a tall skyscraper, looking out over a vibrant cityscape, with a rainbow in the sky above them.
        ###
        title: ${title}
        synopsis: ${synopsis}
        image description: 
        `;

        return await fetchCompletion({ prompt, temperature: 0.8, max_tokens: 100 }, 'fetchImagePrompt');
    }

    async function fetchCompletion(config, key) {
        const response = await openai.completions.create({
            model: "gpt-3.5-turbo-instruct",
            max_tokens: 60,
            ...config,
        });

        if (debugMode && key) {
            console.log(key, { response });
        }

        return response.choices[0].text.trim();
    }

    async function generateImage(config) {
        const defaultConfig = {
            model: "dall-e-2",
            n: 1,
            size: '256x256',
            response_format: 'b64_json',
        };

        config = { ...defaultConfig, ...config };

        const response = await openai.images.generate(config);
        const image = response.data[0][config.response_format];

        if (debugMode) {
            console.log('generateImage', { response, image });
        }

        return image;
    }

    function reset() {
        setHasError(false);
        setUserInput('');
        setMessage(greetings);
        setOutput(null);
        setShowOutput(false);
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
                                    {
                                        !showOutput && (
                                            <section id="setup-container">
                                                <div className="setup-inner">
                                                    <img src={movieboss} />
                                                    <div className="speech-bubble-ai" id="speech-bubble-ai">
                                                        <p id="movie-boss-text">{message}</p>
                                                    </div>
                                                </div>

                                                <div className="setup-inner setup-input-container" id="setup-input-container">
                                                    {!output && (
                                                        <>
                                                            {!isLoading && (
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
                                                            )}

                                                            {isLoading && (
                                                                <img src={loading} className="loading" id="loading" />
                                                            )}
                                                        </>
                                                    )}

                                                    {
                                                        output && (
                                                            <button type='button' id="view-pitch-btn" className="view-pitch-btn" onClick={() => setShowOutput(true)}>
                                                                View Pitch
                                                            </button>
                                                        )
                                                    }
                                                </div>

                                            </section>
                                        )
                                    }

                                    {
                                        showOutput && (
                                            <section className="output-container" id="output-container">
                                                {
                                                    output.image && (
                                                        <div id="output-img-container" className="output-img-container">
                                                            <img src={'data:image/png;base64,' + output.image} />
                                                        </div>
                                                    )
                                                }

                                                <h1 id="output-title">{output.title}</h1>
                                                <h2 id="output-stars">{output.stars}</h2>
                                                <p id="output-text">{output.text}</p>

                                                <button type='button' className="view-pitch-btn" onClick={() => reset()}>
                                                    Generate Again
                                                </button>
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