import Head from "next/head";
import Header from "../components/Header";
import Footer from "../components/Footer";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-primary-50/20 to-white flex flex-col">
      <Head>
        <title>Privacy Policy | Asetta</title>
        <meta
          name="description"
          content="Privacy Policy for Asetta - Your trusted academic management platform"
        />
      </Head>
      <Header />

      <main className="flex-grow pt-32 pb-24 relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-24 -left-24 w-96 h-96 bg-gradient-to-br from-primary-100/20 to-transparent rounded-full blur-3xl" />
          <div className="absolute -bottom-24 -right-24 w-80 h-80 bg-gradient-to-tr from-primary-100/15 to-transparent rounded-full blur-3xl" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Hero Section */}
          <div className="text-center mb-16 animate-fade-in">
            <span className="inline-flex items-center px-4 py-2 rounded-full bg-primary-100 text-primary-700 font-semibold text-sm border border-primary-200/50 mb-6">
              <svg
                className="w-4 h-4 mr-2"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                  clipRule="evenodd"
                />
              </svg>
              Privacy Policy
            </span>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-gray-900 mb-8 font-heading tracking-tight leading-tight">
              Your Privacy is{" "}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary-600 to-primary-800">
                Important to Us
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              We're committed to protecting your personal information and being
              transparent about how we collect, use, and safeguard your data.
            </p>
          </div>

          {/* Content Section */}
          <div className="animate-fade-in-up">
            <div className="max-w-none">
              <div className="flex flex-wrap gap-8 lg:gap-12">
                <div className="flex-1 min-w-0 lg:min-w-[400px] space-y-8">
                  <div className="group">
                    <h2 className="text-3xl font-bold text-gray-900 mb-6 font-heading flex items-center">
                      <div className="w-8 h-8 bg-gradient-to-br from-primary-100 to-primary-50 rounded-lg flex items-center justify-center mr-3">
                        <svg
                          className="w-4 h-4 text-primary-600"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                      Introduction
                    </h2>
                    <p className="text-gray-700 leading-relaxed text-lg">
                      At Asetta, we take your privacy seriously. This Privacy
                      Policy explains how we collect, use, disclose, and
                      safeguard your information when you use our platform.
                    </p>
                  </div>

                  <div className="group">
                    <h2 className="text-3xl font-bold text-gray-900 mb-6 font-heading flex items-center">
                      <div className="w-8 h-8 bg-gradient-to-br from-primary-100 to-primary-50 rounded-lg flex items-center justify-center mr-3">
                        <svg
                          className="w-4 h-4 text-primary-600"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                      Information We Collect
                    </h2>
                    <div className="space-y-3">
                      {[
                        "Account information (name, email, password)",
                        "Academic information (courses, assignments, grades)",
                        "Usage data and preferences",
                      ].map((item, index) => (
                        <div key={index} className="flex items-start">
                          <div className="w-2 h-2 bg-primary-500 rounded-full mt-2.5 mr-3 flex-shrink-0"></div>
                          <span className="text-gray-700 text-lg">{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="group">
                    <h2 className="text-3xl font-bold text-gray-900 mb-6 font-heading flex items-center">
                      <div className="w-8 h-8 bg-gradient-to-br from-primary-100 to-primary-50 rounded-lg flex items-center justify-center mr-3">
                        <svg
                          className="w-4 h-4 text-primary-600"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                      How We Use Your Information
                    </h2>
                    <div className="space-y-3">
                      {[
                        "Provide and maintain our services",
                        "Improve and personalize your experience",
                        "Communicate with you about updates and changes",
                        "Ensure platform security and prevent fraud",
                      ].map((item, index) => (
                        <div key={index} className="flex items-start">
                          <div className="w-2 h-2 bg-primary-500 rounded-full mt-2.5 mr-3 flex-shrink-0"></div>
                          <span className="text-gray-700 text-lg">{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex-1 min-w-0 lg:min-w-[400px] space-y-8">
                  <div className="group">
                    <h2 className="text-3xl font-bold text-gray-900 mb-6 font-heading flex items-center">
                      <div className="w-8 h-8 bg-gradient-to-br from-primary-100 to-primary-50 rounded-lg flex items-center justify-center mr-3">
                        <svg
                          className="w-4 h-4 text-primary-600"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                      Data Security
                    </h2>
                    <p className="text-gray-700 leading-relaxed text-lg">
                      We implement appropriate security measures to protect your
                      personal information. However, no method of transmission
                      over the Internet is 100% secure.
                    </p>
                  </div>

                  <div className="group">
                    <h2 className="text-3xl font-bold text-gray-900 mb-6 font-heading flex items-center">
                      <div className="w-8 h-8 bg-gradient-to-br from-primary-100 to-primary-50 rounded-lg flex items-center justify-center mr-3">
                        <svg
                          className="w-4 h-4 text-primary-600"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                      Your Rights
                    </h2>
                    <div className="space-y-3">
                      {[
                        "Access your personal information",
                        "Correct inaccurate data",
                        "Request deletion of your data",
                        "Opt-out of communications",
                      ].map((item, index) => (
                        <div key={index} className="flex items-start">
                          <div className="w-2 h-2 bg-primary-500 rounded-full mt-2.5 mr-3 flex-shrink-0"></div>
                          <span className="text-gray-700 text-lg">{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="group">
                    <h2 className="text-3xl font-bold text-gray-900 mb-6 font-heading flex items-center">
                      <div className="w-8 h-8 bg-gradient-to-br from-primary-100 to-primary-50 rounded-lg flex items-center justify-center mr-3">
                        <svg
                          className="w-4 h-4 text-primary-600"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                          <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                        </svg>
                      </div>
                      Contact Us
                    </h2>
                    <p className="text-gray-700 leading-relaxed text-lg">
                      If you have any questions about this Privacy Policy,
                      please contact us at:
                    </p>
                    <div className="mt-4 p-4 bg-primary-50 rounded-xl border border-primary-200/50">
                      <a
                        href="mailto:videna.psalmeleazar@gmail.com"
                        className="text-primary-600 hover:text-primary-700 transition-colors duration-200 font-semibold text-lg"
                      >
                        videna.psalmeleazar@gmail.com
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Last Updated */}
          <div className="text-center mt-16 animate-fade-in-up">
            <div className="inline-flex items-center px-6 py-3 bg-gray-100 rounded-full text-gray-600 text-sm font-medium">
              <svg
                className="w-4 h-4 mr-2"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                  clipRule="evenodd"
                />
              </svg>
              Last updated:{" "}
              {new Date().toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
