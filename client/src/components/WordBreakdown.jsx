const WordBreakdown = ({ englishText, frenchText, words }) => {
  const englishWords = englishText.trim().split(/\s+/);
  const frenchWords = frenchText.trim().split(/\s+/);
  const rows = words.map((item, index) => ({
    englishWord: englishWords[index] || 'Phrase',
    frenchWord: item.word || frenchWords[index] || '',
    ipa: item.phonetic || '',
    soundsLike: item.english_hint || item.translation || ''
  }));

  return (
    <section className="card breakdown-card fade-in">
      <div className="section-title">
        <h3>Word Breakdown</h3>
      </div>
      <div className="table-wrap breakdown-table">
        <table>
          <thead>
            <tr>
              <th>English word</th>
              <th>French word</th>
              <th>IPA</th>
              <th>Sounds like</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr key={`${row.frenchWord}-${index}`}>
                <td>{row.englishWord}</td>
                <td>{row.frenchWord}</td>
                <td className="mono">{row.ipa}</td>
                <td>{row.soundsLike}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="breakdown-mobile-list">
        {rows.map((row, index) => (
          <article className="breakdown-mobile-card" key={`${row.frenchWord}-mobile-${index}`}>
            <div className="breakdown-mobile-row">
              <span className="label">English word</span>
              <p>{row.englishWord}</p>
            </div>
            <div className="breakdown-mobile-row">
              <span className="label">French word</span>
              <p>{row.frenchWord}</p>
            </div>
            <div className="breakdown-mobile-row">
              <span className="label">IPA</span>
              <p className="mono">{row.ipa || 'Unavailable'}</p>
            </div>
            <div className="breakdown-mobile-row">
              <span className="label">Sounds like</span>
              <p>{row.soundsLike || 'Unavailable'}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
};

export default WordBreakdown;
