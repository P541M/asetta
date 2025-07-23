import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/router";
import Head from "next/head";
import Link from "next/link";
import Header from "../components/Header";
import Footer from "../components/Footer";

export default function LandingPage() {
  const router = useRouter();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Handle ESC key to close modal
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isModalOpen) {
        setIsModalOpen(false);
      }
    };

    if (isModalOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isModalOpen]);

  const handleThemeSwitch = (newMode: boolean) => {
    if (isDarkMode === newMode || isTransitioning) return;

    setIsTransitioning(true);
    setIsDarkMode(newMode);

    // Reset transition state after animation completes
    setTimeout(() => {
      setIsTransitioning(false);
    }, 300);
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Head>
        <title>Asetta - Your AI-Powered Academic Success Companion</title>
        <meta
          name="description"
          content="Always ahead, never behind. Asetta is a completely free AI-powered platform that helps students stay on top of assignments, deadlines, and academic goals."
        />
      </Head>
      <Header />

      {/* Hero Section */}
      <section
        className="relative pb-20 lg:pb-32 pb-safe overflow-hidden bg-gradient-to-br from-primary-50 via-white to-white"
        style={{
          paddingTop: `max(11rem, calc(11rem + env(safe-area-inset-top)))`,
        }}
      >
        {/* Subtle background elements */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-24 -left-24 w-96 h-96 bg-gradient-to-br from-primary-100/20 to-transparent rounded-full blur-3xl" />
          <div className="absolute -bottom-24 -right-24 w-80 h-80 bg-gradient-to-tr from-primary-100/15 to-transparent rounded-full blur-3xl" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pl-safe pr-safe relative z-10">
          {/* Content Section */}
          <div className="text-center mb-16 lg:mb-20">
            <div className="max-w-4xl mx-auto space-y-6 md:space-y-8">
              <span className="inline-flex items-center px-4 py-2 rounded-full bg-primary-100 text-primary-700 font-semibold text-sm border border-primary-200/50 animate-fade-in-down-initial animate-fade-in-down">
                <span className="w-2 h-2 bg-primary-500 rounded-full mr-2 animate-pulse"></span>
                100% Free for Students
              </span>

              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-gray-900 font-heading tracking-tight leading-tight animate-fade-in-initial animate-fade-in">
                Your Smart{" "}
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary-600 to-primary-800">
                  Academic
                </span>{" "}
                Assistant
              </h1>

              <p className="text-lg sm:text-xl lg:text-2xl text-gray-600 leading-relaxed max-w-3xl mx-auto animate-fade-in-up-initial animate-fade-in-up">
                Always ahead, never behind. AI-powered academic organization
                that keeps you on top of assignments, deadlines, and your study
                goals.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8 lg:mt-10 animate-fade-in-up-initial animate-fade-in-up">
              <Link
                href="https://asetta.me/register"
                className="group inline-flex items-center justify-center px-8 py-4 text-lg font-bold text-white bg-gradient-to-r from-primary-600 to-primary-700 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
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
              </Link>

              <Link
                href="/features"
                className="inline-flex items-center justify-center px-8 py-4 text-lg font-bold text-gray-700 bg-white border-2 border-gray-200 rounded-2xl shadow-lg hover:shadow-xl hover:border-primary-300 transition-all duration-300 hover:-translate-y-1"
              >
                Explore Features
              </Link>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center space-y-2 sm:space-y-0 sm:space-x-8 mt-8 text-sm text-gray-500 animate-fade-in-up-initial animate-fade-in-up">
              <div className="flex items-center">
                <svg
                  className="w-4 h-4 text-green-500 mr-2"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                No credit card required
              </div>
              <div className="flex items-center">
                <svg
                  className="w-4 h-4 text-green-500 mr-2"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                Setup in 2 minutes
              </div>
            </div>
          </div>

          {/* Dashboard Preview */}
          <div className="max-w-5xl mx-auto animate-fade-in-up-initial animate-fade-in-up">
            {/* Theme Toggle */}
            <div className="flex justify-center mb-8">
              <div className="inline-flex items-center bg-white rounded-full p-1 shadow-lg border border-gray-200">
                <button
                  onClick={() => handleThemeSwitch(false)}
                  disabled={isTransitioning}
                  className={`flex items-center px-4 py-2 rounded-full transition-all duration-300 ${
                    !isDarkMode
                      ? "bg-primary-600 text-white shadow-md"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                  } ${
                    isTransitioning
                      ? "cursor-not-allowed opacity-50"
                      : "cursor-pointer"
                  }`}
                >
                  <svg
                    className={`w-4 h-4 mr-2 transition-all duration-300 ${
                      !isDarkMode ? "rotate-0" : "rotate-180"
                    }`}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Light
                </button>

                <button
                  onClick={() => handleThemeSwitch(true)}
                  disabled={isTransitioning}
                  className={`flex items-center px-4 py-2 rounded-full transition-all duration-300 ${
                    isDarkMode
                      ? "bg-gray-900 text-white shadow-md"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                  } ${
                    isTransitioning
                      ? "cursor-not-allowed opacity-50"
                      : "cursor-pointer"
                  }`}
                >
                  <svg
                    className={`w-4 h-4 mr-2 transition-all duration-300 ${
                      isDarkMode ? "rotate-0" : "-rotate-12"
                    }`}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                  </svg>
                  Dark
                </button>
              </div>
            </div>

            <div className="relative group">
              <div className="absolute -inset-4 bg-gradient-to-r from-primary-600/20 to-primary-700/20 rounded-3xl blur-2xl group-hover:blur-3xl transition-all duration-500"></div>
              <button
                onClick={() => setIsModalOpen(true)}
                className="relative bg-white rounded-2xl shadow-2xl border border-gray-200/50 overflow-hidden w-full hover:scale-105 transition-transform duration-300 cursor-pointer"
                aria-label="Click to view dashboard preview in full size"
              >
                <div className="relative">
                  {/* Light Mode Image */}
                  <Image
                    src="/images/Light_Prev.png"
                    alt="Asetta Dashboard Preview - Light Mode"
                    width={1000}
                    height={600}
                    priority
                    className={`w-full h-auto transition-opacity duration-300 ${
                      !isDarkMode ? "opacity-100" : "opacity-0"
                    }`}
                  />

                  {/* Dark Mode Image - Layered on top */}
                  <Image
                    src="/images/Dark_Prev.png"
                    alt="Asetta Dashboard Preview - Dark Mode"
                    width={1000}
                    height={600}
                    priority
                    className={`absolute inset-0 w-full h-auto transition-opacity duration-300 ${
                      isDarkMode ? "opacity-100" : "opacity-0"
                    }`}
                  />
                  <div className="absolute inset-0 bg-black/0 hover:bg-black/5 transition-all duration-300 flex items-center justify-center">
                    <div className="opacity-0 hover:opacity-100 transition-opacity duration-300 bg-white/90 rounded-full p-3 shadow-lg">
                      <svg
                        className="w-8 h-8 text-primary-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"
                        />
                      </svg>
                    </div>
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section
        id="features"
        className="py-32 bg-gradient-to-b from-white via-gray-50/50 to-white relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary-50/30 via-transparent to-transparent"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pl-safe pr-safe relative z-10">
          <div className="text-center mb-24 animate-fade-in-up-initial animate-fade-in-up">
            <span className="inline-block mb-4 px-4 py-2 rounded-full bg-gradient-to-r from-primary-100 to-primary-50 text-primary-700 font-semibold text-sm shadow-md border border-primary-200/50">
              🚀 Always Ahead, Never Behind
            </span>
            <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-6 font-heading tracking-tight">
              Smart Features for{" "}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary-600 to-primary-700">
                Student Success
              </span>
            </h2>
            <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Everything you need to dominate your academic journey with tools
              that actually work for students.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
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
            ].map((feature, index) => (
              <div
                key={index}
                className={`group transform transition-all duration-500 hover:-translate-y-3 hover:scale-105 animate-fade-in-up-initial animate-fade-in-up`}
                style={{ animationDelay: `${index * 0.2}s` }}
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
                    <h3 className="text-2xl font-bold text-gray-900 mb-4 group-hover:text-primary-900 transition-colors duration-300">
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

          {/* And More Section */}
          <div className="mt-20 text-center animate-fade-in-up-initial animate-fade-in-up">
            <div className="group transform transition-all duration-300 hover:scale-105 hover:-translate-y-1 inline-block">
              <Link
                href="/features"
                className="inline-flex items-center justify-center px-8 py-4 text-lg font-bold text-white bg-gradient-to-r from-primary-600 to-primary-700 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 relative overflow-hidden"
              >
                <span className="absolute inset-0 bg-gradient-to-r from-primary-700 to-primary-800 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                <span className="relative z-10">See All Features</span>
                <svg
                  className="w-5 h-5 ml-3 group-hover:translate-x-1 transition-transform duration-300 relative z-10"
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
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 pb-safe bg-gradient-to-br from-primary-50 via-primary-25 to-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary-100/40 via-transparent to-transparent"></div>
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-gradient-to-br from-primary-200 to-primary-100 rounded-full blur-3xl opacity-30 animate-float"></div>
        <div
          className="absolute -bottom-24 -right-24 w-80 h-80 bg-gradient-to-br from-primary-150 to-primary-50 rounded-full blur-3xl opacity-40 animate-float"
          style={{ animationDelay: "2s" }}
        ></div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="animate-fade-in-up-initial animate-fade-in-up">
            <span className="inline-block mb-6 px-6 py-3 rounded-full bg-gradient-to-r from-primary-100 to-primary-50 text-primary-700 font-bold text-sm shadow-lg border border-primary-200/50 backdrop-blur-sm">
              🚀 Ready to Excel?
            </span>
            <h2 className="text-5xl md:text-6xl font-extrabold text-gray-900 mb-8 font-heading tracking-tight leading-tight">
              Start Your{" "}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary-600 via-primary-700 to-primary-800 animate-gradient-x">
                Academic Success
              </span>{" "}
              Journey Today
            </h2>
            <p className="text-xl md:text-2xl text-gray-700 mb-12 max-w-4xl mx-auto leading-relaxed font-medium">
              Join students who are using Asetta's comprehensive platform to
              organize semesters, track grades, manage deadlines, and achieve
              their academic goals—all completely free.
            </p>
            <div className="flex justify-center group transform transition-all duration-300 hover:scale-105 hover:-translate-y-2">
              <Link
                href="https://asetta.me/register"
                className="inline-flex items-center justify-center px-12 py-6 text-xl font-bold text-white bg-gradient-to-r from-primary-600 via-primary-700 to-primary-800 rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-300 relative overflow-hidden animate-scale-delayed"
              >
                <span className="absolute inset-0 bg-gradient-to-r from-primary-700 via-primary-800 to-primary-900 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                <span className="relative z-10">Create Your Free Account</span>
                <svg
                  className="w-6 h-6 ml-4 group-hover:translate-x-2 transition-transform duration-300 relative z-10"
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
              </Link>
            </div>
            <p className="mt-8 text-sm text-gray-500 font-medium">
              No credit card required • Forever free for students • Setup in
              under 2 minutes
            </p>
          </div>
        </div>
      </section>

      {/* Image Preview Modal */}
      {isModalOpen && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="relative max-w-7xl max-h-[90vh] w-full animate-scale"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute -top-12 right-0 text-white hover:text-gray-300 transition-colors duration-200 z-10"
              aria-label="Close modal"
            >
              <svg
                className="w-8 h-8"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>

            {/* Modal Image */}
            <div className="relative bg-white rounded-2xl shadow-2xl overflow-hidden">
              {/* Light Mode Image */}
              <Image
                src="/images/Light_Prev.png"
                alt="Asetta Dashboard Preview - Light Mode - Full Size"
                width={1400}
                height={900}
                className={`w-full h-auto transition-opacity duration-300 ${
                  !isDarkMode ? "opacity-100" : "opacity-0"
                }`}
                priority
              />

              {/* Dark Mode Image - Layered on top */}
              <Image
                src="/images/Dark_Prev.png"
                alt="Asetta Dashboard Preview - Dark Mode - Full Size"
                width={1400}
                height={900}
                className={`absolute inset-0 w-full h-auto transition-opacity duration-300 ${
                  isDarkMode ? "opacity-100" : "opacity-0"
                }`}
                priority
              />
            </div>

            {/* Theme indicator */}
            <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1 text-sm font-medium text-gray-700">
              {isDarkMode ? "Dark" : "Light"} Mode
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
