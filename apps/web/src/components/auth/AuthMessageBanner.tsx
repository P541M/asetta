import { CircleAlert, CircleCheck } from "lucide-react";
import { Alert, AlertTitle, AlertDescription } from "../ui/alert";

interface AuthMessageBannerProps {
  type: "error" | "success";
  title: string;
  text: string;
}

/** Error/success banner shown at the top of the auth forms. */
const AuthMessageBanner = ({ type, title, text }: AuthMessageBannerProps) => (
  <Alert variant={type === "error" ? "destructive" : "success"} className="mb-6">
    {type === "error" ? <CircleAlert aria-hidden /> : <CircleCheck aria-hidden />}
    <AlertTitle>{title}</AlertTitle>
    <AlertDescription>{text}</AlertDescription>
  </Alert>
);

export default AuthMessageBanner;
