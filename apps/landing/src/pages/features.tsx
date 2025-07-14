import Head from "next/head";
import Link from "next/link";
import Header from "../components/Header";
import Footer from "../components/Footer";

export default function FeaturesPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-primary-50/20 to-white flex flex-col">
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
          <div className="absolute -top-24 -left-24 w-96 h-96 bg-gradient-to-br from-primary-100/20 to-transparent rounded-full blur-3xl" />
          <div className="absolute -bottom-24 -right-24 w-80 h-80 bg-gradient-to-tr from-primary-100/15 to-transparent rounded-full blur-3xl" />
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
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary-600 to-primary-800">
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
                icon: "M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z",
                title: "Intelligent Document Processing",
                description:
                  "Transform course syllabi into organized assignment schedules. Upload your PDF course outline and let AI instantly extract every assignment, deadline, and weight—eliminating manual data entry and ensuring nothing falls through the cracks.",
              },
              {
                icon: "M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z",
                title: "Advanced Grade Calculator",
                description:
                  "Take control of your academic performance with precision grade tracking. Calculate exactly what you need to achieve your target grades, monitor your GPA in real-time, and make informed decisions about your study priorities.",
              },
              {
                icon: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z",
                title: "Smart Calendar & Deadline Management",
                description:
                  "Visualize your entire semester at a glance with drag-and-drop scheduling. Never miss another deadline with intelligent notifications and seamless calendar integration that syncs with your existing tools.",
              },
              {
                icon: "M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10",
                title: "Semester Organization",
                description:
                  "Structure your academic journey with intuitive semester management. Organize courses, navigate between terms effortlessly, and maintain clear separation between different academic periods for better focus and planning.",
              },
              {
                icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4",
                title: "Comprehensive Assessment Tracking",
                description:
                  "Master your academic workload with powerful assessment management tools. Track progress, manage statuses, filter by courses, and handle multiple assignments efficiently with bulk operations and intelligent search capabilities.",
              },
              {
                icon: "M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z",
                title: "Professional Notes & Documentation",
                description:
                  "Enhance your study process with a sophisticated note-taking system. Create detailed, formatted notes for each assessment with professional text editing tools, link management, and persistent storage for comprehensive academic documentation.",
              },
            ].map((feature, index) => (
              <div
                key={index}
                className={`group transform transition-all duration-500 hover:-translate-y-3 hover:scale-105 animate-fade-in-up-initial animate-fade-in-up`}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 border border-gray-200/50 hover:border-primary-200 h-full flex flex-col relative overflow-hidden group-hover:bg-white">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary-50/30 via-transparent to-primary-50/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                  <div className="relative z-10">
                    <div className="w-16 h-16 bg-gradient-to-br from-primary-100 to-primary-50 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-gradient-to-br group-hover:from-primary-200 group-hover:to-primary-100 transition-all duration-300 shadow-md">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-8 w-8 text-primary-600 group-hover:text-primary-700 transition-colors duration-300"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d={feature.icon}
                        />
                      </svg>
                    </div>

                    <h3 className="text-2xl font-bold text-gray-900 mb-4 group-hover:text-primary-900 transition-colors duration-300 font-heading">
                      {feature.title}
                    </h3>

                    <p className="text-gray-600 leading-relaxed flex-grow text-lg group-hover:text-gray-700 transition-colors duration-300">
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
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary-600 to-primary-800">
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
                  className="group inline-flex items-center justify-center px-10 py-4 text-lg font-bold text-white bg-gradient-to-r from-primary-600 to-primary-700 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
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
