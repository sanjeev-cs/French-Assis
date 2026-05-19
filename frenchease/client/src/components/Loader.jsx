const Loader = ({ message }) => {
  return (
    <div className="loader" role="status" aria-live="polite">
      <span className="dot" />
      <span>{message}</span>
    </div>
  );
};

export default Loader;
