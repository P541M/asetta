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

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
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

          {/* Main Content */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 md:p-12 shadow-xl border border-gray-200/50 animate-fade-in-up">
            
            {/* Quick Summary */}
            <div className="bg-gradient-to-r from-primary-50 to-primary-100 rounded-xl p-6 mb-12 border border-primary-200/50">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Quick Summary</h2>
              <div className="grid md:grid-cols-2 gap-6 text-sm">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">What We Collect</h4>
                  <p className="text-gray-600">Name, email, course outlines, academic data, usage information</p>
                  
                  <h4 className="font-semibold text-gray-900 mb-1 mt-3">How We Use It</h4>
                  <p className="text-gray-600">AI processing, deadline notifications, platform improvements</p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">Your Rights</h4>
                  <p className="text-gray-600">Access, correct, delete data; control AI processing</p>
                  
                  <h4 className="font-semibold text-gray-900 mb-1 mt-3">Security</h4>
                  <p className="text-gray-600">Encrypted storage, secure authentication, Google Cloud</p>
                </div>
              </div>
            </div>

            {/* Introduction */}
            <section className="mb-10">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Privacy Commitment</h2>
              <p className="text-gray-700 leading-relaxed text-lg mb-4">
                We respect your privacy and are committed to protecting your personal information in compliance with Canada's Personal Information Protection and Electronic Documents Act (PIPEDA). This policy explains how we collect, use, and protect your information.
              </p>
            </section>

            {/* Information We Collect */}
            <section className="mb-10">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Information We Collect</h2>
              <p className="text-gray-700 leading-relaxed text-lg mb-4">
                We collect only the information necessary to provide our academic management services:
              </p>
              <div className="space-y-3">
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-primary-500 rounded-full mt-2.5 mr-3 flex-shrink-0"></div>
                  <span className="text-gray-700">Your name and email address for account creation</span>
                </div>
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-primary-500 rounded-full mt-2.5 mr-3 flex-shrink-0"></div>
                  <span className="text-gray-700">Course outlines and academic documents you upload</span>
                </div>
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-primary-500 rounded-full mt-2.5 mr-3 flex-shrink-0"></div>
                  <span className="text-gray-700">Academic information extracted from your documents (deadlines, assignments)</span>
                </div>
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-primary-500 rounded-full mt-2.5 mr-3 flex-shrink-0"></div>
                  <span className="text-gray-700">Email preferences and notification settings</span>
                </div>
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-primary-500 rounded-full mt-2.5 mr-3 flex-shrink-0"></div>
                  <span className="text-gray-700">Basic usage information to improve our service</span>
                </div>
              </div>
            </section>

            {/* How We Use Your Information */}
            <section className="mb-10">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">How We Use Your Information</h2>
              <p className="text-gray-700 leading-relaxed text-lg mb-4">
                We use your information only for the purposes you expect:
              </p>
              <div className="space-y-3">
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-primary-500 rounded-full mt-2.5 mr-3 flex-shrink-0"></div>
                  <span className="text-gray-700">Provide AI-powered assessment tracking and deadline management</span>
                </div>
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-primary-500 rounded-full mt-2.5 mr-3 flex-shrink-0"></div>
                  <span className="text-gray-700">Send email notifications about upcoming deadlines (if you choose)</span>
                </div>
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-primary-500 rounded-full mt-2.5 mr-3 flex-shrink-0"></div>
                  <span className="text-gray-700">Store and sync your academic data securely</span>
                </div>
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-primary-500 rounded-full mt-2.5 mr-3 flex-shrink-0"></div>
                  <span className="text-gray-700">Improve our platform functionality and AI accuracy</span>
                </div>
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-primary-500 rounded-full mt-2.5 mr-3 flex-shrink-0"></div>
                  <span className="text-gray-700">Provide customer support when needed</span>
                </div>
              </div>
            </section>

            {/* AI Processing */}
            <section className="mb-10">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">AI Processing</h2>
              <p className="text-gray-700 leading-relaxed text-lg mb-4">
                We use AI to extract academic information from your course outlines:
              </p>
              <div className="space-y-3 mb-4">
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-secondary-600 rounded-full mt-2.5 mr-3 flex-shrink-0"></div>
                  <span className="text-gray-700">Your uploaded files are processed using Google's Gemini AI</span>
                </div>
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-secondary-600 rounded-full mt-2.5 mr-3 flex-shrink-0"></div>
                  <span className="text-gray-700">Files are deleted after processing - we don't store the original documents</span>
                </div>
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-secondary-600 rounded-full mt-2.5 mr-3 flex-shrink-0"></div>
                  <span className="text-gray-700">You can request to opt-out of AI processing (this limits functionality)</span>
                </div>
              </div>
              
              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                <h4 className="font-semibold text-yellow-800 mb-2">AI Accuracy Notice:</h4>
                <p className="text-yellow-700">
                  AI-extracted information may contain errors. Always verify important dates and details against your original documents.
                </p>
              </div>
            </section>

            {/* Data Security */}
            <section className="mb-10">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">How We Protect Your Data</h2>
              <p className="text-gray-700 leading-relaxed text-lg mb-4">
                We use industry-standard security measures to protect your information:
              </p>
              <div className="space-y-3">
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-primary-500 rounded-full mt-2.5 mr-3 flex-shrink-0"></div>
                  <span className="text-gray-700">Secure authentication through Firebase</span>
                </div>
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-primary-500 rounded-full mt-2.5 mr-3 flex-shrink-0"></div>
                  <span className="text-gray-700">Encrypted data transmission and storage</span>
                </div>
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-primary-500 rounded-full mt-2.5 mr-3 flex-shrink-0"></div>
                  <span className="text-gray-700">Google Cloud's secure infrastructure</span>
                </div>
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-primary-500 rounded-full mt-2.5 mr-3 flex-shrink-0"></div>
                  <span className="text-gray-700">Regular security monitoring and updates</span>
                </div>
              </div>
            </section>

            {/* Your Privacy Rights */}
            <section className="mb-10">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Your Privacy Rights</h2>
              <p className="text-gray-700 leading-relaxed text-lg mb-4">
                Under PIPEDA, you have the right to:
              </p>
              <div className="space-y-3 mb-6">
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-primary-500 rounded-full mt-2.5 mr-3 flex-shrink-0"></div>
                  <span className="text-gray-700">Access and download your personal information</span>
                </div>
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-primary-500 rounded-full mt-2.5 mr-3 flex-shrink-0"></div>
                  <span className="text-gray-700">Correct any inaccurate information</span>
                </div>
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-primary-500 rounded-full mt-2.5 mr-3 flex-shrink-0"></div>
                  <span className="text-gray-700">Delete your account and all associated data</span>
                </div>
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-primary-500 rounded-full mt-2.5 mr-3 flex-shrink-0"></div>
                  <span className="text-gray-700">Withdraw consent for data processing</span>
                </div>
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-primary-500 rounded-full mt-2.5 mr-3 flex-shrink-0"></div>
                  <span className="text-gray-700">Control how your data is used for AI processing</span>
                </div>
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-primary-500 rounded-full mt-2.5 mr-3 flex-shrink-0"></div>
                  <span className="text-gray-700">File complaints with the Privacy Commissioner of Canada</span>
                </div>
              </div>
              
              <div className="bg-primary-50 border border-primary-200 rounded-xl p-4">
                <h4 className="font-semibold text-primary-800 mb-2">How to Exercise Your Rights:</h4>
                <p className="text-primary-700">
                  Email us at videna.psalmeleazar@gmail.com with "Privacy Request" in the subject line. We'll respond within 30 days as required by law.
                </p>
              </div>
            </section>

            {/* Data Retention */}
            <section className="mb-10">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">How Long We Keep Your Data</h2>
              <div className="space-y-3">
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-primary-500 rounded-full mt-2.5 mr-3 flex-shrink-0"></div>
                  <span className="text-gray-700">Academic data: Kept while your account is active</span>
                </div>
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-primary-500 rounded-full mt-2.5 mr-3 flex-shrink-0"></div>
                  <span className="text-gray-700">Uploaded files: Deleted within 24 hours after processing</span>
                </div>
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-primary-500 rounded-full mt-2.5 mr-3 flex-shrink-0"></div>
                  <span className="text-gray-700">Account deletion: All data permanently removed within 30 days</span>
                </div>
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-primary-500 rounded-full mt-2.5 mr-3 flex-shrink-0"></div>
                  <span className="text-gray-700">Usage analytics: Anonymized after 2 years</span>
                </div>
              </div>
            </section>

            {/* Third Party Services */}
            <section className="mb-10">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Third-Party Services</h2>
              <p className="text-gray-700 leading-relaxed text-lg mb-4">
                We work with trusted services to provide our platform:
              </p>
              <div className="space-y-3">
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-primary-400 rounded-full mt-2.5 mr-3 flex-shrink-0"></div>
                  <span className="text-gray-700">Google Firebase for secure data storage and authentication</span>
                </div>
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-primary-400 rounded-full mt-2.5 mr-3 flex-shrink-0"></div>
                  <span className="text-gray-700">Google Gemini AI for document processing</span>
                </div>
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-primary-400 rounded-full mt-2.5 mr-3 flex-shrink-0"></div>
                  <span className="text-gray-700">Email services for deadline notifications</span>
                </div>
              </div>
            </section>

            {/* Contact Information */}
            <section className="mb-0">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Privacy Questions & Complaints</h2>
              <p className="text-gray-700 leading-relaxed text-lg mb-4">
                For privacy questions, complaints, or to exercise your rights, contact our Privacy Officer:
              </p>
              <div className="p-4 bg-primary-50 rounded-xl border border-primary-200/50 mb-4">
                <a
                  href="mailto:videna.psalmeleazar@gmail.com"
                  className="text-primary-600 hover:text-primary-700 transition-colors duration-200 font-semibold text-lg flex items-center"
                >
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                  </svg>
                  videna.psalmeleazar@gmail.com
                </a>
                <p className="text-primary-600 mt-2 text-sm">Privacy Officer - Asetta Platform</p>
              </div>
              
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                <h4 className="font-semibold text-gray-800 mb-2">Privacy Commissioner of Canada:</h4>
                <p className="text-gray-700 text-sm mb-2">
                  If you're not satisfied with our response, you can file a complaint with:
                </p>
                <p className="text-gray-700 text-sm">
                  <strong>Privacy Commissioner of Canada</strong><br/>
                  Phone: 1-800-282-1376<br/>
                  Website: www.priv.gc.ca
                </p>
              </div>
            </section>
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
              Last updated: July 28, 2025
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}