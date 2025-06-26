import { motion } from "framer-motion";
import Head from "next/head";
import Link from "next/link";
import Header from "../components/Header";
import Footer from "../components/Footer";

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-primary-50/20 to-white flex flex-col">
      <Head>
        <title>Pricing - Asetta</title>
        <meta
          name="description"
          content="Asetta is completely free for all students. Join us today!"
        />
      </Head>
      <Header />

      <main className="flex-grow pt-32 pb-24 relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-24 -left-24 w-96 h-96 bg-gradient-to-br from-primary-100/20 to-transparent rounded-full blur-3xl" />
          <div className="absolute -bottom-24 -right-24 w-80 h-80 bg-gradient-to-tr from-primary-100/15 to-transparent rounded-full blur-3xl" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Hero Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16 animate-fade-in"
          >
            <span className="inline-flex items-center px-4 py-2 rounded-full bg-primary-100 text-primary-700 font-semibold text-sm border border-primary-200/50 mb-6">
              <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
              100% Free for Students
            </span>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-gray-900 mb-8 font-heading tracking-tight leading-tight">
              Simple{" "}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary-600 to-primary-800">
                Pricing
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Spoiler alert: It's completely free! We believe every student deserves access to powerful academic tools without breaking the bank.
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
              <div className="absolute inset-0 bg-gradient-to-br from-primary-50/30 via-transparent to-green-50/20 opacity-50"></div>
              
              <div className="relative z-10">
                <div className="text-center mb-12">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                    className="inline-block mb-8"
                  >
                    <span className="inline-flex items-center px-6 py-3 rounded-2xl text-lg font-bold bg-gradient-to-r from-green-100 to-primary-100 text-primary-800 border border-green-200/50 shadow-md">
                      <span className="mr-3 text-2xl">🎓</span>
                      Student Special
                    </span>
                  </motion.div>
                  <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6 font-heading">
                    Hey there, fellow student! 👋
                  </h2>
                  <p className="text-xl md:text-2xl text-gray-600 mb-8 leading-relaxed">
                    We know you're already spending enough on textbooks and coffee.
                    <br className="hidden md:block" />
                    That's why Asetta is and always will be completely free!
                  </p>
                </div>

                <div className="text-center mb-12">
                  <div className="inline-flex items-baseline mb-6">
                    <span className="text-8xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-green-600 to-primary-600">$0</span>
                    <span className="text-2xl font-bold text-gray-500 ml-2">/forever</span>
                  </div>
                  <p className="text-gray-600 text-xl mb-12 max-w-2xl mx-auto leading-relaxed">
                    No hidden fees. No premium features. No catch.
                    <br />
                    Just a simple, powerful tool to help you ace your studies! 📚✨
                  </p>

                  <motion.div
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    className="inline-block"
                  >
                    <Link
                      href="https://kivo-two.vercel.app/register"
                      className="group inline-flex items-center justify-center px-10 py-5 text-xl font-bold text-white bg-gradient-to-r from-primary-600 to-primary-700 rounded-2xl hover:from-primary-700 hover:to-primary-800 transition-all duration-300 shadow-lg hover:shadow-xl"
                    >
                      Join the Student Community
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

                {/* Features Grid */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.6, delay: 0.6 }}
                  className="pt-8 border-t border-gray-200/50"
                >
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {[
                      {
                        emoji: "🎯",
                        title: "All Features Included",
                        description: "AI-powered tracking, smart notifications, and personalized insights"
                      },
                      {
                        emoji: "🚀",
                        title: "No Credit Card Required",
                        description: "Sign up instantly with just your email address"
                      },
                      {
                        emoji: "💫",
                        title: "Always Free for Students",
                        description: "No subscription fees, premium tiers, or hidden costs"
                      },
                    ].map((item, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.8 + index * 0.1 }}
                        className="group text-center p-6 rounded-2xl hover:bg-primary-50/50 transition-all duration-300"
                      >
                        <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">{item.emoji}</div>
                        <h3 className="text-xl font-bold text-gray-900 mb-3 font-heading">{item.title}</h3>
                        <p className="text-gray-600 leading-relaxed">{item.description}</p>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
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
            <div className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-2xl border border-yellow-200/50 shadow-sm">
              <span className="text-2xl mr-3">☕</span>
              <p className="text-gray-700 font-medium text-lg">
                P.S. Save your money for that extra coffee during finals week!
                <br className="hidden sm:block" />
                <span className="font-bold text-primary-600">We've got your back! 💪</span>
              </p>
            </div>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
