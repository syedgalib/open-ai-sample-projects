import './App.scss';

import { useState } from 'react';
import OpenAI from "openai";

import { process } from '@root/env';

import loading from '@assets/images/loading-white.svg';
import owlLogo from '@assets/images/owl-logo.png';
import sendBtnIcon from '@assets/images/send-btn-icon.png';

export default function App() {
    const debugMode = true;

    const openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
        dangerouslyAllowBrowser: true,
    });

    const [userInput, setUserInput] = useState('');
    const [messages, setMessages] = useState([
        {
            role: 'system',
            content: 'You are a highly knowledgeable assistant that is always happy to help.'
        },
    ]);

    const [hasError, setHasError] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // Submit Input
    function submitInput() {
        if (!userInput) {
            return;
        }

        if (isLoading) {
            return;
        }

        const newMessages = [
            ...messages,
            {
                role: 'user',
                content: userInput
            },
        ];

        setMessages( newMessages );
        setUserInput( '' );
        prepareResult( newMessages );
    }

    // Prepare Result
    async function prepareResult( messages ) {
        if (isLoading) {
            return;
        }

        setIsLoading(true);

        try {
            await fetchReplay( messages );
            setIsLoading(false);
        } catch (error) {
            console.log({ error });

            setHasError(true)
            setIsLoading(false);
        }
    }

    // Fetch Replay
    async function fetchReplay( messages ) {
        const message = await fetchChatCompletion({ messages }, 'fetchBodyReplay');

        setMessages(currentValue => ([
            ...currentValue,
            message,
        ]));
    }

    async function fetchChatCompletion(config, key) {
        const response = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            presence_penalty: 0,
            ...config,
        });

        if (debugMode && key) {
            console.log(key, { response });
        }

        return response.choices[0].message;
    }

    function getMessages() {
        const messageList = structuredClone(messages);
        messageList.shift();
        return messageList;
    }

    function tryAgain() {
        setHasError(false);
        prepareResult( messages );
    }

    return (
        <main>
            <section className="chatbot-container">
                <div className="chatbot-header">
                    <img src={owlLogo} className="logo" />
                    <h1>KnowItAll</h1>
                    <h2>Ask me anything!</h2>
                    <p className="supportId">User ID: 2344</p>
                </div>

                <div className="chatbot-conversation-container" id="chatbot-conversation">
                    <div className="speech speech-ai">
                        How can I help you?
                    </div>

                    {
                        getMessages().map(
                            (message, index) => (
                                <div key={index} className={'speech speech-' + (message.role === 'user' ? 'human' : 'ai')}>
                                    {message.content}
                                </div>
                            )
                        )
                    }
                </div>

                {
                    isLoading && (
                        <img src={loading} className='loading' />
                    )
                }

                {
                    (!hasError && !isLoading) && (
                        <form id="form" className="chatbot-input-container" onSubmit={submitInput}>
                            <input type="text" value={userInput} required onChange={(e) => setUserInput( e.target.value )} />
                            <button type='submit' id="submit-btn" className="submit-btn">
                                <img
                                    src={sendBtnIcon}
                                    className="send-btn-icon"
                                />
                            </button>
                        </form>
                    )
                }

                {hasError && (
                    <div className="text-center">
                        <p>Something went wrong, please try again.</p>
                        <button type='button' className="btn" onClick={tryAgain}>
                            Try Again
                        </button>
                    </div>
                )}
            </section>
        </main>
    );
}