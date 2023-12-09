import './App.scss';

import owlLogo from '@assets/images/owl-logo.png';
import sendBtnIcon from '@assets/images/send-btn-icon.png';

export default function App() {

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
                </div>
                <form id="form" className="chatbot-input-container">
                    <input name="user-input" type="text" id="user-input" required />
                    <button id="submit-btn" className="submit-btn">
                        <img
                            src={sendBtnIcon}
                            className="send-btn-icon"
                        />
                    </button>
                </form>
            </section>
        </main>
    );
}