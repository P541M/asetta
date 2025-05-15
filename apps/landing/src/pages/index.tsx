import { useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/router";
import Head from "next/head";
import Link from "next/link";
import Header from "../components/Header";
import Footer from "../components/Footer";

export default function LandingPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Head>
        <title>Kivo - Simplify Your Academic Journey</title>
        <meta
          name="description"
          content="Kivo is an all-in-one platform to help students manage assignments, track deadlines, and stay organized."
        />
      </Head>
      <Header />

      {/* Hero Section */}
      <section className="relative pt-36 pb-24 overflow-hidden bg-gradient-to-br from-indigo-50 via-purple-50 to-white">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-32 -left-32 w-[600px] h-[600px] bg-gradient-to-br from-indigo-200 via-indigo-100 to-transparent rounded-full blur-3xl opacity-60 animate-fade-in" />
          <div className="absolute -bottom-32 -right-32 w-[500px] h-[500px] bg-gradient-to-tr from-purple-200 via-purple-100 to-transparent rounded-full blur-3xl opacity-60 animate-fade-in-delayed" />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col lg:flex-row items-center">
            <div className="lg:w-1/2 lg:pr-12 mb-10 lg:mb-0 animate-fade-in">
              <span className="inline-block mb-4 px-4 py-2 rounded-full bg-indigo-100 text-indigo-700 font-semibold text-sm shadow-sm animate-fade-in-down">
                🚀 New for Students
              </span>
              <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 mb-8 font-heading tracking-tight leading-tight drop-shadow-lg">
                Your Academic Journey,{" "}
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 animate-scale">
                  Simplified
                </span>
              </h1>
              <p className="text-2xl text-gray-700 mb-10 leading-relaxed max-w-xl animate-fade-in">
                Stay organized, meet deadlines, and focus on what matters
                most—your education. Kivo brings clarity and confidence to your
                student life.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="transform transition-transform duration-200 hover:scale-105">
                  <Link
                    href="https://kivo-two.vercel.app/register"
                    className="inline-flex items-center justify-center px-8 py-4 text-lg font-bold text-white bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl shadow-lg hover:shadow-2xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 animate-fade-in"
                  >
                    Get Started Free
                    <svg
                      className="w-5 h-5 ml-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 8l4 4m0 0l-4 4m4-4H3"
                      />
                    </svg>
                  </Link>
                </div>
                <div className="transform transition-transform duration-200 hover:scale-105">
                  <Link
                    href="/features"
                    className="inline-flex items-center justify-center px-8 py-4 text-lg font-bold text-indigo-600 bg-white border-2 border-indigo-200 rounded-xl shadow hover:bg-indigo-50 hover:border-indigo-400 transition-all duration-200 animate-fade-in"
                  >
                    See All Features
                  </Link>
                </div>
              </div>
            </div>
            <div className="lg:w-1/2 animate-fade-in-delayed flex justify-center">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl transform rotate-3 scale-105 opacity-10" />
                <div className="absolute -top-6 -left-6 w-24 h-24 bg-indigo-200 rounded-full blur-2xl opacity-40 animate-fade-in" />
                <div className="absolute -bottom-6 -right-6 w-20 h-20 bg-purple-200 rounded-full blur-2xl opacity-40 animate-fade-in-delayed" />
                <div className="relative z-10">
                  <Image
                    src="/images/kivo-dashboard.png"
                    alt="Kivo Dashboard Preview"
                    width={700}
                    height={400}
                    priority
                    className="rounded-2xl shadow-2xl border-4 border-white/80 hover:scale-[1.02] transition-transform duration-300"
                  />
                  <div className="absolute bottom-4 right-4 bg-white/80 px-4 py-2 rounded-lg shadow text-indigo-700 font-semibold text-sm animate-fade-in-down">
                    Preview
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20 animate-fade-in">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Everything You Need
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              A comprehensive suite of tools designed to streamline your
              academic experience.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              {
                icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2",
                title: "Assignment Tracking",
                description:
                  "Keep track of all your assignments, deadlines, and progress in one place.",
              },
              {
                icon: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z",
                title: "Calendar Integration",
                description:
                  "Sync your academic schedule with your personal calendar for seamless planning.",
              },
              {
                icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z",
                title: "Progress Analytics",
                description:
                  "Visualize your academic progress and identify areas for improvement.",
              },
            ].map((feature, index) => (
              <div
                key={index}
                className="group transform transition-all duration-300 hover:-translate-y-2"
              >
                <div className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-lg transition-shadow duration-300 border border-gray-100">
                  <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center mb-6 group-hover:bg-indigo-100 transition-colors duration-300">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6 text-indigo-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d={feature.icon}
                      />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* And More Section */}
          <div className="mt-16 text-center">
            <Link
              href="/features"
              className="inline-flex items-center justify-center px-6 py-3 text-base font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors duration-200 shadow-sm hover:shadow-md"
            >
              See All Features
              <svg
                className="w-5 h-5 ml-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 8l4 4m0 0l-4 4m4-4H3"
                />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-br from-indigo-50 to-white animate-fade-in">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-6">
            Ready to Transform Your Academic Experience?
          </h2>
          <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
            Join thousands of students who are using Kivo to stay organized and
            boost their academic performance.
          </p>
          <div className="flex justify-center transform transition-transform duration-200 hover:scale-105">
            <Link
              href="https://kivo-two.vercel.app/register"
              className="inline-flex items-center justify-center px-8 py-4 text-lg font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors duration-200 shadow-lg hover:shadow-xl"
            >
              Create Your Free Account
              <svg
                className="w-5 h-5 ml-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 8l4 4m0 0l-4 4m4-4H3"
                />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
