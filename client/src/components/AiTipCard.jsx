import { useState } from 'react';
import { speakFrench } from '../utils/speech.js';

const AiTipCard = ({ tip }) => {
  const [isOpen, setIsOpen] = useState(false);
  const example = tip.example_sentence;

  return (
    <section className="card ai-tip-card fade-in">
      <button className="collapse-button" type="button" onClick={() => setIsOpen((current) => !current)}>
        <span className="collapse-copy">
          <span>AI Learning Tip</span>
          {!isOpen ? (
            <span className="collapse-chip-row" aria-label="AI tip content available">
              <span className="collapse-chip">Memory tip</span>
              <span className="collapse-chip">Example</span>
              <span className="collapse-chip">Common mistake</span>
            </span>
          ) : null}
        </span>
        <span>{isOpen ? 'Close' : 'Open'}</span>
      </button>

      {isOpen ? (
        <div className="tip-content">
          <div className="tip-summary">
            <span className="difficulty-badge">{tip.difficulty || 'beginner'}</span>
            <p>{tip.memory_tip}</p>
          </div>

          {example?.french ? (
            <div className="example-card">
              <div className="example-header">
                <span className="label">Practice sentence</span>
                <button className="secondary-button compact-button" type="button" onClick={() => speakFrench(example.french)}>
                  Listen
                </button>
              </div>
              <p className="example-french">{example.french}</p>
              <p className="example-english">{example.english}</p>
              {example.pronunciation_guide ? (
                <span className="pronunciation-pill compact-pill">Sounds like: {example.pronunciation_guide}</span>
              ) : null}
              {example.phonetic_transcription ? <p className="ipa-line">{example.phonetic_transcription}</p> : null}
            </div>
          ) : null}

          {tip.common_mistake ? (
            <p className="mistake-note">
              <strong>Common mistake:</strong> {tip.common_mistake}
            </p>
          ) : null}
        </div>
      ) : null}
    </section>
  );
};

export default AiTipCard;
