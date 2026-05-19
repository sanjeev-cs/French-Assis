import { useState } from 'react';
import { speakFrench } from '../utils/speech.js';

const PhoneticDisplay = ({ phonetics, frenchText }) => {
  const [showIpa, setShowIpa] = useState(false);

  return (
    <section className="card phonetic-card fade-in">
      <div className="section-title compact-section-title">
        <h3>How to say it</h3>
      </div>

      <div className="say-it-panel">
        <div className="say-it-copy">
          <span className="label">Read this out loud</span>
          <p className="readable-pronunciation">{phonetics.pronunciation_guide || 'Guide unavailable'}</p>
        </div>
        <button className="secondary-button" type="button" onClick={() => speakFrench(frenchText)}>
          Listen
        </button>
      </div>

      {phonetics.pronunciation_explanation ? (
        <div className="pronunciation-explanation">
          <span className="label">Why it sounds this way</span>
          <p>{phonetics.pronunciation_explanation}</p>
        </div>
      ) : null}

      {phonetics.audio_description ? (
        <details className="sound-details">
          <summary>More sound detail</summary>
          <p>{phonetics.audio_description}</p>
        </details>
      ) : null}

      {phonetics.phonetic_transcription ? (
        <div className="ipa-details">
          <button className="text-button" type="button" onClick={() => setShowIpa((current) => !current)}>
            {showIpa ? 'Hide IPA symbols' : 'Show IPA symbols'}
          </button>
          {showIpa ? (
            <p className="ipa-help">
              IPA is the technical pronunciation alphabet. You can ignore it if the readable guide is enough.
              <span className="ipa-line">{phonetics.phonetic_transcription}</span>
            </p>
          ) : null}
        </div>
      ) : null}
    </section>
  );
};

export default PhoneticDisplay;
