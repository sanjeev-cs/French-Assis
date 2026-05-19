import { useEffect } from 'react';
import AiTipCard from '../components/AiTipCard.jsx';
import Loader from '../components/Loader.jsx';
import PhoneticDisplay from '../components/PhoneticDisplay.jsx';
import ResultCard from '../components/ResultCard.jsx';
import SearchBar from '../components/SearchBar.jsx';
import WordBreakdown from '../components/WordBreakdown.jsx';
import { useTranslate } from '../hooks/useTranslate.js';

const Home = ({ replaySearch }) => {
  const { result, isLoading, stageMessage, error, lookup } = useTranslate();
  const isMultiWord = result.inputText.trim().split(/\s+/).length > 1;

  useEffect(() => {
    if (replaySearch?.text) {
      lookup(replaySearch.text);
    }
  }, [replaySearch?.key]);

  return (
    <section className="home-page fade-in">
      <div className="hero">
        <h1>Translate & Pronounce</h1>
        <p className="hero-copy">Type English or French to get translations and pronunciation.</p>
      </div>

      <SearchBar onSearch={lookup} disabled={isLoading} initialValue={replaySearch?.text || ''} />

      {error ? <p className="error-banner">{error}</p> : null}
      {isLoading ? <Loader message={stageMessage} /> : null}

      {result.translation ? (
        <div className="result-stack">
          <ResultCard result={result} />
          {result.phonetics ? (
            <PhoneticDisplay phonetics={result.phonetics} frenchText={result.translation.frenchText} />
          ) : null}
          {isMultiWord && result.phonetics?.word_breakdown?.length ? (
            <WordBreakdown
              englishText={result.translation.englishText}
              frenchText={result.translation.frenchText}
              words={result.phonetics.word_breakdown}
            />
          ) : null}
          {result.aiTip ? <AiTipCard tip={result.aiTip} /> : null}
        </div>
      ) : null}
    </section>
  );
};

export default Home;
