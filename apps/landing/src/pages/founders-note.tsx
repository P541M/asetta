import { motion } from "framer-motion";
import Head from "next/head";
import Link from "next/link";
import Header from "../components/Header";
import Footer from "../components/Footer";

export default function FoundersNotePage() {
  return (
    <div className="min-h-screen bg-gray-50/20 flex flex-col">
      <Head>
        <title>A Note from Our Founder | Asetta</title>
        <meta
          name="description"
          content="A personal message from Eleazar, founder of Asetta, about his journey from struggling first-year student to creating an AI-powered academic management platform."
        />
      </Head>
      <Header />

      <main
        className="flex-grow pb-24 relative overflow-hidden"
        style={{
          paddingTop: `max(8rem, calc(8rem + env(safe-area-inset-top)))`,
        }}
      >
        {/* Background Elements */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-24 -left-24 w-96 h-96 bg-gray-100/30 rounded-full blur-3xl" />
          <div className="absolute -bottom-24 -right-24 w-80 h-80 bg-gray-100/20 rounded-full blur-3xl" />
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Hero Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-20 animate-fade-in"
          >
            <span className="inline-flex items-center px-4 py-2 rounded-full bg-gray-100 text-gray-700 font-semibold text-sm border border-gray-200/50 mb-6">
              <span className="w-2 h-2 bg-primary-500 rounded-full mr-2"></span>
              From the Founder
            </span>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-gray-900 mb-8 font-heading tracking-tight leading-tight">
              A Personal{" "}
              <span className="text-gray-700">
                Note
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              The story of a struggling first-year student who built the
              academic support system he wished he had.
            </p>
          </motion.div>

          {/* Main Content */}
          <div className="space-y-16">
            {/* Personal Story */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative"
            >
              <div className="bg-gray-50 rounded-3xl p-8 md:p-12 shadow-lg border border-gray-200/50 relative overflow-hidden">
                {/* Decorative quote element */}
                <div className="absolute top-8 left-8 w-12 h-12 opacity-10">
                  <svg
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="text-gray-600"
                  >
                    <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h4v10h-10z" />
                  </svg>
                </div>

                <div className="relative z-10">
                  <div className="max-w-3xl mx-auto">
                    <div className="prose prose-lg max-w-none">
                      <p className="text-lg md:text-xl text-gray-700 leading-relaxed mb-8 italic font-medium">
                        "I was completely overwhelmed in my first year—going from structured high school to managing complex course loads and deadlines felt impossible."
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* The Struggle */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 md:p-12 shadow-lg border border-gray-200/50 relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-orange-50/30 opacity-50"></div>

              <div className="relative z-10">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6 font-heading">
                  The Problem
                </h2>
                <div className="prose prose-lg prose-gray max-w-none">
                  <p className="text-lg md:text-xl text-gray-700 leading-relaxed">
                    Despite being successful in high school, I was constantly stressed about missing assignments and deadlines. I wasn't alone—most of my friends were struggling with the same transition from structured support to complete academic independence. <strong className="text-orange-600">We had the intelligence to succeed, but lacked the organizational systems to handle this new level of independence.</strong>
                  </p>
                </div>
              </div>
            </motion.div>

            {/* The Solution */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 md:p-12 shadow-lg border border-gray-200/50 relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-blue-50/30 opacity-50"></div>

              <div className="relative z-10">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6 font-heading">
                  Building Asetta
                </h2>
                <div className="prose prose-lg prose-gray max-w-none">
                  <p className="text-lg md:text-xl text-gray-700 leading-relaxed mb-6">
                    As a software engineering student, I realized technology could bridge the gap between high school's structured support and post-secondary independence. <strong className="text-blue-600">So I built Asetta—not as a business opportunity, but as the solution I desperately needed.</strong>
                  </p>

                  <p className="text-lg md:text-xl text-gray-700 leading-relaxed">
                    I wanted a system that could automatically extract important dates from syllabi, organize academic life intelligently, and provide the support I wished I'd had during that overwhelming first year. Most importantly, I remembered that feeling of stress and knew financial barriers shouldn't prevent students from getting help. <strong className="text-green-600">That's why Asetta will always remain completely free for students.</strong>
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Personal Reflection */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1.0 }}
              className="bg-gray-50 rounded-3xl p-8 md:p-12 shadow-lg border border-gray-200/50 relative overflow-hidden"
            >
              <div className="relative z-10">
                <div className="max-w-3xl mx-auto text-center">
                  <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8 font-heading">
                    Today
                  </h2>

                  <div className="prose prose-lg max-w-none">
                    <p className="text-lg md:text-xl text-gray-700 leading-relaxed mb-8">
                      I'm now in my fourth year and still use Asetta daily to manage my course load and deadlines. Every feature comes from something I've needed or heard other students ask for. If my first-year struggles can help even one student feel more in control of their academic journey, every hour building this was worth it.
                    </p>
                  </div>

                  <div className="pt-6 border-t border-gray-300/50">
                    <p className="text-xl font-bold text-gray-700 mb-2">
                      — Eleazar
                    </p>
                    <p className="text-gray-600 mb-1">Founder & Student</p>
                    <p className="text-sm text-gray-500">
                      4th Year Software Engineering, University of Guelph
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Call to Action */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1.2 }}
              className="bg-primary-50 rounded-3xl p-8 md:p-12 shadow-lg border border-primary-200/50 relative overflow-hidden text-center"
            >
              <div className="absolute inset-0 bg-primary-100/20"></div>

              <div className="relative z-10">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6 font-heading">
                  Ready to Get Organized?
                </h2>
                <p className="text-lg md:text-xl text-gray-700 leading-relaxed mb-8 max-w-2xl mx-auto">
                  Join thousands of students who have transformed their academic
                  organization with Asetta. It's completely free, and it might
                  just change how you experience post-secondary life.
                </p>

                <motion.div
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  className="inline-block"
                >
                  <Link
                    href="https://asetta.me/register"
                    className="group inline-flex items-center justify-center px-10 py-5 text-xl font-bold text-white bg-primary-600 rounded-2xl hover:bg-primary-700 transition-all duration-300 shadow-lg hover:shadow-xl"
                  >
                    Start Your Journey
                    <svg
                      className="w-6 h-6 ml-3 group-hover:translate-x-1 transition-transform duration-300"
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
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
