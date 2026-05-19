import { useState } from 'react';
import { sendChatMessage } from '../services/api.js';
import ChatMessage from './ChatMessage.jsx';
import GroqLogo from './GroqLogo.jsx';
import Loader from './Loader.jsx';

const INITIAL_MESSAGES = [
  {
    role: 'assistant',
    content: 'Ask me about French pronunciation, grammar, vocabulary, or how to use a phrase.'
  }
];

const ChatAssistant = ({ onSearchTerm }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState(INITIAL_MESSAGES);
  const [draft, setDraft] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const submitMessage = async () => {
    const message = draft.trim();

    if (!message || isLoading) {
      return;
    }

    const nextMessages = [...messages, { role: 'user', content: message }];
    setMessages(nextMessages);
    setDraft('');
    setIsLoading(true);

    try {
      const data = await sendChatMessage({
        message,
        history: nextMessages.slice(-8)
      });
      setMessages((current) => [...current, { role: 'assistant', content: data.answer }]);
    } catch {
      setMessages((current) => [
        ...current,
        { role: 'assistant', content: 'The chat assistant is unavailable right now. Please try again.' }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      submitMessage();
    }
  };

  const clearChat = () => {
    setMessages(INITIAL_MESSAGES);
    setDraft('');
  };

  return (
    <div className="chat-assistant">
      {isOpen ? (
        <section className="chat-panel" aria-label="FrenchEase AI chat assistant">
          <header className="chat-header">
            <div>
              <span className="label">Groq assistant</span>
              <h2>French questions</h2>
            </div>
            <div className="chat-header-actions">
              <button className="icon-button chat-clear" type="button" onClick={clearChat} aria-label="Clear chat">
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M7 7h10l-.7 12.2A2 2 0 0 1 14.3 21H9.7a2 2 0 0 1-2-1.8L7 7Z" />
                  <path d="M9 7V5.8A2.8 2.8 0 0 1 11.8 3h.4A2.8 2.8 0 0 1 15 5.8V7" />
                  <path d="M5 7h14" />
                  <path d="M10 11v6" />
                  <path d="M14 11v6" />
                </svg>
              </button>
              <button className="icon-button chat-close" type="button" onClick={() => setIsOpen(false)} aria-label="Close chat">
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M6 6l12 12" />
                  <path d="M18 6L6 18" />
                </svg>
              </button>
            </div>
          </header>

          <div className="chat-messages">
            {messages.map((message, index) => (
              <ChatMessage
                message={message}
                onSearchTerm={onSearchTerm}
                key={`${message.role}-${index}`}
              />
            ))}
            {isLoading ? <Loader message="Thinking..." /> : null}
          </div>

          <div className="chat-input-row">
            <textarea
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about French..."
              rows="2"
              maxLength="800"
            />
            <button type="button" onClick={submitMessage} disabled={isLoading || !draft.trim()}>
              Send
            </button>
          </div>
        </section>
      ) : null}

      <button className="chat-fab" type="button" onClick={() => setIsOpen((current) => !current)} aria-label="Open Groq chat assistant">
        <GroqLogo />
        <span>Groq</span>
      </button>
    </div>
  );
};

export default ChatAssistant;
