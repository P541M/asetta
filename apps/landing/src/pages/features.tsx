import Head from "next/head";
import Link from "next/link";
import Image from "next/image";
import Header from "../components/Header";
import Footer from "../components/Footer";

export default function FeaturesPage() {
  return (
    <div className="min-h-screen bg-primary-50/20 flex flex-col">
      <Head>
        <title>Features | Asetta</title>
        <meta
          name="description"
          content="Discover Asetta's powerful features for academic organization: semester management, grade calculator, calendar system, and more—completely free."
        />
      </Head>
      <Header />

      <main 
        className="flex-grow pb-24 relative overflow-hidden"
        style={{
          paddingTop: `max(8rem, calc(8rem + env(safe-area-inset-top)))`,
        }}
      >
        {/* Background Elements */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-24 -left-24 w-96 h-96 bg-primary-100/20 rounded-full blur-3xl" />
          <div className="absolute -bottom-24 -right-24 w-80 h-80 bg-primary-100/15 rounded-full blur-3xl" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Hero Section */}
          <div className="text-center mb-20 animate-fade-in-initial animate-fade-in">
            <span className="inline-flex items-center px-4 py-2 rounded-full bg-primary-100 text-primary-700 font-semibold text-sm border border-primary-200/50 mb-6">
              <span className="w-2 h-2 bg-primary-500 rounded-full mr-2 animate-pulse"></span>
              AI-Powered Features
            </span>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-gray-900 mb-8 font-heading tracking-tight leading-tight">
              Smart Features for{" "}
              <span className="text-primary-600">
                Academic Success
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Comprehensive academic organization tools designed for students.
              Track assessments, calculate grades, manage deadlines, and stay organized
              across all your semesters—completely free.
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-10 animate-fade-in-up-initial animate-fade-in-up">
            {[
              {
                image: "/images/features/document-processing.png",
                title: "Intelligent Document Processing",
                description:
                  "Transform course syllabi into organized assignment schedules. Upload your PDF course outline and let AI instantly extract every assignment, deadline, and weight—eliminating manual data entry and ensuring nothing falls through the cracks.",
              },
              {
                image: "/images/features/grade-calculator.png",
                title: "Advanced Grade Calculator",
                description:
                  "Take control of your academic performance with precision grade tracking. Calculate exactly what you need to achieve your target grades, monitor your GPA in real-time, and make informed decisions about your study priorities.",
              },
              {
                image: "/images/features/calendar-deadlines.png",
                title: "Smart Calendar & Deadline Management",
                description:
                  "Visualize your entire semester at a glance with drag-and-drop scheduling. Never miss another deadline with intelligent notifications and seamless calendar integration that syncs with your existing tools.",
              },
              {
                image: "/images/features/semester-organization.png",
                title: "Semester Organization",
                description:
                  "Structure your academic journey with intuitive semester management. Organize courses, navigate between terms effortlessly, and maintain clear separation between different academic periods for better focus and planning.",
              },
              {
                image: "/images/features/assessment-tracking.png",
                title: "Comprehensive Assessment Tracking",
                description:
                  "Master your academic workload with powerful assessment management tools. Track progress, manage statuses, filter by courses, and handle multiple assignments efficiently with bulk operations and intelligent search capabilities.",
              },
              {
                image: "/images/features/notes-documentation.png",
                title: "Professional Notes & Documentation",
                description:
                  "Enhance your study process with a sophisticated note-taking system. Create detailed, formatted notes for each assessment with professional text editing tools, link management, and persistent storage for comprehensive academic documentation.",
              },
            ].map((feature, index) => (
              <div
                key={index}
                className={`animate-fade-in-up-initial animate-fade-in-up`}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="bg-white rounded-3xl shadow-lg border border-gray-200/50 h-full overflow-hidden">
                  {/* Image Header */}
                  <div className="relative h-48 md:h-56 overflow-hidden">
                    <Image
                      src={feature.image}
                      alt={feature.title}
                      fill
                      className="object-cover"
                    />
                  </div>

                  {/* Text Box */}
                  <div className="p-6 md:p-8">
                    <h3 className="text-2xl font-bold text-gray-900 mb-4 font-heading">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600 leading-relaxed text-lg">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* CTA Section */}
          <div className="text-center mt-24 animate-fade-in-up-initial animate-fade-in-up">
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-12 shadow-xl border border-gray-200/50 max-w-4xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6 font-heading">
                Ready to Transform Your{" "}
                <span className="text-primary-600">
                  Academic Journey?
                </span>
              </h2>
              <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
                Join students who are using Asetta's comprehensive tools to organize
                their academic work, track grades, and manage deadlines effectively.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href="https://asetta.me/register"
                  className="group inline-flex items-center justify-center px-10 py-4 text-lg font-bold text-white bg-primary-600 hover:bg-primary-700 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                >
                  Get Started Free
                  <svg
                    className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 8l4 4m0 0l-4 4m4-4H3"
                    />
                  </svg>
                </a>
                <Link
                  href="/contact"
                  className="inline-flex items-center justify-center px-10 py-4 text-lg font-bold text-gray-700 bg-white border-2 border-gray-200 rounded-2xl shadow-lg hover:shadow-xl hover:border-primary-300 transition-all duration-300 hover:-translate-y-1"
                >
                  Contact Us
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
