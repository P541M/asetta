interface SettingsMessageProps {
  text: string;
  type: "success" | "error";
}

const SettingsMessage = ({ text, type }: SettingsMessageProps) => {
  if (!text) return null;

  return (
    <div
      className={`mt-6 p-4 rounded-xl ${
        type === "success"
          ? "bg-light-success-bg text-light-success-text dark:bg-dark-success-bg dark:text-dark-success-text"
          : "bg-light-error-bg text-light-error-text dark:bg-dark-error-bg dark:text-dark-error-text"
      }`}
    >
      {text}
    </div>
  );
};

export default SettingsMessage;
