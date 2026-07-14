interface CopyrightAgreementProps {
  id: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  className?: string;
}

/** Terms-of-service consent checkbox shown before syllabus uploads. */
const CopyrightAgreement = ({ id, checked, onChange, className = "" }: CopyrightAgreementProps) => (
  <div
    className={`p-4 bg-light-bg-secondary dark:bg-dark-bg-secondary rounded-lg border border-light-border-secondary dark:border-dark-border-secondary ${className}`.trim()}
  >
    <div className="flex items-start space-x-3">
      <input
        type="checkbox"
        id={id}
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-1 w-4 h-4 text-light-button-primary dark:text-dark-button-primary border-gray-300 rounded focus:ring-light-button-primary dark:focus:ring-dark-button-primary"
      />
      <label
        htmlFor={id}
        className="text-sm text-light-text-secondary dark:text-dark-text-secondary"
      >
        By uploading, I agree to the{" "}
        <a
          href="https://www.asetta.me/terms"
          target="_blank"
          rel="noopener noreferrer"
          className="text-light-button-primary dark:text-dark-button-primary hover:underline"
        >
          Terms of Service
        </a>{" "}
        and confirm I have permission to upload these materials.
      </label>
    </div>
  </div>
);

export default CopyrightAgreement;
