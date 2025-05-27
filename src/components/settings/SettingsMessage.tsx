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
          ? "bg-green-50 text-green-800 dark:bg-green-900/20 dark:text-green-400"
          : "bg-red-50 text-red-800 dark:bg-red-900/20 dark:text-red-400"
      }`}
    >
      {text}
    </div>
  );
};

export default SettingsMessage;
