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
                  <p className="text-gray-600">Only upload course outlines you have permission to use</p>
                  
                  <h4 className="font-semibold text-gray-900 mb-1 mt-3">What You Own</h4>
                  <p className="text-gray-600">Your academic content; we own the platform</p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">Our Responsibility</h4>
                  <p className="text-gray-600">Provide the service; no guarantees on AI accuracy</p>
                  
                  <h4 className="font-semibold text-gray-900 mb-1 mt-3">Academic Use</h4>
                  <p className="text-gray-600">For organization only, not completing academic work</p>
                </div>
              </div>
            </div>

            {/* Agreement to Terms */}
            <section className="mb-10">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Agreement to Terms</h2>
              <p className="text-gray-700 leading-relaxed text-lg mb-4">
                By using Asetta, you agree to these terms. These terms are governed by Ontario, Canada law and comply with the Personal Information Protection and Electronic Documents Act (PIPEDA) and Copyright Act of Canada.
              </p>
            </section>

            {/* User Responsibilities */}
            <section className="mb-10">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Your Responsibilities</h2>
              <div className="space-y-3">
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-primary-500 rounded-full mt-2.5 mr-3 flex-shrink-0"></div>
                  <span className="text-gray-700">Only upload course outlines and academic materials you have permission to use</span>
                </div>
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-primary-500 rounded-full mt-2.5 mr-3 flex-shrink-0"></div>
                  <span className="text-gray-700">Ensure uploaded content doesn't violate copyright or your institution's policies</span>
                </div>
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-primary-500 rounded-full mt-2.5 mr-3 flex-shrink-0"></div>
                  <span className="text-gray-700">Use the platform for academic organization, not to complete academic work</span>
                </div>
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-primary-500 rounded-full mt-2.5 mr-3 flex-shrink-0"></div>
                  <span className="text-gray-700">Keep your account secure and don't share login credentials</span>
                </div>
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-primary-500 rounded-full mt-2.5 mr-3 flex-shrink-0"></div>
                  <span className="text-gray-700">Verify AI-extracted information against your original documents</span>
                </div>
              </div>
            </section>

            {/* Platform Use */}
            <section className="mb-10">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">How Our Platform Works</h2>
              <p className="text-gray-700 leading-relaxed text-lg mb-4">
                Asetta uses AI to process your uploaded course outlines and extract assessment information. Here's what you should know:
              </p>
              <div className="space-y-3">
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-primary-500 rounded-full mt-2.5 mr-3 flex-shrink-0"></div>
                  <span className="text-gray-700">AI accuracy is not guaranteed - always double-check extracted information</span>
                </div>
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-primary-500 rounded-full mt-2.5 mr-3 flex-shrink-0"></div>
                  <span className="text-gray-700">Email notifications depend on your email provider and may be delayed</span>
                </div>
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-primary-500 rounded-full mt-2.5 mr-3 flex-shrink-0"></div>
                  <span className="text-gray-700">You remain responsible for managing your academic deadlines</span>
                </div>
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-primary-500 rounded-full mt-2.5 mr-3 flex-shrink-0"></div>
                  <span className="text-gray-700">The service may be temporarily unavailable for maintenance</span>
                </div>
              </div>
            </section>

            {/* Copyright Compliance */}
            <section className="mb-10">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Copyright and Course Materials</h2>
              <p className="text-gray-700 leading-relaxed text-lg mb-4">
                When uploading course outlines, you confirm you have permission under Canada's Copyright Act fair dealing provisions for educational purposes. If content is reported for copyright infringement:
              </p>
              <div className="space-y-3 mb-6">
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-primary-500 rounded-full mt-2.5 mr-3 flex-shrink-0"></div>
                  <span className="text-gray-700">We will investigate copyright complaints within 48 hours</span>
                </div>
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-primary-500 rounded-full mt-2.5 mr-3 flex-shrink-0"></div>
                  <span className="text-gray-700">Infringing content will be removed and users notified</span>
                </div>
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-primary-500 rounded-full mt-2.5 mr-3 flex-shrink-0"></div>
                  <span className="text-gray-700">You can file a counter-notice if you believe content was wrongly removed</span>
                </div>
              </div>
              
              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                <h4 className="font-semibold text-yellow-800 mb-2">Educational Fair Dealing:</h4>
                <p className="text-yellow-700">
                  Canadian copyright law allows fair dealing for educational purposes, but this doesn't protect all educational content from copyright claims. Only upload materials you have clear permission to use.
                </p>
              </div>
            </section>

            {/* Ownership */}
            <section className="mb-10">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Content Ownership</h2>
              <div className="space-y-3">
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-primary-500 rounded-full mt-2.5 mr-3 flex-shrink-0"></div>
                  <span className="text-gray-700">You own all academic content and notes you create or upload</span>
                </div>
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-primary-500 rounded-full mt-2.5 mr-3 flex-shrink-0"></div>
                  <span className="text-gray-700">We own the platform, software, and AI technology</span>
                </div>
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-primary-500 rounded-full mt-2.5 mr-3 flex-shrink-0"></div>
                  <span className="text-gray-700">You give us permission to process your files to provide our services</span>
                </div>
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-primary-500 rounded-full mt-2.5 mr-3 flex-shrink-0"></div>
                  <span className="text-gray-700">We don't claim ownership of your academic work</span>
                </div>
              </div>
            </section>

            {/* Limitation of Liability */}
            <section className="mb-10">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Liability Limits</h2>
              <p className="text-gray-700 leading-relaxed text-lg mb-4">
                Asetta is provided "as is" without warranties. To the extent permitted by Ontario law, we're not liable for:
              </p>
              <div className="space-y-3 mb-6">
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-primary-500 rounded-full mt-2.5 mr-3 flex-shrink-0"></div>
                  <span className="text-gray-700">Missed deadlines due to AI errors, notification failures, or service outages</span>
                </div>
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-primary-500 rounded-full mt-2.5 mr-3 flex-shrink-0"></div>
                  <span className="text-gray-700">Academic consequences from relying on platform information</span>
                </div>
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-primary-500 rounded-full mt-2.5 mr-3 flex-shrink-0"></div>
                  <span className="text-gray-700">Data loss or technical issues with third-party services</span>
                </div>
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-primary-500 rounded-full mt-2.5 mr-3 flex-shrink-0"></div>
                  <span className="text-gray-700">Any damages exceeding CAD $100</span>
                </div>
              </div>
              
              <div className="bg-primary-50 border border-primary-200 rounded-xl p-4">
                <h4 className="font-semibold text-primary-800 mb-2">Important Academic Reminder:</h4>
                <p className="text-primary-700">
                  You remain fully responsible for managing your academic deadlines. Asetta is a tool to assist with organization, not replace personal academic responsibility.
                </p>
              </div>
            </section>

            {/* Changes and Contact */}
            <section className="mb-0">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Changes and Contact</h2>
              <p className="text-gray-700 leading-relaxed text-lg mb-4">
                We may update these terms occasionally. We'll notify users of material changes. For questions or legal matters, contact:
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