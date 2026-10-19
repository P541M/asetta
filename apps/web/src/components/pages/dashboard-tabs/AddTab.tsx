import { memo } from "react";
import { GraduationCap } from "lucide-react";
import { TabComponentProps } from "../../../types/dashboard";
import AddAssessmentForm from "../../forms/AddAssessmentForm";
import UploadForm from "../../forms/UploadForm";
import EmptyState from "../../ui/EmptyState";
import PanelHeader from "../../ui/PanelHeader";

const AddTab = memo(function AddTab({ data, urlSemesterId }: TabComponentProps) {
  const { selectedSemesterId } = data;

  return (
    <div>
      {selectedSemesterId ? (
        <div className="p-6">
          <PanelHeader title="Add assessments" />

          <UploadForm semesterId={selectedSemesterId} />

          {/* Typographic rule between the two paths */}
          <div className="my-8 flex items-center gap-3">
            <div className="h-px flex-1 bg-border" />
            <span className="text-xs font-medium text-muted-foreground">or add one manually</span>
            <div className="h-px flex-1 bg-border" />
          </div>

          <AddAssessmentForm semesterId={selectedSemesterId} />
        </div>
      ) : (
        <EmptyState
          icon={GraduationCap}
          title={urlSemesterId ? "Semester not found" : "No semester selected"}
          description={
            urlSemesterId
              ? "Check the URL or head back to your dashboard."
              : "Select a semester above to add assessments."
          }
        />
      )}
    </div>
  );
});

export default AddTab;
