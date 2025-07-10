// src/pages/privacy.tsx
import { NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import Header from "../components/layout/Header";

const Privacy: NextPage = () => {
  return (
    <div className="min-h-screen flex flex-col bg-light-bg-secondary dark:bg-dark-bg-primary">
      <Head>
        <title>Asetta - Privacy Policy</title>
        <meta
          name="description"
          content="Read Asetta's Privacy Policy to understand how we collect, use, and protect your information."
        />
      </Head>

      <Header />

      <main className="flex-grow pt-10 pb-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-light-bg-primary dark:bg-dark-bg-secondary rounded-lg shadow-sm border border-light-border-primary dark:border-dark-border-primary p-8">
            <h1 className="text-3xl font-bold text-light-text-primary dark:text-dark-text-primary mb-6">
              Privacy Policy
            </h1>

            <div className="prose prose-primary max-w-none">
              <p className="text-light-text-secondary dark:text-dark-text-secondary mb-6">Last Updated: April 19, 2025</p>

              <p className="mb-6">
                At Asetta, we take your privacy seriously. This Privacy Policy
                explains how we collect, use, disclose, and safeguard your
                information when you use our service.
              </p>

              <h2 className="text-xl font-semibold mt-8 mb-4">
                1. Information We Collect
              </h2>
              <p>
                We collect information that you provide directly to us when you:
              </p>
              <ul className="list-disc pl-6 my-4 space-y-2">
                <li>Create an account</li>
                <li>Upload course outlines or other documents</li>
                <li>Create and manage semesters and assessments</li>
                <li>Contact us or provide feedback</li>
              </ul>
              <p>This information may include:</p>
              <ul className="list-disc pl-6 my-4 space-y-2">
                <li>
                  Personal information such as your name and email address
                </li>
                <li>
                  Academic information such as course names, assignments, and
                  due dates
                </li>
                <li>Content of documents you upload</li>
                <li>Usage data such as how you interact with our service</li>
              </ul>

              <h2 className="text-xl font-semibold mt-8 mb-4">
                1.1 Course Outlines and Academic Content
              </h2>
              <p>When you upload course outlines or other academic content:</p>
              <ul className="list-disc pl-6 my-4 space-y-2">
                <li>
                  We store the content solely for the purpose of providing you
                  with access to your academic materials
                </li>
                <li>
                  We do not claim ownership of any uploaded course materials
                </li>
                <li>
                  The original creators (professors or educational institutions)
                  retain all rights to the content
                </li>
                <li>
                  We process and store this content in accordance with academic
                  fair use guidelines
                </li>
                <li>
                  You are responsible for ensuring you have the right to upload
                  and share such content
                </li>
              </ul>
              <p>
                By using our service to store course outlines, you acknowledge
                that you understand and agree to these terms regarding the
                handling of academic content.
              </p>

              <h2 className="text-xl font-semibold mt-8 mb-4">
                2. How We Use Your Information
              </h2>
              <p>We use the information we collect to:</p>
              <ul className="list-disc pl-6 my-4 space-y-2">
                <li>Provide, maintain, and improve our service</li>
                <li>Process and extract information from uploaded documents</li>
                <li>Send notifications about upcoming deadlines</li>
                <li>Respond to your comments, questions, and requests</li>
                <li>
                  Monitor and analyze trends, usage, and activities in
                  connection with our service
                </li>
                <li>Detect, investigate, and prevent security incidents</li>
              </ul>

              <h2 className="text-xl font-semibold mt-8 mb-4">
                3. Sharing of Information
              </h2>
              <p>
                We do not share your personal information with third parties
                except in the following circumstances:
              </p>
              <ul className="list-disc pl-6 my-4 space-y-2">
                <li>With your consent</li>
                <li>
                  With service providers who need access to perform services on
                  our behalf
                </li>
                <li>To comply with legal obligations</li>
                <li>
                  To protect the rights, property, or safety of Asetta, our
                  users, or others
                </li>
              </ul>

              <h2 className="text-xl font-semibold mt-8 mb-4">
                4. Data Security
              </h2>
              <p>
                We use reasonable measures to help protect your personal
                information from loss, theft, misuse, unauthorized access,
                disclosure, alteration, and destruction. However, no data
                transmission over the Internet or storage system can be
                guaranteed to be 100% secure.
              </p>

              <h2 className="text-xl font-semibold mt-8 mb-4">
                5. Your Choices
              </h2>
              <p>
                You can access, update, or delete your account information at
                any time through your account settings. You may also contact us
                directly to request data deletion.
              </p>

              <h2 className="text-xl font-semibold mt-8 mb-4">
                6. Children&apos;s Privacy
              </h2>
              <p>
                Our service is not directed to children under the age of 13, and
                we do not knowingly collect personal information from children
                under 13. If we learn that we have collected personal
                information from a child under 13, we will promptly delete that
                information.
              </p>

              <h2 className="text-xl font-semibold mt-8 mb-4">
                7. International Data Transfers
              </h2>
              <p>
                Your information may be transferred to, and maintained on,
                computers located outside of your state, province, country, or
                other governmental jurisdiction where the data protection laws
                may differ from those in your jurisdiction.
              </p>

              <h2 className="text-xl font-semibold mt-8 mb-4">
                8. Changes to This Privacy Policy
              </h2>
              <p>
                We may update our Privacy Policy from time to time. We will
                notify you of any changes by posting the new Privacy Policy on
                this page and updating the &ldquo;Last Updated&rdquo; date.
              </p>

              <h2 className="text-xl font-semibold mt-8 mb-4">9. Contact Us</h2>
              <p>
                If you have any questions about this Privacy Policy, please
                contact us at:
              </p>
              <p>
                <a
                  href="mailto:videna.psalmeleazar@gmail.com"
                  className="text-primary-500 hover:text-primary-600"
                >
                  videna.psalmeleazar@gmail.com
                </a>
              </p>
            </div>

            <div className="mt-10 pt-6 border-t border-gray-100">
              <Link
                href="/"
                className="text-primary-500 hover:text-primary-600 font-medium"
              >
                ← Back to Home
              </Link>
            </div>
          </div>
        </div>
      </main>

      <footer className="bg-white border-t border-gray-100 py-4 text-center text-sm text-gray-500">
        <div className="max-w-7xl mx-auto px-4">
          <p>© {new Date().getFullYear()} Asetta. All rights reserved.</p>
          <div className="mt-2">
            <Link
              href="/terms"
              className="text-primary-500 hover:text-primary-600 mr-4"
            >
              Terms of Service
            </Link>
            <Link
              href="/privacy"
              className="text-primary-500 hover:text-primary-600"
            >
              Privacy Policy
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Privacy;
