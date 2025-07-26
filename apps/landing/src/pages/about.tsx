import { motion } from "framer-motion";
import Head from "next/head";
import Link from "next/link";
import Header from "../components/Header";
import Footer from "../components/Footer";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-primary-50/20 to-white flex flex-col">
      <Head>
        <title>About Us | Asetta</title>
        <meta
          name="description"
          content="Learn about Asetta's mission to support students transitioning to post-secondary independence. We're here when you need us, until you don't need us anymore."
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
          <div className="absolute -top-24 -left-24 w-96 h-96 bg-gradient-to-br from-primary-100/20 to-transparent rounded-full blur-3xl" />
          <div className="absolute -bottom-24 -right-24 w-80 h-80 bg-gradient-to-tr from-primary-100/15 to-transparent rounded-full blur-3xl" />
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Hero Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-20 animate-fade-in"
          >
            <span className="inline-flex items-center px-4 py-2 rounded-full bg-primary-100 text-primary-700 font-semibold text-sm border border-primary-200/50 mb-6">
              <span className="w-2 h-2 bg-primary-500 rounded-full mr-2 animate-pulse"></span>
              About Asetta
            </span>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-gray-900 mb-8 font-heading tracking-tight leading-tight">
              Our{" "}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary-600 to-primary-800">
                Story
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Why we built Asetta and how we're supporting students through the challenges of post-secondary life.
            </p>
          </motion.div>

          {/* Main Content Section */}
          <div className="space-y-16">
            {/* Our Mission */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 md:p-12 shadow-lg border border-gray-200/50 relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary-50/30 via-transparent to-primary-50/10 opacity-50"></div>
              
              <div className="relative z-10">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6 font-heading">
                  Our Mission
                </h2>
                <div className="prose prose-lg prose-gray max-w-none">
                  <p className="text-lg md:text-xl text-gray-700 leading-relaxed mb-6">
                    At Asetta, we believe that the transition to post-secondary education shouldn't mean losing the academic support you need. 
                    While students gain independence, they also face more complex coursework, tighter deadlines, and increased responsibility—often without the structured guidance they've always had.
                  </p>
                  <p className="text-lg md:text-xl text-gray-700 leading-relaxed mb-6">
                    We're here to bridge that gap. Asetta uses AI to help students track deadlines, organize assignments, and manage their academic workload with less effort and stress. 
                    Our intelligent system extracts assignment details from syllabi, predicts upcoming deadlines, and provides personalized insights.
                  </p>
                  <p className="text-lg md:text-xl text-gray-700 leading-relaxed">
                    <strong className="text-primary-600">We're here when you need us, until you don't need us anymore.</strong>
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Meet the Founder */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 md:p-12 shadow-lg border border-gray-200/50 relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-gray-50/30 via-transparent to-gray-50/10 opacity-50"></div>
              
              <div className="relative z-10 text-center">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6 font-heading">
                  Meet Our Founder
                </h2>
                <div className="max-w-2xl mx-auto">
                  <p className="text-lg md:text-xl text-gray-700 leading-relaxed mb-6">
                    Asetta was created by Eleazar, a student who experienced firsthand the overwhelming transition to post-secondary life. 
                    After struggling with academic organization during his first year, he built Asetta as the support system he wished he had.
                  </p>
                  <p className="text-lg md:text-xl text-gray-700 leading-relaxed mb-6">
                    Today, as a 4th-year student, Eleazar still uses Asetta daily and continues to develop features based on real student needs and challenges.
                  </p>
                  <Link
                    href="/founders-note"
                    className="inline-flex items-center text-primary-600 hover:text-primary-700 font-semibold"
                  >
                    Read Eleazar's full story
                    <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>
              </div>
            </motion.div>

            {/* Our Commitment */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.9 }}
              className="bg-gradient-to-br from-primary-50 to-primary-25 rounded-3xl p-8 md:p-12 shadow-lg border border-primary-200/50 relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary-100/20 via-transparent to-primary-100/10"></div>
              
              <div className="relative z-10 text-center">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6 font-heading">
                  Our Promise to Students
                </h2>
                <p className="text-lg md:text-xl text-gray-700 leading-relaxed mb-8 max-w-2xl mx-auto">
                  We're here to support you through the challenges of post-secondary life, whether that's your first semester 
                  or your final year. You don't have to navigate academic complexity alone.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <div className="bg-white/60 backdrop-blur-sm p-6 rounded-2xl">
                    <h3 className="text-xl font-bold text-gray-900 mb-3 font-heading">
                      Always Free
                    </h3>
                    <p className="text-gray-700">
                      Because every student deserves academic support throughout their post-secondary journey, regardless of their financial situation.
                    </p>
                  </div>
                  <div className="bg-white/60 backdrop-blur-sm p-6 rounded-2xl">
                    <h3 className="text-xl font-bold text-gray-900 mb-3 font-heading">
                      Student-Centered
                    </h3>
                    <p className="text-gray-700">
                      Built by students who understand the challenges, designed to support your academic success however you choose to use it.
                    </p>
                  </div>
                </div>

                <motion.div
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  className="inline-block"
                >
                  <Link
                    href="https://asetta.me/register"
                    className="group inline-flex items-center justify-center px-10 py-5 text-xl font-bold text-white bg-gradient-to-r from-primary-600 to-primary-700 rounded-2xl hover:from-primary-700 hover:to-primary-800 transition-all duration-300 shadow-lg hover:shadow-xl"
                  >
                    Get Organized Today
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