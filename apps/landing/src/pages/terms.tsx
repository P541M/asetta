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

          {/* Main Content */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 md:p-12 shadow-xl border border-gray-200/50 animate-fade-in-up">
            
            {/* Quick Summary */}
            <div className="bg-gradient-to-r from-primary-50 to-primary-100 rounded-xl p-6 mb-12 border border-primary-200/50">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Quick Summary</h2>
              <div className="grid md:grid-cols-2 gap-6 text-sm">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">Your Responsibilities</h4>
                  <p className="text-gray-600">Provide accurate info, respect IP rights, use responsibly</p>
                  
                  <h4 className="font-semibold text-gray-900 mb-1 mt-3">What You Own</h4>
                  <p className="text-gray-600">Your academic content; we own the platform</p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">AI Disclaimers</h4>
                  <p className="text-gray-600">Verify AI-extracted data; we're not liable for errors</p>
                  
                  <h4 className="font-semibold text-gray-900 mb-1 mt-3">Academic Integrity</h4>
                  <p className="text-gray-600">Tool for organization, not completing academic work</p>
                </div>
              </div>
            </div>

            {/* Agreement to Terms */}
            <section className="mb-10">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Agreement to Terms</h2>
              <p className="text-gray-700 leading-relaxed text-lg">
                By accessing and using Asetta, you agree to be bound by these Terms of Service and all applicable laws and regulations.
              </p>
            </section>

            {/* Prohibited Uses */}
            <section className="mb-10">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Prohibited Uses</h2>
              <div className="space-y-3">
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-secondary-500 rounded-full mt-2.5 mr-3 flex-shrink-0"></div>
                  <span className="text-gray-700">Uploading malicious files or content that could harm our systems</span>
                </div>
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-secondary-500 rounded-full mt-2.5 mr-3 flex-shrink-0"></div>
                  <span className="text-gray-700">Using the platform for commercial purposes without authorization</span>
                </div>
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-secondary-500 rounded-full mt-2.5 mr-3 flex-shrink-0"></div>
                  <span className="text-gray-700">Attempting to reverse engineer any AI or software components</span>
                </div>
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-secondary-500 rounded-full mt-2.5 mr-3 flex-shrink-0"></div>
                  <span className="text-gray-700">Sharing copyrighted course materials without permission</span>
                </div>
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-secondary-500 rounded-full mt-2.5 mr-3 flex-shrink-0"></div>
                  <span className="text-gray-700">Creating multiple accounts to bypass usage limitations</span>
                </div>
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-secondary-500 rounded-full mt-2.5 mr-3 flex-shrink-0"></div>
                  <span className="text-gray-700">Interfering with other users' access to the platform</span>
                </div>
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-secondary-500 rounded-full mt-2.5 mr-3 flex-shrink-0"></div>
                  <span className="text-gray-700">Using automated tools to scrape or extract platform data</span>
                </div>
              </div>
            </section>

            {/* User Responsibilities */}
            <section className="mb-10">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">User Responsibilities</h2>
              <div className="space-y-3">
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-primary-500 rounded-full mt-2.5 mr-3 flex-shrink-0"></div>
                  <span className="text-gray-700">Provide accurate academic information and deadlines</span>
                </div>
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-primary-500 rounded-full mt-2.5 mr-3 flex-shrink-0"></div>
                  <span className="text-gray-700">Maintain the security of your account credentials</span>
                </div>
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-primary-500 rounded-full mt-2.5 mr-3 flex-shrink-0"></div>
                  <span className="text-gray-700">Only upload files you have the right to process</span>
                </div>
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-primary-500 rounded-full mt-2.5 mr-3 flex-shrink-0"></div>
                  <span className="text-gray-700">Use AI-generated insights responsibly for academic purposes</span>
                </div>
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-primary-500 rounded-full mt-2.5 mr-3 flex-shrink-0"></div>
                  <span className="text-gray-700">Respect intellectual property rights of uploaded content</span>
                </div>
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-primary-500 rounded-full mt-2.5 mr-3 flex-shrink-0"></div>
                  <span className="text-gray-700">Report any security vulnerabilities or bugs you discover</span>
                </div>
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-primary-500 rounded-full mt-2.5 mr-3 flex-shrink-0"></div>
                  <span className="text-gray-700">Keep your contact information up-to-date for notifications</span>
                </div>
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-primary-500 rounded-full mt-2.5 mr-3 flex-shrink-0"></div>
                  <span className="text-gray-700">Comply with your institution's academic integrity policies</span>
                </div>
              </div>
            </section>

            {/* Disclaimer */}
            <section className="mb-10">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Disclaimer</h2>
              <p className="text-gray-700 leading-relaxed text-lg mb-4">
                Asetta is provided "as is" without any warranties regarding AI accuracy, deadline predictions, or service availability. While we strive for accuracy, AI-extracted information should be verified against original documents. We do not guarantee that notifications will be delivered or that the service will be uninterrupted or error-free.
              </p>
              <div className="bg-primary-50 border border-primary-200 rounded-xl p-4">
                <h4 className="font-semibold text-primary-800 mb-2">Important Academic Disclaimer:</h4>
                <p className="text-primary-700">
                  Students remain fully responsible for managing their academic deadlines. Asetta is a tool to assist with organization, not replace personal academic responsibility.
                </p>
              </div>
            </section>

            {/* Limitations */}
            <section className="mb-10">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Limitations</h2>
              <p className="text-gray-700 leading-relaxed text-lg mb-4">
                To the maximum extent permitted by law, Asetta shall not be liable for:
              </p>
              <div className="space-y-2">
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-secondary-400 rounded-full mt-2.5 mr-3 flex-shrink-0"></div>
                  <span className="text-gray-700">Missed deadlines due to notification failures or AI inaccuracies</span>
                </div>
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-secondary-400 rounded-full mt-2.5 mr-3 flex-shrink-0"></div>
                  <span className="text-gray-700">Academic consequences resulting from reliance on platform information</span>
                </div>
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-secondary-400 rounded-full mt-2.5 mr-3 flex-shrink-0"></div>
                  <span className="text-gray-700">Data loss due to technical issues or service interruptions</span>
                </div>
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-secondary-400 rounded-full mt-2.5 mr-3 flex-shrink-0"></div>
                  <span className="text-gray-700">Damages from third-party service failures (Firebase, Google AI)</span>
                </div>
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-secondary-400 rounded-full mt-2.5 mr-3 flex-shrink-0"></div>
                  <span className="text-gray-700">Indirect, consequential, or punitive damages of any kind</span>
                </div>
              </div>
            </section>

            {/* Platform Features and Usage */}
            <section className="mb-10">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Platform Features and Usage</h2>
              <p className="text-gray-700 leading-relaxed text-lg mb-4">
                By using Asetta, you agree to the following terms regarding our platform features:
              </p>
              
              <h4 className="font-semibold text-gray-900 mb-3">AI-Powered Document Processing:</h4>
              <div className="space-y-2 mb-4">
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-secondary-600 rounded-full mt-2.5 mr-3 flex-shrink-0"></div>
                  <span className="text-gray-700">PDF files are processed using Google Gemini AI to extract assessment information</span>
                </div>
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-secondary-600 rounded-full mt-2.5 mr-3 flex-shrink-0"></div>
                  <span className="text-gray-700">AI accuracy is not guaranteed; always verify extracted data against original documents</span>
                </div>
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-secondary-600 rounded-full mt-2.5 mr-3 flex-shrink-0"></div>
                  <span className="text-gray-700">We are not responsible for misinterpretation of uploaded content</span>
                </div>
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-secondary-600 rounded-full mt-2.5 mr-3 flex-shrink-0"></div>
                  <span className="text-gray-700">Large or complex files may take longer to process or may fail</span>
                </div>
              </div>
              
              <h4 className="font-semibold text-gray-900 mb-3">Email Notifications:</h4>
              <div className="space-y-2">
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-secondary-600 rounded-full mt-2.5 mr-3 flex-shrink-0"></div>
                  <span className="text-gray-700">Notification delivery depends on email service availability</span>
                </div>
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-secondary-600 rounded-full mt-2.5 mr-3 flex-shrink-0"></div>
                  <span className="text-gray-700">Emails may be delayed, filtered as spam, or fail to deliver</span>
                </div>
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-secondary-600 rounded-full mt-2.5 mr-3 flex-shrink-0"></div>
                  <span className="text-gray-700">Users must maintain current email addresses for notifications</span>
                </div>
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-secondary-600 rounded-full mt-2.5 mr-3 flex-shrink-0"></div>
                  <span className="text-gray-700">Notification preferences can be adjusted in platform settings</span>
                </div>
              </div>
            </section>

            {/* Content Ownership and Intellectual Property */}
            <section className="mb-10">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Content Ownership and Intellectual Property</h2>
              <p className="text-gray-700 leading-relaxed text-lg mb-4">
                Understanding ownership rights for content on our platform:
              </p>
              
              <h4 className="font-semibold text-gray-900 mb-3">Your Content:</h4>
              <div className="space-y-2 mb-4">
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-primary-500 rounded-full mt-2.5 mr-3 flex-shrink-0"></div>
                  <span className="text-gray-700">You retain ownership of all academic materials you upload</span>
                </div>
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-primary-500 rounded-full mt-2.5 mr-3 flex-shrink-0"></div>
                  <span className="text-gray-700">You grant us license to process files for providing our services</span>
                </div>
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-primary-500 rounded-full mt-2.5 mr-3 flex-shrink-0"></div>
                  <span className="text-gray-700">You are responsible for ensuring you have rights to upload content</span>
                </div>
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-primary-500 rounded-full mt-2.5 mr-3 flex-shrink-0"></div>
                  <span className="text-gray-700">We do not claim ownership of your academic work or notes</span>
                </div>
              </div>
              
              <h4 className="font-semibold text-gray-900 mb-3">Platform Content:</h4>
              <div className="space-y-2">
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-primary-500 rounded-full mt-2.5 mr-3 flex-shrink-0"></div>
                  <span className="text-gray-700">All platform software, design, and AI algorithms remain our property</span>
                </div>
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-primary-500 rounded-full mt-2.5 mr-3 flex-shrink-0"></div>
                  <span className="text-gray-700">You may not copy, modify, or redistribute our platform code</span>
                </div>
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-primary-500 rounded-full mt-2.5 mr-3 flex-shrink-0"></div>
                  <span className="text-gray-700">Asetta trademarks and branding are protected intellectual property</span>
                </div>
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-primary-500 rounded-full mt-2.5 mr-3 flex-shrink-0"></div>
                  <span className="text-gray-700">User interface and experience elements are proprietary</span>
                </div>
              </div>
            </section>

            {/* Service Availability and Modifications */}
            <section className="mb-10">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Service Availability and Modifications</h2>
              <p className="text-gray-700 leading-relaxed text-lg mb-4">
                Important information about service availability and changes:
              </p>
              <div className="space-y-3">
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-primary-400 rounded-full mt-2.5 mr-3 flex-shrink-0"></div>
                  <span className="text-gray-700">Service availability depends on Firebase, Google AI, and third-party services</span>
                </div>
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-primary-400 rounded-full mt-2.5 mr-3 flex-shrink-0"></div>
                  <span className="text-gray-700">We may modify, suspend, or discontinue features at any time</span>
                </div>
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-primary-400 rounded-full mt-2.5 mr-3 flex-shrink-0"></div>
                  <span className="text-gray-700">Maintenance periods may temporarily interrupt service access</span>
                </div>
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-primary-400 rounded-full mt-2.5 mr-3 flex-shrink-0"></div>
                  <span className="text-gray-700">Free service may include usage limitations or rate limiting</span>
                </div>
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-primary-400 rounded-full mt-2.5 mr-3 flex-shrink-0"></div>
                  <span className="text-gray-700">We will provide reasonable notice for significant changes when possible</span>
                </div>
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-primary-400 rounded-full mt-2.5 mr-3 flex-shrink-0"></div>
                  <span className="text-gray-700">Account termination may result in immediate loss of access to data</span>
                </div>
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-primary-400 rounded-full mt-2.5 mr-3 flex-shrink-0"></div>
                  <span className="text-gray-700">Data export tools will be provided before any service discontinuation</span>
                </div>
              </div>
            </section>

            {/* Academic Integrity and Responsible Use */}
            <section className="mb-10">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Academic Integrity and Responsible Use</h2>
              <p className="text-gray-700 leading-relaxed text-lg mb-4">
                As an academic tool, Asetta should be used in accordance with academic integrity policies:
              </p>
              <div className="space-y-3">
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-secondary-500 rounded-full mt-2.5 mr-3 flex-shrink-0"></div>
                  <span className="text-gray-700">Asetta is designed to help with organization, not to complete academic work</span>
                </div>
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-secondary-500 rounded-full mt-2.5 mr-3 flex-shrink-0"></div>
                  <span className="text-gray-700">AI-generated insights should not be submitted as your own work</span>
                </div>
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-secondary-500 rounded-full mt-2.5 mr-3 flex-shrink-0"></div>
                  <span className="text-gray-700">Sharing of course materials must comply with institutional policies</span>
                </div>
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-secondary-500 rounded-full mt-2.5 mr-3 flex-shrink-0"></div>
                  <span className="text-gray-700">Users must follow their institution's technology and academic integrity guidelines</span>
                </div>
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-secondary-500 rounded-full mt-2.5 mr-3 flex-shrink-0"></div>
                  <span className="text-gray-700">The platform should supplement, not replace, traditional study methods</span>
                </div>
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-secondary-500 rounded-full mt-2.5 mr-3 flex-shrink-0"></div>
                  <span className="text-gray-700">Any academic misconduct using our platform may result in account termination</span>
                </div>
              </div>
            </section>

            {/* Contact Information */}
            <section className="mb-0">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Contact Information</h2>
              <p className="text-gray-700 leading-relaxed text-lg mb-4">
                If you have any questions about these Terms, please contact us at:
              </p>
              <div className="p-4 bg-primary-50 rounded-xl border border-primary-200/50">
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
              Last updated: July 11, 2025
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}