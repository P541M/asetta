import { useState } from "react";
import { useRouter } from "next/router";
import DashboardLayout from "../layout/DashboardLayout";
import AddAssessmentForm from "../forms/AddAssessmentForm";
import UploadForm from "../forms/UploadForm";

interface AddAssessmentPageProps {
  forceSemesterId?: string;
}

const AddAssessmentPage = ({ forceSemesterId }: AddAssessmentPageProps) => {
  const router = useRouter();
  const [addMode, setAddMode] = useState<"manual" | "upload">("upload");

  // Extract semester ID from URL if this is a semester-specific route
  const urlSemesterId = forceSemesterId || (router.query.semester as string);

  return (
    <DashboardLayout
      title="Add Assessment - Asetta"
      description="Add new assessments to your semester either manually or by uploading a file."
      forceSemesterId={urlSemesterId}
    >
      {({ selectedSemester, selectedSemesterId, refreshAssessments }) => (
        <div className="animate-fade-in">
          {selectedSemesterId ? (
            <div className="p-6">
              <h2 className="text-xl font-medium mb-6 dark:text-dark-text-primary">
                Add Assessment for {selectedSemester}
              </h2>

              <div className="flex space-x-4 mb-6">
                <button
                  onClick={() => setAddMode("upload")}
                  className={`flex-1 py-3 px-4 rounded-md text-sm font-medium transition-all duration-200 ${
                    addMode === "upload"
                      ? "bg-light-button-primary text-white shadow-sm dark:bg-dark-button-primary"
                      : "bg-gray-50 dark:bg-dark-bg-tertiary text-gray-600 dark:text-dark-text-secondary hover:bg-gray-100 dark:hover:bg-dark-bg-hover"
                  }`}
                >
                  Upload File
                </button>
                <button
                  onClick={() => setAddMode("manual")}
                  className={`flex-1 py-3 px-4 rounded-md text-sm font-medium transition-all duration-200 ${
                    addMode === "manual"
                      ? "bg-light-button-primary text-white shadow-sm dark:bg-dark-button-primary"
                      : "bg-gray-50 dark:bg-dark-bg-tertiary text-gray-600 dark:text-dark-text-secondary hover:bg-gray-100 dark:hover:bg-dark-bg-hover"
                  }`}
                >
                  Quick Add
                </button>
              </div>

              {addMode === "upload" ? (
                <UploadForm
                  semester={selectedSemester}
                  onUploadSuccess={refreshAssessments}
                />
              ) : (
                <AddAssessmentForm
                  semesterId={selectedSemesterId}
                  onSuccess={refreshAssessments}
                />
              )}
            </div>
          ) : (
            <div className="p-6 text-center">
              <p className="text-gray-600 dark:text-dark-text-secondary">
                {urlSemesterId
                  ? "Unable to load semester data. Please check the URL or return to the dashboard."
                  : "Please select a semester to add assessments."}
              </p>
            </div>
          )}
        </div>
      )}
    </DashboardLayout>
  );
};

export default AddAssessmentPage;
