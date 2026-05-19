const languageNames = {
  en: 'English',
  fr: 'French'
};

const ResultCard = ({ result }) => {
  const translatedText = result.translation.translatedText;
  const sourceName = languageNames[result.translation.sourceLang] || result.translation.sourceLang;
  const targetName = languageNames[result.translation.targetLang] || result.translation.targetLang;

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

      <div className="action-row">
        <button className="secondary-button" type="button" onClick={copyTranslation}>
          Copy
        </button>
      </div>
    </article>
  );
};

export default ResultCard;
