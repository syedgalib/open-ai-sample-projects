import './App.scss';

import { useState, useEffect, useRef } from 'react';
import OpenAI from "openai";
import { initializeApp } from 'firebase/app';
import { getDatabase, ref, push, get } from 'firebase/database'

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

    const chatBootInstruction = {
        role: 'system',
        content: 'You are a highly knowledgeable assistant that is always happy to help.'
    };

    const app = initializeApp(process.env.CHAT_BOOT_DATABASE_CONFIG);
    const database = getDatabase(app);
    const conversationInDb = ref(database);

    const conversationContainerRef = useRef();

    const [userInput, setUserInput] = useState('');
    const [messages, setMessages] = useState([]);

    const [hasError, setHasError] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        loadOldData();
    }, []);

    function loadOldData() {
        setIsLoading(true);

        get(conversationInDb).then(async (snapshot) => {
            if (snapshot.exists()) {
                const newMessages = Object.values(snapshot.val());
                setMessages( newMessages );
                conversationContainerRef.current.scrollTop = conversationContainerRef.current.scrollHeight;
            }
            setIsLoading(false);
        });
    }


    // Submit Input
    async function submitInput(e) {
        e.preventDefault();

        if (!userInput) {
            return;
        }

        if (isLoading) {
            return;
        }

        const newMessage = {
            role: 'user',
            content: userInput
        };

        const newMessages = [...messages, newMessage];

        setUserInput('');
        setMessages(newMessages);
        await push(conversationInDb, newMessage);
        updateResult();
    }

    // Update Result
    function updateResult() {
        if (isLoading) {
            return;
        }

        setIsLoading(true);

        get(conversationInDb).then(async (snapshot) => {
            if (snapshot.exists()) {
                const newMessages = Object.values(snapshot.val());
                await prepareResult(newMessages);
            }
            else {
                console.log('No data available')
            }
        });
    }

    // Prepare Result
    async function prepareResult(messages) {
        setIsLoading(true);

        try {
            await fetchReplay(messages);
            setIsLoading(false);
        } catch (error) {
            console.log({ error });

            setHasError(true)
            setIsLoading(false);
        }
    }

    // Fetch Replay
    async function fetchReplay(messages) {
        messages.unshift(chatBootInstruction);
        const message = await fetchChatCompletion({ messages }, 'fetchReplay');

        push(conversationInDb, message);
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
        return messages;
    }

    function tryAgain() {
        setHasError(false);
        updateResult();
    }

    return (
        <main>
            <section className="chatbot-container">
                <div className="chatbot-header">
                    <img src={owlLogo} className="logo" />
                    <h1>KnowItAll</h1>
                    <h2>Ask me anything!</h2>
                    <p className="supportId">User ID: 2344</p>
                    <button type='button' className="clear-btn" id="clear-btn">Start Over</button>
                </div>

                <div ref={conversationContainerRef} className="chatbot-conversation-container">
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
                            <input type="text" value={userInput} required onChange={(e) => setUserInput(e.target.value)} />
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