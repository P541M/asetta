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
                  <p className="text-gray-600">Academic data, PDF uploads, email preferences, usage analytics</p>
                  
                  <h4 className="font-semibold text-gray-900 mb-1 mt-3">How We Use It</h4>
                  <p className="text-gray-600">AI processing, deadline notifications, platform improvements</p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">Your Control</h4>
                  <p className="text-gray-600">Access, correct, delete data; opt-out of AI processing</p>
                  
                  <h4 className="font-semibold text-gray-900 mb-1 mt-3">Security</h4>
                  <p className="text-gray-600">Firebase Authentication, HTTPS encryption, Google Cloud</p>
                </div>
              </div>
            </div>

            {/* Introduction */}
            <section className="mb-10">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Introduction</h2>
              <p className="text-gray-700 leading-relaxed text-lg mb-4">
                At Asetta, we take your privacy seriously. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our platform in compliance with Canada's Personal Information Protection and Electronic Documents Act (PIPEDA) and Ontario privacy laws.
              </p>
              <div className="bg-primary-50 border border-primary-200 rounded-xl p-4">
                <h4 className="font-semibold text-primary-800 mb-2">Jurisdiction and Governing Law:</h4>
                <p className="text-primary-700">
                  This Privacy Policy and our data processing practices are governed by the laws of Ontario, Canada. Any disputes relating to privacy matters will be resolved under Ontario jurisdiction.
                </p>
              </div>
            </section>

            {/* Information We Collect */}
            <section className="mb-10">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Information We Collect</h2>
              <div className="space-y-3">
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-primary-500 rounded-full mt-2.5 mr-3 flex-shrink-0"></div>
                  <span className="text-gray-700">Account information (name, email, password)</span>
                </div>
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-primary-500 rounded-full mt-2.5 mr-3 flex-shrink-0"></div>
                  <span className="text-gray-700">Academic information (courses, assignments, grades, deadlines)</span>
                </div>
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-primary-500 rounded-full mt-2.5 mr-3 flex-shrink-0"></div>
                  <span className="text-gray-700">PDF files uploaded for assessment extraction</span>
                </div>
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-primary-500 rounded-full mt-2.5 mr-3 flex-shrink-0"></div>
                  <span className="text-gray-700">Rich text notes and personal academic content</span>
                </div>
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-primary-500 rounded-full mt-2.5 mr-3 flex-shrink-0"></div>
                  <span className="text-gray-700">Email preferences and notification settings</span>
                </div>
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-primary-500 rounded-full mt-2.5 mr-3 flex-shrink-0"></div>
                  <span className="text-gray-700">Usage data, analytics, and platform interactions</span>
                </div>
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-primary-500 rounded-full mt-2.5 mr-3 flex-shrink-0"></div>
                  <span className="text-gray-700">Device information and browser data</span>
                </div>
              </div>
            </section>

            {/* How We Use Your Information */}
            <section className="mb-10">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">How We Use Your Information</h2>
              <div className="space-y-3">
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-primary-500 rounded-full mt-2.5 mr-3 flex-shrink-0"></div>
                  <span className="text-gray-700">Provide AI-powered assessment tracking and deadline management</span>
                </div>
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-primary-500 rounded-full mt-2.5 mr-3 flex-shrink-0"></div>
                  <span className="text-gray-700">Process uploaded PDFs using Google Gemini AI for data extraction</span>
                </div>
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-primary-500 rounded-full mt-2.5 mr-3 flex-shrink-0"></div>
                  <span className="text-gray-700">Send personalized email notifications about upcoming deadlines</span>
                </div>
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-primary-500 rounded-full mt-2.5 mr-3 flex-shrink-0"></div>
                  <span className="text-gray-700">Store and sync your academic data across devices via Firebase</span>
                </div>
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-primary-500 rounded-full mt-2.5 mr-3 flex-shrink-0"></div>
                  <span className="text-gray-700">Improve our AI algorithms and platform functionality</span>
                </div>
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-primary-500 rounded-full mt-2.5 mr-3 flex-shrink-0"></div>
                  <span className="text-gray-700">Provide customer support and technical assistance</span>
                </div>
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-primary-500 rounded-full mt-2.5 mr-3 flex-shrink-0"></div>
                  <span className="text-gray-700">Ensure platform security and prevent unauthorized access</span>
                </div>
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-primary-500 rounded-full mt-2.5 mr-3 flex-shrink-0"></div>
                  <span className="text-gray-700">Comply with legal obligations and enforce our terms</span>
                </div>
              </div>
            </section>

            {/* Data Security */}
            <section className="mb-10">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Data Security</h2>
              <p className="text-gray-700 leading-relaxed text-lg mb-4">
                We implement industry-standard security measures including Firebase Authentication, encrypted data transmission, and secure cloud storage. Your academic data is stored in Google's secure Firebase infrastructure with enterprise-grade protection. However, no method of transmission over the Internet is 100% secure.
              </p>
              <h4 className="font-semibold text-gray-900 mb-3">Security Measures:</h4>
              <div className="space-y-3">
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-primary-500 rounded-full mt-2.5 mr-3 flex-shrink-0"></div>
                  <span className="text-gray-700">Firebase Authentication with secure password hashing</span>
                </div>
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-primary-500 rounded-full mt-2.5 mr-3 flex-shrink-0"></div>
                  <span className="text-gray-700">HTTPS encryption for all data transmission</span>
                </div>
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-primary-500 rounded-full mt-2.5 mr-3 flex-shrink-0"></div>
                  <span className="text-gray-700">Google Cloud security infrastructure</span>
                </div>
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-primary-500 rounded-full mt-2.5 mr-3 flex-shrink-0"></div>
                  <span className="text-gray-700">Regular security updates and monitoring</span>
                </div>
              </div>
            </section>

            {/* Your Rights Under PIPEDA */}
            <section className="mb-10">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Your Rights Under PIPEDA and Ontario Law</h2>
              <p className="text-gray-700 leading-relaxed text-lg mb-4">
                Under Canada's Personal Information Protection and Electronic Documents Act (PIPEDA), you have specific rights regarding your personal information:
              </p>
              
              <h4 className="font-semibold text-gray-900 mb-3">Access and Control Rights:</h4>
              <div className="space-y-3 mb-6">
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-primary-500 rounded-full mt-2.5 mr-3 flex-shrink-0"></div>
                  <span className="text-gray-700">Access and download your personal information and academic data</span>
                </div>
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-primary-500 rounded-full mt-2.5 mr-3 flex-shrink-0"></div>
                  <span className="text-gray-700">Correct inaccurate or incomplete personal information</span>
                </div>
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-primary-500 rounded-full mt-2.5 mr-3 flex-shrink-0"></div>
                  <span className="text-gray-700">Delete your account and all associated personal data</span>
                </div>
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-primary-500 rounded-full mt-2.5 mr-3 flex-shrink-0"></div>
                  <span className="text-gray-700">Withdraw consent for specific data processing activities</span>
                </div>
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-primary-500 rounded-full mt-2.5 mr-3 flex-shrink-0"></div>
                  <span className="text-gray-700">Control AI processing of your uploaded files and documents</span>
                </div>
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-primary-500 rounded-full mt-2.5 mr-3 flex-shrink-0"></div>
                  <span className="text-gray-700">Request data portability in machine-readable formats</span>
                </div>
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-primary-500 rounded-full mt-2.5 mr-3 flex-shrink-0"></div>
                  <span className="text-gray-700">Object to certain types of automated decision-making</span>
                </div>
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-primary-500 rounded-full mt-2.5 mr-3 flex-shrink-0"></div>
                  <span className="text-gray-700">File complaints with the Privacy Commissioner of Canada</span>
                </div>
              </div>
              
              <div className="bg-primary-50 border border-primary-200 rounded-xl p-4">
                <h4 className="font-semibold text-primary-800 mb-2">Exercising Your Rights:</h4>
                <p className="text-primary-700 mb-2">
                  To exercise any of these rights, contact us at videna.psalmeleazar@gmail.com with "Privacy Request" in the subject line. We will respond within 30 days as required by PIPEDA.
                </p>
                <p className="text-primary-700">
                  You may also file a complaint with the Privacy Commissioner of Canada at: <strong>1-800-282-1376</strong> or <strong>www.priv.gc.ca</strong>
                </p>
              </div>
            </section>

            {/* AI and Automated Processing */}
            <section className="mb-10">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">AI and Automated Processing</h2>
              <p className="text-gray-700 leading-relaxed text-lg mb-4">
                Asetta uses artificial intelligence to enhance your academic management experience. Here's how AI processes your data:
              </p>
              <div className="space-y-3">
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-secondary-600 rounded-full mt-2.5 mr-3 flex-shrink-0"></div>
                  <span className="text-gray-700">Google Gemini AI processes uploaded PDF files to extract assessment details</span>
                </div>
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-secondary-600 rounded-full mt-2.5 mr-3 flex-shrink-0"></div>
                  <span className="text-gray-700">AI algorithms analyze document structure to identify deadlines and requirements</span>
                </div>
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-secondary-600 rounded-full mt-2.5 mr-3 flex-shrink-0"></div>
                  <span className="text-gray-700">Machine learning improves accuracy of data extraction over time</span>
                </div>
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-secondary-600 rounded-full mt-2.5 mr-3 flex-shrink-0"></div>
                  <span className="text-gray-700">Your files are processed securely and deleted after extraction</span>
                </div>
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-secondary-600 rounded-full mt-2.5 mr-3 flex-shrink-0"></div>
                  <span className="text-gray-700">You can opt-out of AI processing, though this limits platform functionality</span>
                </div>
              </div>
            </section>

            {/* Third-Party Services */}
            <section className="mb-10">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Third-Party Services</h2>
              <p className="text-gray-700 leading-relaxed text-lg mb-4">
                Asetta integrates with trusted third-party services to provide our functionality:
              </p>
              
              <h4 className="font-semibold text-gray-900 mb-3">Google/Firebase Services:</h4>
              <div className="space-y-3 mb-4">
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-primary-400 rounded-full mt-2.5 mr-3 flex-shrink-0"></div>
                  <span className="text-gray-700">Firebase Authentication for secure login</span>
                </div>
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-primary-400 rounded-full mt-2.5 mr-3 flex-shrink-0"></div>
                  <span className="text-gray-700">Firebase Firestore for data storage</span>
                </div>
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-primary-400 rounded-full mt-2.5 mr-3 flex-shrink-0"></div>
                  <span className="text-gray-700">Google Gemini AI for document processing</span>
                </div>
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-primary-400 rounded-full mt-2.5 mr-3 flex-shrink-0"></div>
                  <span className="text-gray-700">Google Cloud Infrastructure for hosting</span>
                </div>
              </div>
              
              <h4 className="font-semibold text-gray-900 mb-3">Email & Communication:</h4>
              <div className="space-y-3">
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-primary-400 rounded-full mt-2.5 mr-3 flex-shrink-0"></div>
                  <span className="text-gray-700">Gmail/Nodemailer for notification emails</span>
                </div>
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-primary-400 rounded-full mt-2.5 mr-3 flex-shrink-0"></div>
                  <span className="text-gray-700">Vercel for web hosting and serverless functions</span>
                </div>
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-primary-400 rounded-full mt-2.5 mr-3 flex-shrink-0"></div>
                  <span className="text-gray-700">Email delivery services for deadline reminders</span>
                </div>
              </div>
            </section>

            {/* Data Retention and Deletion */}
            <section className="mb-10">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Data Retention and Deletion</h2>
              <p className="text-gray-700 leading-relaxed text-lg mb-4">
                In compliance with PIPEDA principles, we retain your personal information only as long as necessary for the identified purposes or as required by law:
              </p>
              <div className="space-y-3 mb-6">
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-primary-500 rounded-full mt-2.5 mr-3 flex-shrink-0"></div>
                  <span className="text-gray-700">Academic data and personal information: Retained while your account is active and for legitimate business purposes</span>
                </div>
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-primary-500 rounded-full mt-2.5 mr-3 flex-shrink-0"></div>
                  <span className="text-gray-700">Uploaded PDFs: Processed immediately and securely deleted within 24 hours (no permanent storage)</span>
                </div>
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-primary-500 rounded-full mt-2.5 mr-3 flex-shrink-0"></div>
                  <span className="text-gray-700">Communication preferences: Retained until you withdraw consent or delete your account</span>
                </div>
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-primary-500 rounded-full mt-2.5 mr-3 flex-shrink-0"></div>
                  <span className="text-gray-700">Usage analytics: Anonymized and aggregated after 2 years, with personal identifiers removed</span>
                </div>
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-primary-500 rounded-full mt-2.5 mr-3 flex-shrink-0"></div>
                  <span className="text-gray-700">Legal compliance records: Retained for 7 years as required by Canadian business law</span>
                </div>
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-primary-500 rounded-full mt-2.5 mr-3 flex-shrink-0"></div>
                  <span className="text-gray-700">Account deletion: All personal data permanently deleted within 30 days (subject to legal obligations)</span>
                </div>
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-primary-500 rounded-full mt-2.5 mr-3 flex-shrink-0"></div>
                  <span className="text-gray-700">Backup systems: All backup data containing personal information purged within 90 days of account deletion</span>
                </div>
              </div>
              
              <div className="bg-secondary-50 border border-secondary-200 rounded-xl p-4">
                <h4 className="font-semibold text-secondary-800 mb-2">Data Minimization Principle:</h4>
                <p className="text-secondary-700">
                  We follow PIPEDA's data minimization principle by collecting only the personal information necessary for identified purposes and retaining it only as long as required.
                </p>
              </div>
            </section>

            {/* Data Breach Notification */}
            <section className="mb-10">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Data Breach Notification</h2>
              <p className="text-gray-700 leading-relaxed text-lg mb-4">
                In compliance with PIPEDA requirements, we have established procedures for handling potential data breaches:
              </p>
              <div className="space-y-3 mb-6">
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-secondary-600 rounded-full mt-2.5 mr-3 flex-shrink-0"></div>
                  <span className="text-gray-700">Immediate assessment and containment of any suspected breach within 24 hours</span>
                </div>
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-secondary-600 rounded-full mt-2.5 mr-3 flex-shrink-0"></div>
                  <span className="text-gray-700">Notification to the Privacy Commissioner of Canada within 72 hours if required by law</span>
                </div>
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-secondary-600 rounded-full mt-2.5 mr-3 flex-shrink-0"></div>
                  <span className="text-gray-700">User notification without undue delay if the breach poses real risk of significant harm</span>
                </div>
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-secondary-600 rounded-full mt-2.5 mr-3 flex-shrink-0"></div>
                  <span className="text-gray-700">Detailed incident documentation and remediation measures implementation</span>
                </div>
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-secondary-600 rounded-full mt-2.5 mr-3 flex-shrink-0"></div>
                  <span className="text-gray-700">Enhanced security measures to prevent future occurrences</span>
                </div>
              </div>
              
              <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                <h4 className="font-semibold text-red-800 mb-2">If You Suspect a Data Breach:</h4>
                <p className="text-red-700">
                  Contact us immediately at <strong>videna.psalmeleazar@gmail.com</strong> with "SECURITY INCIDENT" in the subject line. We take all security concerns seriously and will investigate promptly.
                </p>
              </div>
            </section>

            {/* Consent Management */}
            <section className="mb-10">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Consent Management</h2>
              <p className="text-gray-700 leading-relaxed text-lg mb-4">
                Your consent is fundamental to our data processing activities. We obtain and manage consent in accordance with PIPEDA requirements:
              </p>
              
              <h4 className="font-semibold text-gray-900 mb-3">Types of Consent We Collect:</h4>
              <div className="space-y-3 mb-6">
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-primary-400 rounded-full mt-2.5 mr-3 flex-shrink-0"></div>
                  <span className="text-gray-700"><strong>Account Creation:</strong> Express consent to process basic account information</span>
                </div>
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-primary-400 rounded-full mt-2.5 mr-3 flex-shrink-0"></div>
                  <span className="text-gray-700"><strong>AI Processing:</strong> Explicit consent for AI analysis of uploaded documents</span>
                </div>
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-primary-400 rounded-full mt-2.5 mr-3 flex-shrink-0"></div>
                  <span className="text-gray-700"><strong>Email Communications:</strong> Opt-in consent for notification emails and updates</span>
                </div>
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-primary-400 rounded-full mt-2.5 mr-3 flex-shrink-0"></div>
                  <span className="text-gray-700"><strong>Analytics:</strong> Consent for usage analytics and platform improvement</span>
                </div>
              </div>
              
              <h4 className="font-semibold text-gray-900 mb-3">Consent Principles:</h4>
              <div className="space-y-3 mb-6">
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-primary-400 rounded-full mt-2.5 mr-3 flex-shrink-0"></div>
                  <span className="text-gray-700">Consent must be freely given, specific, informed, and clearly indicated</span>
                </div>
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-primary-400 rounded-full mt-2.5 mr-3 flex-shrink-0"></div>
                  <span className="text-gray-700">You can withdraw consent at any time through your account settings</span>
                </div>
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-primary-400 rounded-full mt-2.5 mr-3 flex-shrink-0"></div>
                  <span className="text-gray-700">Withdrawal of consent may limit certain platform functionality</span>
                </div>
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-primary-400 rounded-full mt-2.5 mr-3 flex-shrink-0"></div>
                  <span className="text-gray-700">We maintain records of consent for accountability purposes</span>
                </div>
              </div>
              
              <div className="bg-primary-50 border border-primary-200 rounded-xl p-4">
                <h4 className="font-semibold text-primary-800 mb-2">Managing Your Consent:</h4>
                <p className="text-primary-700">
                  Access your consent preferences through the Settings page in your account. You can review, modify, or withdraw specific consents while maintaining your account.
                </p>
              </div>
            </section>

            {/* Contact Us */}
            <section className="mb-0">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Privacy Officer Contact</h2>
              <p className="text-gray-700 leading-relaxed text-lg mb-4">
                For privacy-related inquiries, complaints, or to exercise your rights under PIPEDA, please contact our Privacy Officer:
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
                <h4 className="font-semibold text-gray-800 mb-2">Alternative Dispute Resolution:</h4>
                <p className="text-gray-700 text-sm mb-2">
                  If you are not satisfied with our response to your privacy concern, you may file a complaint with:
                </p>
                <p className="text-gray-700 text-sm">
                  <strong>Privacy Commissioner of Canada</strong><br/>
                  Phone: 1-800-282-1376<br/>
                  Website: www.priv.gc.ca<br/>
                  Email: info@priv.gc.ca
                </p>
              </div>
            </section>

            {/* Enhanced PIPEDA Compliance (2025) */}
            <section className="mb-10">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Enhanced Privacy Protection (2025)</h2>
              <p className="text-gray-700 leading-relaxed text-lg mb-6">
                In accordance with evolving Canadian privacy standards and regulatory guidance for 2025, we have implemented enhanced privacy protection measures:
              </p>
              
              <div className="bg-green-50 border border-green-200 rounded-xl p-6 mb-6">
                <h4 className="font-semibold text-green-800 mb-3">Strengthened Privacy Rights:</h4>
                <div className="space-y-3">
                  <div className="flex items-start">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2.5 mr-3 flex-shrink-0"></div>
                    <span className="text-green-700"><strong>Data Portability:</strong> Export your data in machine-readable formats</span>
                  </div>
                  <div className="flex items-start">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2.5 mr-3 flex-shrink-0"></div>
                    <span className="text-green-700"><strong>Automated Decision-Making:</strong> Opt-out of AI processing where legally required</span>
                  </div>
                  <div className="flex items-start">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2.5 mr-3 flex-shrink-0"></div>
                    <span className="text-green-700"><strong>Enhanced Consent:</strong> Granular controls for different data processing activities</span>
                  </div>
                  <div className="flex items-start">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2.5 mr-3 flex-shrink-0"></div>
                    <span className="text-green-700"><strong>Breach Notification:</strong> Direct notification within 72 hours for high-risk breaches</span>
                  </div>
                </div>
              </div>

              <h4 className="font-semibold text-gray-900 mb-3">Privacy by Design Implementation:</h4>
              <div className="space-y-3 mb-6">
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-primary-400 rounded-full mt-2.5 mr-3 flex-shrink-0"></div>
                  <span className="text-gray-700">Data minimization principles applied to all collection practices</span>
                </div>
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-primary-400 rounded-full mt-2.5 mr-3 flex-shrink-0"></div>
                  <span className="text-gray-700">Purpose limitation ensuring data use aligns with stated collection purposes</span>
                </div>
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-primary-400 rounded-full mt-2.5 mr-3 flex-shrink-0"></div>
                  <span className="text-gray-700">Storage limitation with automated deletion schedules</span>
                </div>
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-primary-400 rounded-full mt-2.5 mr-3 flex-shrink-0"></div>
                  <span className="text-gray-700">Regular privacy impact assessments for new features</span>
                </div>
              </div>

              <h4 className="font-semibold text-gray-900 mb-3">Digital Services Tax (DST) Privacy Implications:</h4>
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <p className="text-blue-700 text-sm">
                  Canada's 2025 Digital Services Tax legislation may require additional data reporting for qualifying digital services. 
                  Any DST-related data processing will be limited to what is legally required and will not expand beyond 
                  our existing privacy commitments. Users retain all privacy rights regarding such processing.
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