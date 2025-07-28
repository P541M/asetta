import { motion } from "framer-motion";
import Head from "next/head";
import Link from "next/link";
import Header from "../components/Header";
import Footer from "../components/Footer";

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-primary-50/20 to-white flex flex-col">
      <Head>
        <title>Pricing | Asetta</title>
        <meta
          name="description"
          content="100% Free for Students! Comprehensive academic organization tools with no hidden fees. Semester management, grade tracking, and deadline organization."
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

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Hero Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-20 animate-fade-in"
          >
            <span className="inline-flex items-center px-4 py-2 rounded-full bg-primary-100 text-primary-700 font-semibold text-sm border border-primary-200/50 mb-6">
              <span className="w-2 h-2 bg-primary-500 rounded-full mr-2 animate-pulse"></span>
              100% Free for Students
            </span>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-gray-900 mb-8 font-heading tracking-tight leading-tight">
              Simple{" "}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary-600 to-primary-800">
                Pricing
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              We believe every student deserves access to powerful academic tools without breaking the bank. That's why Asetta is and always will be completely free.
            </p>
          </motion.div>

          {/* Pricing Card */}
          <div className="animate-fade-in-up">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 md:p-12 shadow-xl border border-gray-200/50 max-w-4xl mx-auto relative overflow-hidden"
            >
              {/* Decorative Elements */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary-50/30 via-transparent to-primary-50/20 opacity-50"></div>

              <div className="relative z-10">
                <div className="text-center mb-12">
                  <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6 font-heading">
                    Academic Success, Zero Cost
                  </h2>
                  <p className="text-xl md:text-2xl text-gray-600 mb-8 leading-relaxed max-w-2xl mx-auto">
                    Focus on your studies while we handle the organization. No subscriptions, no premium features, no catch.
                  </p>
                </div>

                <div className="text-center mb-8">
                  <div className="inline-flex items-baseline">
                    <span className="text-8xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-primary-600 to-primary-700">
                      $0
                    </span>
                    <span className="text-2xl font-bold text-gray-500 ml-2">
                      /forever
                    </span>
                  </div>
                </div>

                <div className="text-center mb-12">
                  <motion.div
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    className="inline-block"
                  >
                    <Link
                      href="https://asetta.me/register"
                      className="group inline-flex items-center justify-center px-10 py-5 text-xl font-bold text-white bg-gradient-to-r from-primary-600 to-primary-700 rounded-2xl hover:from-primary-700 hover:to-primary-800 transition-all duration-300 shadow-lg hover:shadow-xl"
                    >
                      Get Started Free
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

                {/* Benefits */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-8 border-t border-gray-200/50">
                  {[
                    {
                      title: "All Features Included",
                      description: "Access to every feature including AI-powered tools, grade calculator, and calendar system"
                    },
                    {
                      title: "No Credit Card Required",
                      description: "Sign up instantly with just your email address and start organizing immediately"
                    },
                    {
                      title: "Always Free for Students",
                      description: "Our commitment to students means no subscription fees or hidden costs, ever"
                    }
                  ].map((item, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: 0.6 + index * 0.1 }}
                      className="text-center p-6 rounded-2xl hover:bg-primary-50/50 transition-all duration-300"
                    >
                      <h3 className="text-xl font-bold text-gray-900 mb-3 font-heading">
                        {item.title}
                      </h3>
                      <p className="text-gray-600 leading-relaxed">
                        {item.description}
                      </p>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>

          {/* Bottom Message */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1 }}
            className="mt-16 text-center animate-fade-in-up"
          >
            <div className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-primary-50 to-primary-25 rounded-2xl border border-primary-200/50 shadow-sm">
              <p className="text-gray-700 font-medium text-lg">
                Save your money for textbooks and coffee.
                <br className="hidden sm:block" />
                <span className="font-bold text-primary-600">
                  We've got your academic organization covered.
                </span>
              </p>
            </div>
          </motion.div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
