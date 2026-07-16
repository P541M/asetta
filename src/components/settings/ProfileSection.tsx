import { ProfileSectionProps } from "../../types/profile";
import { Input } from "../ui/input";
import { Label } from "../ui/label";

const ProfileSection = ({ form, onChange }: ProfileSectionProps) => {
  const currentYear = new Date().getFullYear();

  return (
    <div className="space-y-8">
      {/* Section header */}
      <div className="border-b border-border pb-4">
        <h3 className="text-base font-semibold text-foreground">Profile information</h3>
        <p className="mt-1 text-sm text-muted-foreground">Update your profile details</p>
      </div>

      {/* Profile fields */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="displayName">Display name</Label>
          <Input
            id="displayName"
            type="text"
            value={form.displayName}
            onChange={(e) => onChange("displayName", e.target.value)}
            placeholder="Your display name"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="institution">Institution</Label>
          <Input
            id="institution"
            type="text"
            value={form.institution}
            onChange={(e) => onChange("institution", e.target.value)}
            placeholder="Your university or school"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="studyProgram">Study program</Label>
          <Input
            id="studyProgram"
            type="text"
            value={form.studyProgram}
            onChange={(e) => onChange("studyProgram", e.target.value)}
            placeholder="e.g., Computer Science, Business Administration"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="graduationYear">Expected graduation year</Label>
          <Input
            id="graduationYear"
            type="number"
            min={currentYear}
            max={currentYear + 10}
            value={form.graduationYear}
            onChange={(e) => onChange("graduationYear", parseInt(e.target.value))}
          />
        </div>
      </div>
    </div>
  );
};

export default ProfileSection;
