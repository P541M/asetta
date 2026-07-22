import {
  ArrowRight,
  BellRing,
  CalendarPlus,
  CircleCheck,
  ClipboardCheck,
  ListChecks,
  Loader2,
  type LucideIcon,
} from "lucide-react";
import { useAuth } from "../../../contexts/AuthContext";
import { useOnboarding } from "../../../contexts/OnboardingContext";
import { useCourseColors } from "../../../hooks/useCourseColors";
import { resolveCourseColor } from "../../../constants/courseColors";
import { Button } from "../../ui/button";
import CourseColorDot from "../../ui/CourseColorDot";

const nextSteps: { icon: LucideIcon; title: string; description: string }[] = [
  {
    icon: ClipboardCheck,
    title: "Review & organize",
    description: "Check extracted assessments and make any necessary adjustments",
  },
  {
    icon: ListChecks,
    title: "Track progress",
    description: "Mark assessments as complete and track your academic progress",
  },
  {
    icon: CalendarPlus,
    title: "Add more content",
    description: "Upload additional course outlines or create more semesters",
  },
  {
    icon: BellRing,
    title: "Stay on top",
    description: "Get reminders and use the calendar view to never miss deadlines",
  },
];

export function CompletionStep() {
  const { user } = useAuth();
  const { state, completeOnboarding } = useOnboarding();
  const { courseColors } = useCourseColors(user, state.createdSemesterId ?? "");

  const handleViewDashboard = () => {
    completeOnboarding();
  };

  return (
    <div className="mx-auto max-w-2xl text-center">
      {/* Success marker (scale-in = feedback on arriving at the finished state) */}
      <div className="mb-8">
        <div className="mx-auto mb-6 flex size-24 items-center justify-center rounded-full bg-success/10 motion-safe:animate-scale-in">
          <CircleCheck className="size-12 text-success" aria-hidden />
        </div>

        <h1 className="mb-4 text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
          You&apos;re all set
        </h1>

        <p className="text-lg text-muted-foreground">
          Your academic planning assistant is ready to help you stay organized.
        </p>
      </div>

      {/* Results summary */}
      {state.hasCompletedUpload && (
        <div className="mb-8 rounded-xl bg-secondary/50 p-6">
          <h3 className="mb-4 text-base font-semibold text-foreground">Setup summary</h3>

          <div className="grid gap-4 text-center md:grid-cols-3">
            <div>
              <p className="text-xl font-semibold text-foreground md:text-2xl">
                {state.extractionResults?.processedFiles || 0}
              </p>
              <p className="text-xs font-medium text-muted-foreground">Files processed</p>
            </div>

            <div>
              <p className="text-xl font-semibold text-foreground md:text-2xl">
                {state.extractionResults?.totalAssessments || 0}
              </p>
              <p className="text-xs font-medium text-muted-foreground">Assessments found</p>
            </div>

            <div>
              <p className="text-xl font-semibold text-foreground md:text-2xl">
                {state.extractionResults?.courseBreakdown?.length || 0}
              </p>
              <p className="text-xs font-medium text-muted-foreground">Courses identified</p>
            </div>
          </div>

          {/* Course breakdown */}
          {state.extractionResults?.courseBreakdown &&
            state.extractionResults.courseBreakdown.length > 0 && (
              <div className="mt-6 border-t border-border pt-6">
                <h4 className="mb-3 text-left text-sm font-medium text-foreground">
                  Courses in {state.semesterData.name}:
                </h4>
                <div className="grid gap-2">
                  {state.extractionResults.courseBreakdown.map(
                    (course: { courseName: string; assessmentCount: number }, index: number) => (
                      <div
                        key={index}
                        className="flex items-center justify-between rounded-lg bg-card px-3 py-2"
                      >
                        <span className="flex min-w-0 items-center gap-1.5">
                          <CourseColorDot
                            color={resolveCourseColor(
                              courseColors[course.courseName],
                              course.courseName,
                            )}
                          />
                          <span className="truncate text-sm font-medium text-foreground">
                            {course.courseName}
                          </span>
                        </span>
                        <span className="text-sm text-muted-foreground">
                          {course.assessmentCount} assessment
                          {course.assessmentCount !== 1 ? "s" : ""}
                        </span>
                      </div>
                    ),
                  )}
                </div>
              </div>
            )}
        </div>
      )}

      {/* What's next */}
      <div className="mb-8 rounded-xl bg-secondary/50 p-6">
        <h3 className="mb-4 text-base font-semibold text-foreground">What&apos;s next?</h3>

        <div className="grid gap-4 text-left md:grid-cols-2">
          {nextSteps.map(({ icon: Icon, title, description }) => (
            <div key={title} className="flex items-start gap-3">
              <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                <Icon className="size-4 text-primary" aria-hidden />
              </div>
              <div>
                <h4 className="mb-1 text-sm font-medium text-foreground">{title}</h4>
                <p className="text-xs text-muted-foreground">{description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Action button */}
      <div className="flex justify-center">
        <Button type="button" onClick={handleViewDashboard} disabled={state.isLoading}>
          {state.isLoading ? (
            <>
              <Loader2 className="motion-safe:animate-spin" aria-hidden />
              Setting up your dashboard...
            </>
          ) : (
            <>
              Go to dashboard
              <ArrowRight aria-hidden />
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
