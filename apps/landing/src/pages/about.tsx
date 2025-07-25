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

          {/* Main Story Section */}
          <div className="space-y-16">
            {/* The Transition */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 md:p-12 shadow-lg border border-gray-200/50 relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary-50/30 via-transparent to-primary-50/10 opacity-50"></div>
              
              <div className="relative z-10">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6 font-heading">
                  The Educational Journey
                </h2>
                <div className="prose prose-lg prose-gray max-w-none">
                  <p className="text-lg md:text-xl text-gray-700 leading-relaxed mb-6">
                    From elementary school through high school, our entire educational journey was guided. Teachers told us exactly when assignments were due, 
                    what to study, and how to manage our time. Parents, counselors, and the system itself provided structure at every step.
                  </p>
                  <p className="text-lg md:text-xl text-gray-700 leading-relaxed mb-6">
                    Then post-secondary education arrives—university, college, trade school—and suddenly that structure disappears. 
                    No more daily check-ins. No more guided schedules. You're expected to independently manage complex coursework, deadlines, and academic goals.
                  </p>
                  <p className="text-lg md:text-xl text-gray-700 leading-relaxed">
                    <strong className="text-primary-600">But why should support vanish right when the academic challenges become most demanding?</strong>
                  </p>
                </div>
              </div>
            </motion.div>

            {/* The Problem */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 md:p-12 shadow-lg border border-gray-200/50 relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-orange-50/30 via-transparent to-orange-50/10 opacity-50"></div>
              
              <div className="relative z-10">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6 font-heading">
                  The Independence Challenge
                </h2>
                <div className="prose prose-lg prose-gray max-w-none">
                  <p className="text-lg md:text-xl text-gray-700 leading-relaxed mb-6">
                    Post-secondary life is overwhelming. New environments, new freedoms, increased responsibility—and suddenly you're 
                    expected to independently track multiple courses, assignments, and deadlines without the support systems you've always had.
                  </p>
                  <p className="text-lg md:text-xl text-gray-700 leading-relaxed mb-6">
                    Many students, like myself when I started, struggle with this transition. There are countless new adjustments: 
                    managing complex schedules, understanding different course structures, balancing academic and personal responsibilities, 
                    all while trying to build the organizational skills that were never explicitly taught.
                  </p>
                  <p className="text-lg md:text-xl text-gray-700 leading-relaxed">
                    <strong className="text-orange-600">When life gets overwhelming, even the most motivated students can struggle to stay organized.</strong>
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
              <div className="absolute inset-0 bg-gradient-to-br from-green-50/30 via-transparent to-green-50/10 opacity-50"></div>
              
              <div className="relative z-10">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6 font-heading">
                  Our Approach
                </h2>
                <div className="prose prose-lg prose-gray max-w-none">
                  <p className="text-lg md:text-xl text-gray-700 leading-relaxed mb-6">
                    That's where Asetta comes in. We're here to help you navigate the crazy transition to post-secondary life 
                    and stay organized through the challenges that come with academic independence.
                  </p>
                  <p className="text-lg md:text-xl text-gray-700 leading-relaxed mb-6">
                    Asetta uses AI to help you track deadlines, organize assignments, and manage your academic workload with less effort and stress. 
                    Our intelligent system can extract assignment details from your syllabi, predict upcoming deadlines, and provide personalized insights—so you can focus 
                    on learning and enjoying your post-secondary experience. Whether you're a first-year finding your footing or 
                    a senior managing complex coursework, we're here to support your academic success.
                  </p>
                  <p className="text-lg md:text-xl text-gray-700 leading-relaxed">
                    <strong className="text-green-600">We're always available when academic life gets overwhelming, helping you stay organized and in control.</strong>
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Personal Message */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.7 }}
              className="relative"
            >
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-3xl p-8 md:p-10 shadow-sm border border-gray-200/30 relative overflow-hidden">
                {/* Subtle decorative elements */}
                <div className="absolute top-4 left-4 w-8 h-8 opacity-10">
                  <svg viewBox="0 0 24 24" fill="currentColor" className="text-primary-600">
                    <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h4v10h-10z"/>
                  </svg>
                </div>
                
                <div className="relative z-10">
                  <div className="max-w-3xl mx-auto text-center">
                    <h3 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6 font-heading">
                      A Personal Note
                    </h3>
                    
                    <div className="prose prose-lg max-w-none">
                      <p className="text-lg md:text-xl text-gray-700 leading-relaxed mb-6 italic">
                        "I was that kid who felt completely overwhelmed when I started post-secondary. 
                        The jump from having everything structured and guided to suddenly being responsible for managing 
                        complex course loads, multiple deadlines, and academic planning was honestly terrifying."
                      </p>
                      
                      <p className="text-lg md:text-xl text-gray-700 leading-relaxed mb-6">
                        I spent my first year constantly stressed about missing assignments, forgetting deadlines, 
                        and feeling like I was always playing catch-up. I realized I wasn't alone—so many of my friends 
                        were struggling with the same overwhelming transition. We had the intelligence and motivation to succeed, 
                        but we just didn't have the organizational systems to handle this new level of academic independence.
                      </p>
                      
                      <p className="text-lg md:text-xl text-gray-700 leading-relaxed mb-6">
                        That's why I built Asetta. Not as another productivity app, but as the support system I wish I had 
                        during that crazy transition. If my experience can help even one student feel less overwhelmed 
                        and more in control of their academic journey, then every hour spent building this platform was worth it.
                      </p>
                    </div>
                    
                    <div className="mt-8 pt-6 border-t border-gray-300/50">
                      <p className="text-lg font-semibold text-gray-600">
                        — Eleazar, Founder
                      </p>
                      <p className="text-sm text-gray-500 mt-1">
                        Still using Asetta as a 4th-year student
                      </p>
                    </div>
                  </div>
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