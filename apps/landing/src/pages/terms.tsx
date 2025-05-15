import Head from "next/head";
import Header from "../components/Header";
import Footer from "../components/Footer";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Head>
        <title>Terms of Service - Kivo</title>
        <meta
          name="description"
          content="Terms of Service for Kivo - Your trusted academic management platform"
        />
      </Head>
      <Header />

      <main className="flex-grow pt-32 pb-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 animate-fade-in">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Terms of Service
            </h1>
            <p className="text-xl text-gray-600">
              Please read these terms carefully
            </p>
          </div>

          <div className="bg-white rounded-3xl p-8 md:p-12 shadow-xl animate-fade-in-delayed border border-gray-100">
            <div className="prose prose-indigo max-w-none mx-auto">
              <div className="grid gap-10 md:grid-cols-2">
                <div>
                  <h2 className="text-2xl font-bold text-indigo-700 mb-4">
                    Agreement to Terms
                  </h2>
                  <p>
                    By accessing and using Kivo, you agree to be bound by these
                    Terms of Service and all applicable laws and regulations.
                  </p>
                  <h2 className="text-2xl font-bold text-indigo-700 mt-8 mb-4">
                    Use License
                  </h2>
                  <ul className="list-disc pl-5 text-gray-700">
                    <li>Modifying or copying the materials</li>
                    <li>Using the materials for commercial purposes</li>
                    <li>Attempting to reverse engineer any software</li>
                    <li>Removing any copyright or proprietary notations</li>
                  </ul>
                  <h2 className="text-2xl font-bold text-indigo-700 mt-8 mb-4">
                    User Responsibilities
                  </h2>
                  <ul className="list-disc pl-5 text-gray-700">
                    <li>Provide accurate information</li>
                    <li>Maintain the security of your account</li>
                    <li>Use the platform responsibly</li>
                    <li>Comply with all applicable laws</li>
                  </ul>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-indigo-700 mb-4">
                    Disclaimer
                  </h2>
                  <p>
                    Kivo is provided "as is" without any warranties, expressed
                    or implied. We do not guarantee that the service will be
                    uninterrupted or error-free.
                  </p>
                  <h2 className="text-2xl font-bold text-indigo-700 mt-8 mb-4">
                    Limitations
                  </h2>
                  <p>
                    In no event shall Kivo be liable for any damages arising out
                    of the use or inability to use the platform.
                  </p>
                  <h2 className="text-2xl font-bold text-indigo-700 mt-8 mb-4">
                    Contact Information
                  </h2>
                  <p>
                    If you have any questions about these Terms, please contact
                    us at:
                    <br />
                    <a
                      href="mailto:terms@kivo.com"
                      className="text-indigo-600 hover:text-indigo-700 transition-colors duration-200 font-medium"
                    >
                      terms@kivo.com
                    </a>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
