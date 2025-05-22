import { motion } from "framer-motion";
import Head from "next/head";
import Link from "next/link";
import Header from "../components/Header";
import Footer from "../components/Footer";

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Head>
        <title>Pricing - Asetta</title>
        <meta
          name="description"
          content="Asetta is completely free for all students. Join us today!"
        />
      </Head>
      <Header />

      <main className="flex-grow pt-32 pb-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Pricing Plans
            </h1>
            <p className="text-xl text-gray-600">
              Spoiler alert: It's free! 🎉
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-gradient-to-br from-primary-50 to-white rounded-3xl p-8 md:p-12 shadow-xl"
          >
            <div className="text-center mb-8">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="inline-block mb-6"
              >
                <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-primary-100 text-primary-800">
                  <span className="mr-2">🎓</span>
                  Student Special
                </span>
              </motion.div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Hey there, fellow student! 👋
              </h2>
              <p className="text-xl text-gray-600 mb-8">
                We know you're already spending enough on textbooks and coffee.
                <br />
                That's why Asetta is and always will be completely free!
              </p>
            </div>

            <div className="space-y-6 text-center">
              <div className="text-6xl font-bold text-primary-600 mb-4">$0</div>
              <p className="text-gray-600 text-lg mb-8">
                No hidden fees. No premium features. No catch.
                <br />
                Just a simple, powerful tool to help you ace your studies! 📚✨
              </p>

              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="inline-block"
              >
                <Link
                  href="https://kivo-two.vercel.app/register"
                  className="inline-flex items-center justify-center px-8 py-4 text-lg font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors duration-200 shadow-lg hover:shadow-xl"
                >
                  Join the Student Community
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
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="mt-12 pt-8 border-t border-gray-200"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                {[
                  {
                    emoji: "🎯",
                    text: "All features included",
                  },
                  {
                    emoji: "🚀",
                    text: "No credit card required",
                  },
                  {
                    emoji: "💫",
                    text: "Always free for students",
                  },
                ].map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.8 + index * 0.1 }}
                    className="p-4"
                  >
                    <div className="text-3xl mb-2">{item.emoji}</div>
                    <p className="text-gray-600">{item.text}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1 }}
            className="mt-12 text-center"
          >
            <p className="text-gray-500 text-sm">
              P.S. Save your money for that extra coffee during finals week! ☕
              <br />
              We've got your back! 💪
            </p>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
