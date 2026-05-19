import { FRENCH_VARIANT_OPTIONS } from '../constants/frenchVariants.js';

const FrenchVariantSelector = ({ value, onChange, disabled, compact = false }) => {
  return (
    <div className={`variant-selector ${compact ? 'variant-selector--compact' : ''}`} aria-label="French variant preference">
      <span className="variant-selector-label">French style</span>
      <div className="variant-selector-options">
        {FRENCH_VARIANT_OPTIONS.map((option) => (
          <button
            key={option.value}
            type="button"
            className={`variant-option ${value === option.value ? 'active' : ''}`}
            onClick={() => onChange(option.value)}
            disabled={disabled}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default FrenchVariantSelector;
