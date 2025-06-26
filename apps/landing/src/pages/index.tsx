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
          <div className="absolute -top-32 -left-32 w-[600px] h-[600px] bg-gradient-to-br from-primary-200 via-primary-100 to-transparent rounded-full blur-3xl opacity-60 animate-float" />
          <div className="absolute -bottom-32 -right-32 w-[500px] h-[500px] bg-gradient-to-tr from-primary-200 via-primary-100 to-transparent rounded-full blur-3xl opacity-60 animate-float" style={{animationDelay: '1s'}} />
          <div className="absolute top-1/2 left-1/4 w-[300px] h-[300px] bg-gradient-to-br from-primary-100 via-primary-50 to-transparent rounded-full blur-2xl opacity-40 animate-pulse" />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col lg:flex-row items-center">
            <div className="lg:w-1/2 lg:pr-12 mb-10 lg:mb-0 animate-fade-in-left">
              <span className="inline-block mb-6 px-5 py-3 rounded-full bg-gradient-to-r from-primary-100 to-primary-50 text-primary-700 font-semibold text-sm shadow-lg border border-primary-200/50 backdrop-blur-sm animate-fade-in-down hover:scale-105 transition-transform duration-300">
                🎓 100% Free for Students
              </span>
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold text-gray-900 mb-8 font-heading tracking-tight leading-[1.1] drop-shadow-lg">
                Your Smart{" "}
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary-500 via-primary-600 to-primary-700 animate-gradient-x animate-scale">
                  Academic Assistant
                </span>
              </h1>
              <p className="text-xl md:text-2xl text-gray-700 mb-12 leading-relaxed max-w-2xl animate-fade-in-up font-medium">
                Experience the future of academic organization with AI-powered
                assessment tracking, smart deadline management, and personalized
                insights—all completely free for students.
              </p>
              <div className="flex flex-col sm:flex-row gap-6 animate-fade-in-up">
                <div className="group transform transition-all duration-300 hover:scale-105 hover:-translate-y-1">
                  <Link
                    href="https://kivo-two.vercel.app/register"
                    className="inline-flex items-center justify-center px-10 py-5 text-lg font-bold text-white bg-gradient-to-r from-primary-500 via-primary-600 to-primary-700 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 relative overflow-hidden animate-scale-delayed"
                  >
                    <span className="absolute inset-0 bg-gradient-to-r from-primary-600 via-primary-700 to-primary-800 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                    <span className="relative z-10">Get Started Free</span>
                    <svg
                      className="w-5 h-5 ml-3 group-hover:translate-x-1 transition-transform duration-300 relative z-10"
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
                <div className="group transform transition-all duration-300 hover:scale-105 hover:-translate-y-1">
                  <Link
                    href="/features"
                    className="inline-flex items-center justify-center px-10 py-5 text-lg font-bold text-primary-600 bg-white/80 backdrop-blur-sm border-2 border-primary-200 rounded-2xl shadow-lg hover:bg-white hover:border-primary-400 hover:shadow-xl transition-all duration-300 animate-scale-delayed"
                  >
                    <span className="group-hover:scale-110 transition-transform duration-300">See All Features</span>
                  </Link>
                </div>
              </div>
            </div>
            <div className="lg:w-1/2 animate-fade-in-right flex justify-center">
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-primary-500 to-primary-600 rounded-3xl transform rotate-2 scale-105 opacity-20 group-hover:rotate-1 group-hover:scale-110 transition-all duration-500" />
                <div className="absolute -top-8 -left-8 w-32 h-32 bg-gradient-to-r from-primary-300 to-primary-200 rounded-full blur-2xl opacity-50 animate-float" />
                <div className="absolute -bottom-8 -right-8 w-24 h-24 bg-gradient-to-r from-primary-200 to-primary-100 rounded-full blur-2xl opacity-50 animate-float" style={{animationDelay: '1.5s'}} />
                <div className="absolute top-1/4 -right-4 w-16 h-16 bg-gradient-to-r from-primary-100 to-primary-50 rounded-full blur-xl opacity-60 animate-pulse" />
                <div className="relative z-10 group-hover:scale-[1.03] transition-transform duration-500">
                  <Image
                    src="/images/kivo-dashboard.png"
                    alt="Asetta Dashboard Preview"
                    width={700}
                    height={400}
                    priority
                    className="rounded-3xl shadow-2xl border-4 border-white/90 backdrop-blur-sm"
                  />
                  <div className="absolute bottom-6 right-6 bg-white/90 backdrop-blur-md px-5 py-3 rounded-xl shadow-lg text-primary-700 font-bold text-sm border border-white/50 animate-bounce">
                    ✨ Live Preview
                  </div>
                  <div className="absolute top-6 left-6 bg-green-500/90 backdrop-blur-md px-3 py-1.5 rounded-full shadow-lg text-white font-semibold text-xs animate-pulse">
                    • LIVE
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-32 bg-gradient-to-b from-white via-gray-50/50 to-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary-50/30 via-transparent to-transparent"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-24 animate-fade-in-up">
            <span className="inline-block mb-4 px-4 py-2 rounded-full bg-gradient-to-r from-primary-100 to-primary-50 text-primary-700 font-semibold text-sm shadow-md border border-primary-200/50">
              ⚡ Powered by AI
            </span>
            <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-6 font-heading tracking-tight">
              Smart Features for{" "}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary-600 to-primary-700">
                Student Success
              </span>
            </h2>
            <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
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
                className={`group transform transition-all duration-500 hover:-translate-y-3 hover:scale-105 animate-fade-in-up`}
                style={{animationDelay: `${index * 0.2}s`}}
              >
                <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 border border-gray-200/50 hover:border-primary-200 h-full flex flex-col relative overflow-hidden group-hover:bg-white">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary-50/30 via-transparent to-primary-50/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <div className="relative z-10">
                    <div className="w-16 h-16 bg-gradient-to-br from-primary-100 to-primary-50 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-gradient-to-br group-hover:from-primary-200 group-hover:to-primary-100 transition-all duration-300 shadow-md">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-8 w-8 text-primary-600 group-hover:text-primary-700 transition-colors duration-300"
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
                    <h3 className="text-2xl font-bold text-gray-900 mb-4 group-hover:text-primary-900 transition-colors duration-300">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600 leading-relaxed flex-grow text-lg group-hover:text-gray-700 transition-colors duration-300">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* And More Section */}
          <div className="mt-20 text-center animate-fade-in-up">
            <div className="group transform transition-all duration-300 hover:scale-105 hover:-translate-y-1 inline-block">
              <Link
                href="/features"
                className="inline-flex items-center justify-center px-8 py-4 text-lg font-bold text-white bg-gradient-to-r from-primary-600 to-primary-700 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 relative overflow-hidden"
              >
                <span className="absolute inset-0 bg-gradient-to-r from-primary-700 to-primary-800 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                <span className="relative z-10">See All Features</span>
                <svg
                  className="w-5 h-5 ml-3 group-hover:translate-x-1 transition-transform duration-300 relative z-10"
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
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 bg-gradient-to-br from-primary-50 via-primary-25 to-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary-100/40 via-transparent to-transparent"></div>
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-gradient-to-br from-primary-200 to-primary-100 rounded-full blur-3xl opacity-30 animate-float"></div>
        <div className="absolute -bottom-24 -right-24 w-80 h-80 bg-gradient-to-br from-primary-150 to-primary-50 rounded-full blur-3xl opacity-40 animate-float" style={{animationDelay: '2s'}}></div>
        
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="animate-fade-in-up">
            <span className="inline-block mb-6 px-6 py-3 rounded-full bg-gradient-to-r from-primary-100 to-primary-50 text-primary-700 font-bold text-sm shadow-lg border border-primary-200/50 backdrop-blur-sm">
              🚀 Ready to Excel?
            </span>
            <h2 className="text-5xl md:text-6xl font-extrabold text-gray-900 mb-8 font-heading tracking-tight leading-tight">
              Start Your{" "}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary-600 via-primary-700 to-primary-800 animate-gradient-x">
                Academic Success
              </span>{" "}
              Journey Today
            </h2>
            <p className="text-xl md:text-2xl text-gray-700 mb-12 max-w-4xl mx-auto leading-relaxed font-medium">
              Join thousands of students who are using Asetta's AI-powered
              platform to stay organized, meet deadlines, and achieve their
              academic goals—all completely free.
            </p>
            <div className="flex justify-center group transform transition-all duration-300 hover:scale-105 hover:-translate-y-2">
              <Link
                href="https://kivo-two.vercel.app/register"
                className="inline-flex items-center justify-center px-12 py-6 text-xl font-bold text-white bg-gradient-to-r from-primary-600 via-primary-700 to-primary-800 rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-300 relative overflow-hidden animate-scale-delayed"
              >
                <span className="absolute inset-0 bg-gradient-to-r from-primary-700 via-primary-800 to-primary-900 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                <span className="relative z-10">Create Your Free Account</span>
                <svg
                  className="w-6 h-6 ml-4 group-hover:translate-x-2 transition-transform duration-300 relative z-10"
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
            <p className="mt-8 text-sm text-gray-500 font-medium">
              No credit card required • Forever free for students • Setup in under 2 minutes
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
