import { cn } from "@/lib/utils";
import { Checkbox } from "../ui/checkbox";
import { Label } from "../ui/label";

interface CopyrightAgreementProps {
  id: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  className?: string;
}

/** Terms-of-service consent checkbox shown before syllabus uploads. */
const CopyrightAgreement = ({ id, checked, onChange, className }: CopyrightAgreementProps) => (
  <div className={cn("rounded-xl bg-secondary/50 p-4", className)}>
    <div className="flex items-start gap-3">
      <Checkbox
        id={id}
        checked={checked}
        onCheckedChange={(value) => onChange(value === true)}
        className="mt-0.5"
      />
      <Label htmlFor={id} className="font-normal leading-normal text-muted-foreground">
        By uploading, I agree to the{" "}
        <a
          href="https://www.asetta.me/terms"
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary hover:underline"
        >
          Terms of Service
        </a>{" "}
        and confirm I have permission to upload these materials.
      </Label>
    </div>
  </div>
);

export default CopyrightAgreement;
