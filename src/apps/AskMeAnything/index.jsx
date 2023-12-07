import { useState } from 'react'
import OpenAI from "openai";
import { process } from '@root/env';
import './App.scss'

function App() {
  const [question, setQuestion] = useState('');
  const [conversations, setConversations] = useState([]);

  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    dangerouslyAllowBrowser: true,
  });

  async function getCompletions() {
    if (!question) {
      return;
    }

    setQuestion('');
    setConversations(currentValue => ([...currentValue, {
      userType: 'user',
      text: question,
    }]));

    const response = await openai.completions.create({
      model: "gpt-3.5-turbo-instruct",
      prompt: question,
      temperature: 1,
      max_tokens: 256,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0,
    });

    setConversations(currentValue => ([...currentValue, {
      userType: 'boot',
      text: response.choices[0].text.trim(),
    }]));
  }

  return (
    <div className='container'>
      <h1>Ask Me Anything</h1>
      <div className="card">
        <input type='text' value={question} onChange={e => { setQuestion(e.target.value) }} />

        <button onClick={getCompletions}>Ask</button>
      </div>

      <div className="card">
        {
          conversations.map((conversation, index) => (
            <p key={index}>{conversation.text}</p>
          ))
        }
      </div>
    </div>
  )
}

export default App
