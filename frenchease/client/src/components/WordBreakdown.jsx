const WordBreakdown = ({ englishText, frenchText, words }) => {
  const englishWords = englishText.trim().split(/\s+/);
  const frenchWords = frenchText.trim().split(/\s+/);

  return (
    <section className="card breakdown-card fade-in">
      <div className="section-title">
        <h3>Word Breakdown</h3>
      </div>
      <div className="table-wrap">
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
            {words.map((item, index) => (
              <tr key={`${item.word}-${index}`}>
                <td>{englishWords[index] || 'Phrase'}</td>
                <td>{item.word || frenchWords[index] || ''}</td>
                <td className="mono">{item.phonetic || ''}</td>
                <td>{item.english_hint || item.translation || ''}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
};

export default WordBreakdown;
