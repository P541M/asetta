import { useState } from "react";
import { useRouter } from "next/router";
import DashboardLayout from "../../../components/layout/DashboardLayout";
import AddAssessmentForm from "../../../components/forms/AddAssessmentForm";
import UploadForm from "../../../components/forms/UploadForm";

const SemesterAddAssessmentPage = () => {
  const router = useRouter();
  const { semester: semesterId } = router.query;
  const [addMode, setAddMode] = useState<"manual" | "upload">("manual");

  return (
    <DashboardLayout
      title="Add Assessment - Asetta"
      description="Add new assessments to this semester either manually or by uploading a file."
      forceSemesterId={semesterId as string}
    >
      {({
        selectedSemester,
        selectedSemesterId,
        refreshAssessments,
      }) => (
        <div className="animate-fade-in">
          {selectedSemesterId ? (
            <div className="p-6">
              <h2 className="text-xl font-medium mb-6 dark:text-dark-text-primary">
                Add Assessment for {selectedSemester}
              </h2>

              <div className="flex space-x-4 mb-6">
                <button
                  onClick={() => setAddMode("manual")}
                  className={`flex-1 py-3 px-4 rounded-md text-sm font-medium transition-all duration-200 ${
                    addMode === "manual"
                      ? "bg-primary-500 text-white shadow-sm"
                      : "bg-gray-50 dark:bg-dark-bg-tertiary text-gray-600 dark:text-dark-text-secondary hover:bg-gray-100 dark:hover:bg-dark-bg-hover"
                  }`}
                >
                  Quick Add
                </button>
                <button
                  onClick={() => setAddMode("upload")}
                  className={`flex-1 py-3 px-4 rounded-md text-sm font-medium transition-all duration-200 ${
                    addMode === "upload"
                      ? "bg-primary-500 text-white shadow-sm"
                      : "bg-gray-50 dark:bg-dark-bg-tertiary text-gray-600 dark:text-dark-text-secondary hover:bg-gray-100 dark:hover:bg-dark-bg-hover"
                  }`}
                >
                  Upload File
                </button>
              </div>

              {addMode === "manual" ? (
                <AddAssessmentForm
                  semester={selectedSemester}
                  semesterId={selectedSemesterId}
                  onSuccess={refreshAssessments}
                />
              ) : (
                <UploadForm
                  semester={selectedSemester}
                  onUploadSuccess={refreshAssessments}
                />
              )}
            </div>
          ) : (
            <div className="p-6 text-center">
              <p className="text-gray-600 dark:text-dark-text-secondary">
                Unable to load semester data. Please check the URL or return to the dashboard.
              </p>
            </div>
          )}
        </div>
      )}
    </DashboardLayout>
  );
};

export default SemesterAddAssessmentPage;