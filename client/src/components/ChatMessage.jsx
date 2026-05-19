import { extractSearchTerms, formatChatText } from '../utils/chatFormatting.js';

const ChatMessage = ({ message, onSearchTerm }) => {
  const parts = formatChatText(message.content);
  const terms = message.role === 'assistant' ? extractSearchTerms(message.content) : [];

  return (
    <div className={`chat-message ${message.role}`}>
      <div className="chat-message-content">
        {parts.map((part, index) =>
          part.type === 'list' ? (
            <div className="chat-list-item" key={`${part.text}-${index}`}>
              {part.text}
            </div>
          ) : (
            <p key={`${part.text}-${index}`}>{part.text}</p>
          )
        )}
      </div>

      {terms.length ? (
        <div className="chat-search-actions">
          {terms.map((term) => (
            <button type="button" key={term} onClick={() => onSearchTerm(term)}>
              Search {term}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
};

export default ChatMessage;
