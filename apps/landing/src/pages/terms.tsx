import Head from "next/head";
import Header from "../components/Header";
import Footer from "../components/Footer";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-primary-50/20 to-white flex flex-col">
      <Head>
        <title>Terms of Service | Asetta</title>
        <meta
          name="description"
          content="Terms of Service for Asetta - Your trusted academic management platform"
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
                  d="M10 2L3 7v11c0 .55.45 1 1 1h3v-6h4v6h3c.55 0 1-.45 1-1V7l-7-5zM8.5 14c-.28 0-.5-.22-.5-.5s.22-.5.5-.5.5.22.5.5-.22.5-.5.5zm3 0c-.28 0-.5-.22-.5-.5s.22-.5.5-.5.5.22.5.5-.22.5-.5.5z"
                  clipRule="evenodd"
                />
              </svg>
              Terms of Service
            </span>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-gray-900 mb-8 font-heading tracking-tight leading-tight">
              Terms of{" "}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary-600 to-primary-800">
                Service
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Please read these terms carefully before using our platform. By
              using Asetta, you agree to be bound by these terms.
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
                            d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                      Agreement to Terms
                    </h2>
                    <p className="text-gray-700 leading-relaxed text-lg">
                      By accessing and using Asetta, you agree to be bound by
                      these Terms of Service and all applicable laws and
                      regulations.
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
                            d="M3 4a1 1 0 011-1h4a1 1 0 010 2H6.414l2.293 2.293a1 1 0 01-1.414 1.414L5 6.414V8a1 1 0 01-2 0V4zm9 1a1 1 0 010-2h4a1 1 0 011 1v4a1 1 0 01-2 0V6.414l-2.293 2.293a1 1 0 11-1.414-1.414L13.586 5H12zm-9 7a1 1 0 012 0v1.586l2.293-2.293a1 1 0 111.414 1.414L6.414 15H8a1 1 0 010 2H4a1 1 0 01-1-1v-4zm13-1a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 010-2h1.586l-2.293-2.293a1 1 0 111.414-1.414L15 13.586V12a1 1 0 011-1z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                      Prohibited Uses
                    </h2>
                    <div className="space-y-3">
                      {[
                        "Modifying or copying the materials",
                        "Using the materials for commercial purposes",
                        "Attempting to reverse engineer any software",
                        "Removing any copyright or proprietary notations",
                      ].map((item, index) => (
                        <div key={index} className="flex items-start">
                          <div className="w-2 h-2 bg-red-500 rounded-full mt-2.5 mr-3 flex-shrink-0"></div>
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
                            d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                      User Responsibilities
                    </h2>
                    <div className="space-y-3">
                      {[
                        "Provide accurate information",
                        "Maintain the security of your account",
                        "Use the platform responsibly",
                        "Comply with all applicable laws",
                      ].map((item, index) => (
                        <div key={index} className="flex items-start">
                          <div className="w-2 h-2 bg-green-500 rounded-full mt-2.5 mr-3 flex-shrink-0"></div>
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
                            d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                      Disclaimer
                    </h2>
                    <p className="text-gray-700 leading-relaxed text-lg">
                      Asetta is provided "as is" without any warranties,
                      expressed or implied. We do not guarantee that the service
                      will be uninterrupted or error-free.
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
                            d="M3 6a3 3 0 013-3h10a1 1 0 01.8 1.6L14.25 8l2.55 3.4A1 1 0 0116 13H6a1 1 0 00-1 1v3a1 1 0 11-2 0V6z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                      Limitations
                    </h2>
                    <p className="text-gray-700 leading-relaxed text-lg">
                      In no event shall Asetta be liable for any damages arising
                      out of the use or inability to use the platform.
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
                          <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                          <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                        </svg>
                      </div>
                      Contact Information
                    </h2>
                    <p className="text-gray-700 leading-relaxed text-lg">
                      If you have any questions about these Terms, please
                      contact us at:
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
