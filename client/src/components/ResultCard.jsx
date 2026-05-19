import { speakFrench } from '../utils/speech.js';

const languageNames = {
  en: 'English',
  fr: 'French'
};

const GenderFormCard = ({ label, value, pronunciation }) => {
  const hasPronunciation = Boolean(pronunciation?.guide);

  return (
    <div className="translation-meta-card translation-meta-card--pronunciation">
      <span className="label">{label}</span>
      <p>{value || 'Unavailable'}</p>
      {hasPronunciation ? <p className="translation-pronunciation">Sounds like: {pronunciation.guide}</p> : null}
      {pronunciation?.ipa ? <p className="translation-ipa">IPA: {pronunciation.ipa}</p> : null}
      {hasPronunciation ? (
        <button className="secondary-button compact-button" type="button" onClick={() => speakFrench(value)}>
          Listen
        </button>
      ) : null}
    </div>
  );
};

const ResultCard = ({ result }) => {
  const translatedText = result.translation.translatedText;
  const sourceName = languageNames[result.translation.sourceLang] || result.translation.sourceLang;
  const targetName = languageNames[result.translation.targetLang] || result.translation.targetLang;
  const variants = result.translation.variantTranslations;
  const genderForms = result.translation.genderForms;
  const genderPronunciations = result.translation.genderPronunciations || {};
  const selectedVariantLabel = result.translation.frenchVariantLabel || 'French';
  const selectedVariantText = variants
    ? result.translation.frenchVariant === 'canadian'
      ? variants.canadianFrench
      : variants.europeanFrench
    : translatedText;

  const copyTranslation = async () => {
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(translatedText);
    }
  };

  return (
    <article className="card result-card fade-in">
      <div className="result-header">
        <p className="translation-path">
          Detected {sourceName} to {targetName}
        </p>
        <span className="language-chip">{result.translation.targetLang.toUpperCase()}</span>
      </div>

      <div className="translated-line">
        <h2>{translatedText}</h2>
      </div>

      {variants ? (
        <div className="translation-meta-grid translation-meta-grid--single">
          <div className="translation-meta-card">
            <span className="label">{selectedVariantLabel}</span>
            <p>{selectedVariantText}</p>
          </div>
        </div>
      ) : null}

      {genderForms?.applicable ? (
        <div className="translation-meta-grid">
          <GenderFormCard label="Masculine" value={genderForms.masculine} pronunciation={genderPronunciations.masculine} />
          <GenderFormCard label="Feminine" value={genderForms.feminine} pronunciation={genderPronunciations.feminine} />
        </div>
      ) : null}

      {result.translation.translationNote ? <p className="translation-note">{result.translation.translationNote}</p> : null}
      {result.translation.sourceLang === 'fr' && result.translation.sourceFrenchVariant !== 'shared' ? (
        <p className="translation-note">Source variety: {result.translation.sourceFrenchVariant === 'canadian' ? 'Canadian French' : 'European French'}</p>
      ) : null}

      <div className="action-row">
        <button className="secondary-button" type="button" onClick={copyTranslation}>
          Copy
        </button>
      </div>
    </article>
  );
};

export default ResultCard;
