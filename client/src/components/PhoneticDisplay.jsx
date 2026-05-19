import { useState } from 'react';
import { speakFrench } from '../utils/speech.js';

const FormPronunciationCard = ({ label, value, pronunciation }) => {
  if (!value || !pronunciation?.guide) {
    return null;
  }

  return (
    <div className="form-pronunciation-card">
      <span className="label">{label}</span>
      <p className="form-pronunciation-word">{value}</p>
      <p className="form-pronunciation-guide">{pronunciation.guide}</p>
      <button className="secondary-button compact-button" type="button" onClick={() => speakFrench(value)}>
        Listen
      </button>
    </div>
  );
};

const PhoneticDisplay = ({ phonetics, frenchText, genderForms, genderPronunciations }) => {
  const [showIpa, setShowIpa] = useState(false);
  const hasGenderPronunciations = Boolean(genderForms?.applicable && (genderPronunciations?.masculine || genderPronunciations?.feminine));

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

      {hasGenderPronunciations ? (
        <div className="form-pronunciation-grid">
          <FormPronunciationCard
            label="Masculine"
            value={genderForms.masculine}
            pronunciation={genderPronunciations.masculine}
          />
          <FormPronunciationCard
            label="Feminine"
            value={genderForms.feminine}
            pronunciation={genderPronunciations.feminine}
          />
        </div>
      ) : null}

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
