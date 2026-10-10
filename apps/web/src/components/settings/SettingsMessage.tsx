import { CircleAlert, CircleCheck } from "lucide-react";
import { Alert, AlertDescription } from "../ui/alert";

interface SettingsMessageProps {
  text: string;
  type: "success" | "error";
}

const SettingsMessage = ({ text, type }: SettingsMessageProps) => {
  if (!text) return null;

  return (
    <Alert variant={type === "error" ? "destructive" : "success"} className="mt-6">
      {type === "error" ? <CircleAlert aria-hidden /> : <CircleCheck aria-hidden />}
      <AlertDescription>{text}</AlertDescription>
    </Alert>
  );
};

export default SettingsMessage;
