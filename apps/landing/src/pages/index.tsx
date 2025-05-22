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
        <title>Asetta - Your AI-Powered Academic Success Companion</title>
        <meta
          name="description"
          content="Asetta is a completely free AI-powered platform that helps students manage assignments, track deadlines, and stay organized throughout their academic journey."
        />
      </Head>
      <Header />

      {/* Hero Section */}
      <section className="relative pt-36 pb-24 overflow-hidden bg-gradient-to-br from-primary-50 via-primary-50 to-white">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-32 -left-32 w-[600px] h-[600px] bg-gradient-to-br from-primary-200 via-primary-100 to-transparent rounded-full blur-3xl opacity-60 animate-fade-in" />
          <div className="absolute -bottom-32 -right-32 w-[500px] h-[500px] bg-gradient-to-tr from-primary-200 via-primary-100 to-transparent rounded-full blur-3xl opacity-60 animate-fade-in-delayed" />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col lg:flex-row items-center">
            <div className="lg:w-1/2 lg:pr-12 mb-10 lg:mb-0 animate-fade-in">
              <span className="inline-block mb-4 px-4 py-2 rounded-full bg-primary-100 text-primary-700 font-semibold text-sm shadow-sm animate-fade-in-down">
                🎓 100% Free for Students
              </span>
              <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 mb-8 font-heading tracking-tight leading-tight drop-shadow-lg">
                Your Smart{" "}
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary-500 to-primary-600 animate-scale">
                  Academic Assistant
                </span>
              </h1>
              <p className="text-2xl text-gray-700 mb-10 leading-relaxed max-w-xl animate-fade-in">
                Experience the future of academic organization with AI-powered
                assessment tracking, smart deadline management, and personalized
                insights—all completely free for students.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="transform transition-transform duration-200 hover:scale-105">
                  <Link
                    href="https://kivo-two.vercel.app/register"
                    className="inline-flex items-center justify-center px-8 py-4 text-lg font-bold text-white bg-gradient-to-r from-primary-500 to-primary-600 rounded-xl shadow-lg hover:shadow-2xl hover:from-primary-600 hover:to-primary-700 transition-all duration-200 animate-fade-in"
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
                    className="inline-flex items-center justify-center px-8 py-4 text-lg font-bold text-primary-500 bg-white border-2 border-primary-200 rounded-xl shadow hover:bg-primary-50 hover:border-primary-400 transition-all duration-200 animate-fade-in"
                  >
                    See All Features
                  </Link>
                </div>
              </div>
            </div>
            <div className="lg:w-1/2 animate-fade-in-delayed flex justify-center">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-primary-500 to-primary-600 rounded-2xl transform rotate-3 scale-105 opacity-10" />
                <div className="absolute -top-6 -left-6 w-24 h-24 bg-primary-200 rounded-full blur-2xl opacity-40 animate-fade-in" />
                <div className="absolute -bottom-6 -right-6 w-20 h-20 bg-primary-200 rounded-full blur-2xl opacity-40 animate-fade-in-delayed" />
                <div className="relative z-10">
                  <Image
                    src="/images/kivo-dashboard.png"
                    alt="Asetta Dashboard Preview"
                    width={700}
                    height={400}
                    priority
                    className="rounded-2xl shadow-2xl border-4 border-white/80 hover:scale-[1.02] transition-transform duration-300"
                  />
                  <div className="absolute bottom-4 right-4 bg-white/80 px-4 py-2 rounded-lg shadow text-primary-700 font-semibold text-sm animate-fade-in-down">
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
              Smart Features for Student Success
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Everything you need to excel in your studies, powered by advanced
              AI technology.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              {
                icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2",
                title: "AI-Powered Assessment Tracking",
                description:
                  "Automatically extract and organize assignments, exams, and projects from your course documents using advanced AI technology.",
              },
              {
                icon: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z",
                title: "Smart Deadline Management",
                description:
                  "Never miss a deadline with AI-powered notifications and automated progress tracking for all your academic tasks.",
              },
              {
                icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z",
                title: "Personalized Insights",
                description:
                  "Get AI-driven analytics and recommendations to optimize your study schedule and improve your academic performance.",
              },
            ].map((feature, index) => (
              <div
                key={index}
                className="group transform transition-all duration-300 hover:-translate-y-2"
              >
                <div className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-lg transition-shadow duration-300 border border-gray-100 h-full flex flex-col">
                  <div className="w-12 h-12 bg-primary-50 rounded-xl flex items-center justify-center mb-6 group-hover:bg-primary-100 transition-colors duration-300">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6 text-primary-600"
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
                  <p className="text-gray-600 leading-relaxed flex-grow">
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
              className="inline-flex items-center justify-center px-6 py-3 text-base font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors duration-200 shadow-sm hover:shadow-md"
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
      <section className="py-24 bg-gradient-to-br from-primary-50 to-white animate-fade-in">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-6">
            Start Your Academic Success Journey Today
          </h2>
          <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
            Join thousands of students who are using Asetta's AI-powered
            platform to stay organized, meet deadlines, and achieve their
            academic goals—all completely free.
          </p>
          <div className="flex justify-center transform transition-transform duration-200 hover:scale-105">
            <Link
              href="https://kivo-two.vercel.app/register"
              className="inline-flex items-center justify-center px-8 py-4 text-lg font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors duration-200 shadow-lg hover:shadow-xl"
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
