import { FileText } from "lucide-react";
import { StepNavigation } from "../ui/StepNavigation";
import { useAuth } from "../../../contexts/AuthContext";

export function WelcomeStep() {
  const { user } = useAuth();
  const userName = user?.displayName || user?.email?.split("@")[0] || "there";

  return (
    <div className="text-center">
      <div className="mb-12">
        <div className="mx-auto mb-6 flex size-16 items-center justify-center rounded-xl bg-primary/10">
          <FileText className="size-8 text-primary" aria-hidden />
        </div>
        <h1 className="mb-4 text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
          Welcome to Asetta, {userName}!
        </h1>
        <p className="mx-auto max-w-lg text-lg text-muted-foreground">
          Upload your course outlines and we&apos;ll automatically track all your assessments and
          deadlines.
        </p>
      </div>

      <StepNavigation canGoBack={false} nextLabel="Get started" />
    </div>
  );
}
