export interface Feature {
  image: string;
  title: string;
  description: string;
}

export const FEATURES: Feature[] = [
  {
    image: "/images/features/document-processing.gif",
    title: "AI Extraction",
    description:
      "Upload your course outline and AI extracts every assignment, deadline, and weight. No manual data entry.",
  },
  {
    image: "/images/features/grade-calculator.gif",
    title: "Grade Calculator",
    description:
      "Know exactly what you need on every assessment to hit your target grade, with your average tracked in real time.",
  },
  {
    image: "/images/features/calendar-deadlines.gif",
    title: "Calendar & Deadlines",
    description:
      "See your entire semester at a glance with drag-and-drop scheduling and smart deadline reminders.",
  },
  {
    image: "/images/features/semester-organization.gif",
    title: "Semester Organization",
    description:
      "Keep courses and terms cleanly separated, and move between semesters effortlessly.",
  },
  {
    image: "/images/features/assessment-tracking.gif",
    title: "Assessment Tracking",
    description:
      "Track progress and status across all your assignments, with filtering, search, and bulk actions.",
  },
  {
    image: "/images/features/notes-documentation.gif",
    title: "Notes & Documentation",
    description:
      "Attach rich, formatted notes to any assessment, with links, formatting, and persistent storage included.",
  },
];

// The three features showcased on the home page.
export const HOME_FEATURES = FEATURES.slice(0, 3);

export interface Challenge {
  title: string;
  description: string;
}

export const CHALLENGES: Challenge[] = [
  {
    title: "Scattered Information",
    description:
      "Assignment details spread across multiple syllabi, emails, and announcements, making it impossible to see the full picture of your semester.",
  },
  {
    title: "Grade Uncertainty",
    description:
      'Constantly wondering "What do I need on the final?" without having a clear, real-time view of where you stand in each class.',
  },
  {
    title: "Missed Deadlines",
    description:
      "Despite good intentions and multiple reminder systems, important assignments still slip through the cracks at the worst possible times.",
  },
  {
    title: "Time Wasted Organizing",
    description:
      "Hours spent manually copying information into calendars and spreadsheets, time that could be better spent actually studying and learning.",
  },
];
