import { useEffect } from 'react';
import AiTipCard from '../components/AiTipCard.jsx';
import InvalidTranslationCard from '../components/InvalidTranslationCard.jsx';
import Loader from '../components/Loader.jsx';
import PhoneticDisplay from '../components/PhoneticDisplay.jsx';
import ResultCard from '../components/ResultCard.jsx';
import SearchBar from '../components/SearchBar.jsx';
import WordBreakdown from '../components/WordBreakdown.jsx';
import { useTranslate } from '../hooks/useTranslate.js';
import { isNotRecognizedPhonetics } from '../utils/phoneticsResult.js';

const Home = ({ replaySearch }) => {
  const { result, isLoading, stageMessage, error, lookup } = useTranslate();
  const isMultiWord = result.inputText.trim().split(/\s+/).length > 1;
  const hasInvalidTranslation = isNotRecognizedPhonetics(result.phonetics);
  const inlineErrorMessage = result.invalidMessage;

  useEffect(() => {
    if (replaySearch?.text) {
      lookup({ text: replaySearch.text });
    }
  }, [replaySearch?.key]);

  return (
    <section className="home-page fade-in">
      <div className="hero">
        <h1>Translate & Pronounce</h1>
        <p className="hero-copy">Type English or French to get translations and pronunciation.</p>
      </div>

      <SearchBar
        onSearch={lookup}
        disabled={isLoading}
        initialValue={replaySearch?.text || ''}
      />

      {error ? <p className="error-banner">{error}</p> : null}
      {isLoading ? <Loader message={stageMessage} /> : null}

      {inlineErrorMessage ? (
        <div className="result-stack">
          <InvalidTranslationCard message={inlineErrorMessage} />
        </div>
      ) : null}

      {result.translation ? (
        <div className="result-stack">
          {hasInvalidTranslation ? (
            <InvalidTranslationCard message={result.phonetics.pronunciation_guide} />
          ) : (
            <>
              <ResultCard result={result} />
              {result.phonetics ? (
                <PhoneticDisplay
                  phonetics={result.phonetics}
                  frenchText={result.translation.frenchText}
                  genderForms={result.translation.genderForms}
                  genderPronunciations={result.translation.genderPronunciations}
                />
              ) : null}
              {isMultiWord && result.phonetics?.word_breakdown?.length ? (
                <WordBreakdown
                  englishText={result.translation.englishText}
                  frenchText={result.translation.frenchText}
                  words={result.phonetics.word_breakdown}
                />
              ) : null}
              {result.aiTip ? <AiTipCard tip={result.aiTip} /> : null}
            </>
          )}
        </div>
      ) : null}
    </section>
  );
};

export default Home;
