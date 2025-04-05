// src/pages/terms.tsx
import { NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import Header from "../components/Header";

const Terms: NextPage = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Head>
        <title>Kivo - Terms of Service</title>
        <meta
          name="description"
          content="Review Kivo's Terms of Service to understand the rules and guidelines for using our platform."
        />
      </Head>

      <Header />

      <main className="flex-grow pt-10 pb-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">
              Terms of Service
            </h1>

            <div className="prose prose-indigo max-w-none">
              <p className="text-gray-700 mb-6">Last Updated: March 10, 2025</p>

              <h2 className="text-xl font-semibold mt-8 mb-4">
                1. Acceptance of Terms
              </h2>
              <p>
                Welcome to Kivo. By accessing or using our service, you agree to
                be bound by these Terms of Service. If you disagree with any
                part of the terms, you may not access the service.
              </p>

              <h2 className="text-xl font-semibold mt-8 mb-4">
                2. Description of Service
              </h2>
              <p>
                Kivo provides a platform for students to organize their
                coursework, track assignments, and manage academic deadlines.
                The service may include features such as file uploads,
                assignment tracking, and notifications.
              </p>

              <h2 className="text-xl font-semibold mt-8 mb-4">
                3. User Accounts
              </h2>
              <p>
                To use certain features of our service, you may need to create
                an account. You are responsible for safeguarding your account
                information and for all activities that occur under your
                account.
              </p>
              <p>
                You agree to provide accurate, current, and complete information
                during the registration process and to update such information
                to keep it accurate, current, and complete.
              </p>

              <h2 className="text-xl font-semibold mt-8 mb-4">
                4. User Content
              </h2>
              <p>
                Our service allows you to upload, submit, store, and share
                content, including text and files. You retain all rights to your
                content, but you grant us a license to use, copy, modify, and
                display it in connection with the service.
              </p>
              <p>
                You are solely responsible for the content you upload and share
                through our service.
              </p>

              <h2 className="text-xl font-semibold mt-8 mb-4">
                5. Prohibited Uses
              </h2>
              <p>You agree not to use the service:</p>
              <ul className="list-disc pl-6 my-4 space-y-2">
                <li>
                  For any unlawful purpose or to promote illegal activities
                </li>
                <li>
                  To infringe upon or violate the intellectual property rights
                  of others
                </li>
                <li>To harass, abuse, or harm another person</li>
                <li>To upload invalid data, viruses, or harmful code</li>
                <li>
                  To interfere with or disrupt the service or servers connected
                  to the service
                </li>
              </ul>

              <h2 className="text-xl font-semibold mt-8 mb-4">
                6. Intellectual Property
              </h2>
              <p>
                The service and its original content, features, and
                functionality are owned by Kivo and are protected by
                international copyright, trademark, and other intellectual
                property laws.
              </p>

              <h2 className="text-xl font-semibold mt-8 mb-4">
                7. Termination
              </h2>
              <p>
                We may terminate or suspend your account and access to the
                service immediately, without prior notice or liability, for any
                reason, including without limitation if you breach the Terms.
              </p>

              <h2 className="text-xl font-semibold mt-8 mb-4">
                8. Limitation of Liability
              </h2>
              <p>
                In no event shall Kivo, its directors, employees, partners,
                agents, suppliers, or affiliates be liable for any indirect,
                incidental, special, consequential, or punitive damages,
                including without limitation, loss of profits, data, use,
                goodwill, or other intangible losses, resulting from your access
                to or use of or inability to access or use the service.
              </p>

              <h2 className="text-xl font-semibold mt-8 mb-4">
                9. Changes to Terms
              </h2>
              <p>
                We reserve the right to modify or replace these terms at any
                time. If a revision is material, we will provide at least 30
                days' notice prior to any new terms taking effect. What
                constitutes a material change will be determined at our sole
                discretion.
              </p>

              <h2 className="text-xl font-semibold mt-8 mb-4">
                10. Contact Us
              </h2>
              <p>
                If you have any questions about these Terms, please contact us
                at:
              </p>
              <p>
                <a
                  href="mailto:videna.psalmeleazar@gmail.com"
                  className="text-indigo-600 hover:text-indigo-800"
                >
                  videna.psalmeleazar@gmail.com
                </a>
              </p>
            </div>

            <div className="mt-10 pt-6 border-t border-gray-100">
              <Link
                href="/"
                className="text-indigo-600 hover:text-indigo-800 font-medium"
              >
                ← Back to Home
              </Link>
            </div>
          </div>
        </div>
      </main>

      <footer className="bg-white border-t border-gray-100 py-4 text-center text-sm text-gray-500">
        <div className="max-w-7xl mx-auto px-4">
          <p>© {new Date().getFullYear()} Kivo. All rights reserved.</p>
          <div className="mt-2">
            <Link
              href="/terms"
              className="text-indigo-600 hover:text-indigo-800 mr-4"
            >
              Terms of Service
            </Link>
            <Link
              href="/privacy"
              className="text-indigo-600 hover:text-indigo-800"
            >
              Privacy Policy
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Terms;
