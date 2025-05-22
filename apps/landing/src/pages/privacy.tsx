import Head from "next/head";
import Header from "../components/Header";
import Footer from "../components/Footer";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Head>
        <title>Privacy Policy - Asetta</title>
        <meta
          name="description"
          content="Privacy Policy for Asetta - Your trusted academic management platform"
        />
      </Head>
      <Header />

      <main className="flex-grow pt-32 pb-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 animate-fade-in">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Privacy Policy
            </h1>
            <p className="text-xl text-gray-600">
              Your privacy is important to us
            </p>
          </div>

          <div className="bg-white rounded-3xl p-8 md:p-12 shadow-xl animate-fade-in-delayed border border-gray-100">
            <div className="prose prose-indigo max-w-none mx-auto">
              <div className="grid gap-10 md:grid-cols-2">
                <div>
                  <h2 className="text-2xl font-bold text-primary-700 mb-4">
                    Introduction
                  </h2>
                  <p>
                    At Asetta, we take your privacy seriously. This Privacy
                    Policy explains how we collect, use, disclose, and safeguard
                    your information when you use our platform.
                  </p>
                  <h2 className="text-2xl font-bold text-primary-700 mt-8 mb-4">
                    Information We Collect
                  </h2>
                  <ul className="list-disc pl-5 text-gray-700">
                    <li>Account information (name, email, password)</li>
                    <li>Academic information (courses, assignments, grades)</li>
                    <li>Usage data and preferences</li>
                  </ul>
                  <h2 className="text-2xl font-bold text-primary-700 mt-8 mb-4">
                    How We Use Your Information
                  </h2>
                  <ul className="list-disc pl-5 text-gray-700">
                    <li>Provide and maintain our services</li>
                    <li>Improve and personalize your experience</li>
                    <li>Communicate with you about updates and changes</li>
                    <li>Ensure platform security and prevent fraud</li>
                  </ul>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-primary-700 mb-4">
                    Data Security
                  </h2>
                  <p>
                    We implement appropriate security measures to protect your
                    personal information. However, no method of transmission
                    over the Internet is 100% secure.
                  </p>
                  <h2 className="text-2xl font-bold text-primary-700 mt-8 mb-4">
                    Your Rights
                  </h2>
                  <ul className="list-disc pl-5 text-gray-700">
                    <li>Access your personal information</li>
                    <li>Correct inaccurate data</li>
                    <li>Request deletion of your data</li>
                    <li>Opt-out of communications</li>
                  </ul>
                  <h2 className="text-2xl font-bold text-primary-700 mt-8 mb-4">
                    Contact Us
                  </h2>
                  <p>
                    If you have any questions about this Privacy Policy, please
                    contact us at:
                    <br />
                    <a
                      href="mailto:videna.psalmeleazar@gmail.com"
                      className="text-primary-600 hover:text-primary-700 transition-colors duration-200 font-medium"
                    >
                      videna.psalmeleazar@gmail.com
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
