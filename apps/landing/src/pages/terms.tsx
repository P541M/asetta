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
              <p className="text-gray-700 leading-relaxed text-lg mb-4">
                By accessing and using Asetta, you agree to be bound by these Terms of Service and all applicable laws and regulations. These Terms are governed by the laws of Ontario, Canada, and comply with the Ontario Consumer Protection Act, 2023.
              </p>
              
              <div className="bg-primary-50 border border-primary-200 rounded-xl p-4 mb-4">
                <h4 className="font-semibold text-primary-800 mb-2">Governing Law and Jurisdiction:</h4>
                <p className="text-primary-700">
                  These Terms of Service are governed by and construed in accordance with the laws of Ontario, Canada, including the Consumer Protection Act, 2023. Any legal action or proceeding arising under these Terms will be brought exclusively in the Ontario Superior Court of Justice, and you hereby consent to personal jurisdiction and venue therein.
                </p>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                <h4 className="font-semibold text-green-800 mb-2">Ontario Consumer Protection Act Compliance:</h4>
                <p className="text-green-700 mb-2">
                  In accordance with Ontario's Consumer Protection Act, 2023, these Terms do not contain any prohibited clauses. Specifically:
                </p>
                <ul className="text-green-700 text-sm space-y-1 ml-4">
                  <li>• You retain the right to publish reviews of Asetta and our services</li>
                  <li>• No monetary limits are placed on claims for breaches of conditions or warranties</li>
                  <li>• You are not prevented from commencing class action proceedings</li>
                  <li>• Disputes may be resolved in Ontario Superior Court as provided by law</li>
                  <li>• You have the right to cancel this agreement within one year if prohibited terms are discovered</li>
                </ul>
              </div>
            </section>

            {/* Forward-Looking Consumer Protection Compliance */}
            <section className="mb-10">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Upcoming Consumer Protection Changes (2026)</h2>
              <p className="text-gray-700 leading-relaxed text-lg mb-6">
                We are proactively preparing for Ontario's new Consumer Protection Act, 2023, expected to come into force in 2026. While still in regulatory development, we commit to full compliance with enhanced consumer protections:
              </p>
              
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-6">
                <h4 className="font-semibold text-blue-800 mb-3">Enhanced Digital Consumer Rights (Upcoming):</h4>
                <div className="space-y-2">
                  <div className="flex items-start">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2.5 mr-3 flex-shrink-0"></div>
                    <span className="text-blue-700"><strong>Click-to-Cancel:</strong> Easy cancellation for any paid services (when introduced)</span>
                  </div>
                  <div className="flex items-start">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2.5 mr-3 flex-shrink-0"></div>
                    <span className="text-blue-700"><strong>Online Contract Protection:</strong> Enhanced protections for digital agreements</span>
                  </div>
                  <div className="flex items-start">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2.5 mr-3 flex-shrink-0"></div>
                    <span className="text-blue-700"><strong>Unilateral Amendment Limits:</strong> Restrictions on unilateral changes to terms</span>
                  </div>
                  <div className="flex items-start">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2.5 mr-3 flex-shrink-0"></div>
                    <span className="text-blue-700"><strong>Private Action Rights:</strong> Enhanced rights to seek damages for violations</span>
                  </div>
                </div>
              </div>

              <h4 className="font-semibold text-gray-900 mb-3">Our Proactive Commitments:</h4>
              <div className="space-y-3 mb-6">
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-primary-400 rounded-full mt-2.5 mr-3 flex-shrink-0"></div>
                  <span className="text-gray-700">We will update these Terms automatically when new CPA requirements take effect</span>
                </div>
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-primary-400 rounded-full mt-2.5 mr-3 flex-shrink-0"></div>
                  <span className="text-gray-700">Users will receive 30 days notice of any material changes required by new legislation</span>
                </div>
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-primary-400 rounded-full mt-2.5 mr-3 flex-shrink-0"></div>
                  <span className="text-gray-700">Our free service model ensures minimal disruption from new consumer protection requirements</span>
                </div>
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-primary-400 rounded-full mt-2.5 mr-3 flex-shrink-0"></div>
                  <span className="text-gray-700">We maintain proactive compliance monitoring through legal consultation</span>
                </div>
              </div>

              <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
                <h4 className="font-semibold text-orange-800 mb-2">Regulatory Transition:</h4>
                <p className="text-orange-700 text-sm">
                  As Ontario's new Consumer Protection Act regulations are finalized, we will provide updates to ensure 
                  continuous compliance. Users will be notified of any material changes with appropriate notice periods. 
                  Our commitment to free service for students remains unchanged regardless of regulatory updates.
                </p>
              </div>
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

            {/* Limitation of Liability */}
            <section className="mb-10">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Limitation of Liability</h2>
              <p className="text-gray-700 leading-relaxed text-lg mb-4">
                To the maximum extent permitted by Ontario law, Asetta and its operators shall not be liable for any damages arising from your use of the platform, including but not limited to:
              </p>
              <div className="space-y-2 mb-6">
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-secondary-400 rounded-full mt-2.5 mr-3 flex-shrink-0"></div>
                  <span className="text-gray-700">Missed academic deadlines due to notification failures, system outages, or AI inaccuracies</span>
                </div>
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-secondary-400 rounded-full mt-2.5 mr-3 flex-shrink-0"></div>
                  <span className="text-gray-700">Academic consequences, grade impacts, or educational setbacks resulting from reliance on platform information</span>
                </div>
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-secondary-400 rounded-full mt-2.5 mr-3 flex-shrink-0"></div>
                  <span className="text-gray-700">Data loss, corruption, or unauthorized access due to technical issues, security breaches, or service interruptions</span>
                </div>
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-secondary-400 rounded-full mt-2.5 mr-3 flex-shrink-0"></div>
                  <span className="text-gray-700">Damages from third-party service failures including Firebase, Google AI, email providers, or hosting services</span>
                </div>
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-secondary-400 rounded-full mt-2.5 mr-3 flex-shrink-0"></div>
                  <span className="text-gray-700">Indirect, consequential, incidental, special, exemplary, or punitive damages of any kind</span>
                </div>
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-secondary-400 rounded-full mt-2.5 mr-3 flex-shrink-0"></div>
                  <span className="text-gray-700">Loss of profits, business opportunities, data, goodwill, or other intangible losses</span>
                </div>
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-secondary-400 rounded-full mt-2.5 mr-3 flex-shrink-0"></div>
                  <span className="text-gray-700">Any damages arising from user-generated content, copyright infringement, or academic misconduct</span>
                </div>
              </div>
              
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4">
                <h4 className="font-semibold text-red-800 mb-2">Maximum Liability Cap:</h4>
                <p className="text-red-700">
                  In no event shall our total aggregate liability exceed CAD $100 or the amount you paid to use our services in the 12 months preceding the claim, whichever is greater. This limitation applies regardless of the legal theory on which the claim is based.
                </p>
              </div>
              
              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                <h4 className="font-semibold text-yellow-800 mb-2">Statutory Rights:</h4>
                <p className="text-yellow-700">
                  Nothing in these Terms excludes or limits our liability for death or personal injury caused by negligence, fraud, or other liability that cannot be excluded or limited under Ontario law.
                </p>
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

            {/* Indemnification */}
            <section className="mb-10">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Indemnification</h2>
              <p className="text-gray-700 leading-relaxed text-lg mb-4">
                You agree to indemnify, defend, and hold harmless Asetta, its operators, and affiliates from and against any and all claims, damages, losses, costs, and expenses (including reasonable legal fees) arising from:
              </p>
              <div className="space-y-3">
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-primary-500 rounded-full mt-2.5 mr-3 flex-shrink-0"></div>
                  <span className="text-gray-700">Your violation of these Terms of Service or any applicable law</span>
                </div>
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-primary-500 rounded-full mt-2.5 mr-3 flex-shrink-0"></div>
                  <span className="text-gray-700">Your use or misuse of the platform or services</span>
                </div>
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-primary-500 rounded-full mt-2.5 mr-3 flex-shrink-0"></div>
                  <span className="text-gray-700">Copyright infringement or intellectual property violations in content you upload</span>
                </div>
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-primary-500 rounded-full mt-2.5 mr-3 flex-shrink-0"></div>
                  <span className="text-gray-700">Any breach of your academic institution's policies resulting from platform use</span>
                </div>
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-primary-500 rounded-full mt-2.5 mr-3 flex-shrink-0"></div>
                  <span className="text-gray-700">Any third-party claims arising from your content or platform usage</span>
                </div>
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-primary-500 rounded-full mt-2.5 mr-3 flex-shrink-0"></div>
                  <span className="text-gray-700">Negligence, misconduct, or illegal activities conducted through your account</span>
                </div>
              </div>
            </section>

            {/* DMCA and Copyright Policy */}
            <section className="mb-10">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Copyright and DMCA Policy</h2>
              <p className="text-gray-700 leading-relaxed text-lg mb-4">
                We respect intellectual property rights and comply with copyright laws. If you believe your copyrighted work has been uploaded without permission:
              </p>
              
              <h4 className="font-semibold text-gray-900 mb-3">Copyright Infringement Claims:</h4>
              <div className="space-y-3 mb-6">
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-secondary-600 rounded-full mt-2.5 mr-3 flex-shrink-0"></div>
                  <span className="text-gray-700">Send written notice to <strong>videna.psalmeleazar@gmail.com</strong> with "DMCA Takedown" in the subject line</span>
                </div>
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-secondary-600 rounded-full mt-2.5 mr-3 flex-shrink-0"></div>
                  <span className="text-gray-700">Include identification of the copyrighted work claimed to be infringed</span>
                </div>
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-secondary-600 rounded-full mt-2.5 mr-3 flex-shrink-0"></div>
                  <span className="text-gray-700">Provide location of the allegedly infringing material on our platform</span>
                </div>
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-secondary-600 rounded-full mt-2.5 mr-3 flex-shrink-0"></div>
                  <span className="text-gray-700">Include your contact information and a statement of good faith belief</span>
                </div>
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-secondary-600 rounded-full mt-2.5 mr-3 flex-shrink-0"></div>
                  <span className="text-gray-700">Provide physical or electronic signature of the copyright owner or authorized agent</span>
                </div>
              </div>
              
              <h4 className="font-semibold text-gray-900 mb-3">Response Procedures:</h4>
              <div className="space-y-3 mb-6">
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-secondary-600 rounded-full mt-2.5 mr-3 flex-shrink-0"></div>
                  <span className="text-gray-700">We will investigate valid DMCA notices within 48 hours</span>
                </div>
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-secondary-600 rounded-full mt-2.5 mr-3 flex-shrink-0"></div>
                  <span className="text-gray-700">Infringing content will be removed and users notified</span>
                </div>
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-secondary-600 rounded-full mt-2.5 mr-3 flex-shrink-0"></div>
                  <span className="text-gray-700">Repeat infringers may have their accounts terminated</span>
                </div>
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-secondary-600 rounded-full mt-2.5 mr-3 flex-shrink-0"></div>
                  <span className="text-gray-700">Users may file counter-notices if they believe content was wrongly removed</span>
                </div>
              </div>
              
              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                <h4 className="font-semibold text-yellow-800 mb-2">Fair Use and Educational Content:</h4>
                <p className="text-yellow-700">
                  Users should consider fair use principles when uploading course materials. However, fair use does not automatically protect all educational content from copyright claims.
                </p>
              </div>
            </section>

            {/* Force Majeure */}
            <section className="mb-10">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Force Majeure</h2>
              <p className="text-gray-700 leading-relaxed text-lg mb-4">
                We shall not be liable for any failure or delay in performance under these Terms due to circumstances beyond our reasonable control, including but not limited to:
              </p>
              <div className="space-y-3 mb-6">
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-primary-400 rounded-full mt-2.5 mr-3 flex-shrink-0"></div>
                  <span className="text-gray-700">Natural disasters, pandemics, or public health emergencies</span>
                </div>
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-primary-400 rounded-full mt-2.5 mr-3 flex-shrink-0"></div>
                  <span className="text-gray-700">Government actions, legal restrictions, or regulatory changes</span>
                </div>
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-primary-400 rounded-full mt-2.5 mr-3 flex-shrink-0"></div>
                  <span className="text-gray-700">Internet service failures, cyber attacks, or major technical outages</span>
                </div>
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-primary-400 rounded-full mt-2.5 mr-3 flex-shrink-0"></div>
                  <span className="text-gray-700">Third-party service disruptions (Google, Firebase, email providers)</span>
                </div>
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-primary-400 rounded-full mt-2.5 mr-3 flex-shrink-0"></div>
                  <span className="text-gray-700">Labor strikes, equipment failures, or supplier disruptions</span>
                </div>
              </div>
              
              <p className="text-gray-700 leading-relaxed text-lg">
                During force majeure events, we will make commercially reasonable efforts to minimize service disruption and provide updates to users when possible.
              </p>
            </section>

            {/* Dispute Resolution */}
            <section className="mb-10">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Dispute Resolution</h2>
              <p className="text-gray-700 leading-relaxed text-lg mb-4">
                Any disputes arising under these Terms shall be resolved according to Ontario law:
              </p>
              
              <h4 className="font-semibold text-gray-900 mb-3">Resolution Process:</h4>
              <div className="space-y-3 mb-6">
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-primary-500 rounded-full mt-2.5 mr-3 flex-shrink-0"></div>
                  <span className="text-gray-700"><strong>Step 1:</strong> Contact us directly at videna.psalmeleazar@gmail.com to attempt good faith resolution</span>
                </div>
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-primary-500 rounded-full mt-2.5 mr-3 flex-shrink-0"></div>
                  <span className="text-gray-700"><strong>Step 2:</strong> If informal resolution fails, mediation through Ontario mediation services</span>
                </div>
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-primary-500 rounded-full mt-2.5 mr-3 flex-shrink-0"></div>
                  <span className="text-gray-700"><strong>Step 3:</strong> Final resolution through Ontario courts if mediation is unsuccessful</span>
                </div>
              </div>
              
              <div className="bg-primary-50 border border-primary-200 rounded-xl p-4">
                <h4 className="font-semibold text-primary-800 mb-2">Limitation Period:</h4>
                <p className="text-primary-700">
                  Any legal action must be commenced within one (1) year after the cause of action arose, or such claim shall be permanently barred.
                </p>
              </div>
            </section>

            {/* Digital Services Tax Compliance (2025) */}
            <section className="mb-10">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Digital Services Tax Compliance</h2>
              <p className="text-gray-700 leading-relaxed text-lg mb-4">
                In accordance with Canada's Digital Services Tax (DST) legislation effective 2025:
              </p>
              
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
                <h4 className="font-semibold text-blue-800 mb-2">Tax Transparency Notice:</h4>
                <p className="text-blue-700 text-sm">
                  While our service is free to students, we comply with Canadian DST requirements for digital services. 
                  This legislation requires registration and reporting for qualifying digital services revenue, 
                  applicable retroactively from January 1, 2022.
                </p>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-primary-500 rounded-full mt-2.5 mr-3 flex-shrink-0"></div>
                  <span className="text-gray-700">DST applies to certain digital services that rely on Canadian user engagement and data</span>
                </div>
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-primary-500 rounded-full mt-2.5 mr-3 flex-shrink-0"></div>
                  <span className="text-gray-700">Our free service model means no direct DST costs are passed to users</span>
                </div>
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-primary-500 rounded-full mt-2.5 mr-3 flex-shrink-0"></div>
                  <span className="text-gray-700">We maintain compliance with all Canadian federal tax obligations</span>
                </div>
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-primary-500 rounded-full mt-2.5 mr-3 flex-shrink-0"></div>
                  <span className="text-gray-700">Tax compliance information is available upon reasonable request</span>
                </div>
              </div>
            </section>

            {/* Contact Information */}
            <section className="mb-0">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Legal Contact Information</h2>
              <p className="text-gray-700 leading-relaxed text-lg mb-4">
                For legal matters, copyright issues, or questions about these Terms, please contact:
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
                <p className="text-primary-600 mt-2 text-sm">Legal Affairs - Asetta Platform</p>
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