const InvalidTranslationCard = ({ message }) => {
  return (
    <article className="card invalid-translation-card fade-in">
      <span className="label">Not found</span>
      <h3>{message}</h3>
    </article>
  );
};

export default InvalidTranslationCard;
