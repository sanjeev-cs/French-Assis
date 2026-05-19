const GroqLogo = ({ className = '' }) => {
  return (
    <span className={`groq-logo ${className}`} aria-hidden="true">
      <svg viewBox="0 0 32 32" role="img">
        <circle cx="16" cy="16" r="15" />
        <path d="M20.7 10.2a7.5 7.5 0 1 0 1.9 7.3h-6.1v-3.2h9.7c.1.6.2 1.2.2 1.9 0 5.9-4.3 10.1-10 10.1A10.2 10.2 0 1 1 23 8.5l-2.3 1.7Z" />
      </svg>
    </span>
  );
};

export default GroqLogo;
